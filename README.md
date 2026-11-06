[English](README.md) | [中文](README_CN.md)

# FIU Skills

Agent skills for the FIU Finance MCP server — market data for Hong Kong, US, A-share, Japan and global fixed income. Provided by Rongjuhui, a financial information provider.Access global market quotes, news, and financial data covering Hong Kong stocks, US stocks, A-shares (China Connect), Japanese stocks, global indices, funds, and bonds. Supported data includes quotes and order books, candlestick and intraday charts, fund flow analysis, industries, concepts and investment themes, financials, financial reports, announcement feeds, corporate actions, share capital and shareholders, valuations, research reports, ETF NAVs and holdings, IPOs, bonds, options, financial news, investment and economic calendars, macroeconomic data, and searches for global security codes and international identifiers.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/Skills-1-green.svg)](#available-skills)
[![Markets](<https://img.shields.io/badge/Markets-HK%20%7C%20US%20%7C%20CN%20%7C%20JP%20%7C%20Global-orange.svg>)](docs/mcp-interfaces_EN.md)

## Overview

This repository packages the FIU Finance MCP capabilities as an installable agent skill. The skill teaches the agent which toolset answers which question, what parameters each endpoint takes, and where the data boundaries are — so it routes correctly instead of guessing.

Backed by 26 toolsets over 104 endpoints at `https://ai.szfiu.com/api/mcp/v2`. Together with `describe_tool` and `search`, the service exposes 28 MCP tools.

## Install

### From ClawHub

```bash
npx clawhub@latest install fiu-finance-mcp
```

### Manual

```bash
git clone https://github.com/fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

Or copy a single skill:

```bash
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

The repository also documents the official npm/npx stdio adapter (`fiu-finance-mcp`) for clients that cannot connect to remote Streamable HTTP. It requires Node.js 20.18.1 or newer and uses `FIU_API_KEY`.

### Verify

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
./test.sh
```

## Quick Start

1. **Get an API key** at https://ai.szfiu.com
2. **Export it** so the helper scripts can authenticate:

   ```bash
   export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
   ```
3. **Or configure the MCP server directly** in your client:

   ```json
   {
     "mcpServers": {
       "fiu-finance": {
         "type": "streamableHttp",
         "url": "https://ai.szfiu.com/api/mcp/v2",
         "headers": { "Authorization": "Bearer YOUR_API_KEY" }
       }
     }
   }
   ```
4. **Ask naturally:**

   ```text
   What is Tencent trading at right now?
   Show me the last 60 daily candles for AAPL.
   Which Hong Kong IPOs are open for subscription this week?
   Kweichow Moutai's revenue and net profit over the last three years.
   ```

## Available Skills

| Skill                                         | Description                                                                                                                                                                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`fiu-finance-mcp`](skills/fiu-finance-mcp/) | Quotes, order book, K-line, market rankings, capital flow, F10 fundamentals, shareholding, ETF and fund data, Stock Connect, IPO, bonds, US options, news, financial calendar, macro data, company announcements and reference codes across HK, US, CN, JP and global fixed income |

## Features

- **Routing built in** — the skill maps user intent to a toolset, so the agent picks `f10_financials` for a balance sheet and `ipo` for a prospectus without trial and error.
- **Parameters up front** — required discriminators (`ipoType`, `connectType`, `holdingType`, …) and their legal values are documented, cutting the describe-retry loop.
- **Boundaries stated** — the skill says plainly what is *not* covered (filings full text, analyst research), so the agent stops instead of hallucinating.
- **Progressive reference loading** — four reference files are loaded on demand by topic, not all at once.
- **Shell fallback** — Node.js and Python helper scripts reproduce any call from the command line.
- **Latest catalog** — 26 toolsets and 104 endpoints, including financial calendar, macro economics and listed-company announcements.

## Helper scripts

Both scripts speak MCP Streamable HTTP directly and default to `https://ai.szfiu.com/api/mcp/v2`.

```bash
cd ~/.openclaw/skills/fiu-finance-mcp

node scripts/call.js list
node scripts/call.js describe quote_kline,get_kline
node scripts/call.js call quote_spot --endpoint get_quote \
  --param market=HK --param assetType=stock --param symbols=00700.hk
```

```bash
python scripts/call.py list
python scripts/call.py describe f10_financials
python scripts/call.py call f10_financials --endpoint get_financial_statement \
  --param market=HK --param symbol=00700.hk --param statementType=income
```

On error, both scripts write to stderr and exit non-zero, so automation can tell data from failure.

## Documentation

| Document                                                          | Contents                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| [USAGE_EN.md](USAGE_EN.md)                                         | Full usage guide — install, configure, call, troubleshoot   |
| [docs/mcp-interfaces_EN.md](docs/mcp-interfaces_EN.md)             | All 26 toolsets and 104 endpoints with current routing notes |
| [skills/fiu-finance-mcp/SKILL.md](skills/fiu-finance-mcp/SKILL.md) | The skill definition the agent reads                         |

## Project structure

```
openclaw-skills/
├── README.md               English
├── README_CN.md            中文
├── USAGE.md                使用指南
├── USAGE_EN.md             Usage guide
├── install.sh              Install all skills
├── test.sh                 Verify connection and credentials
├── docs/
│   ├── mcp-interfaces_EN.md
│   └── mcp-interfaces_CN.md
└── skills/
    └── fiu-finance-mcp/
        ├── SKILL.md
        ├── SKILL_CN.md
        ├── skill.json
        ├── install.sh
        ├── references/
        │   ├── toolsets.md
        │   ├── setup-and-auth.md
        │   ├── troubleshooting.md
        │   └── examples.md
        └── scripts/
            ├── call.js
            └── call.py
```

## Security

- The API key lives in an environment variable or your client's header config — never in a skill file, a prompt, or a business parameter.
- `.gitignore` excludes `.env` and `*.key`. Do not commit credentials.
- Rotate the key at https://ai.szfiu.com if it is exposed.

## License

[MIT](LICENSE)

## Support

- Issues: https://github.com/fiu-ai/openclaw-skills/issues
- MCP server: https://github.com/fiu-ai/mcp-server
- Service: https://ai.szfiu.com
