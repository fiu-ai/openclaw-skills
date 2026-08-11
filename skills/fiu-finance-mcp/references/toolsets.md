# 工具集选择参考

当用户意图无法从 `SKILL.md` 的简表判断时读取本文件。确认参数、endpoint、适用市场和能力边界，调用 `describe_tool`。

## 工具集路由

| 用户意图                                                       | 工具集                       | 适用市场               | 不适合场景                              |
| -------------------------------------------------------------- | ---------------------------- | ---------------------- | --------------------------------------- |
| 证券搜索、最新行情、快照、扩展行情、基础资料                   | `quote_spot`               | HK、US、CN、JP、GLOBAL | K线、盘口逐笔、F10 财务                 |
| 盘口、买卖盘、逐笔成交、分时走势                               | `quote_intraday`           | HK、US、CN、JP、GLOBAL | 财报、股东、IPO                         |
| K线、历史走势、收益率走势                                      | `quote_kline`              | HK、US、CN、JP、GLOBAL | 未声明支持的周期不要自行补              |
| 港股窝轮、牛熊证、衍生品行情                                   | `quote_derivatives_hk`     | HK                     | 美股期权、A股(中华通)、日股             |
| 美股期权链、期权报价、Greeks、到期日                           | `quote_us_options`         | US                     | 港股窝轮、 A股(中华通)、日股            |
| 市场概况、涨跌分布、交易统计                                   | `market_overview`          | HK、US、CN、JP         | 单票实时行情                            |
| 涨跌幅榜、成交额榜、ETF 排行、IPO 排行、债券排行               | `market_ranking`           | HK、US、CN、JP         | 公司财报、盘口                          |
| 资金流向、资金分布、主力资金                                   | `market_flow`              | HK、US、CN、JP         | 财务报表、IPO 详情                      |
| 行业、概念、板块、指数、成分股                                 | `market_structure`         | HK、US、CN、JP         | 单票逐笔成交                            |
| 筹码成本、获利比例                                             | `market_position_cost`     | HK、US                 | A股(中华通)/日股未覆盖，不要强行调用    |
| 公司概况、高管、公司资料、业务简介                             | `f10_profile`              | HK、US、CN             | 实时行情、盘口、K线、公告全文、研报     |
| 利润表、资产负债表、现金流、财务指标                           | `f10_financials`           | HK、US、CN             | 实时行情、年报 PDF、公告全文、研报      |
| 主营构成、分红、拆股、回购、停复牌、治理事件                   | `f10_business_governance`  | HK、US、CN             | 最新报价、资金流、公告全文搜索          |
| 主要股东、十大股东、股东结构、持股变动                         | `shareholding_structure`   | HK、US、CN             | 机构明细优先用机构持股工具集            |
| 机构持股明细与统计                                             | `shareholding_institution` | US                     | 基金/券商专项持仓                       |
| 基金持股、券商持股、沽空数据                                   | `shareholding_fund_broker` | HK、US                 | 普通股东结构                            |
| 基金净值、基金资产、基金业绩、ETF 列表和成分                   | `fund_etf`                 | HK、US、JP             | 普通股票财报                            |
| 港股通、沪深港通、互联互通资金                                 | `stock_connect`            | HK、CN                 | 美股、日股、债券                        |
| 港股/美股 IPO 日历、招股详情、承销商、基石、保证金、公告、排行 | `ipo`                      | HK、US                 | 已上市股票行情、已上市公司公告/研报搜索 |
| 新闻搜索、语义检索、个股新闻、最新新闻、详情、统计             | `fiu_news`                 | HK、US、CN、JP、GLOBAL | 公告全文、信息披露全文、研报全文        |
| 债券搜索、资料、快照、扩展行情、买卖盘                         | `bond_basic`               | GLOBAL                 | 普通股票或股票指数                      |
| 债券排行、走势图、收益率、交易状态                             | `bond_analytics`           | GLOBAL                 | 股票排行、ETF 排行                      |
| 代码映射、交易状态、交易时段、参考数据                         | `reference`                | HK、US、CN、JP、GLOBAL | 有明确业务工具时不要优先用参考工具      |

## 必填字段速查

