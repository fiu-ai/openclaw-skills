[English](mcp-interfaces_EN.md) | [中文](mcp-interfaces_CN.md)

# MCP 接口参考

服务地址：`https://ai.szfiu.com/api/mcp/v2`
传输方式：MCP Streamable HTTP
鉴权：`Authorization: Bearer <API_KEY>`

28 个工具 = `describe_tool` + `search` + 26 个业务工具集，共 104 个 endpoint。

大多数业务工具集统一收两个参数：

```json
{
  "endpoint": "<endpoint 名称>",
  "params": { "...": "该 endpoint 的字段" }
}
```

`market`、`symbol`、`symbols`、`startDate`、`endDate`、`limit` 是通用字段。endpoint 专有的类型判别字段——`ipoType`、`connectType`、`holdingType`、`dataType` 等——和它们一起放在 `params` 里。

`market_overview`、`market_flow`、`market_position_cost`、`shareholding_institution`、`macro_economics` 和 `company_announcements` 是扁平工具，业务字段直接放在 `arguments`，以 `tools/list` 和 `describe_tool` 返回的 schema 为准。

下表列的是**必填**字段。完整类型、默认值和枚举语义，用 `describe_tool` 带 `detail: "params"` 查。

---

## describe_tool

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `toolNames` | `string[]` | 是 | 最多 5 个，可填工具集名、endpoint 名或工具集 key |
| `detail` | `summary` \| `params` | 否 | 默认 `summary`；`params` 增加详细参数说明和路由要求 |

```json
{ "toolNames": ["f10_financials", "get_financial_statement"], "detail": "params" }
```

---

## 行情

### `quote_spot` — 港股、美股、A股(Zhcall提供)、日股、GLOBAL

| Endpoint | 必填 |
| --- | --- |
| `get_quote` | `assetType` = `stock` \| `etf` \| `index` \| `warrant` \| `bond`，`symbols` |
| `get_security_definition` | `market` = `HK` \| `US` \| `CN`，`definitionType` = `stock_define` \| `double_counter` \| `new_stocks` |
| `get_security_profile` | `symbols` |
| `search_security` | — |

### `quote_intraday` — 港股、美股、A股(Zhcall提供)、日股、GLOBAL

| Endpoint | 必填 |
| --- | --- |
| `get_intraday_trend` | `symbol` |
| `get_mini_trend` | `symbol` |
| `get_orderbook` | `symbol` |
| `get_trade_history` | `market` = `HK` \| `US`，`historyType` = `trade`，`symbol` |
| `get_trade_statistics` | `market` = `HK` \| `US` \| `CN` \| `JP`，`statisticsType` = `overview` \| `detail` |
| `get_trades` | `symbol` |

### `quote_kline` — 港股、美股、A股(Zhcall提供)、日股、GLOBAL

| Endpoint | 必填 |
| --- | --- |
| `get_kline` | `assetType` = `stock` \| `etf` \| `index` \| `bond`，`symbol` |
| `get_jp_kline` | `symbol` 或 `symbols`（仅 JP） |
| `get_snapshot_history` | `market` = `HK` \| `US`，`historyType` = `snapshot`，`symbol` |

`period` 取值：`1m`、`3m`、`5m`、`15m`、`30m`、`60m`、`120m`、`240m`、`1d`、`1w`、`1mo`、`1q`、`1y`。
`adjust`：`none`（默认）、`forward`、`backward`。`limit` 默认 100，最大 500。

### `quote_derivatives_hk` — 港股

| Endpoint | 必填 |
| --- | --- |
| `get_hk_warrant_catalog` | `warrantType` = `issuer` \| `list` \| `list_en` \| `profile` |
| `get_hk_warrant_trading_data` | `warrantTradeType` = `history` \| `rank` \| `statistics` |
| `get_quote_extend` | `symbols` |

### `quote_us_options` — 美股

