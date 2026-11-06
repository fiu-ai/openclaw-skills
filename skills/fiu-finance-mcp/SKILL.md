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

Market data for Hong Kong, US, A-share, Japan and global fixed income: quotes, order book, tick trades, K-line, market rankings, capital flow, F10 fundamentals, shareholding, ETF and fund data, IPO, US options, news, financial calendar, macro data, company announcements and reference codes.

Endpoint: `https://ai.szfiu.com/api/mcp/v2` (Streamable HTTP, `Authorization: Bearer <API_KEY>`). The current catalog has 26 business toolsets and 104 endpoints, plus `describe_tool` and `search`.

## How to call

Prefer the FIU MCP tools already exposed in the session. Most business toolsets take the same two arguments:

```json
{
  "endpoint": "get_quote",
  "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
}
```

The flat toolsets `market_overview`, `market_flow`, `market_position_cost`, `shareholding_institution`, `macro_economics` and `company_announcements` keep business fields directly under `arguments`; inspect `tools/list` before calling them.

When no native MCP tool is available, or you need to reproduce a call from the shell:

```bash
node scripts/call.js list
node scripts/call.js describe quote_kline,get_kline
node scripts/call.js call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
```

A Python equivalent is at `scripts/call.py` (uses `requests`, falls back to `urllib`).

## First run

1. Get an API key at `https://ai.szfiu.com`.
2. Configure the MCP client with `https://ai.szfiu.com/api/mcp/v2` and header `Authorization: Bearer <API_KEY>`.
3. For the scripts, export the same value: `export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"`.

Details in `references/setup-and-auth.md`.

## Coverage

| Domain        | Capabilities                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Quotes        | Security search, profile, snapshot and extended quotes for stocks, ETFs, indices, warrants, bonds    |
| Intraday      | Order book, tick trades, intraday and mini trend, trade statistics                                   |
| K-line        | 1m–1y periods, historical snapshots, return series, forward/backward adjustment                     |
| Market        | Statistics, rankings, capital flow, industries, indices, constituents, position cost                 |
| Fundamentals  | Company profile, management, income / balance / cash statements, indicators, corporate actions       |
| Shareholding  | Major and top-ten shareholders, holding changes, institutional and broker holdings, short selling    |
| Funds & ETF   | Global fund search, profile, NAV, performance, risk, complete holdings, exposure, fees and ranking   |
| Stock Connect | Quota balance, net turnover, holding ratio, rankings                                                 |
| IPO           | HK and US IPO calendar, offering detail, underwriters, cornerstones, margin, prospectus notices      |
| Bonds         | Search, profile, quote, order book, rankings, charts, yields, trading status                         |
| US options    | OPRA chain, expirations, quotes, Greeks, rankings, overview                                          |
| News          | Semantic news search, per-symbol news, latest, detail, related news and digest material              |
| Calendar      | Financial-calendar search and event details                                                          |
| Macro         | Curated macroeconomic series                                                                         |
| Announcements | Listed-company announcements with attachment URLs or content                                         |
| Reference     | ISIN, SEDOL, CIK, ADR, currency, trade symbols, trading sessions, symbol mapping                     |

## Loading reference docs

Decide which domain the question belongs to, then load only the matching file. Do not load them all.

| Situation                                                | Load                              |
| -------------------------------------------------------- | --------------------------------- |
| Choosing a toolset, market coverage, out-of-scope checks | `references/toolsets.md`        |
| Configuration, API key, connection state                 | `references/setup-and-auth.md`  |
| Tools not visible, 401, validation errors, timeouts      | `references/troubleshooting.md` |
| Sample calls and prompts                                 | `references/examples.md`        |

## Working rules

1. **Describe before calling.** When the `endpoint` or its fields are unclear, call `describe_tool` first. `detail=summary` (default) for routing, `detail=params` for fields.
2. **Most endpoints need a discriminator.** `ipoType`, `connectType`, `dataType`, `holdingType`, `actionType`, `referenceType`, `optionType` and similar fields are required — `describe_tool` lists the legal values.
3. **Batch modestly.** Keep batch quote, financial, holding and news queries to about 5 subjects or 5 metrics per call.
4. **Markets.** `CN` is the A-share market. `GLOBAL` is cross-market data, currently fixed income — do not use it for ordinary equities.
5. **Out of scope.** Analyst research and disclosure full text are not available. F10 returns structured statements and events; `company_announcements` returns listed-company announcements and attachments; `fiu_news` returns news.

## Core operations

### `call(tool_name, arguments)`

| Argument               | Type       | Notes                                                                               |
| ---------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `tool_name`          | `string` | Toolset name, e.g.`quote_spot`, `quote_kline`, `f10_financials`, `fiu_news` |
| `arguments.endpoint` | `string` | Capability within the toolset, e.g.`get_quote`, `get_kline`, `news_search`    |
| `arguments.params`   | `object` | Business fields, per`describe_tool` or the tool schema                            |

### `describe(toolNames, detail)`

Returns parameters, market coverage and capability boundaries. Up to 5 names per call; `detail` supports `summary` and `params`.

### `list()`

Lists the tools currently exposed. For debugging only, not a routing step.

## Notes

- Use FIU MCP for anything within its coverage; do not fall back to web search.
- If `describe_tool` and the business toolsets are absent from the session, MCP is not connected — say so instead of guessing.
- Symbols use full suffixes: `00700.hk`, `AAPL.us`, `600519.sh`, `000001.sz`, `6758.jp`. Bonds accept an ISIN.
- Dates are `YYYY-MM-DD`; minute-level K-line, ticks and intraday use `YYYY-MM-DD HH:mm:ss`.
- Never put the API key in `params`.
- Successful business responses include `code: 0` and `resultStatus`: `ok` has data; `empty` has no business records and includes `emptyReason`. Treat `isError: true` as a failure, not an empty result.
- Interpret the data objectively; do not give directional buy or sell advice.
