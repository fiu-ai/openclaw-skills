[English](README.md) | [中文](README_CN.md)

# FIU Skills

FIU Finance MCP 的 Agent 技能包，由金融信息商融聚汇提供。查询全球市场行情资讯与金融数据，已覆盖港股、美股、A股（中华通）、日股及全球指数、基金、债券市场，支持行情盘口、K线分时、资金分析、行业、概念/投资主题、财务、财报、公告流、公司行动、股本股东、估值、研究报告、ETF基金净值/持仓、新股IPO、债券、期权、财经新闻、投资日历/财经日历、宏观数据及全球证券代码和国际编码搜索。仅提供客观数据与金融数据检索，不构成投资分析或买卖建议。

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/Skills-1-green.svg)](#可用技能)
[![Markets](<https://img.shields.io/badge/Markets-HK%20%7C%20US%20%7C%20CN%20%7C%20JP%20%7C%20Global-orange.svg>)](docs/mcp-interfaces_CN.md)

## 概述

本仓库把 FIU Finance MCP 的能力打包成可安装的 Agent 技能。技能告诉模型：什么问题该用哪个工具集、每个 endpoint 要什么参数、数据边界在哪里，让它直接选对工具，而不是靠试。

底层是 `https://ai.szfiu.com/api/mcp/v2` 上的 26 个工具集、104 个 endpoint；加上 `describe_tool` 和 `search` 两个辅助工具，共 28 个 MCP 工具。

## 安装

### 从 ClawHub 安装

```bash
npx clawhub@latest install fiu-finance-mcp
```

### 手动安装

```bash
git clone https://github.com/fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

或只装单个技能：

```bash
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

对于不支持远程 Streamable HTTP 的客户端，最新产品手册还提供 `fiu-finance-mcp` npm/npx stdio 适配器。该方式需要 Node.js 20.18.1 或更高版本，并使用 `FIU_API_KEY`。

### 验证

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
./test.sh
```

## 快速开始

1. **申请 API Key**：打开 https://ai.szfiu.com
2. **导出 Key**，供脚本鉴权使用：

   ```bash
   export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
   ```
3. **或直接在客户端配置 MCP 服务**：

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
4. **直接自然语言提问**：

   ```text
   腾讯控股现在多少钱？
   帮我看 AAPL 最近 60 根日K。
   本周港股有哪些新股在招股？
   贵州茅台最近三年的营业收入和净利润趋势。
   ```

## 可用技能

| 技能                                          | 说明                                                                                                                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`fiu-finance-mcp`](skills/fiu-finance-mcp/) | 覆盖港股、美股、A股(Zhcall提供)、日股和全球债券的行情报价、盘口成交、K线、市场排行、资金流、F10 基本面、股东持仓、ETF 基金、互联互通、新股 IPO、债券、美股期权、新闻、财经日历、宏观数据、上市公司公告和参考码表 |

## 功能特性

- **内置选路**：技能把用户意图映射到工具集，问资产负债表就走 `f10_financials`，问招股书就走 `ipo`，不用反复试。
- **参数前置**：把必填的类型判别字段（`ipoType`、`connectType`、`holdingType` 等）和合法取值写在文档里，减少「调用—报错—再查」的往返。
- **边界写明**：明确说清哪些不覆盖（公告全文、研报），模型该停的时候会停，不会编。
- **按需加载参考文档**：四份参考文档按话题分开，用到哪份读哪份，不一次性铺开。
- **命令行兜底**：Node.js 和 Python 脚本可以在终端复现任意一次调用。
- **最新目录**：26 个工具集、104 个 endpoint，包含财经日历、宏观经济和上市公司公告能力。

## 脚本使用

两个脚本都直接走 MCP Streamable HTTP，默认地址 `https://ai.szfiu.com/api/mcp/v2`。

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

出错时两个脚本都把内容写到 stderr 并以非零码退出，自动化脚本能区分「拿到数据」和「拿到错误」。

## 文档

| 文档                                                                    | 内容                                        |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| [USAGE.md](USAGE.md)                                                     | 完整使用指南：安装、配置、调用、排障        |
| [docs/mcp-interfaces_CN.md](docs/mcp-interfaces_CN.md)                   | 26 个工具集、104 个 endpoint 及当前路由说明 |
| [skills/fiu-finance-mcp/SKILL_CN.md](skills/fiu-finance-mcp/SKILL_CN.md) | 模型读取的技能定义                          |

## 项目结构

```
openclaw-skills/
├── README.md               English
├── README_CN.md            中文
├── USAGE.md                使用指南
├── USAGE_EN.md             Usage guide
├── install.sh              安装全部技能
├── test.sh                 验证连接与鉴权
├── docs/
│   ├── mcp-interfaces_CN.md
│   └── mcp-interfaces_EN.md
└── skills/
    └── fiu-finance-mcp/
        ├── SKILL.md
        ├── SKILL_CN.md
        ├── skill.json
        ├── install.sh
        ├── references/
        │   ├── toolsets.md          工具集选择与必填字段
        │   ├── setup-and-auth.md    配置与鉴权
        │   ├── troubleshooting.md   排障
        │   └── examples.md          调用示例
        └── scripts/
            ├── call.js
            └── call.py
```

## 安全说明

- API Key 放在环境变量或客户端请求头配置里，不要写进技能文件、提示词或业务参数。
- `.gitignore` 已排除 `.env` 和 `*.key`，不要提交凭据。
- Key 一旦泄露，到 https://ai.szfiu.com 重新申请替换。

## 许可证

[MIT](LICENSE)

## 支持

- 问题反馈：https://github.com/fiu-ai/openclaw-skills/issues
- MCP 服务仓库：https://github.com/fiu-ai/mcp-server
- 服务地址：https://ai.szfiu.com
