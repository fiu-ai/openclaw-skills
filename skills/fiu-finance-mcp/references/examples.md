# 调用示例

以下参数组合均可直接使用。字段含义、完整枚举以 `describe_tool` 为准。

## 行情

```json
// quote_spot —— 批量快照行情
{ "endpoint": "get_quote", "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk", "09988.hk"] } }

// quote_spot —— 按名称/代码搜索
{ "endpoint": "search_security", "params": { "market": "HK", "assetType": "stock", "keyword": "腾讯", "limit": 5 } }

// quote_spot —— 证券静态资料
{ "endpoint": "get_security_profile", "params": { "market": "US", "symbols": ["AAPL.us"] } }

// quote_kline —— 最近 60 根日K
{ "endpoint": "get_kline", "params": { "market": "US", "assetType": "stock", "symbol": "AAPL.us", "period": "1d", "limit": 60 } }

// quote_intraday —— 买卖盘 / 逐笔 / 分时
{ "endpoint": "get_orderbook",      "params": { "market": "HK", "assetType": "stock", "symbol": "00700.hk" } }
{ "endpoint": "get_trades",         "params": { "market": "HK", "assetType": "stock", "symbol": "00700.hk", "limit": 10 } }
{ "endpoint": "get_intraday_trend", "params": { "market": "HK", "assetType": "stock", "symbol": "00700.hk" } }

// quote_derivatives_hk —— 窝轮发行商
{ "endpoint": "get_hk_warrant_catalog", "params": { "market": "HK", "warrantType": "issuer" } }
```

## 市场

```json
// market_overview —— 港股大市统计
{ "endpoint": "get_market_statistics", "params": { "market": "HK" } }

// market_ranking —— 港股涨幅榜前 10
{ "endpoint": "get_rankings", "params": { "market": "HK", "rankType": "stock", "sortField": "changeRate", "sortType": 1, "pageSize": 10 } }

// market_flow —— A股(中华通)当前资金流
{ "endpoint": "get_capital_flow", "params": { "market": "CN", "flowType": "current", "symbol": "600519.sh" } }

// market_structure —— A股(中华通)行业列表
{ "endpoint": "get_industry_data", "params": { "market": "CN", "industryType": "list" } }

// market_position_cost —— 指定价位获利比例
{ "endpoint": "get_position_cost", "params": { "market": "HK", "costType": "range", "symbol": "00700.hk", "price": 480 } }
```

`sortType`：`1` 降序（默认）、`0` 升序。`costType` 取 `distribution` 时改传 `high` 和 `low`。

## 基本面

```json
// f10_profile —— 公司基础资料
{ "endpoint": "get_company_profile", "params": { "market": "CN", "symbol": "600519.sh", "dataType": "basic" } }

// f10_financials —— 港股年报利润表
{ "endpoint": "get_financial_statement", "params": { "market": "HK", "symbol": "00700.hk", "statementType": "income", "reportType": "F" } }

// f10_financials —— A股(中华通)年度资产负债表
{ "endpoint": "get_financial_statement", "params": { "market": "CN", "symbol": "600519.sh", "statementType": "balance", "reportType": 12 } }

// f10_financials —— 财务指标
{ "endpoint": "get_financial_indicator", "params": { "market": "CN", "symbol": "600519.sh" } }

// f10_business_governance —— 分红记录
{ "endpoint": "get_company_action", "params": { "market": "HK", "symbol": "00700.hk", "actionType": "dividends" } }
```

## 股东持仓

```json
// shareholding_structure
{ "endpoint": "get_shareholders", "params": { "market": "HK", "symbol": "00700.hk", "holdingType": "major" } }
{ "endpoint": "get_shareholders", "params": { "market": "CN", "symbol": "600519.sh", "holdingType": "topten" } }
{ "endpoint": "get_shareholding_change", "params": { "market": "HK", "symbol": "00700.hk" } }

// shareholding_institution —— 美股机构持股统计
{ "endpoint": "get_institution_holding", "params": { "market": "US", "symbol": "AAPL.us", "holdingType": "statistics" } }

// shareholding_fund_broker —— 港股沽空
{ "endpoint": "get_short_sell", "params": { "market": "HK", "symbol": "00700.hk" } }
```

## 基金、IPO、债券、参考数据

```json
// fund_etf
{ "endpoint": "get_etf_data",  "params": { "market": "HK", "dataType": "issuer" } }
{ "endpoint": "get_fund_data", "params": { "market": "HK", "symbol": "02800.hk", "dataType": "value" } }

// ipo —— 待上市新股
{ "endpoint": "get_hk_ipo_list", "params": { "ipoType": "to_be_listed" } }

// bond_basic —— 债券搜索
{ "endpoint": "search_bond", "params": { "market": "GLOBAL", "keyword": "CHINA", "limit": 5 } }

// reference —— ISIN 查询
{ "endpoint": "get_reference_data", "params": { "market": "HK", "symbol": "00700.hk", "referenceType": "isin" } }
```

`ipoType` 常用取值：`make_new` 招股中、`today` 今日、`to_be_listed` 待上市、`listed` 已上市。

## 新闻

```json
{ "endpoint": "news_latest",          "params": { "market": "HK", "limit": 5 } }
{ "endpoint": "news_search",          "params": { "market": "CN", "query": "新能源", "limit": 10 } }
{ "endpoint": "news_by_symbol",       "params": { "market": "HK", "symbol": "00700.hk", "limit": 10 } }
{ "endpoint": "news_semantic_search", "params": { "market": "US", "query": "AI chip demand", "limit": 10 } }
```

`news_search` 只匹配标题、摘要和关键词，不搜正文；描述性问题用 `news_semantic_search`。

## 查参数

```json
{ "toolNames": ["ipo"], "detail": "summary" }
{ "toolNames": ["get_hk_ipo_margin_info"], "detail": "params" }
{ "toolNames": ["get_hk_ipo_margin_info"], "detail": "full" }
```

## 自然语言测试问题

```text
腾讯控股现在多少钱？港股今天涨跌家数是多少？
帮我看 AAPL 最近 60 根日K，顺便算一下区间涨幅。
本周港股有哪些新股在招股？保证金倍数是多少？
贵州茅台最近三年的营业收入和净利润趋势。
苹果的机构持股统计，最近一个季度有没有明显增减？
00700.hk 的十大股东和最近的持股变动。
A股今天哪些行业资金净流入最多？
最近 24 小时港股有什么重要新闻？
2800.hk 的最新净值和资产规模。
00700.hk 的 ISIN 是多少？
```
