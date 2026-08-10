#!/usr/bin/env node

const DEFAULT_URL = process.env.FIU_MCP_URL || "http://ai.szfiu.com/api/mcp/v2";
const PORTAL_FALLBACK = "http://ai.szfiu.com";
const PROTOCOL_VERSION = "2025-06-18";
const AUTH_ENV = "FIU_MCP_GATEWAY_AUTHORIZATION";

// 出错时用来判断哪个 host 是"对外的"，其余 host:port 一律脱敏。
let activeUrl = DEFAULT_URL;

async function main() {
  const { command, args, url, raw, endpoint, paramPairs } = parseCli(process.argv.slice(2));
  activeUrl = url;

  if (command === "help" || !command) {
    printHelp();
    return;
  }

  let request;
  if (command === "list") {
    request = {
      method: "tools/list",
      params: {}
    };
  } else if (command === "describe") {
    const toolNames = parseToolNames(args[0]);
    request = {
      method: "tools/call",
      params: {
        name: "describe_tool",
        arguments: { toolNames }
      }
    };
  } else if (command === "call") {
    const toolName = args[0];
    if (!toolName) {
      throw new Error("Missing tool name. Example: call quote_spot '{\"endpoint\":\"get_quote\",\"params\":{\"market\":\"HK\",\"symbols\":[\"00700.hk\"]}}'");
    }
    let toolArgs;
    if (endpoint) {
      toolArgs = {
        endpoint,
        params: parseParamPairs(paramPairs)
      };
    } else if (args[1]) {
      toolArgs = parseJsonArg(args.slice(1).join(" "), "tool arguments");
    } else {
      throw new Error("Missing tool arguments. PowerShell example: call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk");
    }
    request = {
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolArgs
      }
    };
  } else {
    throw new Error(`Unknown command: ${command}`);
  }

  const client = new McpHttpClient(url);
  await client.initialize();
  const response = await client.request(request.method, request.params);

  const output = raw ? response : unwrapToolResult(response);
  const text = JSON.stringify(output, null, 2);

  // 网关把下游错误也标成 isError，这里必须落到 stderr + 非零退出码，
  // 否则自动化脚本会把错误信息当成数据继续跑。
  if (response?.isError === true) {
    console.error(redactInternalAddress(text, publicHost(url)));
    process.exitCode = 1;
    return;
  }

  console.log(text);
}

/**
 * 上游未授权 / 上游网关没把请求送到位时统一抛这个错误。
 *
 * 关键点：绝不把上游的原始错误正文透出去。auth 层反代失败时正文里带的是
 * `dial tcp <服务器内网地址>: connect: connection refused` 这类服务器内网地址，
 * 对使用者没有任何可操作性，还等于把部署拓扑漏给了客户端。
 */
class McpAuthRequiredError extends Error {
  constructor(portal, reason) {
    super(`${reason}请先在 ${portal} 完成授权，再配置 JWT 后重试。`);
    this.name = "McpAuthRequiredError";
    this.code = "MCP_AUTH_REQUIRED";
    this.portal = portal;
    this.howToFix = [
      `1. 浏览器打开 ${portal} 完成登录授权，拿到 JWT。`,
      `2. 设置环境变量 ${AUTH_ENV}=Bearer <token>。`,
      `3. MCP 客户端 / FIU_MCP_URL 填 ${portal}/api/mcp/v2，不要填任何内网地址。`,
      "4. 若授权已完成仍失败，请联系服务方，不要自行改地址。"
    ];
  }
}

class McpHttpClient {
  constructor(url) {
    this.url = url;
    this.sessionId = undefined;
    this.nextId = 1;
  }

  async initialize() {
    const response = await this.post({
      jsonrpc: "2.0",
      id: this.nextId++,
      method: "initialize",
      params: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: {
          name: "fiu-finance-mcp-skill-node",
          version: "0.1.0"
        }
      }
    });

    this.sessionId = response.sessionId;
    if (!this.sessionId) {
      throw new Error("MCP initialize did not return Mcp-Session-Id header.");
    }

    await this.post({
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {}
    });

