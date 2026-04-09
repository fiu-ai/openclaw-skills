# FIU MCP Tools Reference
# 列出所有可用的 MCP Server tools

## HK F10 (stock_hk_f10)

| Tool Name | Description |
|-----------|-------------|
| company_info | 公司基本信息 |
| financials | 财务数据 |
| dividend | 分红送股 |
| split_history | 拆股历史 |
| holders | 股东信息 |
| news | 公告新闻 |
| industry | 行业分类 |

## US F10 (stock_us_f10)

| Tool Name | Description |
|-----------|-------------|
| company_info | 公司基本信息 |
| financials | 财务数据 |
| dividend | 分红送股 |
| split_history | 拆股历史 |
| holders | 股东信息 |
| news | 公告新闻 |
| industry | 行业分类 |

## CN F10 (stock_cn_f10)

| Tool Name | Description |
|-----------|-------------|
| company_info | 公司基本信息 |
| financials | 财务数据 |
| dividend | 分红送股 |
| split_history | 拆股历史 |
| holders | 股东信息 |
| news | 公告新闻 |
| industry | 行业分类 |
| prospectus | 招股说明书 |
| public_listing | 公募持仓 |

## HK SDK (stock_hk_sdk)

| Tool Name | Description |
|-----------|-------------|
| quote | 市场快照 |
| kline | K线数据 |
| orderbook | 买卖盘 |
| tick | 逐笔成交 |
| intraday | 分时数据 |
| capital | 资金流向 |
| capital_distribution | 资金分布 |
| sector_list | 板块列表 |
| sector_stocks | 板块成分股 |
| stock_sector | 股票所属板块 |
| stock_filter | 条件选股 |
| market_ranking | 市场排行榜 |
| trade | 下单 |
| cancel_order | 撤单 |
| modify_order | 改单 |
| query_cash | 资金查询 |
| query_positions | 持仓查询 |
| query_orders | 订单查询 |
| futures_trade | 期货交易 |
| subscribe_quote | 报价订阅 |
| subscribe_kline | K线订阅 |
| subscribe_tick | 逐笔订阅 |
| subscribe_orderbook | 盘口订阅 |
| subscribe_intraday | 分时订阅 |

## US SDK (stock_us_sdk)

| Tool Name | Description |
|-----------|-------------|
| quote | 市场快照 |
| kline | K线数据 |
| orderbook | 买卖盘 |
| tick | 逐笔成交 |
| intraday | 分时数据 |
| capital | 资金流向 |
| capital_distribution | 资金分布 |
| sector_list | 板块列表 |
| sector_stocks | 板块成分股 |
| stock_sector | 股票所属板块 |
| stock_filter | 条件选股 |
| market_ranking | 市场排行榜 |
| trade | 下单 |
| cancel_order | 撤单 |
| modify_order | 改单 |
| query_cash | 资金查询 |
| query_positions | 持仓查询 |
| query_orders | 订单查询 |
| futures_trade | 期货交易 |

## CN SDK (stock_cn_sdk)

| Tool Name | Description |
|-----------|-------------|
| quote | 市场快照 |
| kline | K线数据 |
| orderbook | 买卖盘 |
| tick | 逐笔成交 |
| intraday | 分时数据 |
| capital | 资金流向 |
| capital_distribution | 资金分布 |
| sector_list | 板块列表 |
| sector_stocks | 板块成分股 |
| stock_sector | 股票所属板块 |
| stock_filter | 条件选股 |
| market_ranking | 市场排行榜 |
| trade | 下单 |
| cancel_order | 撤单 |
| modify_order | 改单 |
| query_cash | 资金查询 |
| query_positions | 持仓查询 |
| query_orders | 订单查询 |
| futures_trade | 期货交易 |

## Toolkit (toolkit)

| Tool Name | Description |
|-----------|-------------|
| search | 证券代码搜索 |
| stock_info | 股票基本信息查询 |

## Usage Examples

### 基本格式
```bash
# mcp_router.sh <市场> <tool_name> [参数...]
```

### 行情查询
```bash
# 港股行情
./mcp_router.sh hk_sdk quote symbol=00700.HK fields=snapshot

# 美股行情
./mcp_router.sh us_sdk quote symbol=AAPL fields=snapshot sessionId=1

# A股行情
./mcp_router.sh cn_sdk quote symbol=600519 fields=snapshot sessionId=1
```

### K线查询
```bash
# 日K线
./mcp_router.sh hk_sdk kline symbol=00700.HK ktype=1

# 周K线
./mcp_router.sh us_sdk kline symbol=AAPL ktype=2

# 分钟K线
./mcp_router.sh cn_sdk kline symbol=600519 ktype=5
```

### 资金流向
```bash
./mcp_router.sh hk_sdk capital symbol=00700.HK
./mcp_router.sh cn_sdk capital symbol=600519
```

### F10 数据
```bash
./mcp_router.sh hk_f10 financials symbol=00700.HK
./mcp_router.sh us_f10 company_info symbol=AAPL
./mcp_router.sh cn_f10 dividend symbol=600519
```

### 代码搜索
```bash
./mcp_router.sh toolkit search keyword=腾讯
./mcp_router.sh toolkit stock_info code=00700
```

### 交易操作 (需谨慎)
```bash
# 模拟买入
./mcp_router.sh hk_sdk trade action=buy symbol=00700.HK qty=100 price=380

# 查持仓
./mcp_router.sh hk_sdk query_positions

# 查资金
./mcp_router.sh hk_sdk query_cash

# 撤单
./mcp_router.sh hk_sdk cancel_order order_id=xxx
```