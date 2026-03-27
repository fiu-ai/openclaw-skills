# FIU MCP Server 接口文档

本文档提供 FIU MCP Server 所有接口的完整说明，供 AI 工具参考使用。

## 目录

- [港股市场 F10 MCP](#港股市场 f10-mcp)
- [美股市场 F10 MCP](#美股市场 f10-mcp)
- ~~[A 股市场 F10 MCP](#a 股市场 f10-mcp)~~
- [港股市场 SDK MCP](#港股市场 sdk-mcp)
- [美股市场 SDK MCP](#美股市场 sdk-mcp)
- ~~[A 股市场 SDK MCP](#a 股市场 sdk-mcp)~~
- [FIU Toolkit MCP](#fiu-toolkit-mcp)

---

## 港股市场 F10 MCP

### 配置

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

### 功能

查询港股市场 F10 数据，包括：
- 公司简况
- 财务数据
- 基础信息
- 基金数据

### 认证

在请求头中添加 JWT Token：
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 美股市场 F10 MCP

### 配置

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

### 功能

查询美股市场 F10 数据，包括：
- 公司简况
- 财务数据
- 基础信息
- 基金数据

---

## ~~A 股市场 F10 MCP~~

> *(A 股数据即将推出，暂不可用)*

### ~~配置~~

~~查询 A 股市场 F10 数据，包括：~~
~~- 公司简况~~
~~- 财务数据~~
~~- 基础信息~~

---

## 港股市场 SDK MCP

### 配置

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

### 功能

查询港股市场数据，包括：
- 基础数据
- 码表
- 大盘统计
- 盘口数据
- 资金分析
- 排行榜
- 图表 K 线
- 行业数据
- 指数信息
- 沪深港股通
- 衍生品
- 筹码分布

---

## 美股市场 SDK MCP

### 配置

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

### 功能

查询美股市场数据，包括：
- 基础数据
- 码表
- 大盘统计
- 盘口数据
- 资金分析
- 排行榜
- 图表 K 线
- 行业数据
- 指数信息
- 沪深港股通
- 衍生品
- 筹码分布

---

## ~~A 股市场 SDK MCP~~

> *(A 股数据即将推出，暂不可用)*

### ~~配置~~

~~查询 A 股市场数据，包括：~~
~~- 码表~~
~~- 大盘统计~~
~~- 盘口数据~~
~~- 资金分析~~
~~- 排行榜~~
~~- 图表 K 线~~
~~- 行业数据~~
~~- 指数信息~~
~~- 沪深港股通~~
~~- 衍生品~~
~~- 筹码分布~~

---

## FIU Toolkit MCP

### 配置

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

### 功能

- 证券代码检索
- 股票代码查询
- 市场代码映射

---

## 标准配置模板

### JSON 配置（Streamable HTTP）

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
        /* stockCnF10 - A股数据即将推出 */
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
        /* stockCnSdk - A股数据即将推出 */
        "szfiuToolkit": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/toolkit/"
        }
    }
}
```

### SSE 传输配置

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
        /* stockCnF10SSE - A股数据即将推出 */
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
        /* stockCnSdkSSE - A股数据即将推出 */
        "szfiuToolkitSSE": {
            "transport": "streamable_http",
            "url": "https://mcp.szfiu.com/sse/toolkit/"
        }
    }
}
```

---

## 认证 Token

当前 JWT Token（有效期至 2030 年）：
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzemZpdS1tY3AtYXV0aCIsInN1YiI6ImRkYjI1NjRlLWUxZjYtNGVhOC1hZGJiLWQ5MTFjOTc2ZDNmZiIsImF1ZCI6WyJ0aGlyZC1wYXJ0eS1zeXN0ZW1zIl0sImV4cCI6MTg2OTYyMDY3NCwiaWF0IjoxNzczODg5NTAwfQ.KEQW3bFejfEEHG-ydXDrFtH3sxI9uql4nBRPPFglK5H1SFkwtbzi4DqWMjUCI_nAhjOLYx9KTe487-j--bpJ8V-JXpdayNrTnxDEFZrYe97ZFeMm9ojs2fxRhw3N21BHfJz2fxANNm5WCW6-XFENxyHlHBvnVb-TFW9dzxAotZ7vKyDQ34g_ga-ONEb2b3VyzyKUYB9Y-q3o3tdwkWQ
```

**注意**：请妥善保管您的 API Token，不要泄露给未授权的第三方。

---

## 使用示例

### 查询港股行情

```bash
curl -X POST https://mcp.szfiu.com/stock_hk_sdk/ \
  -H "Authorization: Bearer {api_key}" \
  -H "Content-Type: application/json" \
  -d '{"tool": "quote", "params": {"symbol": "00700.HK"}}'
```

### 查询公司财务数据

```bash
curl -X POST https://mcp.szfiu.com/stock_hk_f10/ \
  -H "Authorization: Bearer {api_key}" \
  -H "Content-Type: application/json" \
  -d '{"tool": "financials", "params": {"symbol": "00700.HK"}}'
```

### 检索证券代码

```bash
curl -X POST https://mcp.szfiu.com/toolkit/ \
  -H "Content-Type: application/json" \
  -d '{"tool": "search", "params": {"keyword": "腾讯"}}'
```

---

## 注意事项

1. **限频规则**：请留意各接口的调用频率限制，避免超频
2. **Token 有效期**：定期检查 Token 是否过期，及时更新
3. **数据传输**：建议使用 HTTPS 加密传输
4. **错误处理**：实现适当的错误处理和重试机制

---

## 相关链接

- [FIU MCP 官方文档](https://mcp.szfiu.com)
- [GitHub 仓库](https://github.com/fiu-ai/openclaw-skills)
