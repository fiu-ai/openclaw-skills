# FIU MCP Skills Usage Guide

## Quick Start

### 1. Install Skills

```bash
# Clone repository
git clone git@github.com:fiu-ai/openclaw-skills.git
cd fiu-mcp-skills

# Run installation script
./install.sh
```

Or manually:

```bash
cp -r skills/* ~/.openclaw/skills/
```

### 2. Configure API Token

```bash
# Add to ~/.zshrc or ~/.bashrc
export FIU_MCP_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Verify Installation

In OpenClaw, type `/` to see the skills list. You should see `market-assistant`.

## Usage

### Using in OpenClaw

After installation, you can use natural language in OpenClaw conversations:

```
Query Tencent Holdings real-time quote
Show AAPL K-line data
What's the capital flow for Tencent
Buy 100 shares of Tencent with simulation account
Check my positions
```

### Using Command Line Scripts

Scripts in the skill directory can also be used independently:

```bash
# Set environment variable
export FIU_MCP_TOKEN="your_token_here"

# Query quote
cd ~/.openclaw/skills/market-assistant/scripts
./quote.sh 00700.HK HK

# Query K-line
./kline.sh 00700.HK D 100

# Query capital flow
./capital.sh 00700.HK

# Place order (simulation)
./trade.sh buy 00700.HK 100 350.5 SIMULATE

# Query positions
./positions.sh SIMULATE

# Query cash
./cash.sh SIMULATE

# Search securities code
./search.sh Tencent
```

## MCP Protocol

FIU MCP Server uses JSON-RPC 2.0 protocol. Request format:

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

Response format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Response content"
      }
    ],
    "isError": false
  }
}
```

## Available Tools

### Market Query Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `quote` | Market snapshot | `symbol` |
| `kline` | K-line data | `symbol`, `period`, `count` |
| `orderbook` | Order book | `symbol` |
| `deal` | Tick-by-tick deals | `symbol` |
| `time_slice` | Time-sharing data | `symbol` |
| `market_status` | Market status | `market` (HK/US/CN) |
| `capital_flow` | Capital flow | `symbol` |
| `capital_distribution` | Capital distribution | `symbol` |

### Trading Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `place_order` | Place order | `symbol`, `action`, `qty`, `price`, `order_type`, `environment` |
| `cancel_order` | Cancel order | `order_id`, `environment` |
| `modify_order` | Modify order | `order_id`, `price`, `qty`, `environment` |
| `positions` | Query positions | `environment` |
| `cash` | Query cash | `environment` |
| `orders` | Query orders | `environment`, `status` |

### Market Data Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sectors` | Sector list | `market` |
| `sector_stocks` | Sector constituents | `sector_id` |
| `stock_sectors` | Stock sectors | `symbol` |
| `screen_stocks` | Stock screening | `conditions` |
| `rankings` | Market rankings | `type`, `market` |

### Utility Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `search` | Securities code search | `keyword` |

## FAQ

### Q: How to get API Token?

A: Contact FIU official to get JWT Token, or register at https://mcp.szfiu.com.

### Q: Is trading real or simulation?

A: Default is simulation environment (SIMULATE). For real trading:
1. Must specify `environment: "REAL"`
2. Secondary confirmation required
3. Trading password required

### Q: What about rate limits?

A: Order placement limit is 15 requests/30 seconds. If rate limited:
1. Reduce request frequency
2. Implement exponential backoff retry
3. Batch requests

### Q: What's the subscription quota?

A: Real-time subscription quota is 100～2000, depending on account level. Release unused subscriptions regularly.

### Q: Which markets are supported?

A: Currently supported:
- HK Stock (HK)
- US Stock (US)
- ~~A-Share (CN)~~

## Development Guide

### Adding New Tool Scripts

1. Create new script in `skills/market-assistant/scripts/`
2. Use JSON-RPC 2.0 format to call API
3. Parse SSE response (use `grep "^data:"`)
4. Add execute permission: `chmod +x script.sh`

### Example Script Structure

```bash
#!/bin/bash
set -e

TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "Error: Please set FIU_MCP_TOKEN environment variable"
    exit 1
fi

curl -s -X POST "https://mcp.szfiu.com/stock_hk_sdk/" \
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

## Resources

- [FIU MCP Official Docs](https://mcp.szfiu.com)
- [GitHub Repository](https://github.com/fiu-ai/openclaw-skills)
- [OpenClaw Docs](https://docs.openclaw.ai)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)

## Support

For issues, please submit a GitHub Issue or contact FIU support.
