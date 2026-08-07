# FIU Finance MCP — OpenClaw 技能

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Markets](<https://img.shields.io/badge/Markets-%E6%B8%AF%20%7C%20%E7%BE%8E%20%7C%20%E6%B2%AA%E6%B7%B1%20%7C%20%E6%96%B0%20%7C%20%E6%97%A5-orange>)](#可用市场)

[English](README.md) | [技能定义](skills/fiu-finance-mcp/SKILL_CN.md) | [FIU MCP](http://ai.szfiu.com)

借助 AI 编程工具，您可以用自然语言完成行情、K 线、资金流向、基本面、股东、新股、债券和资讯的查询。本仓库把 FIU Finance MCP 服务打包成技能，装好之后直接向 AI 提问即可。

---

## ✨ 特性

- 🗣 **自然语言** —— 中英文直接提问，不用记参数名
- 🌏 **五大板块** —— 港股、美股、沪深、新股、日股，一个技能全覆盖
- 📊 **数据丰富** —— 行情、K 线、资金流向、盘口、排行、基本面、股东、新股、债券、期权、资讯
- 🔀 **一个 CLI** —— 一个零依赖脚本（`call.js`）打通全部 FIU MCP 工具
- 🧭 **自描述** —— `describe_tool` 实时返回工具目录，AI 不用猜字段名
- 📦 **一键安装** —— clone、跑 `install.sh`、配置 API Key 即可使用

---

## 安装技能

### 一键安装（推荐）

把下面这段内容发给 AI 编程工具，让它按步骤执行：

```
# 安装 FIU Finance MCP 技能

请按以下步骤操作：

## 步骤 1：获取技能包

git clone https://github.com/fiu-ai/openclaw-skills.git && cd openclaw-skills

## 步骤 2：安装

执行 ./install.sh，把 skills/ 下的技能复制到全局技能目录。

## 步骤 3：配置 API Key

提示用户到 http://ai.szfiu.com 申请 API Key，然后配置：
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"

## 步骤 4：验证

执行 ./test.sh，确认五步自检全部通过。
```

### 手动安装

| 安装范围                | 拷贝目标目录                   |
| ----------------------- | ------------------------------ |
| OpenClaw，全局          | `~/.openclaw/skills/`        |
| Claude Code，全局       | `~/.claude/skills/`          |
| Claude Code，仅当前项目 | `项目根目录/.claude/skills/` |

```bash
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

### 配置

在 [http://ai.szfiu.com](http://ai.szfiu.com) 申请 API Key，然后：

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
```

| 环境变量                          | 必填 | 默认值                             |
| --------------------------------- | ---- | ---------------------------------- |
| `FIU_MCP_GATEWAY_AUTHORIZATION` | 是   | 无（格式`Bearer <API_KEY>`）     |
| `FIU_MCP_URL`                   | 否   | `http://ai.szfiu.com/api/mcp/v2` |

需要 `node` 和 `bash`。`scripts/call.py` 是 `scripts/call.js` 的 Python 版，参数一致，只有查看用法这一项不同：Python 版用 `-h` / `--help`，不支持 `help` 子命令。

### 验证

```bash
./test.sh
```

五步自检：工具列表、目录查询、港股 / 美股 / A 股 / 新股 / 日股行情。

---

## 功能一览

| 功能            | 说明                                                         | 市场          |
| --------------- | ------------------------------------------------------------ | ------------- |
| 快照行情        | 最新价、涨跌、成交、市值、估值                               | 港 美 沪深 日 |
| 证券搜索        | 按关键词搜股票、ETF、指数、基金、窝轮、债券                  | 港 美 沪深 日 |
| K 线            | 分钟到月线，前 / 后复权，最新 K 线                           | 港 美 沪深 日 |
| 买卖盘          | 实时盘口深度                                                 | 港 美 沪深 日 |
| 逐笔成交        | 逐笔明细、成交历史、成交统计                                 | 港 美 沪深 日 |
| 分时走势        | 当日分时与迷你分时图                                         | 港 美 沪深 日 |
| 资金流向        | 主力流入流出、大中小单分布、近 N 日资金流                    | 港 美 沪深 日 |
| 市场概览        | 涨跌分布与市场统计                                           | 港 美 沪深 日 |
| 排行榜          | 股票、行业、ETF、新股、券商、期权排行                        | 港 美 沪深 日 |
| 行业与指数      | 行业 / 指数列表、成分股、所属板块                            | 港 美 沪深 日 |
| 筹码            | 筹码成本区间与筹码移动分布                                   | 港 美         |
| 公司资料        | 基本资料、高管、扩展资料                                     | 港 美 沪深    |
| 财务报表        | 利润表、资产负债表、现金流量表、财务指标                     | 港 美 沪深    |
| 业务与治理      | 主营构成、分红、拆股、回购、停复牌、股东大会                 | 港 美 沪深    |
| 股东结构        | 主要股东、十大股东、持股变动                                 | 港 美 沪深    |
| 机构持股        | 机构持股明细与统计                                           | 美            |
| 基金 / 券商持股 | 基金持股、券商持股、每日沽空                                 | 港 美         |
| 基金与 ETF      | 净值、资产与行业配置、ETF 列表与成分                         | 港 美 日      |
| 互联互通        | 额度、净买入、排行、持股比例                                 | 港 沪深       |
| 新股            | IPO 日历、招股、承销商、基石、保证金、排行                   | 港 美         |
| 期权            | OPRA 期权链、报价、Greeks、概览、排行                        | 美            |
| 债券            | 债券搜索、资料、行情、盘口、排行、收益率                     | `GLOBAL`    |
| 新闻资讯        | 搜索、语义检索、个股新闻、最新、详情、摘要                   | 港 美 沪深 日 |
| 参考数据        | ISIN / SEDOL / CIK / ADR、货币、代码映射、交易状态、交易时段 | 港 美 沪深 日 |

---

## 可用市场

| 市场码  | 市场         | 代码示例                                    |
| ------- | ------------ | ------------------------------------------- |
| `HK`  | 港股         | `00700.hk`；含窝轮 / 牛熊证               |
| `US`  | 美股         | `AAPL.us`；含 OPRA 期权                   |
| `CN`  | A 股（沪深） | `600519.sh`、`000001.sz`、`300750.sz` |
| `JP`  | 日股         | `6758.jp`                                 |
| `IPO` | 新股         | `00668.hk`                                |

---

## 使用方式

### 自然语言触发

说清楚想要什么，AI 会自己选对应的调用：

- 「查询腾讯 00700 的行情」 —— 快照行情
- 「AAPL 最近 30 根小时线」 —— K 线
- 「贵州茅台今天的资金流向」 —— 资金流向
- 「本周港股新上市的新股」 —— 新股列表
- 「腾讯最新一期利润表」 —— 财务报表

### 命令行

三个子命令，都在 `skills/fiu-finance-mcp/` 目录下执行。

```bash
node scripts/call.js list                       # 列出网关暴露的工具
node scripts/call.js describe <名称>            # 目录查询，一次最多 5 个
node scripts/call.js call <工具集> ...          # 调用某个 endpoint
node scripts/call.js help
```

参数：`--endpoint|-e <endpoint>`、`--param|-p key=value`（可重复）、`--url <url>`、`--raw`。`symbols` 按逗号拆成数组；`true`/`false`/`null`/数字以及 `[...]`/`{...}` 会被解析，其余按字符串处理。网关报错时输出到 stderr，退出码为 1。

`call` 也接受原始 JSON 形式，写脚本更方便：

```bash
node scripts/call.js call quote_spot '{"endpoint":"get_quote","params":{"market":"HK","assetType":"stock","symbols":["00700.hk"]}}'
```

### 工具调用速查

**目录发现**

```bash
node scripts/call.js list
node scripts/call.js describe quote_spot,quote_kline,quote_intraday,market_flow,reference
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

`describe_tool` 是入口：`detail=summary`（默认）用于选路，`detail=params` 查字段和枚举，`detail=full` 在某个 endpoint 反复调不通时单独排障。`toolNames` 一次最多 5 个。

**行情与搜索**

```bash
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
node scripts/call.js call quote_spot -e get_quote -p market=US -p assetType=stock -p symbols=AAPL.us
node scripts/call.js call quote_spot -e get_quote -p market=CN -p assetType=stock -p symbols=600519.sh
node scripts/call.js call quote_spot -e get_quote -p market=JP -p assetType=stock -p symbols=6758.jp
node scripts/call.js call quote_spot -e search_security -p market=HK -p keyword=腾讯 -p limit=5
```

**分时、K 线、资金流向**

```bash
node scripts/call.js call quote_kline    -e get_kline          -p market=US -p assetType=stock -p symbol=AAPL.us -p period=60m -p limit=10
node scripts/call.js call quote_intraday -e get_orderbook      -p market=HK -p assetType=stock -p symbol=00700.hk
node scripts/call.js call quote_intraday -e get_intraday_trend -p market=HK -p assetType=stock -p symbol=00700.hk
node scripts/call.js call market_flow    -e get_capital_flow   -p market=HK -p symbol=00700.hk -p flowType=current
```

**市场结构与排行**

```bash
node scripts/call.js call market_ranking       -e get_rankings           -p market=HK -p rankType=stock -p pageSize=5
node scripts/call.js call market_overview      -e get_market_statistics  -p market=CN
node scripts/call.js call market_structure     -e get_industry_data      -p market=HK -p industryType=list
node scripts/call.js call market_structure     -e get_index_data         -p market=CN -p indexType=list
node scripts/call.js call market_position_cost -e get_position_cost      -p market=HK -p symbol=00700.hk -p costType=range -p price=470
```

**基本面与股东**

```bash
node scripts/call.js call f10_financials           -e get_financial_statement -p market=HK -p symbol=00700.hk  -p statementType=income
node scripts/call.js call f10_profile              -e get_company_profile     -p market=CN -p symbol=600519.sh -p dataType=basic
node scripts/call.js call f10_business_governance  -e get_company_action      -p market=HK -p symbol=00700.hk  -p actionType=dividends
node scripts/call.js call shareholding_structure   -e get_shareholders        -p market=CN -p symbol=600519.sh -p holdingType=topten
node scripts/call.js call shareholding_institution -e get_institution_holding -p market=US -p symbol=AAPL.us   -p holdingType=statistics
node scripts/call.js call shareholding_fund_broker -e get_short_sell          -p market=HK -p symbol=00700.hk
```

**基金、互联互通、IPO、衍生品、债券**

```bash
node scripts/call.js call fund_etf             -e get_etf_data              -p market=HK -p dataType=list -p params='{"sortField":"changeRate","sortType":1}'
node scripts/call.js call stock_connect        -e get_cn_stock_connect_data -p market=CN -p connectType=balance -p params='{"date":"2026-08-06","period":1}'
node scripts/call.js call ipo                  -e get_hk_ipo_list           -p market=HK -p ipoType=listed
node scripts/call.js call quote_derivatives_hk -e get_hk_warrant_catalog    -p market=HK -p warrantType=issuer
node scripts/call.js call quote_us_options     -e get_us_option_chain       -p market=US -p optionType=expiration -p params='{"root":"AAPL"}'
node scripts/call.js call bond_basic           -e search_bond               -p market=GLOBAL -p keyword=treasury
node scripts/call.js call bond_analytics       -e get_bond_yield            -p market=GLOBAL -p bondType=codes
```

**新闻与参考数据**

```bash
node scripts/call.js call fiu_news  -e news_latest        -p market=HK -p limit=3
node scripts/call.js call fiu_news  -e news_by_symbol     -p market=US -p symbol=AAPL.us -p limit=3
node scripts/call.js call reference -e get_reference_data -p market=HK -p symbol=00700.hk -p referenceType=isin
node scripts/call.js call reference -e get_trading_status -p market=US -p statusType=session
node scripts/call.js call reference -e get_market_hours   -p market=US
```

---

## 目录结构

```
openclaw-skills/
├── README.md                      # 英文版
├── README_CN.md                   # 本文件（中文）
├── USAGE.md / USAGE_EN.md         # 详细使用指南
├── install.sh                     # 安装 skills/ 下的全部技能
├── test.sh                        # 网关连通性测试
├── docs/
│   ├── mcp-interfaces_CN.md       # 网关接口参考（中文）
│   └── mcp-interfaces_EN.md       # 网关接口参考（英文）
└── skills/
    └── fiu-finance-mcp/
        ├── SKILL.md               # 技能定义（英文）
        ├── SKILL_CN.md            # 技能定义（中文）
        ├── skill.json             # 技能清单
        ├── install.sh             # 单技能安装脚本
        ├── references/
        │   ├── toolsets.md        # 工具集选择与市场覆盖
        │   ├── setup-and-auth.md  # API Key 与连接
        │   ├── examples.md        # 调用示例与提示词
        │   └── troubleshooting.md # 401、参数校验、超时
        └── scripts/
            ├── call.js            # CLI（Node，零依赖）
            └── call.py            # 同一套 CLI 的 Python 版
```

---

## 🔒 安全提示

- API Key 只从 [http://ai.szfiu.com](http://ai.szfiu.com) 获取。
- 通过 `FIU_MCP_GATEWAY_AUTHORIZATION` 传递；不要放进 `params`、脚本或提交记录里。
- 对 Key 应用最小权限原则；一旦被打印到日志或终端，立即轮换。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎贡献，提交 PR 前请先阅读贡献指南。

## 💬 支持

- **文档：** [FIU MCP](http://ai.szfiu.com)
- **问题反馈：** [GitHub Issues](https://github.com/fiu-ai/openclaw-skills/issues)