    return response.body;
  }

  async request(method, params) {
    const response = await this.post({
      jsonrpc: "2.0",
      id: this.nextId++,
      method,
      params
    });

    if (response.body?.error) {
      throw new Error(redactInternalAddress(JSON.stringify(response.body.error), publicHost(this.url)));
    }

    return response.body?.result ?? response.body;
  }

  async post(payload) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Mcp-Protocol-Version": PROTOCOL_VERSION
    };

    if (this.sessionId) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }

    const authorization = process.env.FIU_MCP_GATEWAY_AUTHORIZATION;
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(this.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    const body = parseResponseBody(text, response.headers.get("content-type") || "");

    // 状态码判断必须排在解析失败之前：上游 502/503 常常返回纯文本或 HTML，
    // 直接让 JSON.parse 抛错会把原始正文（含内网地址）当成报错信息透出去。
    if (!response.ok) {
      throw buildHttpFailure(response.status, body === UNPARSABLE ? undefined : body, text, this.url);
    }

    if (body === UNPARSABLE) {
      throw new Error(`MCP 上游返回了无法解析的响应（HTTP ${response.status}）。`);
    }

    const sessionId = response.headers.get("mcp-session-id") || this.sessionId;
    return { body, sessionId };
  }
}

function publicHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * 内网地址判定：IPv4、localhost、以及不带点的容器服务名（szfiu-mcp-adapter）。
 * 授权入口一旦落在这类地址上，对使用者既不可达也等于泄漏拓扑，一律回退到对外域名。
 */
function isInternalHost(host) {
  return !host
    || host.toLowerCase() === "localhost"
    || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)
    || !host.includes(".");
}

function portalUrl(url) {
  try {
    const parsed = new URL(url);
    return isInternalHost(parsed.hostname) ? PORTAL_FALLBACK : parsed.origin;
  } catch {
    return PORTAL_FALLBACK;
  }
}

/**
 * 把任何可能出现在错误文本里的服务器内网地址抹掉：
 * IPv4、localhost、`dial tcp ...` 以及 `service-name:<port>` 这种容器内地址。
 * 只保留对外域名（publicHost），其余 host:port 一律换成 [internal]。
 */
