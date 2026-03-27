# FIU MCP Server OpenClaw Skills

[中文](README_CN.md) | [English](README.md)

## Overview

This project provides OpenClaw skills for interacting with SZFIU  MCP Server, enabling AI assistants to access market data and trading capabilities through natural language.

## Features

- **MCP Interface Documentation**: Complete Markdown documentation for all FIU MCP endpoints
- **Market Trading Assistant Skill**: OpenClaw skill for market queries and trading operations
- **Bilingual Support**: Documentation available in both Chinese and English

## Quick Start

### Installation

```bash
# Clone or download this repository
cd fiu-mcp-skills

# Install skills to OpenClaw
cp -r skills/* ~/.openclaw/skills/

# Verify installation
# In OpenClaw chat, type / to see available skills
```

### Configuration

Set your FIU MCP API token in the skill configuration:

```bash
export FIU_MCP_TOKEN="your_jwt_token_here"
```

## Available Skills

### market-assistant

Market trading assistant for querying market data and executing trades.

**Commands:**
- Query stock quotes, K-line data, order book
- Check market status, capital flow, sector information
- Execute trades (simulation by default)

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

## Development

### Project Structure

```
fiu-mcp-skills/
├── README.md
├── README_CN.md
├── docs/
│   ├── mcp-interfaces_CN.md
│   └── mcp-interfaces_EN.md
├── skills/
│   └── market-assistant/
│       ├── SKILL.md
│       └── scripts/
└── scripts/
```

### Testing

After installation, test the skill in OpenClaw:

```
/market-assistant 查询腾讯控股的实时行情
```

## License

MIT License

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## Support

- Documentation: [FIU MCP Docs](https://mcp.szfiu.com)
- Issues: [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
