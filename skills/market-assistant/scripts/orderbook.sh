#!/bin/bash
# FIU MCP - 买卖盘口查询
# 获取实时买卖盘口挂单数据

set -e

SYMBOL="${1:-}"

if [ -z "$SYMBOL" ]; then
    echo "用法：orderbook.sh <股票代码>"
    echo "示例：orderbook.sh 00700.HK"
    exit 1
fi

TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误：请设置 FIU_MCP_TOKEN 环境变量"
    exit 1
fi

curl -s -X POST "https://mcp.szfiu.com/stock_hk_sdk/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"tool\": \"orderbook\",
        \"params\": {
            \"symbol\": \"$SYMBOL\"
        }
    }" | jq .
