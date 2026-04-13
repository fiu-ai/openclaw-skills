# FIU MCP Server OpenClaw Skills

[中文](README_CN.md) | [English](README.md)

## Overview

This project provides OpenClaw skills for interacting with SZFIU MCP Server, enabling AI assistants to access market data and trading capabilities through natural language.

## Install from ClawHub

The **fiu-market-assistant** skill is available on ClawHub:

👉 [fiu-market-assistant on ClawHub](https://clawhub.ai/ulnit/fiu-market-assistant)

### CLI Installation

```bash
npx clawhub@latest install fiu-market-assistant
```

Install a specific version:

```bash
npx clawhub@latest install fiu-market-assistant@1.0.3
```

### Manual Installation

Copy the skill folder to OpenClaw workspace (highest priority, overrides global skills):

```bash
cp -r skills/market-assistant ~/.openclaw/workspace/skills/
```

### Install via WebUI

1. Open OpenClaw WebUI, go to **Skills** management
2. Select **Local → Skills → Configure**, browse pre-installed skills
3. Select the skill with space key, confirm to install

### Verify Installation

```bash
npx clawhub@latest list
```

Or check `SKILL.md` for usage and version info.

## Quick Start

> **Tip:** Update OpenClaw to the latest version before installing to avoid runtime conflicts.

### One-Command Setup

After installation, simply run:

```bash
/fiu-market-assistant setup YOUR_FIU_MCP_TOKEN
```

Then ask naturally:

```
Query Tencent Holdings quote
Show AAPL daily K-line
Buy 100 shares Tencent
```

## Available Commands

### Setup & Config

```bash
/fiu-market-assistant setup <token>    # Quick setup with token
/fiu-market-assistant test             # Test connectivity
/fiu-market-assistant status           # Show status
```

### Data Query

```bash
/fiu-market-assistant discover hk_sdk   # Discover available tools
/fiu-market-assistant discover cn_sdk
/fiu-market-assistant quote 00700       # Query quote
/fiu-market-assistant quote AAPL
/fiu-market-assistant kline 00700       # Query K-line
/fiu-market-assistant search 腾讯        # Search stock code
/fiu-market-assistant capflow 00700     # Capital flow
```

### Trading

```bash
/fiu-market-assistant trade buy 00700 100 380   # Buy (SIMULATE mode)
/fiu-market-assistant positions                  # Query positions
/fiu-market-assistant cash                       # Query cash
/fiu-market-assistant orders                     # Query orders
```

## Features

- **Universal MCP Router**: Call all FIU MCP APIs via `mcp_router.sh`
- **CLI Dispatch**: Easy command-line style queries
- **Natural Language**: Simply ask questions in plain English/Chinese
- **Multiple Markets**: HK, US, CN stock markets
- **Real-time Data**: Quotes, K-line, order book, capital flow
- **Trading**: Place orders (default SIMULATE mode)

## MCP Router Usage

```bash
# Basic usage
mcp_router.sh <market> <tool_name> [parameters...]
mcp_router.sh --list-tools <market>  # List available tools

# Markets: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# Examples
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot symbol=00700.HK
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0
mcp_router.sh toolkit search key=腾讯
```

**Note**: Tool names may differ between markets. Use `mcp_router.sh --list-tools <market>` to discover exact tool names.

## MCP Servers

| Server | Description | Endpoint |
|--------|-------------|----------|
| stockHkF10 | HK Market F10 Data | `https://ai.szfiu.com/stock_hk_f10/` |
| stockUsF10 | US Market F10 Data | `https://ai.szfiu.com/stock_us_f10/` |
| stockCnF10 | A-Share Market F10 Data | `https://ai.szfiu.com/stock_cn_f10/` |
| stockHkSdk | HK Market SDK Data | `https://ai.szfiu.com/stock_hk_sdk/` |
| stockUsSdk | US Market SDK Data | `https://ai.szfiu.com/stock_us_sdk/` |
| stockCnSdk | A-Share Market SDK Data | `https://ai.szfiu.com/stock_cn_sdk/` |
| szfiuToolkit | Securities Code Lookup | `https://ai.szfiu.com/toolkit/` |

## Documentation

- [MCP Interface Documentation (Chinese)](docs/mcp-interfaces_CN.md)
- [MCP Interface Documentation (English)](docs/mcp-interfaces_EN.md)
- [MCP Tools Reference](skills/market-assistant/docs/MCP_TOOLS.md) - Known tool mappings

## Project Structure

```
openclaw-skills/
├── README.md
├── README_CN.md
├── USAGE.md
├── USAGE_EN.md
├── install.sh
├── test.sh
├── docs/
│   ├── mcp-interfaces_CN.md
│   └── mcp-interfaces_EN.md
└── skills/
    └── market-assistant/
        ├── SKILL.md          # English (default)
        ├── SKILL_CN.md       # Chinese
        ├── skill.json        # Skill manifest
        ├── install.sh        # Quick setup script
        ├── docs/
        │   ├── MCP_TOOLS.md
        │   └── mcp-interfaces_*.md
        └── scripts/
            ├── cli.sh         # Main dispatch script
            ├── mcp_router.sh # Universal MCP Router
            └── *.sh          # Individual scripts
```

## Security Notice

This skill requires a FIU_MCP_TOKEN (JWT) to access the FIU MCP service. Please ensure:

1. Your token is obtained from a trusted source
2. Use SIMULATE mode for testing before real trading
3. Apply least-privilege principle to your token
4. Monitor trading activity closely

## License

MIT License

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## Support

- ClawHub: [fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)
- Documentation: [FIU MCP Docs](https://ai.szfiu.com)
- Issues: [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)