| Endpoint | 必填 |
| --- | --- |
| `get_us_option_chain` | `optionType` = `expiration` \| `chain` \| `symbols` \| `snapshot` \| `greeks` \| `callput_volume` |
| `get_us_option_overview` | `optionType` = `latest` \| `line` \| `etf_latest` \| `etf_line` |
| `get_us_option_quote` | `optionType` = `snapshot` \| `order` \| `batch_order` \| `trade` \| `kline` \| `trend` \| `statistics_overview` \| `statistics_detail` \| `base_info` \| `status` \| `batch_status` \| `transaction_extended` |
| `get_us_option_rankings` | `rankType` = `list` \| `statistics` \| `top10` |

---

## 市场

### `market_overview` — 港股、美股、A股(Zhcall提供)、日股

| Endpoint | 必填 |
| --- | --- |
| `get_market_statistics` | `market` = `HK` \| `US` \| `CN` \| `JP` |

### `market_ranking` — 港股、美股、A股(Zhcall提供)、日股

| Endpoint | 必填 |
| --- | --- |
| `get_hk_ranking` | `rankType` = `stock` \| `industry` \| `ipo` \| `broker` \| `market_premium` |
| `get_us_ranking` | `rankType` = `stock` \| `industry` \| `ipo` \| `etf` |
| `get_cn_ranking` | `rankType` = `stock` \| `industry` \| `ipo` |
| `get_jp_ranking` | `rankType` = `stock` \| `hot_stock` \| `industry` |

`rankType` 按市场分支取值：港股为 `stock`、`industry`、`ipo`、`broker`、`market_premium`；美股为 `stock`、`industry`、`ipo`、`etf`；A股为 `stock`、`industry`、`ipo`；日股为 `stock`、`hot_stock`、`industry`。`sortField` 配合 `sortType`（0 升序 / 1 降序）控制排序。

### `market_flow` — 港股、美股、A股(Zhcall提供)、日股

| Endpoint | 必填 |
| --- | --- |
| `get_capital_flow` | `market` = `HK` \| `US` \| `CN` \| `JP`，`symbol` |

### `market_structure` — 港股、美股、A股(Zhcall提供)、日股

| Endpoint | 必填 |
| --- | --- |
| `get_index_data` | `market` = `HK` \| `US` \| `CN`，`indexType` = `list` \| `quote` \| `constituent` \| `mapping` \| `capital_distribution` |
| `get_industry_data` | `market` = `HK` \| `US` \| `CN` \| `JP`，`industryType` = `list` \| `rank` \| `constituent` \| `belong_quote` |
| `get_market_microstructure` | `dataType` = `spread` \| `market_premium` \| `double_counter` \| `broker_list` |

### `market_position_cost` — 港股、美股

| Endpoint | 必填 |
| --- | --- |
| `get_position_cost` | `market` = `HK` \| `US`，`costType` = `range` \| `distribution`，`symbol` |

---

## 基本面（F10）

返回结构化的报表、指标和公司行动数据。**不返回**年报 PDF、公告全文和分析师研报。

### `f10_profile` — 港股、美股、A股(Zhcall提供)

| Endpoint | 必填 |
| --- | --- |
| `get_company_profile` | — |
| `get_company_management` | — |
| `get_company_extra_profile` | `dataType` = `parallel` \| `extend_all` |

### `f10_financials` — 港股、美股、A股(Zhcall提供)

| Endpoint | 必填 |
| --- | --- |
| `get_financial_statement` | —（`statementType` = `income` \| `balance` \| `cash`，默认 `income`） |
| `get_financial_indicator` | — |

**按报告期筛选**：在 `params` 里传 `reportType`，各市场取值不同：

- **港股**：`F` 年报、`I` 半年报、`P` 上市前报告、`Q1` / `Q2` / `Q3` / `Q4` 季报。
- **A股(Zhcall提供)**：整数值，`1` 一季报、`6` 中报、`9` 三季报、`12` 年报、`99` 非常规报表。
- **美股**：`FY` 年报、`I1` / `I2` 半年期、`Q1` / `Q2` / `Q3` / `Q4` 季报。

