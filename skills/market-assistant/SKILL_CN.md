---
name: market-assistant
description: "FIU MCP Market Data and Trading Assistant"
version: "1.0.3"
metadata:
  openclaw:
    requires:
      env:
        - FIU_MCP_TOKEN
      primaryCredential: FIU_MCP_TOKEN
---

# market-assistant — FIU MCP 行情交易助手

## 描述

基于 FIU MCP Server 的行情查询和交易助手技能，支持港股、美股、A 股三个市场的实时行情查询、K 线数据、资金流向、交易下单等功能。

## 触发关键词

- 行情查询相关：行情、股价、报价、涨跌、K 线、分时、盘口
- 交易相关：买入、卖出、下单、撤单、持仓、资金
- 市场分析：资金流向、板块、排行榜、行业
- 市场代码：HK、US、CN、港股、美股、A 股

## 配置

### 必需环境变量

在调用技能前，确保已设置环境变量：

```bash
export FIU_MCP_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

或在技能配置文件中设置：

```json
{
  "fiu_mcp_token": "your_jwt_token_here"
}
```

### 必需工具

以下工具必须在环境中可用：

- `curl` - HTTP 请求
- `jq` - JSON 处理
- `date` - 日期/时间操作
- `bash` - Shell 执行

## MCP 端点

| 市场 | F10 数据 | SDK 数据 |
|------|---------|---------|
| 港股 | `https://mcp.szfiu.com/stock_hk_f10/` | `https://mcp.szfiu.com/stock_hk_sdk/` |
| 美股 | `https://mcp.szfiu.com/stock_us_f10/` | `https://mcp.szfiu.com/stock_us_sdk/` |
| A 股 | `https://mcp.szfiu.com/stock_cn_f10/` | `https://mcp.szfiu.com/stock_cn_sdk/` |
| 代码检索 | `https://mcp.szfiu.com/toolkit/` | - |

## 功能列表

### 行情查询 (13 个接口)

1. **市场快照** - 获取股票最新报价、涨跌幅、成交量等
2. **K 线数据** - 获取日 K、周 K、分钟 K 等历史和实时 K 线
3. **买卖盘** - 获取实时买卖盘口挂单数据
4. **逐笔成交** - 获取最近逐笔成交明细
5. **分时数据** - 获取当日分时走势
6. **市场状态** - 查询各市场开盘/休市状态
7. **资金流向** - 获取个股资金流入流出数据
8. **资金分布** - 获取大单、中单、小单分布
9. **板块列表** - 获取行业/概念板块列表
10. **板块成分股** - 获取板块成分股列表
11. **股票所属板块** - 查询股票所属的行业/概念板块
12. **条件选股** - 按价格、市值、PE、换手率等条件筛选
13. **市场排行榜** - 涨跌幅、成交量、资金流向排行榜

### 交易操作 (7 个接口)

1. **下单** - 证券/期货下单（默认模拟环境）
2. **撤单** - 撤销未成交订单
3. **改单** - 修改订单价格和数量
4. **持仓查询** - 查询账户持仓
5. **资金查询** - 查询账户可用资金
6. **订单查询** - 查询历史/当前订单
7. **期货交易** - 支持 SG 等市场期货操作

### 实时订阅 (5 个接口)

1. **报价订阅** - 订阅实时报价推送
2. **K 线订阅** - 订阅实时 K 线推送
3. **逐笔订阅** - 订阅逐笔成交推送
4. **盘口订阅** - 订阅买卖盘口推送
5. **分时订阅** - 订阅分时数据推送

## MCP Router（推荐）

本技能包含一个通用 MCP Router（`mcp_router.sh`），可调用所有 FIU MCP Server API。这是推荐的使用方式。

### MCP Router 用法

```bash
# 基本格式
mcp_router.sh <市场> <工具名> [参数...]

# 市场选项: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# 示例
mcp_router.sh hk_sdk quote symbol=00700.HK fields=snapshot
mcp_router.sh us_sdk kline symbol=AAPL ktype=1
mcp_router.sh cn_f10 financials symbol=600519
mcp_router.sh toolkit search keyword=腾讯
```

### 可用市场与工具

| 市场 | 说明 | 工具 |
|------|------|------|
| hk_f10 | 港股 F10 数据 | company_info, financials, dividend, split_history, holders, news |
| us_f10 | 美股 F10 数据 | company_info, financials, dividend, split_history, holders, news |
| cn_f10 | A 股 F10 数据 | company_info, financials, dividend, split_history, holders, news, prospectus |
| hk_sdk | 港股 SDK 数据 | quote, kline, orderbook, tick, intraday, capital, trade, cancel_order 等 |
| us_sdk | 美股 SDK 数据 | quote, kline, orderbook, tick, intraday, capital, trade, cancel_order 等 |
| cn_sdk | A 股 SDK 数据 | quote, kline, orderbook, tick, intraday, capital, trade, cancel_order 等 |
| toolkit | 代码检索 | search, stock_info |

完整工具列表请参阅 `docs/MCP_TOOLS.md`。

## 使用示例

### 查询行情

```
查询腾讯控股的实时行情
00700 的最新股价
苹果公司的涨跌幅
```

### 查询 K 线

```
显示腾讯的日 K 线
查看 AAPL 的周 K
茅台的分钟 K 线
```

### 查询资金流向

```
腾讯的资金流向如何
查看 00700 的大单分布
宁德时代的资金流入流出
```

### 交易操作

```
用模拟账户买入 100 股腾讯
卖出 50 股 AAPL
查询我的持仓
查看可用资金
```

### 查询板块

```
科技板块有哪些股票
查询腾讯所属板块
显示今日涨幅榜
```

## 注意事项

1. **环境区分**：交易默认使用模拟环境（SIMULATE），实盘交易需明确说明"正式"/"实盘"/"真实"，且需二次确认
2. **限频规则**：下单接口限频 15 次/30 秒，避免超频
3. **订阅额度**：实时订阅有额度限制（100～2000），需定期释放不需要的订阅
4. **市场时间**：查询前注意市场是否开市
5. **Token 安全**：妥善保管 JWT Token，不要泄露

## 错误处理

常见错误及处理：

- **401 Unauthorized**：Token 过期或无效，请更新 FIU_MCP_TOKEN
- **429 Too Many Requests**：触发限频，请等待后重试
- **404 Not Found**：股票代码错误或接口不存在
- **500 Server Error**：服务端错误，请稍后重试

## 相关文件

- `scripts/` - 技能脚本目录
- `scripts/mcp_router.sh` - 通用 MCP Router（推荐）
- `docs/mcp-interfaces_CN.md` - MCP 接口完整文档
- `docs/mcp-interfaces_EN.md` - MCP Interface Documentation (EN)
- `docs/MCP_TOOLS.md` - 完整 MCP 工具参考

## 版本

- v1.0.0 - 初始版本，支持基础行情查询和交易功能

## 许可证

MIT License

## 安全说明

此技能需要 FIU_MCP_TOKEN（JWT）来访问 FIU MCP 服务。Token 将会被传输到上述列出的端点。请确保：

1. 您的 Token 来自可信来源
2. 使用模拟模式进行测试后再进行实盘交易
3. 对 Token 遵循最小权限原则
4. 密切监控交易活动