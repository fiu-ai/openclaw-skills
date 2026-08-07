# 配置与鉴权

## 连接信息

| 项 | 值 |
| --- | --- |
| 服务地址 | `http://ai.szfiu.com` |
| MCP 入口 | `http://ai.szfiu.com/api/mcp/v2` |
| 传输方式 | Streamable HTTP |
| 请求头 | `Authorization: Bearer <API_KEY>` |

API Key 在 `http://ai.szfiu.com` 申请。

## MCP 客户端配置

```json
{
  "mcpServers": {
    "fiu-finance": {
      "type": "streamableHttp",
      "url": "http://ai.szfiu.com/api/mcp/v2",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

连接成功后客户端会看到 24 个工具：`describe_tool` 加 23 个业务模块工具。

## 鉴权规则

- 每次请求都要带 `Authorization` 头。缺头返回 `401 缺少认证头`，Key 不对返回 `401 无效的令牌`。
- API Key 只放在 HTTP 请求头，不要放进业务参数 `params`，也不要写进提问文本。
- 下游数据服务的鉴权由网关内部处理，使用方不需要额外配置。

## 脚本调用

没有原生 MCP 工具入口，或者需要在命令行复现一次调用时，用 Skill 自带脚本。

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
```

可选覆盖地址：

```bash
export FIU_MCP_URL="http://ai.szfiu.com/api/mcp/v2"
```

Node.js：

```bash
node scripts/call.js list
node scripts/call.js describe quote_kline,get_kline
node scripts/call.js call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
```

Python：

```bash
python scripts/call.py list
python scripts/call.py describe quote_kline,get_kline
python scripts/call.py call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
```

Python 脚本优先使用 `requests`，未安装时自动退回标准库 `urllib`。

调用出错时脚本会把错误写到 stderr 并以非零码退出，便于自动化区分「拿到数据」和「拿到错误」。

## 配置成功后的行为

用户可以直接自然语言提问：

```text
查询腾讯控股最新行情
最近港股有哪些新股在招股？
帮我看 AAPL 最近 60 根日K
```

模型应优先调用 `describe_tool` 或业务模块工具。若工具不可见，应停止并提示检查连接，不要用网页搜索替代。
