# 排障指南

连接失败、工具不可见、401、参数校验失败、超时、模型没有调用 MCP 时读取本文件。

## 当前会话看不到 MCP 工具

含义：客户端没有连上，或工具未注册到当前会话。

检查：

- 客户端里 FIU MCP 是否处于启用状态。
- URL 是否为 `http://ai.szfiu.com/api/mcp/v2`。
- 改完配置后是否重启了客户端。
- 连接正常时应看到 24 个工具：`describe_tool` 加 23 个业务模块工具。

工具不可见时，应提示用户检查连接，不要用网页搜索代替数据查询。

## 连接被拒绝

含义：目标地址没有服务在监听，或 URL 写错。

检查：

- 本机能否访问 `http://ai.szfiu.com`。
- 不要在客户端里填写服务器内网地址。
- 使用脚本时确认 `FIU_MCP_URL` 没有被覆盖成错误地址。

## 401 缺少认证头

含义：请求到达网关，但没有携带 `Authorization`。

处理：

- 客户端配置里加上 `"headers": { "Authorization": "Bearer YOUR_API_KEY" }`。
- 使用脚本时导出 `FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"`。
- 不要把 Key 放进业务参数。

## 401 无效的令牌

含义：请求带了 Key，但网关不认。

处理：

- 确认值的形式是 `Bearer ` 加 Key，中间一个空格。
- 确认 Key 没有过期，必要时在 `http://ai.szfiu.com` 重新申请。
- 确认没有多余的引号、换行或空白字符。

## INVALID_ARGUMENT / INVALID_SEMANTIC_INPUT

含义：网关语义层校验没过，通常是必填字段缺失或枚举值不对。

处理：

- 看 `details.issues`，里面按字段列出了原因。
- 调用 `describe_tool`，`detail` 用 `params`，拿到该 endpoint 的必填字段、类型和合法枚举。
- 常见原因：漏传 `market`，或漏传类型判别字段（`ipoType`、`connectType`、`dataType`、`holdingType`、`actionType`、`referenceType`、`optionType`）。

## INVALID_DOWNSTREAM_ARGS

含义：语义层过了，但下游接口还需要更具体的字段。

处理：

- 对这一个 endpoint 调用 `describe_tool`，`detail` 用 `full`，展开下游请求结构。
- 按展开结果补齐字段后重试。

## UNSUPPORTED_ROUTE

含义：该 endpoint 不支持当前的 `market` / `assetType` 组合。

处理：

- 看 `details.hints`，里面列出了只差一个条件就能命中的组合。
- 对照 `references/toolsets.md` 确认该能力在目标市场是否覆盖。

## DOWNSTREAM_NETWORK_ERROR

含义：网关连不上下游数据服务，通常是网络或部署问题，不是参数问题。

处理：

- 记下错误里的 `requestId`，反馈给维护方。
- 不要反复重试同一个调用。

## 数据为空但没有报错

含义：参数合法，但该市场/该标的/该周期确实没有数据。

检查：

- 代码后缀是否正确：`00700.hk`、`AAPL.us`、`600519.sh`、`000001.sz`、`6758.jp`。
- 该能力在目标市场是否覆盖，见 `references/toolsets.md`。
- 财务查询是否加了不存在的 `reportType`：港股库中没有 `Q2`；A股用数字不是字母；美股不支持按报告期筛选。
- 日期范围是否落在非交易日或未来。

## 模型反复调用元工具

含义：模型在 `describe_tool` 和 `list` 之间打转，没有落到业务调用。

处理：

- 明确告诉模型用哪个工具集和哪个 endpoint。
- `describe_tool` 一次最多 5 个名称，`detail=full` 一次只能查 1 个 endpoint，超出会被拒绝。
- 当前默认直接暴露业务模块工具，不存在「先启用工具集」这一步。
