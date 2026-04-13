# FIU MCP Server OpenClaw Skills

[English](README.md) | [中文](README_CN.md)

## 概述

本项目提供用于与 SZFIU（深圳融聚汇）MCP Server 交互的 OpenClaw Skills，使 AI 助手能够通过自然语言访问市场数据和交易功能。

## 从 ClawHub 安装

**fiu-market-assistant** 技能已在 ClawHub 上架：

👉 [ClawHub 上的 fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)

### CLI 安装

```bash
npx clawhub@latest install fiu-market-assistant
```

安装指定版本：

```bash
npx clawhub@latest install fiu-market-assistant@1.0.3
```

### 手动安装

将技能文件夹复制到 OpenClaw 工作区（优先级最高）：

```bash
cp -r skills/market-assistant ~/.openclaw/workspace/skills/
```

### WebUI 安装

1. 打开 OpenClaw WebUI，进入 **技能** 管理界面
2. 选择 **Local → Skills → Configure**
3. 用空格键选择技能，确认安装

### 验证安装

```bash
npx clawhub@latest list
```

## 快速开始

> **提示：** 安装前建议更新 OpenClaw 到最新版本

### 一步配置

安装后只需运行：

```bash
/fiu-market-assistant setup 你的_FIU_MCP_TOKEN
```

然后直接提问：

```
查询腾讯控股行情
显示苹果日K线
买入100股腾讯
```

## 可用命令

### 配置

```bash
/fiu-market-assistant setup <token>    # 快速配置 Token
/fiu-market-assistant test             # 测试连接
/fiu-market-assistant status           # 显示状态
```

### 数据查询

```bash
/fiu-market-assistant discover hk_sdk  # 发现可用工具
/fiu-market-assistant discover cn_sdk
/fiu-market-assistant quote 00700      # 查询行情
/fiu-market-assistant quote AAPL
/fiu-market-assistant kline 00700      # 查询K线
/fiu-market-assistant search 腾讯       # 搜索股票代码
/fiu-market-assistant capflow 00700    # 资金流向
```

### 交易

```bash
/fiu-market-assistant trade buy 00700 100 380  # 买入（模拟模式）
/fiu-market-assistant positions                 # 查询持仓
/fiu-market-assistant cash                      # 查询资金
/fiu-market-assistant orders                    # 查询订单
```

## 功能特性

- **通用 MCP Router**：通过 `mcp_router.sh` 调用所有 FIU MCP API
- **CLI 命令式**：简单命令行风格查询
- **自然语言**：直接用中英文提问
- **多市场支持**：港股、美股、A股
- **实时数据**：行情、K线、买卖盘、资金流向
- **交易功能**：下单（默认模拟模式）

## MCP Router 使用

```bash
# 基本用法
mcp_router.sh <市场> <工具名> [参数...]
mcp_router.sh --list-tools <市场>  # 列出可用工具

# 市场: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# 示例
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot symbol=00700.HK
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0
mcp_router.sh toolkit search key=腾讯
```

**注意**：不同市场的工具名称可能不同。使用 `--list-tools <市场>` 发现具体工具名。

## MCP 服务器

| 服务器 | 描述 | 端点 |
|--------|------|------|
| stockHkF10 | 港股F10 | https://ai.szfiu.com/stock_hk_f10/ |
| stockUsF10 | 美股F10 | https://ai.szfiu.com/stock_us_f10/ |
| stockCnF10 | A股F10 | https://ai.szfiu.com/stock_cn_f10/ |
| stockHkSdk | 港股SDK | https://ai.szfiu.com/stock_hk_sdk/ |
| stockUsSdk | 美股SDK | https://ai.szfiu.com/stock_us_sdk/ |
| stockCnSdk | A股SDK | https://ai.szfiu.com/stock_cn_sdk/ |
| szfiuToolkit | 代码检索 | https://ai.szfiu.com/toolkit/ |

## 文档

- [MCP 接口文档（中文）](docs/mcp-interfaces_CN.md)
- [MCP 接口文档（英文）](docs/mcp-interfaces_EN.md)
- [MCP 工具参考](skills/market-assistant/docs/MCP_TOOLS.md)

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
        ├── SKILL.md          # 英文版
        ├── SKILL_CN.md       # 中文版
        ├── skill.json        # 元数据
        ├── install.sh        # 快速安装脚本
        ├── docs/
        │   ├── MCP_TOOLS.md
        │   └── mcp-interfaces_*.md
        └── scripts/
            ├── cli.sh         # 主调度脚本
            ├── mcp_router.sh # 通用 MCP Router
            └── *.sh           # 独立脚本
```

## 安全说明

此技能需要 FIU_MCP_TOKEN（JWT）来访问 FIU MCP 服务。请确保：

1. Token 来自可信来源
2. 先用模拟模式测试
3. 遵循最小权限原则
4. 密切监控交易活动

## 许可证

MIT License

## 贡献

欢迎贡献！

## 支持

- ClawHub: [fiu-market-assistant](https://clawhub.ai/ulnit/fiu-market-assistant)
- 文档: [FIU MCP Docs](https://ai.szfiu.com)
- 问题: [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)