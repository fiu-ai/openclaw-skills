---
name: fiu-finance-mcp
description: "FIU Finance MCP assistant. Use when the user asks about Hong Kong, US, A-share, Japan or global bond market data — quotes, order book, K-line, financial statements, shareholding, capital flow, rankings, ETF and fund data, IPO, US options, news or reference codes."
user-invocable: true
allowed-tools: [Read, Bash]
metadata:
  openclaw:
    requires:
      env: [FIU_MCP_GATEWAY_AUTHORIZATION]
      binaries: [node, bash]
      primaryCredential: FIU_MCP_GATEWAY_AUTHORIZATION
---

# FIU Finance MCP

Market data for Hong Kong, US, A-share, Japan and global fixed income: quotes, order book, tick trades, K-line, market rankings, capital flow, F10 fundamentals, shareholding, ETF and fund data, IPO, US options, news and reference codes.

Endpoint: `http://ai.szfiu.com/api/mcp/v2` (Streamable HTTP, `Authorization: Bearer <API_KEY>`).

## How to call

Prefer the FIU MCP tools already exposed in the session. Every business toolset takes the same two arguments:

```json
{
  "endpoint": "get_quote",
  "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
}
```

When no native MCP tool is available, or you need to reproduce a call from the shell:

```bash
node scripts/call.js list
node scripts/call.js describe quote_kline,get_kline
node scripts/call.js call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
```

A Python equivalent is at `scripts/call.py` (uses `requests`, falls back to `urllib`).

## First run

1. Get an API key at `http://ai.szfiu.com`.
2. Configure the MCP client with `http://ai.szfiu.com/api/mcp/v2` and header `Authorization: Bearer <API_KEY>`.
3. For the scripts, export the same value: `export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"`.

Details in `references/setup-and-auth.md`.

## Coverage

| Domain | Capabilities |
| --- | --- |
| Quotes | Security search, profile, snapshot and extended quotes for stocks, ETFs, indices, warrants, bonds |
| Intraday | Order book, tick trades, intraday and mini trend, trade statistics |
| K-line | 1m–1y periods, historical snapshots, return series, forward/backward adjustment |
| Market | Statistics, rankings, capital flow, industries, indices, constituents, position cost |
| Fundamentals | Company profile, management, income / balance / cash statements, indicators, corporate actions |
| Shareholding | Major and top-ten shareholders, holding changes, institutional, fund, broker holdings, short selling |
| Funds & ETF | Fund NAV, assets, sector allocation, performance, ETF list and constituents |
| Stock Connect | Quota balance, net turnover, holding ratio, rankings |
| IPO | HK and US IPO calendar, offering detail, underwriters, cornerstones, margin, prospectus notices |
| Bonds | Search, profile, quote, order book, rankings, charts, yields, trading status |
| US options | OPRA chain, expirations, quotes, Greeks, rankings, overview |
| News | Search, semantic search, per-symbol news, latest, detail, related, statistics |
| Reference | ISIN, SEDOL, CIK, ADR, currency, trade symbols, trading sessions, symbol mapping |

## Loading reference docs

Decide which domain the question belongs to, then load only the matching file. Do not load them all.

| Situation | Load |
| --- | --- |
| Choosing a toolset, market coverage, out-of-scope checks | `references/toolsets.md` |
| Configuration, API key, connection state | `references/setup-and-auth.md` |
| Tools not visible, 401, validation errors, timeouts | `references/troubleshooting.md` |
| Sample calls and prompts | `references/examples.md` |

## Working rules

1. **Describe before calling.** When the `endpoint` or its fields are unclear, call `describe_tool` first. `detail=summary` (default) for routing, `detail=params` for fields, `detail=full` for one endpoint when a call keeps failing.
2. **Most endpoints need a discriminator.** `ipoType`, `connectType`, `dataType`, `holdingType`, `actionType`, `referenceType`, `optionType` and similar fields are required — `describe_tool` lists the legal values.
3. **Batch modestly.** Keep batch quote, financial, holding and news queries to about 5 subjects or 5 metrics per call.
4. **Markets.** `CN` is the A-share market. `GLOBAL` is cross-market data, currently fixed income — do not use it for ordinary equities.
5. **Out of scope.** Exchange filings, disclosure full text and analyst research are not available. F10 returns structured statements and events; `fiu_news` returns news.

## Core operations

### `call(tool_name, arguments)`

| Argument | Type | Notes |
| --- | --- | --- |
| `tool_name` | `string` | Toolset name, e.g. `quote_spot`, `quote_kline`, `f10_financials`, `fiu_news` |
| `arguments.endpoint` | `string` | Capability within the toolset, e.g. `get_quote`, `get_kline`, `news_search` |
| `arguments.params` | `object` | Business fields, per `describe_tool` or the tool schema |

### `describe(toolNames, detail)`

Returns parameters, market coverage and capability boundaries. Up to 5 names per call; `detail=full` accepts 1 endpoint.

### `list()`

Lists the tools currently exposed. For debugging only, not a routing step.

### `help()`

CLI only — not an MCP tool. Prints subcommand syntax, flags, worked examples and the two environment variables. Runs offline, needs no API key, exits 0.

```bash
node scripts/call.js help     # or run with no arguments
python scripts/call.py -h     # the Python twin uses -h / --help, not `help`
```

Use it when you are unsure of the CLI syntax. To find out *what to call*, use `describe` instead — `help` says nothing about toolsets or endpoints.

## Notes

- Use FIU MCP for anything within its coverage; do not fall back to web search.
- If `describe_tool` and the business toolsets are absent from the session, MCP is not connected — say so instead of guessing.
- Symbols use full suffixes: `00700.hk`, `AAPL.us`, `600519.sh`, `000001.sz`, `6758.jp`. Bonds accept an ISIN.
- Dates are `YYYY-MM-DD`; minute-level K-line, ticks and intraday use `YYYY-MM-DD HH:mm:ss`.
- Never put the API key in `params`.
- Interpret the data objectively; do not give directional buy or sell advice.
