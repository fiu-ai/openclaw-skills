# FIU Finance MCP — OpenClaw Skill

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Markets](<https://img.shields.io/badge/Markets-HK%20%7C%20US%20%7C%20CN%20%7C%20IPO%20%7C%20JP-orange>)](#markets)

[中文文档](README_CN.md) | [Skill definition](skills/fiu-finance-mcp/SKILL_EN.md) | [FIU MCP](http://ai.szfiu.com)

With an AI coding tool, you can query quotes, candlesticks, capital flow, fundamentals,
shareholding, IPOs, bonds and news in plain language. This repo packages the FIU Finance MCP
service as a skill so your agent can answer market questions directly.

---

## ✨ Features

- 🗣 **Natural language** — ask in plain English or Chinese, no parameter wrangling
- 🌏 **Five segments** — HK, US, A-share(Zhcall) and JP markets plus new listings, in one skill
- 📊 **Rich data** — quotes, K-line, capital flow, order book, rankings, fundamentals,
  shareholding, IPOs, bonds, options and news
- 🔀 **One CLI** — a single script (`call.js`, zero dependencies) reaches every FIU MCP tool
- 🧭 **Self-describing** — `describe_tool` returns the live catalog, so the agent never guesses
  a field name
- 📦 **One-command install** — clone, run `install.sh`, set the API key

---

## Install the skill

### One-command install (recommended)

Read and run the following block:

```
# Install the FIU Finance MCP skill

Please run these steps:

## Step 1: get the skill package

git clone https://github.com/fiu-ai/openclaw-skills.git && cd openclaw-skills

## Step 2: install

Run ./install.sh to copy everything under skills/ into the global skills directory.

## Step 3: configure the API key

Tell the user to request an API key at http://ai.szfiu.com, then set:
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"

## Step 4: verify

Run ./test.sh and confirm all five checks pass.
```

### Manual install

| Scope                          | Target directory                   |
| ------------------------------ | ---------------------------------- |
| OpenClaw, global               | `~/.openclaw/skills/`            |
| Claude Code, global            | `~/.claude/skills/`              |
| Claude Code, this project only | `<project root>/.claude/skills/` |

```bash
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

### Configure

Request an API key at [http://ai.szfiu.com](http://ai.szfiu.com), then:

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
```

| Variable                          | Required | Default                            |
| --------------------------------- | -------- | ---------------------------------- |
| `FIU_MCP_GATEWAY_AUTHORIZATION` | yes      | — (`Bearer <API_KEY>`)          |
| `FIU_MCP_URL`                   | no       | `http://ai.szfiu.com/api/mcp/v2` |

Requires `node` and `bash`. `scripts/call.py` is a Python twin of `scripts/call.js` and takes
the same arguments, except that it prints usage via `-h` / `--help` rather than a `help`
subcommand.

### Verify

```bash
./test.sh
```

Five checks — tool catalog, catalog lookup, and HK / US / CN / IPO / JP quotes.

---

## Capability

| Capability             | What you get                                                                     | Markets     |
| ---------------------- | -------------------------------------------------------------------------------- | ----------- |
| Snapshot quotes        | Last price, change, turnover, market cap, valuation                              | HK US CN JP |
| Security search        | Look up stocks, ETFs, indices, funds, warrants, bonds by keyword                 | HK US CN JP |
| Candlesticks           | Minute to monthly K-line, forward / backward adjusted, latest bar                | HK US CN JP |
| Order book             | Real-time bid / ask depth                                                        | HK US CN JP |
| Tick trades            | Tick-by-tick detail, trade history, trade statistics                             | HK US CN JP |
| Intraday trend         | Today's trend line and mini trend chart                                          | HK US CN JP |
| Capital flow           | Inflow / outflow, order-size distribution, trailing N-day flow                   | HK US CN JP |
| Market overview        | Advance / decline distribution and market statistics                             | HK US CN JP |
| Rankings               | Stock, industry, ETF, IPO, broker and option rankings                            | HK US CN JP |
| Industries & indices   | Industry and index lists, constituents, sector membership                        | HK US CN JP |
| Position cost          | Cost range and chip movement distribution                                        | HK US       |
| Company profile        | Basic profile, management, extended profile                                      | HK US CN    |
| Financial statements   | Income, balance sheet, cash flow, key indicators                                 | HK US CN    |
| Business & governance  | Revenue breakdown, dividends, splits, buybacks, halts, AGMs                      | HK US CN    |
| Shareholding           | Major and top-ten shareholders, holding changes                                  | HK US CN    |
| Institutional holdings | Institutional holding detail and statistics                                      | US          |
| Fund / broker holdings | Fund holdings, broker holdings, daily short selling                              | HK US       |
| Funds & ETFs           | NAV, asset and sector allocation, ETF lists and constituents                     | HK US JP    |
| Stock Connect          | Quota, net turnover, rankings, holding ratio                                     | HK CN       |
| IPO                    | Calendar, offerings, underwriters, cornerstone investors, margin, rankings       | HK US       |
| Options                | OPRA chains, quotes, Greeks, overview, rankings                                  | US          |
| Bonds                  | Bond search, profile, quotes, depth, rankings, yield curves                      | `GLOBAL`  |
| News                   | Search, semantic search, per-symbol, latest, detail, digest                      | HK US CN JP |
| Reference data         | ISIN / SEDOL / CIK / ADR, currency, symbol mapping, trading status, market hours | HK US CN JP |

---

## Markets

| Code    | Market           | Symbols                                     |
| ------- | ---------------- | ------------------------------------------- |
| `HK`  | Hong Kong        | `00700.hk`; also warrants / CBBCs         |
| `US`  | United States    | `AAPL.us`; also OPRA options              |
| `CN`  | A-share (Zhcall) | `600519.sh`, `000001.sz`, `300750.sz` |
| `JP`  | Japan            | `6758.jp`                                 |
| `IPO` | New listings     | `00668.hk`                                |

`CN` is a gateway routing label, not a downstream `market` field — A-share(Zhcall) downstreams take
the board (`SH` / `SZ` / `ALL`) in `marketBoard`. Bond endpoints route through `market=GLOBAL`.

---

## Usage

### Natural language

Describe what you want and the agent picks the right call:

- "Quote for Tencent 00700" — snapshot quote
- "AAPL hourly K-line, last 30 bars" — candlesticks
- "Kweichow Moutai capital flow today" — capital flow
- "HK IPOs listed this week" — IPO listings
- "Tencent's latest income statement" — financial statements

### Command line

Three subcommands, all under `skills/fiu-finance-mcp/`. Run them from that directory.

```bash
node scripts/call.js list                       # what the gateway exposes
node scripts/call.js describe <names>           # catalog lookup, up to 5 names
node scripts/call.js call <toolset> ...         # invoke an endpoint
node scripts/call.js help
```

Flags: `--endpoint|-e <endpoint>`, `--param|-p key=value` (repeatable), `--url <url>`,
`--raw`. `symbols` splits on commas into an array; `true`/`false`/`null`/numbers and
`[...]`/`{...}` values are parsed, everything else stays a string. A gateway error goes to
stderr with exit code 1.

`call` also accepts the raw JSON form, which is easier to script:

```bash
node scripts/call.js call quote_spot '{"endpoint":"get_quote","params":{"market":"HK","assetType":"stock","symbols":["00700.hk"]}}'
```

### Tool Call Cheatsheet

**Discovery**

```bash
node scripts/call.js list
node scripts/call.js describe quote_spot,quote_kline,quote_intraday,market_flow,reference
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

`describe_tool` is the entry point: `detail=summary` (default) to route, `detail=params` for
fields and enums, `detail=full` for one endpoint when a call keeps failing. `toolNames` takes
at most 5 entries.

**Quotes and search**

```bash
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
node scripts/call.js call quote_spot -e get_quote -p market=US -p assetType=stock -p symbols=AAPL.us
node scripts/call.js call quote_spot -e get_quote -p market=CN -p assetType=stock -p symbols=600519.sh
node scripts/call.js call quote_spot -e get_quote -p market=JP -p assetType=stock -p symbols=6758.jp
node scripts/call.js call quote_spot -e search_security -p market=HK -p keyword=腾讯 -p limit=5
```

**Intraday, K-line, capital flow**

```bash
node scripts/call.js call quote_kline    -e get_kline          -p market=US -p assetType=stock -p symbol=AAPL.us -p period=60m -p limit=10
node scripts/call.js call quote_intraday -e get_orderbook      -p market=HK -p assetType=stock -p symbol=00700.hk
node scripts/call.js call quote_intraday -e get_intraday_trend -p market=HK -p assetType=stock -p symbol=00700.hk
node scripts/call.js call market_flow    -e get_capital_flow   -p market=HK -p symbol=00700.hk -p flowType=current
```

**Market structure and rankings**

```bash
node scripts/call.js call market_ranking       -e get_rankings           -p market=HK -p rankType=stock -p pageSize=5
node scripts/call.js call market_overview      -e get_market_statistics  -p market=CN
node scripts/call.js call market_structure     -e get_industry_data      -p market=HK -p industryType=list
node scripts/call.js call market_structure     -e get_index_data         -p market=CN -p indexType=list
node scripts/call.js call market_position_cost -e get_position_cost      -p market=HK -p symbol=00700.hk -p costType=range -p price=470
```

**Fundamentals and shareholding**

```bash
node scripts/call.js call f10_financials           -e get_financial_statement -p market=HK -p symbol=00700.hk  -p statementType=income
node scripts/call.js call f10_profile              -e get_company_profile     -p market=CN -p symbol=600519.sh -p dataType=basic
node scripts/call.js call f10_business_governance  -e get_company_action      -p market=HK -p symbol=00700.hk  -p actionType=dividends
node scripts/call.js call shareholding_structure   -e get_shareholders        -p market=CN -p symbol=600519.sh -p holdingType=topten
node scripts/call.js call shareholding_institution -e get_institution_holding -p market=US -p symbol=AAPL.us   -p holdingType=statistics
node scripts/call.js call shareholding_fund_broker -e get_short_sell          -p market=HK -p symbol=00700.hk
```

**Funds, Stock Connect, IPO, derivatives, bonds**

```bash
node scripts/call.js call fund_etf             -e get_etf_data              -p market=HK -p dataType=list -p params='{"sortField":"changeRate","sortType":1}'
node scripts/call.js call stock_connect        -e get_cn_stock_connect_data -p market=CN -p connectType=balance -p params='{"date":"2026-08-06","period":1}'
node scripts/call.js call ipo                  -e get_hk_ipo_list           -p market=HK -p ipoType=listed
node scripts/call.js call quote_derivatives_hk -e get_hk_warrant_catalog    -p market=HK -p warrantType=issuer
node scripts/call.js call quote_us_options     -e get_us_option_chain       -p market=US -p optionType=expiration -p params='{"root":"AAPL"}'
node scripts/call.js call bond_basic           -e search_bond               -p market=GLOBAL -p keyword=treasury
node scripts/call.js call bond_analytics       -e get_bond_yield            -p market=GLOBAL -p bondType=codes
```

**News and reference**

```bash
node scripts/call.js call fiu_news  -e news_latest        -p market=HK -p limit=3
node scripts/call.js call fiu_news  -e news_by_symbol     -p market=US -p symbol=AAPL.us -p limit=3
node scripts/call.js call reference -e get_reference_data -p market=HK -p symbol=00700.hk -p referenceType=isin
node scripts/call.js call reference -e get_trading_status -p market=US -p statusType=session
node scripts/call.js call reference -e get_market_hours   -p market=US
```

---

## Project structure

```
openclaw-skills/
├── README.md                      # This file (English)
├── README_CN.md                   # Chinese version
├── USAGE.md / USAGE_EN.md         # Detailed usage guides
├── install.sh                     # Installs every skill in skills/
├── test.sh                        # Gateway connectivity test
├── docs/
│   ├── mcp-interfaces_CN.md       # Gateway interface reference (中文)
│   └── mcp-interfaces_EN.md       # Gateway interface reference (English)
└── skills/
    └── fiu-finance-mcp/
        ├── SKILL.md               # Skill definition (Chinese)
        ├── SKILL_EN.md            # Skill definition (English)
        ├── skill.json             # Skill manifest
        ├── install.sh             # Skill-level install
        ├── references/
        │   ├── toolsets.md        # Toolset selection & market coverage
        │   ├── setup-and-auth.md  # API key and connection
        │   ├── examples.md        # Sample calls and prompts
        │   └── troubleshooting.md # 401, validation errors, timeouts
        └── scripts/
            ├── call.js            # CLI (Node, no dependencies)
            └── call.py            # Same CLI in Python
```

---

## 🔒 Security notice

- Get your API key only from [http://ai.szfiu.com](http://ai.szfiu.com).
- Pass it via `FIU_MCP_GATEWAY_AUTHORIZATION`; never put it in `params`, in a script, or in a
  commit.
- Apply least privilege to the key and rotate it if it is ever printed to a log or terminal.

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome. Please read the contributing guidelines before submitting PRs.

## 💬 Support

- **Documentation:** [FIU MCP](http://ai.szfiu.com)
- **Issues:** [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
