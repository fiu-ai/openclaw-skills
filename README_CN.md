# FIU MCP Server OpenClaw Skills

[English](README.md) | [中文](README_CN.md)

## 概述

本项目提供用于与 SZFIU（深圳融聚汇）MCP Server 交互的 OpenClaw Skills，使 AI 助手能够通过自然语言访问市场数据和交易功能。

## 功能特性

- **MCP 接口文档**：所有 FIU MCP 端点的完整 Markdown 文档
- **行情交易助手技能**：用于市场查询和交易操作的 OpenClaw Skill
- **双语支持**：文档同时提供中文和英文版本

## 快速开始

### 安装

```bash
# 克隆或下载本仓库
cd fiu-mcp-skills

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

**JWT Token 申请：**
申请 MCP Server jwt_token，请访问：https://mcp.szfiu.com/auth/login

## 可用技能

### market-assistant

用于查询市场数据和执行交易的行情交易助手。

**功能：**
- 查询股票行情、K 线数据、买卖盘口
- 检查市场状态、资金流向、板块信息
- 执行交易（默认为模拟环境）

## MCP 服务器列表

| 服务器 | 描述 | 端点 |
|--------|------|------|
| stockHkF10 | 港股市场 F10 数据 | `https://mcp.szfiu.com/stock_hk_f10/` |
| stockUsF10 | 美股市场 F10 数据 | `https://mcp.szfiu.com/stock_us_f10/` |
| ~~stockCnF10~~ | ~~A 股市场 F10 数据~~ | ~~`https://mcp.szfiu.com/stock_cn_f10/`~~ |
| stockHkSdk | 港股市场 SDK 数据 | `https://mcp.szfiu.com/stock_hk_sdk/` |
| stockUsSdk | 美股市场 SDK 数据 | `https://mcp.szfiu.com/stock_us_sdk/` |
| ~~stockCnSdk~~ | ~~A 股市场 SDK 数据~~ | ~~`https://mcp.szfiu.com/stock_cn_sdk/`~~ |
| szfiuToolkit | 证券代码检索工具 | `https://mcp.szfiu.com/toolkit/` |

> **备注：** A 股市场数据即将推出，敬请期待。

## 文档

- [MCP 接口文档（中文）](docs/mcp-interfaces_CN.md)
- [MCP 接口文档（英文）](docs/mcp-interfaces_EN.md)

## 开发

### 项目结构

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

### 测试

安装后在 OpenClaw 中测试技能：

```
/market-assistant 查询腾讯控股的实时行情
```

## 许可证

MIT License

## 贡献

欢迎贡献！提交 PR 前请阅读我们的贡献指南。

## 支持

- 文档：[FIU MCP Docs](https://mcp.szfiu.com)
- 问题：[GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