### `f10_business_governance` — 港股、美股、A股(Zhcall提供)

| Endpoint | 必填 |
| --- | --- |
| `get_business_segment` | — |
| `get_company_action` | `actionType` = `dividends` \| `splits` \| `meeting` \| `codechange` \| `exchange_change` \| `suspension` \| `hold_change` \| `repurchase` \| `share_structure` |

---

## 股东与持仓

### `shareholding_structure` — 港股、美股、A股(Zhcall提供)

| Endpoint | 必填 |
| --- | --- |
| `get_shareholders` | `holdingType` = `major` \| `current` \| `detail` \| `topten` |
| `get_shareholding_change` | — |

`topten`（十大股东）用于 A股(Zhcall提供)，港股用 `major`。

### `shareholding_institution` — 美股

| Endpoint | 必填 |
| --- | --- |
| `get_institution_holding` | `holdingType` = `detail` \| `statistics` |

### `shareholding_fund_broker` — 港股、美股

| Endpoint | 必填 |
| --- | --- |
| `get_broker_holding` | `holdingType` = `ratio` \| `detail` \| `statistics` \| `rank` \| `f10_ratio` |
| `get_short_sell` | — |

---

## 基金与互联互通

### `fund_data` — 全球基金

基金接口不使用 `market`、`symbol` 或 `dataType`。基金引用使用 `fund_id` 或 `fund_class_id`；分页使用从 0 开始的 `page` 和最大 200 的 `page_size`。只有名称或 Ticker 时才先调用 `search_funds`；已有稳定 ID 时直接调用目标 endpoint。

| Endpoint | 调用契约 |
| --- | --- |
| `search_funds` | `mode` = `search` \| `categories` \| `providers` \| `share_classes`；`share_classes` 必须传 `fund_id` |
| `get_fund_profile` | 一个基金引用；`operation` = `default` \| `size` |
| `get_fund_managers` | 一个基金引用；`operation` = `current` \| `history` \| `bio` \| `education`；history 必须传起止日期 |
| `get_fund_distributions` | 一个基金引用，加 `start_date` 和 `end_date` |
| `get_fund_terms` | 一个基金引用；`kind` = `fees` \| `constraints` \| `purchase` |
| `get_fund_nav` | 一个基金引用；`operation` = `latest` \| `history`；history 必须传起止日期 |
| `get_fund_performance` | 一个基金引用；`operation` = `latest` \| `custom`；custom 必须传起止日期 |
| `compare_funds` | `fund_ids` / `fund_class_ids` 合计 2-10 个 |
| `get_fund_risk` | 一个基金引用；`operation` = `default` \| `rating` \| `debt` |
| `rank_funds` / `screen_funds` | 可选 `rank_field` 及筛选条件 |
| `get_fund_holdings` | 一个基金引用；`operation` = `default` \| `top` \| `history`；history 必须传起止日期 |
| `get_fund_exposure` | 一个基金引用；`operation` = `asset` \| `sector` \| `country` |
| `get_fund_benchmark` / `get_fund_sales_markets` | 一个基金引用 |
| `get_country_code` | 必填 `countryName`；支持中英文名称、ISO2、ISO3 和常用别名 |

### `stock_connect` — 港股、A股(Zhcall提供)

| Endpoint | 必填 |
| --- | --- |
| `get_stock_connect_data` | `connectType`（12 个取值，见下） |
| `get_hk_stock_connect_data` | `connectType` = `minute_flow` \| `balance` \| `cumulative_net_turnover_in` \| `cumulative_net_flow` \| `index_quote` \| `net_turnover` \| `rank_change_rate` \| `rank_net_turnover_in` \| `rank_shareholdings` \| `rank_traded` \| `shareholding_ratio` \| `turnover_flow` |
| `get_cn_stock_connect_data` | `connectType` = `balance` \| `cumulative_net_flow` \| `net_turnover` \| `quote_info` \| `rank_change_rate` \| `rank_net_turnover_in` \| `rank_shareholdings` \| `shareholding_ratio` |

