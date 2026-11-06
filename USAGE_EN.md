[English](USAGE_EN.md) | [中文](USAGE.md)

# Usage Guide

## Quick Start

### 1. Get an API key

Request one at https://ai.szfiu.com.

### 2. Install the skill

```bash
git clone https://github.com/fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

Skills install to `~/.openclaw/skills/` by default. Override with `OPENCLAW_SKILLS_DIR`:

```bash
OPENCLAW_SKILLS_DIR=/opt/skills ./install.sh
```

For clients that only support local stdio, use the npm/npx adapter from the product manual (Node.js 20.18.1+):

```bash
FIU_API_KEY=YOUR_API_KEY npx -y fiu-finance-mcp
```

Configure `command: "npx"`, `args: ["-y", "fiu-finance-mcp"]` and `env.FIU_API_KEY`. The `--api-key` flag overrides the environment variable; `--url` overrides the default HTTPS endpoint.

### 3. Configure credentials

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
```

Add it to `~/.bashrc` or `~/.zshrc` to make it permanent.

### 4. Verify

```bash
./test.sh
```

All `[PASS]` means connectivity, authentication and the tool list are working.

---

## How to use it

### Option 1 — Natural language (recommended)

Once the skill is installed and the key is set, just ask:

```text
What is Tencent trading at right now?
Compare AAPL and MSFT over the last year.
Kweichow Moutai's revenue and net profit for the last three years.
Which Hong Kong IPOs are open for subscription this week, and what are the allotment odds?
Top gainers in Hong Kong today.
How much did southbound money buy today?
```

The agent uses the skill's routing table to pick the toolset and fill in the required parameters.

### Option 2 — Configure the MCP server in your client

You can skip the skill and connect your client straight to the server:

```json
{
  "mcpServers": {
    "fiu-finance": {
      "type": "streamableHttp",
      "url": "https://ai.szfiu.com/api/mcp/v2",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Claude Code, one command:

```bash
claude mcp add --transport http fiu-finance https://ai.szfiu.com/api/mcp/v2 \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### Option 3 — Command line

```bash
cd ~/.openclaw/skills/fiu-finance-mcp

# List every tool
node scripts/call.js list

# Describe a toolset or endpoint
node scripts/call.js describe quote_kline,get_kline

# Call
node scripts/call.js call quote_spot --endpoint get_quote \
  --param market=HK --param assetType=stock --param symbols=00700.hk
```

The Python script takes identical arguments:

```bash
python scripts/call.py call f10_financials --endpoint get_financial_statement \
  --param market=CN --param symbol=600519.sh --param statementType=balance --param reportType=12
```

For heavier payloads, pass the whole arguments object positionally:

```bash
node scripts/call.js call market_ranking \
  '{"endpoint":"get_hk_ranking","params":{"rankType":"stock","sortField":"changeRate","sortType":1,"pageSize":10}}'
```

On Windows PowerShell, quote escaping makes the JSON form awkward — prefer `--endpoint` + `--param`.

---

## MCP protocol

The server speaks **MCP Streamable HTTP** — JSON-RPC 2.0 over HTTP POST.

**URL**: `https://ai.szfiu.com/api/mcp/v2`
**Auth**: `Authorization: Bearer YOUR_API_KEY` header

### Handshake

```bash
curl -s https://ai.szfiu.com/api/mcp/v2 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": { "name": "curl", "version": "1.0" }
    }
  }'
```

The response carries an `Mcp-Session-Id` header. Send it back on subsequent requests.

### List tools

```json
{ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }
```

### Call a tool

Most business toolsets take `endpoint` and `params`. The flat toolsets `market_overview`, `market_flow`, `market_position_cost`, `shareholding_institution`, `macro_economics` and `company_announcements` keep business fields directly under `arguments`.

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "quote_spot",
    "arguments": {
      "endpoint": "get_quote",
      "params": {
        "market": "HK",
        "assetType": "stock",
        "symbols": ["00700.hk", "09988.hk"]
      }
    }
  }
}
```

### Discover parameters

When you are unsure what an endpoint needs, ask `describe_tool` first:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "describe_tool",
    "arguments": {
      "toolNames": ["f10_financials", "get_financial_statement"],
      "detail": "params"
    }
  }
}
```

`toolNames` accepts up to 5 entries. `detail` supports `summary` and `params`, with `summary` as the default.

---

## Available tools

28 tools = `describe_tool` + `search` + 26 business toolsets, covering 104 endpoints.

