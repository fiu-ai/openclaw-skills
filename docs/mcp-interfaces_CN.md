# FIU MCP 网关接口文档

面向 AI 工具与集成方的完整接口说明。内容取自对网关的一次实时 `describe_tool` 全量遍历：
**24 个工具、86 个 endpoint、5 个市场**。

## 目录

- [连接方式](#连接方式)
- [调用模型](#调用模型)
- [市场与代码](#市场与代码)
- [describe_tool](#describe_tool)
- [接口清单](#接口清单)
- [错误码](#错误码)

---

## 连接方式

| 项 | 值 |
|----|----|
| 端点 | `http://ai.szfiu.com/api/mcp/v2` |
| 传输 | Streamable HTTP（JSON-RPC 2.0，响应为 SSE） |
| 协议版本 | `2025-06-18`（请求头 `Mcp-Protocol-Version`） |
| 鉴权 | `Authorization: Bearer <API_KEY>` |
| 会话 | `initialize` 响应头返回 `Mcp-Session-Id`，之后每个请求都要带上 |

MCP 客户端配置：

```json
{
    "mcpServers": {
        "fiuFinance": {
            "description": "FIU Finance MCP 网关",
            "transport": "streamable_http",
            "url": "http://ai.szfiu.com/api/mcp/v2",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

握手顺序是 `initialize` → `notifications/initialized` → `tools/call`。SSE 响应是 CRLF 换行，
取最后一条 `data:` 行解析。命令行等价实现见 `skills/fiu-finance-mcp/scripts/call.js`
（Node，零依赖）与 `call.py`（Python）。

---

## 调用模型

工具不是"一个接口一个函数"，而是**工具集**。每个业务工具只接受两个参数：

```json
{
    "name": "quote_spot",
    "arguments": {
        "endpoint": "get_quote",
        "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
    }
}
```

- `endpoint` —— 工具集内的具体能力，取值见下面的[接口清单](#接口清单)。
- `params` —— 业务字段，`market` 等参数直接放在这一层。
- `params.params` —— 网关未单独抽象的下游字段从这里透传，
  例如 `{"sortField":"changeRate","sortType":1}`。

**多数 endpoint 有一个必填的区分字段**，用来在下游多个接口之间选路：
`statementType`、`dataType`、`holdingType`、`actionType`、`referenceType`、`optionType`、
`connectType`、`ipoType`、`costType`、`warrantType`、`bondType`、`statusType`、
`industryType`、`indexType`、`rankType`、`flowType`、`historyType`、`statisticsType`。
合法取值用 `describe_tool` 的 `detail=params` 查。

---

## 市场与代码

| 市场码 | 市场 | 代码示例 |
|--------|------|----------|
| `HK` | 港股 | `00700.hk` |
| `US` | 美股 | `AAPL.us` |
| `CN` | A 股（沪深） | `600519.sh`、`000001.sz`、`300750.sz` |
| `JP` | 日股 | `6758.jp` |
| `GLOBAL` | 债券路由 | ISIN，如 `US91282CHZ77` |

- `CN` 和 `GLOBAL` 是**网关的路由语义**，不等于下游 requestBody 里的 `market` 字段。
  A 股下游用 `marketBoard` 传板块（`ALL` / `SH` / `SZ`）。
- `GLOBAL` 路由到 `bond_basic`、`bond_analytics` 两个工具集。
- 日期用 `YYYY-MM-DD`；分钟 K 线、逐笔、分时用 `YYYY-MM-DD HH:mm:ss`。
- 工具级别标注的市场是**并集**，单个 endpoint 可能更窄 —— 例如 `fund_etf` 标 `HK/JP/US`，
  但 `get_fund_performance` 只有美股。
- 批量行情、财务、持股、新闻类查询建议控制在约 5 个标的以内；`get_security_profile` 的
  `symbols` 上限是 50 个。

---

## describe_tool

目录查询工具，是所有调用的入口。

| detail | 用途 | 限制 |
|--------|------|------|
| `summary`（默认） | 选工具集、看市场与资产覆盖 | `toolNames` 最多 5 个 |
| `params` | 查字段名、必填项、枚举值 | `toolNames` 最多 5 个 |
| `full` | 单个 endpoint 反复调不通时排障 | 一次 1 个 endpoint |

```json
{ "name": "describe_tool", "arguments": { "toolNames": ["quote_spot"], "detail": "params" } }
```

```bash
node scripts/call.js describe quote_spot,quote_kline,quote_intraday,market_flow,reference
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

---

## 接口清单

### quote_spot —— 行情快照

市场 `CN GLOBAL HK JP US`；资产 `bond etf fund index stock warrant`

| endpoint | 说明 |
|----------|------|
| `search_security` | 搜索股票、ETF、指数、基金、窝轮或债券标的 |
| `get_security_profile` | 查询证券或债券的静态基础资料（`symbols` 最多 50 个） |
| `get_quote` | 查询股票、ETF、指数、窝轮和债券的实时 / 快照行情 |
| `get_security_definition` | 查询证券码表详情、新股参考列表等证券定义类数据 |

### quote_intraday —— 盘中数据

市场 `CN GLOBAL HK JP US`；资产 `bond etf index stock`

| endpoint | 说明 |
|----------|------|
| `get_orderbook` | 买卖盘 / 盘口 |
| `get_trades` | 逐笔成交 |
| `get_intraday_trend` | 盘中分时走势 |
| `get_trade_history` | 逐笔成交历史 |
| `get_trade_statistics` | 成交统计总览与明细 |
| `get_mini_trend` | 迷你分时图 |

### quote_kline —— K 线

市场 `CN GLOBAL HK JP US`；资产 `bond etf index stock`

| endpoint | 说明 |
|----------|------|
| `get_kline` | 历史 K 线 / 走势（`period` 支持 `1m`–`240m` 及日周月，`adjust` 前 / 后复权） |
| `get_latest_kline` | 最新 K 线 |
| `get_snapshot_history` | 证券历史快照 |

### quote_derivatives_hk —— 港股衍生品与扩展行情

市场 `CN GLOBAL HK JP US`；资产 `bond etf index stock warrant`

| endpoint | 说明 |
|----------|------|
| `get_quote_extend` | 扩展行情，含更完整的价格、成交、市值、估值字段 |
| `get_hk_warrant_catalog` | 港股权证 / 窝轮 / 牛熊证目录、发行商与简介 |
| `get_hk_warrant_trading_data` | 港股权证成交统计、活跃榜与历史走势 |

### quote_us_options —— 美股期权

市场 `US`

| endpoint | 说明 |
|----------|------|
| `get_us_option_chain` | 到期日、期权链、合约列表、快照与 Greeks |
| `get_us_option_quote` | 合约快照、盘口、逐笔、K 线、分时、成交统计 |
| `get_us_option_overview` | 期权市场总览与 ETF 期权概览 |
| `get_us_option_rankings` | 期权排行榜 |

### market_overview —— 市场概览

市场 `CN HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_market_statistics` | 市场涨跌分布、市场概况等统计数据 |

### market_ranking —— 排行榜

市场 `CN HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_rankings` | 股票、行业、ETF、IPO、期权、经纪商等排行榜 |

### market_flow —— 资金流向

市场 `CN HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_capital_flow` | 资金流向、资金成交分布、近 N 日资金流 |

### market_structure —— 行业与指数

市场 `CN HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_industry_data` | 行业列表、行业排行、行业成分股、所属板块 |
| `get_index_data` | 指数列表、指数行情、成分股、映射、资金分布 |
| `get_market_microstructure` | 价差、多市场溢价、双柜台、经纪席位（港股） |

### market_position_cost —— 筹码

市场 `HK US`

| endpoint | 说明 |
|----------|------|
| `get_position_cost` | 筹码成本区间（`costType=range` + `price`）与筹码移动分布（`costType=distribution` + `high` / `low`） |

### f10_profile —— 公司资料

市场 `CN HK US`

| endpoint | 说明 |
|----------|------|
| `get_company_profile` | 公司基本资料、公司资料、关联信息 |
| `get_company_management` | 公司高管 |
| `get_company_extra_profile` | 扩展资料 / 特殊证券资料 |

### f10_financials —— 财务报表

市场 `CN HK US`

| endpoint | 说明 |
|----------|------|
| `get_financial_statement` | 利润表、资产负债表、现金流量表（`statementType`） |
| `get_financial_indicator` | 关键财务指标 |

### f10_business_governance —— 业务与治理

市场 `CN HK US`

| endpoint | 说明 |
|----------|------|
| `get_business_segment` | 主营构成 / 业务分部 |
| `get_company_action` | 分红、拆股、股东大会、代码变更、转板、回购、停复牌、股本变动 |

### shareholding_structure —— 股东结构

市场 `CN HK US`

| endpoint | 说明 |
|----------|------|
| `get_shareholders` | 主要股东、十大股东、当前持股、股东权益明细 |
| `get_shareholding_change` | 股本变动、高管持股变动 |

### shareholding_institution —— 机构持股

市场 `US`

| endpoint | 说明 |
|----------|------|
| `get_institution_holding` | 机构持股明细或统计 |

### shareholding_fund_broker —— 基金 / 券商持股与沽空

市场 `HK US`

| endpoint | 说明 |
|----------|------|
| `get_fund_holding` | 基金持股或基金成分股（美股） |
| `get_broker_holding` | 港股经纪商持股比例、详情、排行 |
| `get_short_sell` | 每日沽空 |

### fund_etf —— 基金与 ETF

市场 `HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_fund_data` | 基金净值、资产配置、行业配置 |
| `get_etf_data` | ETF 列表、类型、成分、发行商、投资地区与方向 |
| `get_fund_performance` | 基金历史业绩（仅美股） |

### stock_connect —— 互联互通

市场 `CN HK`

| endpoint | 说明 |
|----------|------|
| `get_stock_connect_data` | 沪深港通综合数据 |
| `get_hk_stock_connect_data` | 港股通 / 北向数据 |
| `get_cn_stock_connect_data` | 沪深股通 / 南向数据 |

### ipo —— 新股

市场 `HK US`

| endpoint | 说明 |
|----------|------|
| `get_hk_ipo_calendar` | 港股 IPO 日历 |
| `get_hk_ipo_list` | 港股新股列表、今日打新、待上市、已上市、递表（`ipoType`） |
| `get_hk_ipo_detail` | 招股详情与配售结果 |
| `get_hk_ipo_company_profile` | IPO 公司概况 |
| `get_hk_ipo_underwriter` | 承销商与保荐人 |
| `get_hk_ipo_cornerstone_investor` | 基石投资者 |
| `get_hk_ipo_margin_info` | 认购倍数、认购金额、保证金 |
| `get_hk_ipo_rankings` | 热门认购、首日回报、保荐人、承销商、基石排行 |
| `get_hk_ipo_notice` | 招股书公告、递表公告（仅 IPO 场景） |
| `get_hk_ipo_subscription_tools` | 打新计算、认购数量、券商、认购方式、中签手数 |
| `get_hk_ipo_market_data` | 港股 IPO 市场概况、行业统计与表现 |
| `get_us_ipo_list` | 美股新股待上市、已上市、走势、PE TTM |
| `get_us_ipo_detail` | 美股 IPO 新股详情 |
| `get_us_ipo_underwriter` | 美股承销商表现与详情 |
| `get_us_ipo_market_data` | 美股 IPO 市场概况与行业表现 |
| `search_ipo_content` | 搜索新股资讯或内容 |
| `get_ipo_news` | 新股资讯列表、详情、热门、排行、推荐、相关 |
| `get_ipo_topic` | 新股专题列表、置顶、详情、关联资讯 |
| `get_ipo_course` | 打新课堂课程列表、热门、排行、推荐、详情 |
| `get_ipo_tags` | 新股内容标签 |

### bond_basic —— 债券基础

市场 `GLOBAL`

| endpoint | 说明 |
|----------|------|
| `search_bond` | 搜索债券 |
| `get_bond_profile` | 债券资料、债券码表、机构债券池 |
| `get_bond_quote` | 债券快照、扩展行情、收益率快照 |
| `get_bond_orderbook` | 债券买卖盘 |

### bond_analytics —— 债券分析

市场 `GLOBAL`

| endpoint | 说明 |
|----------|------|
| `get_bond_rankings` | 债券排行榜、简易排行、债券 ETF 排行 |
| `get_bond_chart` | 历史走势图、分时图、收益率 K 线 / 分时、国债收益率列表 |
| `get_bond_yield` | 收益率码表、快照、K 线、分时 |
| `get_bond_trading_status` | 债券与债券收益率市场交易状态 |

### fiu_news —— 新闻资讯

市场 `CN GLOBAL HK JP US`

| endpoint | 说明 |
|----------|------|
| `news_search` | 搜索新闻列表 |
| `news_semantic_search` | 按语义相似度搜索新闻 |
| `news_by_symbol` | 某个标的相关的新闻 |
| `news_latest` | 最近一段时间的最新新闻 |
| `news_get` | 按 ID 查询单篇详情 |
| `news_related` | 按 ID 查询相关新闻 |
| `news_count` | 统计符合条件的新闻数量 |
| `news_digest` | 适合 AI 摘要的素材，返回 `content_preview` |

### reference —— 参考数据

市场 `CN GLOBAL HK JP US`

| endpoint | 说明 |
|----------|------|
| `get_reference_data` | ISIN、SEDOL、CIK、ADR、货币、交易码表、基础码表、权证关联表、债券码表 |
| `get_trading_status` | 交易日期、交易时段、除权事件、证券状态、退市列表 |
| `get_symbol_mapping` | 证券代码名称映射、指数映射 |
| `get_market_hours` | 市场交易时段状态 |

---

## 错误码

| code | 含义 | 处理 |
|------|------|------|
| `INVALID_ARGUMENT` | 工具入参不合法（缺必填、类型错） | 按提示补参数 |
| `INVALID_SEMANTIC_INPUT` | 网关语义层校验未通过（市场 / 资产 / 日期 / 分页） | 看 `details.issues` 逐条修正 |
| `INVALID_DOWNSTREAM_ARGS` | 语义层通过，下游还缺字段 | `details.issues` 会点名字段，补进 `params.params` |
| `UNSUPPORTED_ROUTE` | 该 endpoint 在这个市场没有下游路由 | 换市场，或用 `describe_tool` 确认覆盖范围 |
| `-32602` | JSON-RPC 参数校验失败（如 `toolNames` 超过 5 个） | 缩小请求 |

`INVALID_DOWNSTREAM_ARGS` 的 `details` 结构：

```json
{
    "semanticToolName": "get_etf_data",
    "downstreamPath": "/v3/etf/list",
    "issues": [
        { "path": "sortField", "message": "下游需要字段 sortField" },
        { "path": "sortType",  "message": "下游需要字段 sortType" }
    ]
}
```

补法：

```bash
node scripts/call.js call fund_etf -e get_etf_data -p market=HK -p dataType=list \
    -p params='{"sortField":"changeRate","sortType":1}'
```

已知需要透传字段的几个 endpoint：

| 调用 | 需要补 |
|------|--------|
| `fund_etf / get_etf_data`（HK，`dataType=list`） | `sortField`、`sortType` |
| `stock_connect / get_cn_stock_connect_data` | `date`、`period` |
| `quote_us_options / get_us_option_chain` | `root` |
| `reference / get_trading_status`（HK，`statusType=session`） | `timeMode`（美股 / A 股不需要） |
