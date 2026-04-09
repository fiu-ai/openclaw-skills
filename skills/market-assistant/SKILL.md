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

# market-assistant — FIU MCP Market Data & Trading Assistant

## Description

A market data query and trading assistant skill based on FIU MCP Server, supporting real-time quotes, K-line data, capital flow, and trading operations for HK, US, and CN stock markets.

## Trigger Keywords

- Quote queries: 行情, 股价, 报价, 涨跌, K线, 分时, 盘口, quote, price, kline, tick
- Trading: 买入, 卖出, 下单, 撤单, 持仓, 资金, buy, sell, order, position
- Market analysis: 资金流向, 板块, 排行榜, 行业, capital flow, sector, ranking
- Market codes: HK, US, CN, 港股, 美股, A股

## Configuration

### Required Environment Variables

Before using this skill, ensure the following environment variable is set:

```bash
export FIU_MCP_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Or configure in the skill settings file:

```json
{
  "fiu_mcp_token": "your_jwt_token_here"
}
```

### Required Binaries

The following tools must be available in your environment:

- `curl` - HTTP requests
- `jq` - JSON processing
- `date` - Date/time operations
- `bash` - Shell execution

## MCP Endpoints

| Market | F10 Data | SDK Data |
|--------|----------|----------|
| HK | `https://mcp.szfiu.com/stock_hk_f10/` | `https://mcp.szfiu.com/stock_hk_sdk/` |
| US | `https://mcp.szfiu.com/stock_us_f10/` | `https://mcp.szfiu.com/stock_us_sdk/` |
| CN | `https://mcp.szfiu.com/stock_cn_f10/` | `https://mcp.szfiu.com/stock_cn_sdk/` |
| Code Search | `https://mcp.szfiu.com/toolkit/` | - |

## Features

### Market Data (13 APIs)

1. **Quote Snapshot** - Get latest price, change %, volume
2. **K-line Data** - Daily, weekly, minute K-lines
3. **Order Book** - Real-time bid/ask orders
4. **Tick Data** - Recent trade details
5. **Intraday Data** - Intraday price chart
6. **Market Status** - Market open/close status
7. **Capital Flow** - Inflow/outflow data
8. **Capital Distribution** - Large/medium/small order distribution
9. **Sector List** - Industry/concept sectors
10. **Sector Components** - Stocks in a sector
11. **Stock Sectors** - Query stock's sectors
12. **Stock Filter** - Filter by price, market cap, PE, turnover
13. **Market Rankings** - Top gainers, volume, capital flow

### Trading Operations (7 APIs)

1. **Place Order** - Stock/futures order (default: SIMULATE mode)
2. **Cancel Order** - Cancel unfilled orders
3. **Modify Order** - Change order price/qty
4. **Query Positions** - View account positions
5. **Query Cash** - View available funds
6. **Query Orders** - View historical/current orders
7. **Futures Trading** - Support SG futures

### Real-time Subscriptions (5 APIs)

1. **Quote Subscription** - Real-time price push
2. **K-line Subscription** - Real-time K-line push
3. **Tick Subscription** - Real-time trade push
4. **Order Book Subscription** - Real-time bid/ask push
5. **Intraday Subscription** - Real-time intraday data push

## MCP Router (Recommended)

This skill includes a universal MCP Router (`mcp_router.sh`) that can call ALL FIU MCP Server APIs. This is the recommended way to use this skill.

### MCP Router Usage

```bash
# Basic format
mcp_router.sh <market> <tool_name> [parameters...]
mcp_router.sh --list-tools <market>  # List all available tools

# Markets: hk_f10, us_f10, cn_f10, hk_sdk, us_sdk, cn_sdk, toolkit

# Examples (note: tool names may differ by market)
mcp_router.sh hk_sdk post_v3_stock_quote fields=snapshot
mcp_router.sh hk_sdk post_v3_chart_kline_list symbol=00700.HK type=0
mcp_router.sh cn_f10 financials symbol=600519
mcp_router.sh toolkit search keyword=腾讯

# Discover available tools for a market
mcp_router.sh --list-tools cn_sdk
```

### Available Markets

| Market | Description |
|--------|-------------|
| hk_f10 | HK F10 Data (company info, financials, etc.) |
| us_f10 | US F10 Data (company info, financials, etc.) |
| cn_f10 | CN F10 Data (company info, financials, etc.) |
| hk_sdk | HK SDK Data (quotes, K-line, trade, etc.) |
| us_sdk | US SDK Data (quotes, K-line, trade, etc.) |
| cn_sdk | CN SDK Data (quotes, K-line, trade, etc.) |
| toolkit | Code Search |

**Note**: Tool names may differ between markets. Use `mcp_router.sh --list-tools <market>` to discover the exact tool names for each endpoint. See `docs/MCP_TOOLS.md` for known tool mappings.

## Usage Examples

### Query Quotes

```
Query Tencent Holdings real-time quote
00700 latest price
Apple stock change %
```

### Query K-line

```
Show Tencent daily K-line
View AAPL weekly K
Maotai minute K-line
```

### Query Capital Flow

```
Tencent capital flow
00700 large order distribution
CATL capital inflow/outflow
```

### Trading

```
Buy 100 shares Tencent with simulate account
Sell 50 shares AAPL
Query my positions
View available cash
```

### Query Sectors

```
What stocks in tech sector
Tencent sector
Show today's top gainers
```

## Important Notes

1. **Environment**: Trading defaults to SIMULATE mode. Real trading requires explicitly stating "real" or "production" with double confirmation.
2. **Rate Limit**: Order API limit is 15 requests per 30 seconds.
3. **Subscription Limit**: Real-time subscriptions have quota limits (100-2000), release unused subscriptions.
4. **Market Hours**: Check if market is open before querying.
5. **Token Security**: Keep your JWT Token secure, do not expose it.

## Error Handling

- **401 Unauthorized**: Token expired or invalid, please update FIU_MCP_TOKEN
- **429 Too Many Requests**: Rate limit triggered, wait and retry
- **404 Not Found**: Invalid stock code or API not found
- **500 Server Error**: Server error, please try later

## Related Files

- `scripts/` - Skill scripts directory
- `scripts/mcp_router.sh` - Universal MCP Router (recommended)
- `docs/mcp-interfaces_CN.md` - MCP Interface Complete Documentation
- `docs/mcp-interfaces_EN.md` - MCP Interface Documentation (English)
- `docs/MCP_TOOLS.md` - Complete MCP Tools Reference

## Version

- v1.0.0 - Initial release, supports basic market data query and trading

## License

MIT License

## Security Notice

This skill requires a FIU_MCP_TOKEN (JWT) to access the FIU MCP service. The token will be transmitted to the endpoints listed above. Please ensure:

1. Your token is obtained from a trusted source
2. Use SIMULATE mode for testing before real trading
3. Apply least-privilege principle to your token
4. Monitor trading activity closely