| Toolset | Markets | Purpose |
| --- | --- | --- |
| `describe_tool` | — | Parameter definitions for any toolset or endpoint |
| `quote_spot` | CN HK JP US GLOBAL | Real-time quotes, security search, static profile |
| `quote_intraday` | CN HK JP US GLOBAL | Order book, tick trades, intraday trend |
| `quote_kline` | CN HK JP US GLOBAL | K-line, historical snapshots, return series |
| `quote_derivatives_hk` | HK | Warrants and CBBC |
| `quote_us_options` | US | Option chain, quotes, Greeks, rankings |
| `market_overview` | CN HK JP US | Market statistics |
| `market_ranking` | CN HK JP US | Market-specific ranking endpoints: `get_hk_ranking`, `get_us_ranking`, `get_cn_ranking`, `get_jp_ranking` |
| `market_flow` | CN HK JP US | Capital flow by symbol |
| `market_structure` | CN HK JP US | Indices, industry classification, microstructure |
| `market_position_cost` | HK US | Position cost distribution and ranges |
| `f10_profile` | CN HK US | Company profile and management |
| `f10_financials` | CN HK US | Income, balance, cash flow, financial indicators |
| `f10_business_governance` | CN HK US | Business segments and corporate actions |
| `shareholding_structure` | CN HK US | Major shareholders, top ten, holding changes |
| `shareholding_institution` | US | Institutional holdings (13F) |
| `shareholding_fund_broker` | HK US | Broker holdings and short selling |
| `fund_data` | Global funds | Search, profile, NAV, performance, risk, complete holdings, exposure, fees, ranking and country-code resolution |
| `stock_connect` | CN HK | Stock Connect flows, holdings, rankings |
| `ipo` | HK US | IPO calendar, offering, cornerstone, sponsor, allotment, content |
| `bond_basic` | GLOBAL | Bond search, profile, quote, order book |
| `bond_analytics` | GLOBAL | Bond rankings, charts, yields, trading status |
| `fiu_news` | CN HK JP US GLOBAL | News search, per-symbol news, latest news, detail, related news and digest material |
| `financial_calendar` | Global | Financial-calendar search and event details |
| `macro_economics` | CN-focused | Curated macroeconomic series |
| `company_announcements` | HK US CN | Listed-company announcements with attachments or content |
| `reference` | CN HK JP US GLOBAL | ISIN/SEDOL/CIK codes, symbol mapping, trading calendar |

Full endpoint and required-field listing: [docs/mcp-interfaces_EN.md](docs/mcp-interfaces_EN.md).

---

## FAQ

**The agent doesn't see the tools.**
Check that `~/.openclaw/skills/fiu-finance-mcp/SKILL.md` exists, then restart the client. If you configured MCP directly, make sure the client reloaded its config.

**`401 缺少认证头` (missing auth header).**
The request carried no `Authorization` header. Check that `FIU_MCP_GATEWAY_AUTHORIZATION` is exported, or that your client's `headers` block is correct. The value must include the `Bearer ` prefix.

**`401 无效的令牌` (invalid token).**
The key is wrong or expired. Confirm it at https://ai.szfiu.com.

**`INVALID_SEMANTIC_INPUT` or `INVALID_ARGUMENT`.**
A required discriminator is missing, or an enum value is wrong. Run `describe_tool` with `detail: "params"` on that endpoint.

**`UNSUPPORTED_ROUTE`.**
That `market` does not support this endpoint or parameter combination. For example, `get_shareholders` with `topten` is A-share; Hong Kong uses `major`.

**How do I get annual figures only?**
Pass `reportType` in `params`. HK: `F` annual, `I` half-year. US: `FY` annual, `I1/I2` half-year periods. CN: `12` annual, `6` interim. Use `describe_tool` for the complete quarterly and market-specific values.

**Empty array returned.**
Successful business responses include `code: 0` and `resultStatus`. When `resultStatus: "empty"`, inspect `emptyReason`: use a wider range for `NO_DATA_FOR_PERIOD`, adjust the symbol or filters for `NO_MATCHING_DATA`, and do not treat it as a retriable failure.

Full troubleshooting: [skills/fiu-finance-mcp/references/troubleshooting.md](skills/fiu-finance-mcp/references/troubleshooting.md).

---

## Development

### Layout

```
skills/<skill-name>/
├── SKILL.md            required — English skill definition with YAML frontmatter
├── SKILL_CN.md         Chinese version
├── skill.json          metadata: version, dependencies, env vars
├── install.sh          single-skill installer
├── references/         progressively loaded reference docs
└── scripts/            executable helpers
```

### Writing SKILL.md

- `description` must state **when to use it** — that is what the agent reads to decide whether to load the skill.
- Keep the body short. Push detail into `references/` and load on demand.
- State the capability boundary explicitly so the agent knows when to stop.

### Local testing

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
./test.sh

# Point at another environment
FIU_MCP_URL=https://your-gateway.example.com/api/mcp/v2 ./test.sh
```

### Before you submit

- [ ] `./test.sh` all green
- [ ] `SKILL.md` and `SKILL_CN.md` agree
- [ ] `skill.json` version bumped
- [ ] No real API key anywhere in the diff

---

## Resources

- MCP server repo: https://github.com/fiu-ai/mcp-server
- MCP specification: https://modelcontextprotocol.io
- Service: https://ai.szfiu.com

## Support

- Issues: https://github.com/fiu-ai/openclaw-skills/issues
- Please include: client and version, the full error, and the toolset/endpoint you called. **Never paste your API key.**
