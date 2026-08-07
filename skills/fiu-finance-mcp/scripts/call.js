#!/usr/bin/env node

const DEFAULT_URL = process.env.FIU_MCP_URL || "http://ai.szfiu.com/api/mcp/v2";
const PROTOCOL_VERSION = "2025-06-18";

async function main() {
  const { command, args, url, raw, endpoint, paramPairs } = parseCli(process.argv.slice(2));

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
    console.error(text);
    process.exitCode = 1;
    return;
  }

  console.log(text);
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
      throw new Error(JSON.stringify(response.body.error));
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

    if (!response.ok) {
      const message = body?.error?.message || body?.message || text || `HTTP ${response.status}`;
      throw new Error(`MCP HTTP ${response.status}: ${message}`);
    }

    const sessionId = response.headers.get("mcp-session-id") || this.sessionId;
    return { body, sessionId };
  }
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

  return JSON.parse(text);
}

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
  console.error(JSON.stringify({
    error: error.name || "Error",
    message: error.message || String(error)
  }, null, 2));
  // 用 exitCode 而不是 process.exit()：Windows 上 fetch 的 keep-alive socket
  // 还没关时强制退出，会触发 libuv 断言并把非零退出码变成崩溃。
  process.exitCode = 1;
});
