#!/usr/bin/env python3

import argparse
import json
import os
import sys
from urllib import error as urlerror
from urllib import request as urlrequest

try:
    import requests
except ImportError:  # pragma: no cover
    requests = None


DEFAULT_URL = os.environ.get("FIU_MCP_URL", "http://ai.szfiu.com/api/mcp/v2")
PROTOCOL_VERSION = "2025-06-18"

# Windows 控制台默认走系统代码页（如 GBK），会让输出的 JSON 不是 UTF-8，
# 下游用 jq / node / python 再解析时会报编码错误。这里统一固定成 UTF-8。
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass


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
            raise RuntimeError(json.dumps(body["error"], ensure_ascii=False))
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

        if status_code < 200 or status_code >= 300:
            raise RuntimeError(f"MCP HTTP {status_code}: {extract_error_message(body, text)}")

        return {
            "body": body,
            "session_id": response_headers.get("mcp-session-id") or self.session_id,
        }


def main():
    parser = argparse.ArgumentParser(description="Call Szfiu Finance MCP Gateway over Streamable HTTP.")
    parser.add_argument("command", choices=["list", "describe", "call"])
    parser.add_argument("items", nargs="*")
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--raw", action="store_true")
    parser.add_argument("--endpoint", "-e")
    parser.add_argument("--param", "-p", action="append", default=[])
    args = parser.parse_args()

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
                "toolNames": parse_tool_names(args.items[0])
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
        print(text, file=sys.stderr)
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

    return json.loads(text)


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
        print(json.dumps({
            "error": error.__class__.__name__,
            "message": str(error),
        }, ensure_ascii=False, indent=2), file=sys.stderr)
        sys.exit(1)
