# 排障指南

当出现连接失败、工具不可见、401、400、超时、调用很慢、模型没有调用 MCP 时读取本文件。

## 当前会话看不到 MCP 工具

表现：

- 用户提问金融数据，模型没有可调用的 `describe_tool` 或业务模块工具。
- 模型准备改用网页搜索。

处理：

1. 停止业务查询，不要网页兜底。
2. 让用户确认 MCP 客户端配置的地址是 `https://ai.szfiu.com/api/mcp/v2`。
3. 让用户先访问 `https://ai.szfiu.com` 完成授权，并重新开启一个干净会话后再测。

## `netERR_CONNECTION_REFUSED`

含义：客户端访问的 MCP HTTP/SSE 地址没有服务在监听，或 URL/网络配置不一致。

检查：

- MCP 客户端 URL 是否为 `https://ai.szfiu.com/api/mcp/v2`。
- 本机是否能访问 `https://ai.szfiu.com`。
- 不要在本机客户端里填写服务器内部地址（内网 IP、`localhost`、容器服务名）。
- 如使用脚本，确认 `FIU_MCP_URL` 没有覆盖成错误地址。

## 401 Unauthorized

含义：请求到达了上游 Gateway，但当前会话或请求头未通过授权。

检查：

- 是否先访问 `https://ai.szfiu.com` 完成授权。
- MCP 客户端配置的 URL 是否为 `https://ai.szfiu.com/api/mcp/v2`。
- 如使用脚本，是否设置了上游要求的 `FIU_MCP_GATEWAY_AUTHORIZATION`。
- 不要把 Token 放入业务工具参数。

## `MCP_AUTH_REQUIRED` / 502、503、504

表现：脚本返回

```json
{
  "error": "McpAuthRequiredError",
  "code": "MCP_AUTH_REQUIRED",
  "portal": "https://ai.szfiu.com"
}
```

含义：上游网关没有把这次请求送到位。最常见的原因是未完成授权或未配置 JWT。

处理：

1. 浏览器打开 `https://ai.szfiu.com` 完成登录授权，拿到 JWT。
2. 设置 `FIU_MCP_GATEWAY_AUTHORIZATION=Bearer <token>`。
3. 确认 `FIU_MCP_URL` / MCP 客户端地址是 `https://ai.szfiu.com/api/mcp/v2`。
4. 授权已完成仍然失败时，联系服务方处理，不要自行改成内网地址。

说明：脚本会把上游错误正文里的服务器内部地址替换成 `[internal]`，所以这里看不到具体主机和端口，这是预期行为，不是信息丢失。

## 400 Bad Request

含义：请求到达下游，但参数不符合下游接口要求。

处理：

- 调用 `describe_tool` 查看 endpoint 的参数、枚举、日期格式和能力边界。
- 检查 `market`、`assetType`、`symbol`/`symbols`、`period`、`date` 等核心字段。
- 同一字段在不同接口里的格式可能不同，以具体 endpoint 描述为准。

## 下游超时或首次调用失败

表现：

- 返回 `This operation was aborted`。
- `elapsedMs` 接近 `timeoutMs`。
- 第一次失败，多调几次后成功。

可能原因：

- 下游 MCP Server 冷启动或连接预热慢。
- SSE/HTTP 连接初始化耗时。
- 下游接口本身响应慢。
- 查询参数导致返回数据量过大。

处理：

- 优先缩小查询范围，例如减少 `symbols`、降低 `limit`、加分页。
- 首次启动后先调用轻量工具做预热，例如工具列表或单只股票基础行情。
- 查看服务日志中的 `requestId`、server、tool、elapsedMs、timeoutMs。
- 如果经常接近超时，应提高超时时间或让下游服务做连接复用/缓存。

## 模型反复调用元工具

表现：模型一直调用 `describe_tool`，没有进入业务工具。

处理：

- 一旦确定工具集和 endpoint，立即调用业务工具。
- `describe_tool` 只用于确认参数，不用于实际查询数据。
- 对简单问题，例如“查腾讯行情”，应直接调用 `quote_spot` 并选择行情 endpoint，不需要启用工具集。

## 数据为空

处理：

- 说明接口返回为空，不要编造。
- 检查市场、代码后缀、日期范围、分页参数。
- 对“最新”“今天”等问题，明确当前日期，并说明数据是否可能因非交易时段、休市或下游延迟而为空。