function redactInternalAddress(text, host) {
  if (typeof text !== "string" || !text) {
    return text;
  }

  return text
    .replace(/\bdial\s+(?:tcp|udp)[^\n"',;]*/gi, "上游连接失败")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?/g, "[internal]")
    .replace(/\blocalhost(?::\d+)?/gi, "[internal]")
    // host 必须含 `.` 或 `-` 才算地址，避免误伤 `timeoutMs:30000` 这类字段。
    .replace(/(?<!["'])\b([a-z0-9][a-z0-9._-]*[.-][a-z0-9._-]*):\d{2,5}\b/gi,
      (match, matchedHost) => (host && matchedHost.toLowerCase() === host.toLowerCase() ? match : "[internal]"));
}

function extractErrorMessage(body, fallback) {
  if (body && typeof body === "object") {
    if (typeof body.message === "string" && body.message) {
      return body.message;
    }
    if (typeof body.error === "string" && body.error) {
      return body.error;
    }
    if (body.error && typeof body.error === "object" && typeof body.error.message === "string" && body.error.message) {
      return body.error.message;
    }
  }
  return fallback;
}

function looksLikeAuthFailure(body, text) {
  const haystack = `${text || ""} ${body === undefined ? "" : JSON.stringify(body)}`.toLowerCase();
  return /unauthor|forbidden|invalid token|missing token|jwt|授权|鉴权|认证|登录/.test(haystack);
}

/**
 * 上游非 2xx 的统一出口。401/403 和 5xx 都收敛成"去授权域名配 JWT"，
 * 不回显上游正文；只有 4xx 的业务参数错误才把（脱敏后的）上游信息带出来。
 */
function buildHttpFailure(status, body, text, url) {
  const portal = portalUrl(url);

  if (status === 401 || status === 403) {
    return new McpAuthRequiredError(portal, `MCP 上游未授权（HTTP ${status}）。`);
  }

  if (status >= 500) {
    return new McpAuthRequiredError(
      portal,
      `MCP 上游网关未能完成请求（HTTP ${status}），常见原因是未完成授权或未配置 JWT。`
    );
  }

  if (looksLikeAuthFailure(body, text)) {
    return new McpAuthRequiredError(portal, `MCP 上游拒绝了请求（HTTP ${status}）。`);
  }

  const message = extractErrorMessage(body, text) || `HTTP ${status}`;
  return new Error(`MCP HTTP ${status}: ${redactInternalAddress(message, publicHost(url))}`);
}

function parseCli(argv) {
  const args = [];
  let url = DEFAULT_URL;
  let raw = false;
  let endpoint;
  const paramPairs = [];

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--url") {
      url = argv[++i];
    } else if (value === "--raw") {
      raw = true;
    } else if (value === "--endpoint" || value === "-e") {
      endpoint = argv[++i];
    } else if (value === "--param" || value === "-p") {
      paramPairs.push(argv[++i]);
    } else {
      args.push(value);
    }
  }

  return {
    command: args.shift(),
    args,
    url,
    raw,
    endpoint,
    paramPairs
  };
}

function parseToolNames(value) {
  if (!value) {
    throw new Error("Missing tool name. Example: describe quote_kline,get_kline");
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = parseJsonArg(trimmed, "tool names");
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (Array.isArray(parsed.toolNames)) {
      return parsed.toolNames;
    }
  }

  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseJsonArg(value, label) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Invalid ${label} JSON: ${error.message}. In Windows PowerShell, prefer: call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk`);
  }
}

function parseParamPairs(paramPairs) {
  const params = {};
  for (const pair of paramPairs) {
    if (!pair || !pair.includes("=")) {
      throw new Error(`Invalid --param value: ${pair}. Expected key=value.`);
    }
    const index = pair.indexOf("=");
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!key) {
      throw new Error(`Invalid --param value: ${pair}. Key is empty.`);
    }
    params[key] = parseParamValue(key, value);
  }
  return params;
}

function parseParamValue(key, value) {
  if (key === "symbols") {
    if (value.trim().startsWith("[")) {
      return parseJsonArg(value, "symbols param");
    }
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("[") || value.startsWith("{")) {
    return parseJsonArg(value, `${key} param`);
  }
  return value;
}

function parseResponseBody(text, contentType) {
  if (!text.trim()) {
    return null;
  }

  if (contentType.includes("text/event-stream") || text.trimStart().startsWith("event:") || text.includes("\ndata:")) {
    const messages = [];
    let currentData = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith("data:")) {
        currentData.push(line.slice(5).trimStart());
      } else if (!line.trim() && currentData.length) {
        messages.push(currentData.join("\n"));
        currentData = [];
      }
    }
    if (currentData.length) {
      messages.push(currentData.join("\n"));
    }

    const parsed = messages
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return undefined;
        }
      })
      .filter(Boolean);

    return parsed[parsed.length - 1] || null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return UNPARSABLE;
  }
}

// 上游正文不是 JSON 时的哨兵值。不能直接让 JSON.parse 抛错——它的报错信息里会
// 原样带上正文片段，而 502 的正文正是服务器内网地址。
const UNPARSABLE = Symbol("unparsable-response-body");

function unwrapToolResult(result) {
  if (!result || !Array.isArray(result.content)) {
    return result;
  }

  const textBlocks = result.content
    .filter((item) => item?.type === "text" && typeof item.text === "string")
    .map((item) => item.text);

  if (!textBlocks.length) {
    return result;
  }

  if (textBlocks.length === 1) {
    try {
      return JSON.parse(textBlocks[0]);
    } catch {
      return textBlocks[0];
    }
  }

  return textBlocks.map((text) => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  });
}

function printHelp() {
  console.log(`Usage:
  node scripts/call.js list [--url http://ai.szfiu.com/api/mcp/v2]
  node scripts/call.js describe quote_kline,get_kline [--url http://ai.szfiu.com/api/mcp/v2]
  node scripts/call.js call <tool_name> '<arguments_json>' [--url http://ai.szfiu.com/api/mcp/v2]
  node scripts/call.js call <tool_name> --endpoint <endpoint> --param key=value

Examples:
  node scripts/call.js call quote_spot '{"endpoint":"get_quote","params":{"market":"HK","assetType":"stock","symbols":["00700.hk"]}}'
  node scripts/call.js call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
  node scripts/call.js call quote_kline '{"endpoint":"get_kline","params":{"market":"US","assetType":"stock","symbol":"AAPL.us","period":"1d","limit":30}}'
  node scripts/call.js describe '["fiu_news","news_digest"]'

Environment:
  FIU_MCP_URL=http://ai.szfiu.com/api/mcp/v2
  FIU_MCP_GATEWAY_AUTHORIZATION=Bearer <gateway token from http://ai.szfiu.com>
`);
}

main().catch((error) => {
  const host = publicHost(activeUrl);
  const payload = {
    error: error.name || "Error",
    message: redactInternalAddress(error.message || String(error), host)
  };
  if (error.code) {
    payload.code = error.code;
  }
  if (error.portal) {
    payload.portal = redactInternalAddress(error.portal, host);
  }
  if (Array.isArray(error.howToFix)) {
    payload.howToFix = error.howToFix.map((item) => redactInternalAddress(item, host));
  }

  console.error(JSON.stringify(payload, null, 2));
  // 用 exitCode 而不是 process.exit()：Windows 上 fetch 的 keep-alive socket
  // 还没关时强制退出，会触发 libuv 断言并把非零退出码变成崩溃。
  process.exitCode = 1;
});
