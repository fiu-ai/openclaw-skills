#!/bin/bash
# FIU MCP - K 线数据查询
# 获取日 K、周 K、分钟 K 等历史和实时 K 线

set -e

SYMBOL="${1:-}"
PERIOD="${2:-D}"  # D=日 K, W=周 K, M=月 K, 60=60 分钟 K
COUNT="${3:-100}"

if [ -z "$SYMBOL" ]; then
    echo "用法：kline.sh <股票代码> [周期] [数量]"
    echo "周期：D(日 K), W(周 K), M(月 K), 60(60 分钟), 30(30 分钟)"
    echo "示例：kline.sh 00700.HK D 100"
    exit 1
fi

TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误：请设置 FIU_MCP_TOKEN 环境变量"
    exit 1
fi

# 调用 API
curl -s -X POST "https://mcp.szfiu.com/stock_hk_sdk/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"tool\": \"kline\",
        \"params\": {
            \"symbol\": \"$SYMBOL\",
            \"period\": \"$PERIOD\",
            \"count\": $COUNT
        }
    }" | jq .
