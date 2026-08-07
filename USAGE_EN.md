# FIU Finance MCP Usage Guide

Covers the `fiu-finance-mcp` skill, which talks to the FIU MCP gateway at
`http://ai.szfiu.com/api/mcp/v2`.

## Quick Start

### 1. Install the skill

```bash
git clone git@github.com:fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

Or install just this skill:

```bash
./skills/fiu-finance-mcp/install.sh
# or
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

### 2. Configure the API key

Get one at [http://ai.szfiu.com](http://ai.szfiu.com), then add it to `~/.zshrc` or `~/.bashrc`:

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
# optional: override the endpoint
# export FIU_MCP_URL="http://ai.szfiu.com/api/mcp/v2"
```

### 3. Verify

```bash
./test.sh
```

Five checks: `tools/list`, `describe_tool`, and HK / US / CN quotes. All green prints
`✅ 测试完成，全部通过`.

In OpenClaw, type `/` to see the skills list — `fiu-finance-mcp` should be there.

## Usage

### In OpenClaw

```
Query Tencent Holdings real-time quote
Show AAPL hourly K-line
Capital flow for Kweichow Moutai today
Is the US market in session right now
Which HK IPOs listed this week
```

### From the command line

```bash
cd ~/.openclaw/skills/fiu-finance-mcp

node scripts/call.js list
node scripts/call.js describe quote_spot,quote_kline
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
```

The Python twin takes identical arguments:

```bash
python scripts/call.py call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
```

More copy-pasteable examples in
[README.md → Tool Call Cheatsheet](README.md#tool-call-cheatsheet).

## Calling convention

The gateway is Streamable HTTP + JSON-RPC 2.0 with `Authorization: Bearer <API_KEY>`.
`call.js` already handles the `initialize` → `notifications/initialized` → `tools/call`
handshake and SSE parsing, so you rarely need to build requests yourself.

Every business tool is a **toolset** and takes exactly two arguments:

```json
{
  "endpoint": "get_quote",
  "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
}
```

On the CLI:

```bash
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
# equivalent to
node scripts/call.js call quote_spot '{"endpoint":"get_quote","params":{"market":"HK","assetType":"stock","symbols":["00700.hk"]}}'
```

### How `-p` values are parsed

| Written as | Becomes |
|------------|---------|
| `-p symbols=00700.hk,AAPL.us` | `["00700.hk","AAPL.us"]` (`symbols` always splits into an array) |
| `-p limit=30` | number `30` |
| `-p conceptFlag=Y` | string `"Y"` |
| `-p timeMode=true` | boolean `true` |
| `-p params='{"sortField":"changeRate"}'` | object, passed through to the downstream |

## Available tools

24 tools, 86 endpoints, five markets (`CN` / `HK` / `US` / `JP` / `GLOBAL`).
Full catalog in [README.md → Capability](README.md#capability); the authoritative source
is always the gateway itself:

```bash
node scripts/call.js list
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

`describe_tool` has three tiers:

| detail | Use for | Limit |
|--------|---------|-------|
| `summary` (default) | Picking a toolset, checking market coverage | up to 5 names |
| `params` | Field names, required flags, enum values | up to 5 names |
| `full` | Debugging one endpoint that keeps failing | 1 endpoint |

## FAQ

### Q: How do I get an API key?

A: Register at [http://ai.szfiu.com](http://ai.szfiu.com) and set
`FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"`.

### Q: I get `INVALID_ARGUMENT` / `INVALID_SEMANTIC_INPUT`

A: Gateway-level validation failed, usually a missing discriminator (`dataType`,
`holdingType`, `ipoType`, `connectType`, `costType`, `statementType`, …). Check required
fields with `describe_tool` at `detail=params`.

### Q: I get `INVALID_DOWNSTREAM_ARGS`

A: Validation passed but the downstream still wants fields. `error.details.issues` names each
one, e.g.

```
sortField  downstream hk_sdk/post_v3_etf_list requires sortField
period     downstream cn_sdk/post_v1_stockConnect_connectBalance requires period
root       downstream us_options/post_opra_v1_chain_expiration requires root
```

Add them via `-p params='{...}'` and retry.

### Q: I get `UNSUPPORTED_ROUTE`

A: That endpoint has no downstream route for that market. Switch markets, or check
`describe_tool` for what it actually supports — the market list on a tool is a union, and an
individual endpoint can be narrower.

### Q: Which markets are supported?

A: `CN` (A-share), `HK` (Hong Kong), `US` (United States), `JP` (Japan), and `GLOBAL`
(cross-market fixed income — **bonds only**, not for ordinary equities).

### Q: What symbol format?

A: Full suffixes — `00700.hk`, `AAPL.us`, `600519.sh`, `000001.sz`, `6758.jp`; bonds accept an
ISIN. Dates are `YYYY-MM-DD`; minute K-line, ticks and intraday use `YYYY-MM-DD HH:mm:ss`.

### Q: Any batch limits?

A: Keep batch quote, financial, holding and news queries to about 5 subjects or 5 metrics per
call; `get_security_profile` caps `symbols` at 50.

## Development

### Calling the gateway over raw HTTP

```bash
curl -s -X POST "http://ai.szfiu.com/api/mcp/v2" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Protocol-Version: 2025-06-18" \
    -H "Mcp-Session-Id: $SESSION_ID" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "quote_spot",
            "arguments": {
                "endpoint": "get_quote",
                "params": {"market": "HK", "assetType": "stock", "symbols": ["00700.hk"]}
            }
        }
    }'
```

`SESSION_ID` comes from the `Mcp-Session-Id` response header of a prior `initialize` call and
must be sent on every subsequent request. Responses are SSE with CRLF line endings — take the
last `data:` line and parse it. `call.js` handles all of this; prefer reusing it for new
integrations.

## Resources

- [FIU MCP](http://ai.szfiu.com)
- [GitHub repository](https://github.com/fiu-ai/openclaw-skills)
- [OpenClaw docs](https://docs.openclaw.ai)
- [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

## Support

For issues, please open a GitHub Issue or contact FIU support.
