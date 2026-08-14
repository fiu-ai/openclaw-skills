#!/usr/bin/env python3

import argparse
import json
import os
import re
import sys
from urllib import error as urlerror
from urllib import parse as urlparse
from urllib import request as urlrequest

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None


DEFAULT_URL = os.environ.get("FIU_MCP_URL", "http://ai.szfiu.com/api/mcp/v2")
PORTAL_FALLBACK = "http://ai.szfiu.com"
PROTOCOL_VERSION = "2025-06-18"
AUTH_ENV = "FIU_MCP_GATEWAY_AUTHORIZATION"
IDENTIFIER_PARAM_KEYS = {
    "id", "symbol", "code", "root", "ticker",
    "securityCode", "stockCode", "warrantCode",
    "isin", "sedol", "cik",
}

# 出错时用来判断哪个 host 是"对外的"，其余 host:port 一律脱敏。
ACTIVE_URL = DEFAULT_URL

# 上游正文不是 JSON 时的哨兵值。不能直接让 json.loads 抛错——它的报错信息里会
# 原样带上正文片段，而 502 的正文正是服务器内网地址。
UNPARSABLE = object()

# Windows 控制台默认走系统代码页（如 GBK），会让输出的 JSON 不是 UTF-8，
# 下游用 jq / node / python 再解析时会报编码错误。这里统一固定成 UTF-8。
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass


class McpAuthRequiredError(RuntimeError):
    """上游未授权 / 上游网关没把请求送到位时统一抛这个错误。

    关键点：绝不把上游的原始错误正文透出去。auth 层反代失败时正文里带的是
    `dial tcp <服务器内网地址>: connect: connection refused` 这类服务器内网地址，
    对使用者没有任何可操作性，还等于把部署拓扑漏给了客户端。
    """

    def __init__(self, portal, reason):
        super().__init__(f"{reason}请先在 {portal} 完成授权，再配置 JWT 后重试。")
        self.code = "MCP_AUTH_REQUIRED"
        self.portal = portal
        self.how_to_fix = [
            f"1. 浏览器打开 {portal} 完成登录授权，拿到 JWT。",
            f"2. 设置环境变量 {AUTH_ENV}=Bearer <token>。",
            f"3. MCP 客户端 / FIU_MCP_URL 填 {portal}/api/mcp/v2，不要填任何内网地址。",
            "4. 若授权已完成仍失败，请联系服务方，不要自行改地址。",
        ]


class McpHttpClient:
    def __init__(self, url):
        self.url = url
        self.session_id = None
        self.next_id = 1

    def initialize(self):
        response = self._post({
            "jsonrpc": "2.0",
            "id": self.next_id,
            "method": "initialize",
            "params": {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": {
                    "name": "fiu-finance-mcp-skill-python",
                    "version": "0.1.0",
                },
            },
        })
        self.next_id += 1
        self.session_id = response["session_id"]
        if not self.session_id:
            raise RuntimeError("MCP initialize did not return Mcp-Session-Id header.")

        self._post({
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {},
        })

    def request(self, method, params):
        response = self._post({
            "jsonrpc": "2.0",
            "id": self.next_id,
            "method": method,
            "params": params,
        })
        self.next_id += 1

        body = response["body"]
        if isinstance(body, dict) and body.get("error"):
            raise RuntimeError(redact_internal_address(
                json.dumps(body["error"], ensure_ascii=False), public_host(self.url)))

        if isinstance(body, dict) and "result" in body:
            return body["result"]
        return body

    def _post(self, payload):
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Mcp-Protocol-Version": PROTOCOL_VERSION,
        }
        if self.session_id:
            headers["Mcp-Session-Id"] = self.session_id

        authorization = os.environ.get("FIU_MCP_GATEWAY_AUTHORIZATION")
        if authorization:
            headers["Authorization"] = authorization

        status_code, response_headers, text = post_json(self.url, headers, payload)
        body = parse_response_body(text, response_headers.get("content-type", ""))
        parse_failed = body is UNPARSABLE
        if parse_failed:
            body = None

        # 状态码判断必须排在解析失败之前：上游 502/503 常常返回纯文本或 HTML，
        # 直接让 json.loads 抛错会把原始正文（含内网地址）当成报错信息透出去。
        if status_code < 200 or status_code >= 300:
            raise build_http_failure(status_code, body, text, self.url)

        if parse_failed:
            raise RuntimeError(f"MCP 上游返回了无法解析的响应（HTTP {status_code}）。")

        return {
            "body": body,
            "session_id": response_headers.get("mcp-session-id") or self.session_id,
        }