多数 endpoint 需要一个类型判别字段。传错或不传，网关会返回 `INVALID_ARGUMENT` 或 `INVALID_DOWNSTREAM_ARGS`，错误里会列出合法取值。

| 工具集                       | 判别字段                                        | 常用取值                                                                                                                   |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `quote_spot`               | `assetType`                                   | `stock`、`etf`、`index`、`warrant`、`bond`                                                                       |
| `quote_kline`              | `assetType`、`period`                       | `period`：`1m`/`5m`/`15m`/`30m`/`60m`/`1d`/`1w`/`1mo`/`1q`/`1y`                                      |
| `quote_derivatives_hk`     | `warrantType`、`warrantTradeType`           | `issuer`、`list`、`profile`；`history`、`rank`、`statistics`                                                   |
| `quote_us_options`         | `optionType`、`rankType`                    | `expiration`、`chain`、`greeks`、`snapshot`；`list`、`statistics`、`top10`                                   |
| `market_ranking`           | `rankType`                                    | `stock`、`industry`、`ipo`、`broker`、`market_premium`、`etf`、`hot_stock`                                   |
| `market_flow`              | `flowType`                                    | `current`、`daily`、`distribution`、`index_distribution`、`totalview`                                            |
| `market_structure`         | `indexType`、`industryType`、`dataType`   | `list`、`quote`、`constituent`、`mapping`                                                                          |
| `market_position_cost`     | `costType`                                    | `range`（配 `price`）、`distribution`（配 `high`/`low`）                                                         |
| `f10_profile`              | `dataType`                                    | `basic`、`com_info`、`relates_info`                                                                                  |
| `f10_financials`           | `statementType`                               | `income`（默认）、`balance`、`cash`                                                                                  |
| `f10_business_governance`  | `actionType`                                  | `dividends`、`splits`、`repurchase`、`suspension`、`share_structure` 等                                          |
| `shareholding_structure`   | `holdingType`                                 | `major`、`current`、`detail`、`topten`                                                                             |
| `shareholding_institution` | `holdingType`                                 | `detail`、`statistics`                                                                                                 |
| `shareholding_fund_broker` | `holdingType`                                 | `ratio`、`detail`、`statistics`、`rank`、`stock_holder`、`fund_constituent`                                    |
| `fund_etf`                 | `dataType`                                    | `list`、`issuer`（仅 HK）、`area`、`direction`、`type`、`constituent`；基金用 `value`、`asset`、`sector` |
| `stock_connect`            | `connectType`                                 | `balance`、`net_turnover`、`shareholding_ratio`、`rank_change_rate` 等                                             |
| `ipo`                      | `ipoType` / `rankType` / `contentType` 等 | 每个 endpoint 一套，务必先`describe_tool`                                                                                |
| `fiu_news`                 | `market`                                      | 必填；`news_by_symbol` 另需 `symbol`（必填，不带后缀），`news_get`/`news_related` 另需 `id`，`news_semantic_search` 另需 `query`                                   |
| `reference`                | `referenceType`、`statusType`               | `isin`、`sedol`、`cik`、`currency`；`trade_date`、`session`、`exright`                                       |

## 财务报告期筛选

`f10_financials` 支持按报告期筛选，把 `reportType` 放进 `params`，取值随市场不同：

- **港股**：`I` 半年报、`F` 年报、`P` 上市前报告、`Q1`/`Q3`/`Q4`/`Q5` 对应季度。库中不含 `Q2`，绝大多数为 `I` 和 `F`。
- A股(中华通)：数字。`1` 第一季度、`6` 中期、`9` 前三季度、`12` 年度、`99` 非常规报表。
- **美股**：暂不支持按报告期筛选，传了也不生效。

## 能力边界

- 公告全文、信息披露全文、研报全文不支持。F10 返回结构化报表和事件数据，不返回年报 PDF。
- `ipo` 的公告仅限 IPO、招股、递表场景，不是已上市公司公告搜索。
- `fiu_news` 覆盖新闻资讯，不覆盖交易所披露文件。
- `GLOBAL` 当前主要路由到债券数据，不要用于普通股票。
- 日股（`JP`）覆盖行情、K线、排行、行业和 ETF，不覆盖 F10 财务和股东数据。
