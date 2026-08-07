# FIU MCP Gateway Interface Documentation

Complete interface specification for AI tools and integrators. Contents were pulled from a live
full `describe_tool` sweep of the gateway: **24 tools, 86 endpoints, 5 markets**.

## Table of Contents

- [Connection](#connection)
- [Call model](#call-model)
- [Markets and symbols](#markets-and-symbols)
- [describe_tool](#describe_tool)
- [Endpoint catalog](#endpoint-catalog)
- [Error codes](#error-codes)

---

## Connection

| Item | Value |
|------|-------|
| Endpoint | `http://ai.szfiu.com/api/mcp/v2` |
| Transport | Streamable HTTP (JSON-RPC 2.0, SSE responses) |
| Protocol version | `2025-06-18` (`Mcp-Protocol-Version` header) |
| Auth | `Authorization: Bearer <API_KEY>` |
| Session | `initialize` returns `Mcp-Session-Id`; echo it on every subsequent request |

MCP client configuration:

```json
{
    "mcpServers": {
        "fiuFinance": {
            "description": "FIU Finance MCP gateway",
            "transport": "streamable_http",
            "url": "http://ai.szfiu.com/api/mcp/v2",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

The handshake is `initialize` → `notifications/initialized` → `tools/call`. SSE responses use
CRLF line endings — take the last `data:` line and parse it. A command-line implementation
lives in `skills/fiu-finance-mcp/scripts/call.js` (Node, zero dependencies) and `call.py`
(Python).

---

## Call model

Tools are not one-function-per-endpoint; they are **toolsets**. Every business tool takes
exactly two arguments:

```json
{
    "name": "quote_spot",
    "arguments": {
        "endpoint": "get_quote",
        "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
    }
}
```

- `endpoint` — the capability inside the toolset; see the [catalog](#endpoint-catalog).
- `params` — business fields; `market` and friends go at this level.
- `params.params` — pass-through for downstream fields the gateway does not surface as named
  params, e.g. `{"sortField":"changeRate","sortType":1}`.

**Most endpoints require a discriminator field** that selects among several downstream APIs:
`statementType`, `dataType`, `holdingType`, `actionType`, `referenceType`, `optionType`,
`connectType`, `ipoType`, `costType`, `warrantType`, `bondType`, `statusType`, `industryType`,
`indexType`, `rankType`, `flowType`, `historyType`, `statisticsType`. Look up the accepted
values with `describe_tool` at `detail=params`.

---

## Markets and symbols

| Market code | Market | Symbol examples |
|-------------|--------|-----------------|
| `HK` | Hong Kong | `00700.hk` |
| `US` | United States | `AAPL.us` |
| `CN` | A-share (Shanghai / Shenzhen) | `600519.sh`, `000001.sz`, `300750.sz` |
| `JP` | Japan | `6758.jp` |
| `GLOBAL` | Bond routing label | ISIN, e.g. `US91282CHZ77` |

- `CN` and `GLOBAL` are **gateway routing labels**, not the downstream `market` field.
  A-share downstreams take the board in `marketBoard` (`ALL` / `SH` / `SZ`).
- `GLOBAL` routes to the `bond_basic` and `bond_analytics` toolsets.
- Dates are `YYYY-MM-DD`; minute K-line, ticks and intraday take `YYYY-MM-DD HH:mm:ss`.
- The market list on a tool is a **union** — an individual endpoint can be narrower. For
  example `fund_etf` is tagged `HK/JP/US`, but `get_fund_performance` is US-only.
- Keep batch quote, financial, holding and news queries to about 5 subjects per call;
  `get_security_profile` caps `symbols` at 50.

---

## describe_tool

The catalog tool, and the entry point for every call.

| detail | Use for | Limit |
|--------|---------|-------|
| `summary` (default) | Picking a toolset, checking market and asset coverage | up to 5 names |
| `params` | Field names, required flags, enum values | up to 5 names |
| `full` | Debugging one endpoint that keeps failing | 1 endpoint |

```json
{ "name": "describe_tool", "arguments": { "toolNames": ["quote_spot"], "detail": "params" } }
```

```bash
node scripts/call.js describe quote_spot,quote_kline,quote_intraday,market_flow,reference
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

---

## Endpoint catalog

### quote_spot — spot quotes

Markets `CN GLOBAL HK JP US`; assets `bond etf fund index stock warrant`

| endpoint | Description |
|----------|-------------|
| `search_security` | Search stocks, ETFs, indices, funds, warrants or bonds |
| `get_security_profile` | Static reference profile for a security or bond (max 50 `symbols`) |
| `get_quote` | Real-time / snapshot quotes for stocks, ETFs, indices, warrants, bonds |
| `get_security_definition` | Security master detail, new-listing reference lists |

### quote_intraday — intraday data

Markets `CN GLOBAL HK JP US`; assets `bond etf index stock`

| endpoint | Description |
|----------|-------------|
| `get_orderbook` | Order book / depth |
| `get_trades` | Tick-by-tick trades |
| `get_intraday_trend` | Intraday trend line |
| `get_trade_history` | Historical tick data |
| `get_trade_statistics` | Trade statistics overview and detail |
| `get_mini_trend` | Mini trend chart |

### quote_kline — candlesticks

Markets `CN GLOBAL HK JP US`; assets `bond etf index stock`

| endpoint | Description |
|----------|-------------|
| `get_kline` | Historical K-line (`period` `1m`–`240m` plus daily/weekly/monthly, `adjust` for forward/backward adjustment) |
| `get_latest_kline` | Latest candle |
| `get_snapshot_history` | Historical security snapshots |

### quote_derivatives_hk — HK derivatives and extended quotes

Markets `CN GLOBAL HK JP US`; assets `bond etf index stock warrant`

| endpoint | Description |
|----------|-------------|
| `get_quote_extend` | Extended quote with fuller price, turnover, market-cap and valuation fields |
| `get_hk_warrant_catalog` | HK warrant / CBBC catalog, issuers and descriptions |
| `get_hk_warrant_trading_data` | HK warrant trade statistics, active lists, historical trend |

### quote_us_options — US options

Markets `US`

| endpoint | Description |
|----------|-------------|
| `get_us_option_chain` | Expirations, chains, contract lists, snapshots and Greeks |
| `get_us_option_quote` | Contract snapshot, depth, ticks, K-line, intraday, trade statistics |
| `get_us_option_overview` | Options market overview and ETF options overview |
| `get_us_option_rankings` | Options rankings |

### market_overview — market overview

Markets `CN HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_market_statistics` | Advance/decline distribution and other market statistics |

### market_ranking — rankings

Markets `CN HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_rankings` | Stock, industry, ETF, IPO, options and broker rankings |

### market_flow — capital flow

Markets `CN HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_capital_flow` | Capital flow, turnover distribution, N-day flow |

### market_structure — industries and indices

Markets `CN HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_industry_data` | Industry list, rankings, constituents, sector membership |
| `get_index_data` | Index list, quotes, constituents, mappings, capital distribution |
| `get_market_microstructure` | Spread, cross-market premium, dual counter, broker seats (HK) |

### market_position_cost — position cost

Markets `HK US`

| endpoint | Description |
|----------|-------------|
| `get_position_cost` | Cost range (`costType=range` + `price`) and cost distribution (`costType=distribution` + `high` / `low`) |

### f10_profile — company profile

Markets `CN HK US`

| endpoint | Description |
|----------|-------------|
| `get_company_profile` | Basic company profile, company data, related information |
| `get_company_management` | Executives and management |
| `get_company_extra_profile` | Extended / special-security profile |

### f10_financials — financial statements

Markets `CN HK US`

| endpoint | Description |
|----------|-------------|
| `get_financial_statement` | Income statement, balance sheet, cash flow (`statementType`) |
| `get_financial_indicator` | Key financial indicators |

### f10_business_governance — business and governance

Markets `CN HK US`

| endpoint | Description |
|----------|-------------|
| `get_business_segment` | Revenue breakdown / business segments |
| `get_company_action` | Dividends, splits, AGMs, symbol changes, transfers, buybacks, halts, share-capital changes |

### shareholding_structure — shareholding structure

Markets `CN HK US`

| endpoint | Description |
|----------|-------------|
| `get_shareholders` | Major shareholders, top ten, current holdings, equity detail |
| `get_shareholding_change` | Share-capital changes, insider holding changes |

### shareholding_institution — institutional holdings

Markets `US`

| endpoint | Description |
|----------|-------------|
| `get_institution_holding` | Institutional holding detail or statistics |

### shareholding_fund_broker — fund / broker holdings and short selling

Markets `HK US`

| endpoint | Description |
|----------|-------------|
| `get_fund_holding` | Fund holdings or fund constituents (US) |
| `get_broker_holding` | HK broker holding ratio, detail, rankings |
| `get_short_sell` | Daily short selling |

### fund_etf — funds and ETFs

Markets `HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_fund_data` | Fund NAV, asset allocation, sector allocation |
| `get_etf_data` | ETF list, types, constituents, issuers, investment region and direction |
| `get_fund_performance` | Historical fund performance (US only) |

### stock_connect — Stock Connect

Markets `CN HK`

| endpoint | Description |
|----------|-------------|
| `get_stock_connect_data` | Combined Shanghai/Shenzhen–Hong Kong Connect data |
| `get_hk_stock_connect_data` | Hong Kong Connect / northbound data |
| `get_cn_stock_connect_data` | Mainland Connect / southbound data |

### ipo — new listings

Markets `HK US`

| endpoint | Description |
|----------|-------------|
| `get_hk_ipo_calendar` | HK IPO calendar |
| `get_hk_ipo_list` | HK new-listing lists: subscribing today, pending, listed, filed (`ipoType`) |
| `get_hk_ipo_detail` | Offering detail and allotment results |
| `get_hk_ipo_company_profile` | IPO company profile |
| `get_hk_ipo_underwriter` | Underwriters and sponsors |
| `get_hk_ipo_cornerstone_investor` | Cornerstone investors |
| `get_hk_ipo_margin_info` | Subscription multiple, subscription amount, margin |
| `get_hk_ipo_rankings` | Hot subscriptions, first-day return, sponsor, underwriter, cornerstone rankings |
| `get_hk_ipo_notice` | Prospectus and filing announcements (IPO scope only) |
| `get_hk_ipo_subscription_tools` | Subscription calculator, lot counts, brokers, methods, allotment lots |
| `get_hk_ipo_market_data` | HK IPO market overview, industry statistics and performance |
| `get_us_ipo_list` | US pending / listed new issues, trend, PE TTM |
| `get_us_ipo_detail` | US IPO detail |
| `get_us_ipo_underwriter` | US underwriter performance and detail |
| `get_us_ipo_market_data` | US IPO market overview and industry performance |
| `search_ipo_content` | Search IPO news or content |
| `get_ipo_news` | IPO news list, detail, hot, rankings, recommended, related |
| `get_ipo_topic` | IPO topic list, pinned, detail, related news |
| `get_ipo_course` | IPO course list, hot, rankings, recommended, detail |
| `get_ipo_tags` | IPO content tags |

### bond_basic — bond basics

Markets `GLOBAL`

| endpoint | Description |
|----------|-------------|
| `search_bond` | Search bonds |
| `get_bond_profile` | Bond profile, bond master, institutional bond pools |
| `get_bond_quote` | Bond snapshot, extended quote, yield snapshot |
| `get_bond_orderbook` | Bond order book |

### bond_analytics — bond analytics

Markets `GLOBAL`

| endpoint | Description |
|----------|-------------|
| `get_bond_rankings` | Bond rankings, simple rankings, bond ETF rankings |
| `get_bond_chart` | Historical trend, intraday, yield K-line / intraday, treasury yield list |
| `get_bond_yield` | Yield master, snapshot, K-line, intraday |
| `get_bond_trading_status` | Bond and bond-yield market trading status |

### fiu_news — news

Markets `CN GLOBAL HK JP US`

| endpoint | Description |
|----------|-------------|
| `news_search` | Search news |
| `news_semantic_search` | Search news by semantic similarity |
| `news_by_symbol` | News for a given symbol |
| `news_latest` | Latest news over a recent window |
| `news_get` | Fetch one article by ID |
| `news_related` | Related articles by ID |
| `news_count` | Count articles matching a filter |
| `news_digest` | AI-summary-ready material, returns `content_preview` |

### reference — reference data

Markets `CN GLOBAL HK JP US`

| endpoint | Description |
|----------|-------------|
| `get_reference_data` | ISIN, SEDOL, CIK, ADR, currency, trading master, base master, warrant linkage, bond master |
| `get_trading_status` | Trading dates, sessions, ex-rights events, security status, delisting list |
| `get_symbol_mapping` | Symbol/name mapping, index mapping |
| `get_market_hours` | Market session status |

---

## Error codes

| code | Meaning | What to do |
|------|---------|------------|
| `INVALID_ARGUMENT` | Tool arguments invalid (missing required, wrong type) | Add the parameter it names |
| `INVALID_SEMANTIC_INPUT` | Gateway semantic validation failed (market / asset / date / paging) | Fix each entry in `details.issues` |
| `INVALID_DOWNSTREAM_ARGS` | Semantic layer passed, downstream still wants fields | `details.issues` names each one; add them under `params.params` |
| `UNSUPPORTED_ROUTE` | No downstream route for that endpoint in that market | Switch markets, or check coverage with `describe_tool` |
| `-32602` | JSON-RPC validation failed (e.g. more than 5 `toolNames`) | Shrink the request |

`INVALID_DOWNSTREAM_ARGS` `details` shape:

```json
{
    "semanticToolName": "get_etf_data",
    "downstreamPath": "/v3/etf/list",
    "issues": [
        { "path": "sortField", "message": "downstream requires field sortField" },
        { "path": "sortType",  "message": "downstream requires field sortType" }
    ]
}
```

Fix:

```bash
node scripts/call.js call fund_etf -e get_etf_data -p market=HK -p dataType=list \
    -p params='{"sortField":"changeRate","sortType":1}'
```

Known endpoints that need pass-through fields:

| Call | Needs |
|------|-------|
| `fund_etf / get_etf_data` (HK, `dataType=list`) | `sortField`, `sortType` |
| `stock_connect / get_cn_stock_connect_data` | `date`, `period` |
| `quote_us_options / get_us_option_chain` | `root` |
| `reference / get_trading_status` (HK, `statusType=session`) | `timeMode` (US / CN do not need it) |
