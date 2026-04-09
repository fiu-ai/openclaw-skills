# FIU MCP Server OpenClaw Skills

[中文](README_CN.md) | [English](README.md)

## Overview

This project provides OpenClaw skills for interacting with SZFIU MCP Server, enabling AI assistants to access market data and trading capabilities through natural language.

## Install from ClawHub

The **market-assistant** skill is available on ClawHub:

👉 [fiu-market-assistant on ClawHub](https://clawhub.ai/ulnit/fiu-market-assistant)

### CLI Installation

```bash
npx clawhub@latest install ulnit/fiu-market-assistant
```

Install a specific version:

```bash
npx clawhub@latest install ulnit/fiu-market-assistant@1.0.3
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

## Features

- **MCP Router**: Universal script to call all FIU MCP APIs (recommended)
- **Market Trading Assistant**: OpenClaw skill for market queries and trading operations
- **MCP Interface Documentation**: Complete Markdown documentation for all FIU MCP endpoints
- **Bilingual Support**: Documentation available in both Chinese and English

## Quick Start

> **Tip:** Update OpenClaw to the latest version before installing to avoid runtime conflicts.

### Installation

Choose one of the methods below. See [Install from ClawHub](#install-from-clawhub) for detailed instructions.

### Configuration

Set your FIU MCP API token in the skill configuration:

```bash
export FIU_MCP_TOKEN="your_jwt_token_here"
```

**Required Binaries:**
- `curl` - HTTP requests
- `jq` - JSON processing
- `date` - Date/time operations
- `bash` - Shell execution

**JWT Token Application:**
To obtain your MCP Server jwt_token, visit: https://mcp.szfiu.com/auth/login

## Available Skills

### market-assistant

Market trading assistant for querying market data and executing trades.

**Features:**
- Query stock quotes, K-line data, order book, tick data, intraday data
- Check market status, capital flow, sector information
- Execute trades (simulation by default, real trading requires explicit confirmation)
- Real-time subscriptions for quotes, K-line, tick, order book, intraday

**MCP Router (Recommended):**
Use the universal `mcp_router.sh` script to call any FIU MCP API:

```bash
# Basic usage
mcp_router.sh <market> <tool_name> [parameters...]
mcp_router.sh --list-tools <market>  # List all available tools

# Markets: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# Examples
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0
mcp_router.sh cn_f10 financials symbol=600519
mcp_router.sh toolkit search keyword=腾讯

# Discover available tools for a market
mcp_router.sh --list-tools cn_sdk
```

**Note**: Tool names may differ between markets. Use `mcp_router.sh --list-tools <market>` to discover exact tool names. See `skills/market-assistant/docs/MCP_TOOLS.md` for known tool mappings.

## MCP Servers

| Server | Description | Endpoint |
|--------|-------------|----------|
| stockHkF10 | HK Market F10 Data | `https://mcp.szfiu.com/stock_hk_f10/` |
| stockUsF10 | US Market F10 Data | `https://mcp.szfiu.com/stock_us_f10/` |
| stockCnF10 | A-Share Market F10 Data | `https://mcp.szfiu.com/stock_cn_f10/` |
| stockHkSdk | HK Market SDK Data | `https://mcp.szfiu.com/stock_hk_sdk/` |
| stockUsSdk | US Market SDK Data | `https://mcp.szfiu.com/stock_us_sdk/` |
| stockCnSdk | A-Share Market SDK Data | `https://mcp.szfiu.com/stock_cn_sdk/` |
| szfiuToolkit | Securities Code Lookup | `https://mcp.szfiu.com/toolkit/` |

## Documentation

- [MCP Interface Documentation (Chinese)](docs/mcp-interfaces_CN.md)
- [MCP Interface Documentation (English)](docs/mcp-interfaces_EN.md)
- [MCP Tools Reference](skills/market-assistant/docs/MCP_TOOLS.md) - Known tool mappings and discovery guide

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
        ├── skill.json        # Skill manifest (metadata)
        ├── install.sh        # Installation script
        ├── docs/
        │   ├── MCP_TOOLS.md
        │   ├── mcp-interfaces_CN.md
        │   └── mcp-interfaces_EN.md
        └── scripts/
            ├── mcp_router.sh  # Universal MCP Router (recommended)
            ├── quote.sh
            ├── kline.sh
            ├── orderbook.sh
            ├── capital.sh
            ├── trade.sh
            ├── search.sh
            ├── cash.sh
            ├── positions.sh
            └── market_status.sh
```

## Testing

After installation, test the skill in OpenClaw:

```
/market-assistant Query Tencent Holdings real-time quote
```

Or use MCP Router directly:

```
/market-assistant mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot
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
- Documentation: [FIU MCP Docs](https://mcp.szfiu.com)
- Issues: [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
