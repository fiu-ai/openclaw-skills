#!/bin/bash
# FIU MCP - 证券代码检索
# 检索证券代码服务

set -e

KEYWORD="${1:-}"

if [ -z "$KEYWORD" ]; then
    echo "用法：search.sh <关键词>"
    echo "示例：search.sh 腾讯"
    echo "       search.sh AAPL"
    exit 1
fi

TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误：请设置 FIU_MCP_TOKEN 环境变量"
    exit 1
fi

curl -s -X POST "https://mcp.szfiu.com/toolkit/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"tool\": \"search\",
        \"params\": {
            \"keyword\": \"$KEYWORD\"
        }
    }" | jq .