def main():
    global ACTIVE_URL

    parser = argparse.ArgumentParser(description="Call Szfiu Finance MCP Gateway over Streamable HTTP.")
    parser.add_argument("command", choices=["list", "describe", "call"])
    parser.add_argument("items", nargs="*")
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--raw", action="store_true")
    parser.add_argument("--detail", choices=["summary", "params", "full"], default="summary")
    parser.add_argument("--endpoint", "-e")
    parser.add_argument("--param", "-p", action="append", default=[])
    args = parser.parse_args()
    ACTIVE_URL = args.url

    client = McpHttpClient(args.url)
    client.initialize()

    if args.command == "list":
        result = client.request("tools/list", {})
    elif args.command == "describe":
        if not args.items:
            raise RuntimeError("Missing tool name. Example: describe quote_kline,get_kline")
        result = client.request("tools/call", {
            "name": "describe_tool",
            "arguments": {
                "toolNames": parse_tool_names(args.items[0]),
                "detail": args.detail,
            },
        })
    elif args.command == "call":
        if len(args.items) < 1:
            raise RuntimeError("Missing tool name. Example: call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk")
        if args.endpoint:
            tool_args = {
                "endpoint": args.endpoint,
                "params": parse_param_pairs(args.param),
            }
        elif len(args.items) >= 2:
            tool_args = parse_json_arg(" ".join(args.items[1:]), "tool arguments")
        else:
            raise RuntimeError("Missing arguments. PowerShell example: call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk")
        result = client.request("tools/call", {
            "name": args.items[0],
            "arguments": tool_args,
        })
    else:
        raise RuntimeError(f"Unknown command: {args.command}")

    output = result if args.raw else unwrap_tool_result(result)
    text = json.dumps(output, ensure_ascii=False, indent=2)

    # 网关把下游错误也标成 isError，这里必须落到 stderr + 非零退出码，
    # 否则自动化脚本会把错误信息当成数据继续跑。
    if isinstance(result, dict) and result.get("isError") is True:
        print(redact_internal_address(text, public_host(args.url)), file=sys.stderr)
        sys.exit(1)

    print(text)


def parse_tool_names(value):
    value = value.strip()
    if value.startswith("[") or value.startswith("{"):
        parsed = parse_json_arg(value, "tool names")
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict) and isinstance(parsed.get("toolNames"), list):
            return parsed["toolNames"]
    return [item.strip() for item in value.split(",") if item.strip()]