`marketBoard` = `ALL` \| `SH` \| `SZ` 用于限定沪深板块，与顶层 `market` 相互独立。`cumulative_net_flow` 只支持 `SH` / `SZ`，且必须显式指定。

---

## 新股 IPO — 港股、美股

只覆盖新股、招股、上市场景，不是已上市公司的公告检索入口。

| Endpoint | 必填 |
| --- | --- |
| `get_hk_ipo_calendar` | `ipoType` = `calendar` \| `calendar_detail` |
| `get_hk_ipo_list` | `ipoType` = `make_new` \| `today` \| `to_be_listed` \| `listed` \| `table` \| `table_detail` |
| `get_hk_ipo_detail` | `ipoType` = `offering` \| `public_offering` \| `company_info` \| `allocation_top` \| `allocation_bottom` |
| `get_ipo_profile` | `ipoType` = `profile`，`code` |
| `get_hk_ipo_company_profile` | `ipoType` = `company_profile` \| `company_profile_new` |
| `get_hk_ipo_underwriter` | `ipoType` = `underwriter_list` \| `sponsor_list` |
| `get_hk_ipo_cornerstone_investor` | `ipoType` = `cornerstone_list` \| `cornerstone_rank` |
| `get_hk_ipo_margin_info` | `ipoType` = `margin` \| `margin_step` \| `broker_info` \| `multiple` |
| `get_hk_ipo_notice` | `ipoType` = `prospectus` \| `table_notice` |
| `get_hk_ipo_rankings` | `rankType` = `popular` \| `first_day_return` \| `sponsor` \| `underwriter` \| `cornerstone` |
| `get_hk_ipo_market_data` | `ipoMarketType` = `market_info` \| `industry_info` \| `industry_performance` \| `industry_name` |
| `get_hk_ipo_subscription_tools` | `ipoUtilityType` = `compute` \| `h5_compute` \| `amount_list` \| `broker_list` \| `lot` \| `new_stock_list` \| `subscription_list` \| `subscription_dates` |
| `get_us_ipo_list` | `ipoType` = `to_be_listed` \| `listed` \| `trend` \| `pe_ttm` |
| `get_us_ipo_detail` | `ipoType` = `stock_details` |
| `get_us_ipo_underwriter` | `ipoType` = `underwriter_performance` \| `underwriter_detail` |
| `get_us_ipo_market_data` | `ipoMarketType` = `us_market_info` \| `us_industry_performance` |
| `get_ipo_news` | `contentType` = `new_stock_info` \| `list` \| `detail` \| `hot` \| `day_rank` \| `week_rank` \| `refer` \| `relate` \| `h5_relate` |
| `get_ipo_topic` | `topicType` = `top` \| `list` \| `detail` \| `info` |
| `get_ipo_course` | `courseType` = `search` \| `hot` \| `month_rank` \| `refer` \| `relate` \| `h5_relate` \| `detail` \| `total_rank` |
| `get_ipo_tags` | `tagType` = `exist_data` \| `list` |
| `search_ipo_content` | `contentType` = `async_search` \| `search` |

---

## 债券 — GLOBAL

债券接口统一用 `market: "GLOBAL"`，`symbol` 可以是 ISIN。

### `bond_basic`

| Endpoint | 必填 |
| --- | --- |
| `search_bond` | — |
| `get_bond_profile` | — |
| `get_bond_quote` | — |
| `get_bond_orderbook` | — |

### `bond_analytics`

| Endpoint | 必填 |
| --- | --- |
| `get_bond_rankings` | — |
| `get_bond_chart` | — |
| `get_bond_yield` | — |
| `get_bond_trading_status` | — |

---

## 新闻资讯 — `fiu_news`，港股、美股、A股(Zhcall提供)、日股、GLOBAL

