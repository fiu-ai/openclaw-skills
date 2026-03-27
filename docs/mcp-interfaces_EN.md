# FIU MCP Server Interface Documentation

This document provides complete specifications for all FIU MCP Server endpoints, designed for AI tool reference.

## Table of Contents

- [HK Market F10 MCP](#hk-market-f10-mcp)
- [US Market F10 MCP](#us-market-f10-mcp)
- ~~[A-Share Market F10 MCP](#a-share-market-f10-mcp)~~
- [HK Market SDK MCP](#hk-market-sdk-mcp)
- [US Market SDK MCP](#us-market-sdk-mcp)
- ~~[A-Share Market SDK MCP](#a-share-market-sdk-mcp)~~
- [FIU Toolkit MCP](#fiu-toolkit-mcp)

---

## HK Market F10 MCP

### Configuration

```json
{
    "mcpServers": {
        "stockHkF10": {
            "description": "港股市场 F10 数据",
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_hk_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

### Features

Query HK market F10 data, including:
- Company profile
- Financial data
- Basic information
- Fund data

### Authentication

Add JWT Token to request headers:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## US Market F10 MCP

### Configuration

```json
{
    "mcpServers": {
        "stockUsF10": {
            "description": "美股市场 F10 数据",
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_us_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

### Features

Query US market F10 data, including:
- Company profile
- Financial data
- Basic information
- Fund data

---

## ~~A-Share Market F10 MCP~~

> *(A-Share data is coming soon and not yet available)*

### ~~Configuration~~

~~Query A-share market F10 data, including:~~
~~- Company profile~~
~~- Financial data~~
~~- Basic information~~

---

## HK Market SDK MCP

### Configuration

```json
{
    "mcpServers": {
        "stockHkSdk": {
            "description": "港股市场 SDK 数据",
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_hk_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

### Features

Query HK market data, including:
- Basic data
- Code tables
- Market statistics
- Order book data
- Capital analysis
- Rankings
- Charts & K-line
- Industry data
- Index information
- Stock connect programs
- Derivatives
- Chip distribution

---

## US Market SDK MCP

### Configuration

```json
{
    "mcpServers": {
        "stockUsSdk": {
            "description": "美股市场 SDK 数据",
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_us_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        }
    }
}
```

### Features

Query US market data, including:
- Basic data
- Code tables
- Market statistics
- Order book data
- Capital analysis
- Rankings
- Charts & K-line
- Industry data
- Index information
- Stock connect programs
- Derivatives
- Chip distribution

---

## ~~A-Share Market SDK MCP~~

> *(A-Share data is coming soon and not yet available)*

### ~~Configuration~~

~~Query A-share market data, including:~~
~~- Code tables~~
~~- Market statistics~~
~~- Order book data~~
~~- Capital analysis~~
~~- Rankings~~
~~- Charts & K-line~~
~~- Industry data~~
~~- Index information~~
~~- Stock connect programs~~
~~- Derivatives~~
~~- Chip distribution~~

---

## FIU Toolkit MCP

### Configuration

```json
{
    "mcpServers": {
        "szfiuToolkit": {
            "description": "FIU 检索证券代码服务",
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/toolkit/"
        }
    }
}
```

### Features

- Securities code search
- Stock code lookup
- Market code mapping

---

## Standard Configuration Template

### JSON Configuration (Streamable HTTP)

```json
{
    "mcpServers": {
        "stockHkF10": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_hk_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        "stockUsF10": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_us_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        /* stockCnF10 - A-Share data coming soon */
        "stockHkSdk": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_hk_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        "stockUsSdk": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/stock_us_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        /* stockCnSdk - A-Share data coming soon */
        "szfiuToolkit": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/toolkit/"
        }
    }
}
```

### SSE Transport Configuration

```json
{
    "mcpServers": {
        "stockHkF10SSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/stock_hk_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        "stockUsF10SSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/stock_us_f10/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        /* stockCnF10SSE - A-Share data coming soon */
        "stockHkSdkSSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/stock_hk_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        "stockUsSdkSSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/stock_us_sdk/",
            "headers": {
                "Authorization": "Bearer {api_key}"
            }
        },
        /* stockCnSdkSSE - A-Share data coming soon */
        "szfiuToolkitSSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/toolkit/"
        }
    }
}
```

---

## Authentication Token

Current JWT Token (valid until 2030):
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzemZpdS1tY3AtYXV0aCIsInN1YiI6ImRkYjI1NjRlLWUxZjYtNGVhOC1hZGJiLWQ5MTFjOTc2ZDNmZiIsImF1ZCI6WyJ0aGlyZC1wYXJ0eS1zeXN0ZW1zIl0sImV4cCI6MTg2OTYyMDY3NCwiaWF0IjoxNzczODg5NTAwfQ.KEQW3bFejfEEHG-ydXDrFtH3sxI9uql4nBRPPFglK5H1SFkwtbzi4DqWMjUCI_nAhjOLYx9KTe487-j--bpJ8V-JXpdayNrTnxDEFZrYe97ZFeMm9ojs2fxRhw3N21BHfJz2fxANNm5WCW6-XFENxyHlHBvnVb-TFW9dzxAotZ7vKyDQ34g_ga-ONEb2b3VyzyKUYB9Y-q3o3tdwkWQ
```

**Note**: Please keep your API Token secure and do not share it with unauthorized parties.

---

## Usage Examples

### Query HK Stock Quote

```bash
curl -X POST https://mcp.szfiu.com/stock_hk_sdk/ \
  -H "Authorization: Bearer {api_key}" \
  -H "Content-Type: application/json" \
  -d '{"tool": "quote", "params": {"symbol": "00700.HK"}}'
```

### Query Company Financials

```bash
curl -X POST https://mcp.szfiu.com/stock_hk_f10/ \
  -H "Authorization: Bearer {api_key}" \
  -H "Content-Type: application/json" \
  -d '{"tool": "financials", "params": {"symbol": "00700.HK"}}'
```

### Search Securities Code

```bash
curl -X POST https://mcp.szfiu.com/toolkit/ \
  -H "Content-Type: application/json" \
  -d '{"tool": "search", "params": {"keyword": "Tencent"}}'
```

---

## Important Notes

1. **Rate Limits**: Be aware of API rate limits for each endpoint
2. **Token Expiry**: Regularly check and refresh your JWT token
3. **Data Security**: Use HTTPS for encrypted data transmission
4. **Error Handling**: Implement proper error handling and retry mechanisms

---

## Related Links

- [FIU MCP Official Docs](https://mcp.szfiu.com)
- [GitHub Repository](https://github.com/fiu-ai/openclaw-skills)
