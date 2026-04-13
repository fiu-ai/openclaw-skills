# FIU MCP Skills 使用指南

## 快速开始

### 1. 安装 Skills

```bash
# 克隆仓库
git clone git@github.com:fiu-ai/openclaw-skills.git
cd fiu-mcp-skills

# 运行安装脚本
./install.sh
```

或者手动安装：

```bash
cp -r skills/* ~/.openclaw/skills/
```

### 2. 配置 API Token

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export FIU_MCP_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. 验证安装

在 OpenClaw 中输入 `/` 查看技能列表，应该能看到 `market-assistant`。

## 使用方式

### 在 OpenClaw 中使用

安装后，可以直接在 OpenClaw 对话中使用自然语言调用：

```
查询腾讯控股的实时行情
显示 AAPL 的 K 线数据
腾讯的资金流向如何
用模拟账户买入 100 股腾讯
查询我的持仓
```

### 使用命令行脚本

技能目录中的脚本也可以独立使用：

```bash
# 设置环境变量
export FIU_MCP_TOKEN="your_token_here"

# 查询行情
cd ~/.openclaw/skills/market-assistant/scripts
./quote.sh 00700.HK HK

# 查询 K 线
./kline.sh 00700.HK D 100

# 查询资金流向
./capital.sh 00700.HK

# 交易下单（模拟环境）
./trade.sh buy 00700.HK 100 350.5 SIMULATE

# 查询持仓
./positions.sh SIMULATE

# 查询资金
./cash.sh SIMULATE

# 检索证券代码
./search.sh 腾讯
```

## MCP 协议说明

FIU MCP Server 使用 JSON-RPC 2.0 协议，请求格式如下：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "key": "value"
    }
  }
}
```

响应格式：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "响应内容"
      }
    ],
    "isError": false
  }
}
```

## 可用工具列表

### 行情查询工具

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `quote` | 市场快照 | `symbol` (股票代码) |
| `kline` | K 线数据 | `symbol`, `period`, `count` |
| `orderbook` | 买卖盘口 | `symbol` |
| `deal` | 逐笔成交 | `symbol` |
| `time_slice` | 分时数据 | `symbol` |
| `market_status` | 市场状态 | `market` (HK/US/CN) |
| `capital_flow` | 资金流向 | `symbol` |
| `capital_distribution` | 资金分布 | `symbol` |

### 交易工具

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `place_order` | 下单 | `symbol`, `action`, `qty`, `price`, `order_type`, `environment` |
| `cancel_order` | 撤单 | `order_id`, `environment` |
| `modify_order` | 改单 | `order_id`, `price`, `qty`, `environment` |
| `positions` | 持仓查询 | `environment` |
| `cash` | 资金查询 | `environment` |
| `orders` | 订单查询 | `environment`, `status` |

### 市场数据工具

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `sectors` | 板块列表 | `market` |
| `sector_stocks` | 板块成分股 | `sector_id` |
| `stock_sectors` | 股票所属板块 | `symbol` |
| `screen_stocks` | 条件选股 | `conditions` |
| `rankings` | 排行榜 | `type`, `market` |

### 工具类

| 工具名 | 描述 | 参数 |
|--------|------|------|
| `search` | 证券代码检索 | `keyword` |

## 常见问题

### Q: 如何获取 API Token？

A: 联系 FIU 官方获取 JWT Token，或访问 https://ai.szfiu.com 注册账号。

### Q: 交易是实盘还是模拟？

A: 默认使用模拟环境（SIMULATE）。如需实盘交易，必须：
1. 明确指定 `environment: "REAL"`
2. 进行二次确认
3. 输入交易密码

### Q: 遇到限频怎么办？

A: 下单接口限频 15 次/30 秒。遇到限频请：
1. 减少请求频率
2. 实现指数退避重试
3. 批量处理请求

### Q: 订阅额度是多少？

A: 实时订阅额度为 100～2000，具体取决于账户等级。请定期释放不需要的订阅。

### Q: 支持哪些市场？

A: 目前支持：
- 港股（HK）
- 美股（US）
- A 股（CN）

## 开发指南

### 添加新的工具脚本

1. 在 `skills/market-assistant/scripts/` 目录创建新脚本
2. 使用 JSON-RPC 2.0 格式调用 API
3. 解析 SSE 响应（使用 `grep "^data:"`）
4. 添加执行权限：`chmod +x script.sh`

### 示例脚本结构

```bash
#!/bin/bash
set -e

TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误：请设置 FIU_MCP_TOKEN 环境变量"
    exit 1
fi

curl -s -X POST "https://ai.szfiu.com/stock_hk_sdk/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "tool_name",
            "arguments": {
                "key": "value"
            }
        }
    }" | grep "^data:" | sed 's/^data: //' | jq .
```

## 相关资源

- [FIU MCP 官方文档](https://ai.szfiu.com)
- [GitHub 仓库](https://github.com/fiu-ai/openclaw-skills)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [JSON-RPC 2.0 规范](https://www.jsonrpc.org/specification)

## 技术支持

如有问题，请提交 GitHub Issue 或联系 FIU 技术支持。