覆盖上市公司新闻资讯，不覆盖交易所公告、披露全文和分析师研报。

| Endpoint | 必填 |
| --- | --- |
| `news_search` | `query` |
| `news_by_symbol` | `symbol` |
| `news_latest` | — |
| `news_get` | `id` |
| `news_related` | `id` |
| `news_digest` | — |

`news_search` 是语义检索。`limit` 默认 10，最大 50；`news_latest` 的 `hours` 默认 24，最大 168。日期、排序和相关性字段以 endpoint schema 为准。

---

## 财经日历、宏观数据与上市公司公告

### `financial_calendar` — 全球事件

| Endpoint | 必填 |
| --- | --- |
| `search_financial_calendar` | `keyword`、`date` |
| `get_financial_event_detail` | `id` |

`search_financial_calendar` 传 `endDate` 查询明确区间；滚动查询使用 `direction` 和 `limit`。国家、事件类型、市场和重要等级分别使用 `countryTypes`、`eventTypes`、`markets`、`importanceLevels`，不使用证券行情的 `market` 字段。

### `macro_economics` — 精选宏观数据

| Endpoint | 必填 |
| --- | --- |
| `get_macro_overview` | `titleId` |

`titleId` 只能使用 `describe_tool` 返回的值：10、20、30、40、50、60、70、80、90、100、110。

### `company_announcements` — 港股、美股、A股

| Endpoint | 必填 |
| --- | --- |
| `get_company_announcements` | `market`、`symbols` |

这是扁平工具，字段直接放在 `arguments`。`startDate`、`endDate` 可选。附件失败时仍保留公告记录，并通过 `attachmentStatus` 标记。

---

## 参考数据 — `reference`，港股、美股、A股(Zhcall提供)、日股、GLOBAL

| Endpoint | 必填 |
| --- | --- |
| `get_reference_data` | `referenceType` = `isin` \| `sedol` \| `trade_symbol` \| `warrant_related` \| `currency` \| `basic_symbol` \| `cik` \| `adr` \| `bond_codes` \| `yield_codes` |
| `get_symbol_mapping` | `referenceType` = `stock` \| `index` |
| `get_trading_status` | `statusType` = `trade_date` \| `session` \| `exright` \| `security` \| `delisted` \| `current` \| `bond_session` \| `yield_session` |
| `get_market_hours` | — |

有对应业务工具集时优先用业务工具集。`reference` 只负责代码映射和交易日历，不是公告、新闻、研报的检索入口。

---

## 通用约定

| 字段 | 格式 |
| --- | --- |
| `market` | `HK`、`US`、`CN`（A股(Zhcall提供)）、`JP`、`GLOBAL`（跨市场，目前为债券） |
| `symbol` / `symbols` | 带后缀：`00700.hk`、`AAPL.us`、`600519.sh`、`000001.sz`、`6758.jp`；债券可用 ISIN |
| `startDate` / `endDate` / `date` | `YYYY-MM-DD`；分钟 K线、逐笔和分时用 `YYYY-MM-DD HH:mm:ss` |
| `limit` | 含义和上限随 endpoint 不同，以 `describe_tool` 为准 |

不要把 `endpoint`、`token`、`Authorization` 塞进 `params`。

## 错误码

| 错误码 | 含义 | 处理 |
| --- | --- | --- |
| `INVALID_ARGUMENT` | 类型或枚举值不匹配 | 用 `describe_tool detail=params` 核对取值 |
| `INVALID_SEMANTIC_INPUT` | 缺少必填的类型判别字段 | 补上对应的 `*Type` 字段 |
| `INVALID_DOWNSTREAM_ARGS` | 参数组合被下游拒绝 | 检查字段之间的依赖关系 |
| `UNSUPPORTED_ROUTE` | 该市场不支持这个 endpoint | 换市场，或改用市场专属 endpoint |
| `DOWNSTREAM_NETWORK_ERROR` | 上游数据源不可达 | 重试；持续失败请提 Issue |
