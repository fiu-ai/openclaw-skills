# FIU MCP Server OpenClaw Skills

[English](README.md) | [中文](README_CN.md)

## 概述

本项目提供用于与 SZFIU（深圳融聚汇）MCP Server 交互的 OpenClaw Skills，使 AI 助手能够通过自然语言访问市场数据和交易功能。

## 从 ClawHub 安装

**market-assistant** 技能已在 ClawHub 上架：

👉 [ClawHub 上的 fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)

### CLI 安装

```bash
npx clawhub@latest install ulnit/fiu-market-assistant
```

安装指定版本：

```bash
npx clawhub@latest install ulnit/fiu-market-assistant@1.0.3
```

### 手动安装

将技能文件夹复制到 OpenClaw 工作区（优先级最高，覆盖全局技能）：

```bash
cp -r skills/market-assistant ~/.openclaw/workspace/skills/
```

### WebUI 安装

1. 打开 OpenClaw WebUI，进入 **技能** 管理界面
2. 选择 **Local → Skills → Configure**，浏览预置技能
3. 用空格键选择所需技能，确认后安装

### 验证安装

```bash
npx clawhub@latest list
```

或查看技能目录下的 `SKILL.md` 了解使用方法和版本信息。

## 功能特性

- **MCP Router**：通用脚本，可调用所有 FIU MCP API（推荐）
- **行情交易助手技能**：用于市场查询和交易操作的 OpenClaw Skill
- **MCP 接口文档**：所有 FIU MCP 端点的完整 Markdown 文档
- **双语支持**：文档同时提供中文和英文版本

## 快速开始

> **提示：** 安装前建议更新 OpenClaw 到最新版本，以避免 Runtime 冲突。

### 安装

选择以下任一方式。详细说明见 [从 ClawHub 安装](#从-clawhub-安装)。

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
mcp_router.sh --list-tools <市场>  # 列出该市场所有可用工具

# 市场: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# 示例
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0
mcp_router.sh cn_f10 financials symbol=600519
mcp_router.sh toolkit search keyword=腾讯

# 发现市场可用工具
mcp_router.sh --list-tools cn_sdk
```

**注意**：不同市场的工具名称可能不同。请使用 `mcp_router.sh --list-tools <市场>` 发现具体的工具名称。完整工具映射请参考 `skills/market-assistant/docs/MCP_TOOLS.md`。

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
- [MCP 工具参考](skills/market-assistant/docs/MCP_TOOLS.md) - 工具映射与发现指南

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
/market-assistant mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot
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

- ClawHub: [fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)
- 文档：[FIU MCP Docs](https://mcp.szfiu.com)
- 问题：[GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
