# FIU MCP Server OpenClaw Skills

[English](README.md) | [中文](README_CN.md)

## 概述

本项目提供用于与 SZFIU（深圳融聚汇）MCP Server 交互的 OpenClaw Skills，使 AI 助手能够通过自然语言访问市场数据和交易功能。

## 功能特性

- **MCP 接口文档**：所有 FIU MCP 端点的完整 Markdown 文档
- **行情交易助手技能**：用于市场查询和交易操作的 OpenClaw Skill
- **MCP Router**：通用脚本，可调用所有 FIU MCP API
- **双语支持**：文档同时提供中文和英文版本

## 快速开始

### 安装

```bash
# 克隆或下载本仓库
cd openclaw-skills

# 安装 skills 到 OpenClaw
cp -r skills/* ~/.openclaw/skills/

# 验证安装
# 在 OpenClaw 聊天中输入 / 查看可用技能
```

### 配置

在技能配置中设置您的 FIU MCP API token：

```bash
export FIU_MCP_TOKEN="your_jwt_token_here"
```

**必需的工具：**
- `curl` - HTTP 请求
- `jq` - JSON 处理
- `date` - 日期/时间操作
- `bash` - Shell 执行

**JWT Token 申请：**
申请 MCP Server jwt_token，请访问：https://mcp.szfiu.com/auth/login

## 可用技能

### market-assistant

用于查询市场数据和执行交易的行情交易助手。

**功能：**
- 查询股票行情、K 线数据、买卖盘口、逐笔成交、分时数据
- 检查市场状态、资金流向、板块信息
- 执行交易（默认为模拟环境，实盘需明确确认）
- 实时订阅报价、K 线、逐笔、盘口、分时数据

**MCP Router（推荐）：**
使用通用 `mcp_router.sh` 脚本调用任意 FIU MCP API：

```bash
# 基本用法
mcp_router.sh <市场> <工具名> [参数...]

# 市场: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# 示例
mcp_router.sh hk_sdk quote symbol=00700.HK fields=snapshot
mcp_router.sh us_sdk kline symbol=AAPL ktype=1
mcp_router.sh cn_f10 financials symbol=600519
mcp_router.sh toolkit search keyword=腾讯
```

完整工具列表请参阅 `skills/market-assistant/docs/MCP_TOOLS.md`。

## MCP 服务器列表

| 服务器 | 描述 | 端点 |
|--------|------|------|
| stockHkF10 | 港股市场 F10 数据 | `https://mcp.szfiu.com/stock_hk_f10/` |
| stockUsF10 | 美股市场 F10 数据 | `https://mcp.szfiu.com/stock_us_f10/` |
| stockCnF10 | A 股市场 F10 数据 | `https://mcp.szfiu.com/stock_cn_f10/` |
| stockHkSdk | 港股市场 SDK 数据 | `https://mcp.szfiu.com/stock_hk_sdk/` |
| stockUsSdk | 美股市场 SDK 数据 | `https://mcp.szfiu.com/stock_us_sdk/` |
| stockCnSdk | A 股市场 SDK 数据 | `https://mcp.szfiu.com/stock_cn_sdk/` |
| szfiuToolkit | 证券代码检索工具 | `https://mcp.szfiu.com/toolkit/` |

## 文档

- [MCP 接口文档（中文）](docs/mcp-interfaces_CN.md)
- [MCP 接口文档（英文）](docs/mcp-interfaces_EN.md)
- [MCP 工具参考](skills/market-assistant/docs/MCP_TOOLS.md) - market-assistant 完整工具列表

## 项目结构

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
        ├── SKILL.md          # 英文版（默认）
        ├── SKILL_CN.md       # 中文版
        ├── skill.json        # Skill 元数据清单
        ├── install.sh        # 安装脚本
        ├── docs/
        │   ├── MCP_TOOLS.md
        │   ├── mcp-interfaces_CN.md
        │   └── mcp-interfaces_EN.md
        └── scripts/
            ├── mcp_router.sh  # 通用 MCP Router（推荐）
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

## 测试

安装后在 OpenClaw 中测试技能：

```
/market-assistant 查询腾讯控股的实时行情
```

或直接使用 MCP Router：

```
/market-assistant mcp_router.sh hk_sdk quote symbol=00700.HK
```

## 安全说明

此技能需要 FIU_MCP_TOKEN（JWT）来访问 FIU MCP 服务。请确保：

1. 您的 Token 来自可信来源
2. 使用模拟模式进行测试后再进行实盘交易
3. 对 Token 遵循最小权限原则
4. 密切监控交易活动

## 许可证

MIT License

## 贡献

欢迎贡献！提交 PR 前请阅读我们的贡献指南。

## 支持

- 文档：[FIU MCP Docs](https://mcp.szfiu.com)
- 问题：[GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)