def parse_param_pairs(param_pairs):
    params = {}
    for pair in param_pairs:
        if not pair or "=" not in pair:
            raise RuntimeError(f"Invalid --param value: {pair}. Expected key=value.")
        key, value = pair.split("=", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            raise RuntimeError(f"Invalid --param value: {pair}. Key is empty.")
        params[key] = parse_param_value(key, value)
    return params


def parse_param_value(key, value):
    if key == "symbols":
        if value.startswith("["):
            return parse_json_arg(value, "symbols param")
        return [item.strip() for item in value.split(",") if item.strip()]
    if value == "true":
        return True
    if value == "false":
        return False
    if value == "null":
        return None
    if key in IDENTIFIER_PARAM_KEYS:
        return value
    try:
        if "." in value:
            return float(value)
        return int(value)
    except ValueError:
        pass
    if value.startswith("[") or value.startswith("{"):
        return parse_json_arg(value, f"{key} param")
    return value


def post_json(url, headers, payload):
    if requests is not None:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        return response.status_code, response.headers, response.text or ""

    data = json.dumps(payload).encode("utf-8")
    req = urlrequest.Request(url, data=data, headers=headers, method="POST")
    try:
        with urlrequest.urlopen(req, timeout=60) as response:
            text = response.read().decode("utf-8")
            return response.status, response.headers, text
    except urlerror.HTTPError as exc:
        text = exc.read().decode("utf-8")
        return exc.code, exc.headers, text


def public_host(url):
    try:
        return urlparse.urlparse(url).hostname or ""
    except ValueError:
        return ""


def is_internal_host(host):
    """内网地址判定：IPv4、localhost、以及不带点的容器服务名（szfiu-mcp-adapter）。

    授权入口一旦落在这类地址上，对使用者既不可达也等于泄漏拓扑，一律回退到对外域名。
    """
    if not host:
        return True
    host = host.lower()
    return host == "localhost" or re.fullmatch(r"(?:\d{1,3}\.){3}\d{1,3}", host) is not None or "." not in host


def portal_url(url):
    try:
        parsed = urlparse.urlparse(url)
        if parsed.scheme and parsed.netloc and not is_internal_host(parsed.hostname):
            return f"{parsed.scheme}://{parsed.netloc}"
    except ValueError:
        pass
    return PORTAL_FALLBACK


_DIAL_RE = re.compile(r"\bdial\s+(?:tcp|udp)[^\n\"',;]*", re.IGNORECASE)
_IPV4_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?")
_LOCALHOST_RE = re.compile(r"\blocalhost(?::\d+)?", re.IGNORECASE)
# host 必须含 `.` 或 `-` 才算地址，避免误伤 `timeoutMs:30000` 这类字段。
_HOSTPORT_RE = re.compile(r"(?<![\"'])\b([a-z0-9][a-z0-9._-]*[.-][a-z0-9._-]*):\d{2,5}\b", re.IGNORECASE)


def redact_internal_address(text, host):
    """把任何可能出现在错误文本里的服务器内网地址抹掉。

    IPv4、localhost、`dial tcp ...` 以及 `service-name:<port>` 这种容器内地址，
    只保留对外域名（host），其余 host:port 一律换成 [internal]。
    """
    if not isinstance(text, str) or not text:
        return text

    def replace_host_port(match):
        if host and match.group(1).lower() == host.lower():
            return match.group(0)
        return "[internal]"

    text = _DIAL_RE.sub("上游连接失败", text)
    text = _IPV4_RE.sub("[internal]", text)
    text = _LOCALHOST_RE.sub("[internal]", text)
    return _HOSTPORT_RE.sub(replace_host_port, text)


def looks_like_auth_failure(body, text):
    haystack = f"{text or ''} {'' if body is None else json.dumps(body, ensure_ascii=False)}".lower()
    return re.search(r"unauthor|forbidden|invalid token|missing token|jwt|授权|鉴权|认证|登录", haystack) is not None


def build_http_failure(status_code, body, text, url):
    """上游非 2xx 的统一出口。

    401/403 和 5xx 都收敛成"去授权域名配 JWT"，不回显上游正文；
    只有 4xx 的业务参数错误才把（脱敏后的）上游信息带出来。
    """
    portal = portal_url(url)

    if status_code in (401, 403):
        return McpAuthRequiredError(portal, f"MCP 上游未授权（HTTP {status_code}）。")

    if status_code >= 500:
        return McpAuthRequiredError(
            portal,
            f"MCP 上游网关未能完成请求（HTTP {status_code}），常见原因是未完成授权或未配置 JWT。",
        )

    if looks_like_auth_failure(body, text):
        return McpAuthRequiredError(portal, f"MCP 上游拒绝了请求（HTTP {status_code}）。")

    message = extract_error_message(body, text) or f"HTTP {status_code}"
    return RuntimeError(f"MCP HTTP {status_code}: {redact_internal_address(message, public_host(url))}")


def extract_error_message(body, fallback):
    # 网关的错误体有多种形状：{"error": "缺少认证头"}、{"error": {"message": ...}}、
    # {"message": ...}。这里逐个兜住，避免对字符串调用 .get 反而把真实错误盖掉。
    if isinstance(body, dict):
        message = body.get("message")
        if isinstance(message, str) and message:
            return message
        error = body.get("error")
        if isinstance(error, str) and error:
            return error
        if isinstance(error, dict):
            nested = error.get("message")
            if isinstance(nested, str) and nested:
                return nested
    return fallback


def parse_json_arg(value, label):
    try:
        return json.loads(value)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid {label} JSON: {exc}") from exc


def parse_response_body(text, content_type):
    if not text.strip():
        return None

    if "text/event-stream" in content_type or text.lstrip().startswith("event:") or "\ndata:" in text:
        messages = []
        current_data = []
        for line in text.splitlines():
            if line.startswith("data:"):
                current_data.append(line[5:].lstrip())
            elif not line.strip() and current_data:
                messages.append("\n".join(current_data))
                current_data = []
        if current_data:
            messages.append("\n".join(current_data))

        parsed = []
        for item in messages:
            try:
                parsed.append(json.loads(item))
            except json.JSONDecodeError:
                pass
        return parsed[-1] if parsed else None

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return UNPARSABLE



def unwrap_tool_result(result):
    if not isinstance(result, dict) or not isinstance(result.get("content"), list):
        return result

    text_blocks = [
        item.get("text")
        for item in result["content"]
        if isinstance(item, dict) and item.get("type") == "text" and isinstance(item.get("text"), str)
    ]
    if not text_blocks:
        return result

    def parse_text(text):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text

    if len(text_blocks) == 1:
        return parse_text(text_blocks[0])
    return [parse_text(text) for text in text_blocks]


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        host = public_host(ACTIVE_URL)
        payload = {
            "error": error.__class__.__name__,
            "message": redact_internal_address(str(error), host),
        }
        code = getattr(error, "code", None)
        if code:
            payload["code"] = code
        portal = getattr(error, "portal", None)
        if portal:
            payload["portal"] = redact_internal_address(portal, host)
        how_to_fix = getattr(error, "how_to_fix", None)
        if how_to_fix:
            payload["howToFix"] = [redact_internal_address(item, host) for item in how_to_fix]

        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        sys.exit(1)
