# FIU MCP Server — OpenClaw Skills

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ClawHub](https://img.shields.io/badge/ClawHub-fi--market--assistant-purple)](https://clawhub.ai/ulnit/fiu-market-assistant)
[![Markets](https://img.shields.io/badge/Markets-A%E8%82%A1%20%7C%20%E6%B8%AF%E8%82%A1%20%7C%20%E7%BE%8E%E8%82%A1-orange)](#features)

> OpenClaw skills for FIU MCP Server — query A-share, HK, and US market data through natural language.

[中文文档](#中文快速开始) | [English Quick Start](#english-quick-start) | [ClawHub](https://clawhub.ai/ulnit/fiu-market-assistant) | [FIU MCP Docs](https://ai.szfiu.com)

---

## ✨ Features

- **🗣️ Natural Language** — Ask questions in plain English or Chinese
- **🌏 Three Markets** — A-share, HK, US stock data in one skill
- **📊 Rich Data** — Quotes, K-line, capital flow, order book, rankings
- **💹 Trading Support** — Place simulated orders, check positions & cash
- **🔀 Universal Router** — One script (`mcp_router.sh`) to call all FIU MCP APIs
- **📦 ClawHub Ready** — One-line install from ClawHub registry

---

## English Quick Start

### Install

```bash
npx clawhub@latest install fiu-market-assistant
```

### Setup

```bash
/fiu-market-assistant setup YOUR_FIU_MCP_TOKEN
```

### Use

Just ask naturally:

```
Query Tencent Holdings quote
Show AAPL daily K-line
What's the capital flow for 00700?
```

---

## 中文快速开始

### 安装

```bash
npx clawhub@latest install fiu-market-assistant
```

### 配置

```bash
/fiu-market-assistant setup 你的FIU_MCP_TOKEN
```

### 使用

直接用自然语言提问：

```
查询腾讯控股行情
显示 AAPL 日线K线
00700 的资金流向如何？
```

---

## Installation Methods

### 1. ClawHub (Recommended)

```bash
# Latest version
npx clawhub@latest install fiu-market-assistant

# Specific version
npx clawhub@latest install fiu-market-assistant@1.0.3

# Verify installation
npx clawhub@latest list
```

### 2. Manual Install

Copy the skill folder to your OpenClaw workspace (highest priority, overrides global skills):

```bash
cp -r skills/market-assistant ~/.openclaw/workspace/skills/
```

### 3. WebUI Install

1. Open OpenClaw WebUI → **Skills** management
2. Select **Local → Skills → Configure**
3. Browse pre-installed skills, select with space key, confirm to install

> 💡 **Tip:** Update OpenClaw to the latest version before installing to avoid runtime conflicts.

---

## Available Commands

### Setup & Diagnostics

| Command | Description |
|---------|-------------|
| `/fiu-market-assistant setup <token>` | Quick setup with JWT token |
| `/fiu-market-assistant test` | Test connectivity to FIU MCP |
| `/fiu-market-assistant status` | Show current configuration status |

### Data Query

| Command | Description |
|---------|-------------|
| `/fiu-market-assistant discover <market>` | List available tools for a market |
| `/fiu-market-assistant quote <code>` | Query real-time quote |
| `/fiu-market-assistant kline <code>` | Query K-line chart data |
| `/fiu-market-assistant search <keyword>` | Search stock code by name |
| `/fiu-market-assistant capflow <code>` | Query capital flow |

### Trading (SIMULATE Mode)

| Command | Description |
|---------|-------------|
| `/fiu-market-assistant trade buy <code> <qty> <price>` | Place buy order |
| `/fiu-market-assistant positions` | Query current positions |
| `/fiu-market-assistant cash` | Query available cash |
| `/fiu-market-assistant orders` | Query order history |

---

## MCP Router

The `mcp_router.sh` script provides a unified interface to all FIU MCP APIs:

```bash
# Basic usage
mcp_router.sh <market> <tool_name> [parameters...]

# List available tools for a market
mcp_router.sh --list-tools <market>
```

**Supported markets:** `hk_f10`, `us_f10`, `cn_f10`, `hk_sdk`, `us_sdk`, `cn_sdk`, `toolkit`

**Examples:**

```bash
# Query HK quote
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot symbol=00700.HK

# Query K-line
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0

# Search stock code
mcp_router.sh toolkit search key=腾讯
```

> ⚠️ Tool names may differ between markets. Always use `--list-tools` to discover exact names.

---

## MCP Servers Reference

| Server | Market | Description | Endpoint |
|--------|--------|-------------|----------|
| `stockCnF10` | A 股 | F10 fundamentals | `https://ai.szfiu.com/api/mcp/stock_cn_f10/` |
| `stockHkF10` | 港股 | F10 fundamentals | `https://ai.szfiu.com/api/mcp/stock_hk_f10/` |
| `stockUsF10` | 美股 | F10 fundamentals | `https://ai.szfiu.com/api/mcp/stock_us_f10/` |
| `stockCnSdk` | A 股 | SDK deep data | `https://ai.szfiu.com/api/mcp/stock_cn_sdk/` |
| `stockHkSdk` | 港股 | SDK deep data | `https://ai.szfiu.com/api/mcp/stock_hk_sdk/` |
| `stockUsSdk` | 美股 | SDK deep data | `https://ai.szfiu.com/api/mcp/stock_us_sdk/` |
| `szfiuToolkit` | All | Stock code lookup | `https://ai.szfiu.com/api/mcp/toolkit/` |

---

## Project Structure

```
openclaw-skills/
├── README.md                    # This file (English)
├── README_CN.md                 # Chinese version
├── USAGE.md / USAGE_EN.md       # Detailed usage guides
├── install.sh                   # Quick setup script
├── test.sh                      # Connectivity test
├── docs/
│   ├── mcp-interfaces_CN.md     # MCP interface docs (中文)
│   └── mcp-interfaces_EN.md     # MCP interface docs (English)
└── skills/
    └── market-assistant/
        ├── SKILL.md             # Skill definition (English)
        ├── SKILL_CN.md          # Skill definition (中文)
        ├── skill.json           # Skill manifest
        ├── install.sh           # Skill-level setup
        ├── docs/
        │   ├── MCP_TOOLS.md     # Known tool mappings
        │   └── mcp-interfaces_*.md
        └── scripts/
            ├── cli.sh           # Main dispatch script
            ├── mcp_router.sh    # Universal MCP router
            └── *.sh             # Individual tool scripts
```

---

## 🔒 Security Notice

This skill requires a `FIU_MCP_TOKEN` (JWT) to access the FIU MCP service.

1. Obtain your token only from [https://ai.szfiu.com](https://ai.szfiu.com)
2. **Always use SIMULATE mode** for testing before real trading
3. Apply the principle of least privilege to your token
4. Monitor trading activity closely

---

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 💬 Support

- **ClawHub:** [fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)
- **Documentation:** [FIU MCP Docs](https://ai.szfiu.com)
- **Issues:** [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
