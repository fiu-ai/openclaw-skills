# FIU Finance MCP 使用指南

面向 FIU MCP 网关 `http://ai.szfiu.com/api/mcp/v2` 的技能 `fiu-finance-mcp`。

## 快速开始

### 1. 安装技能

```bash
git clone git@github.com:fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

或者只装这一个技能：

```bash
./skills/fiu-finance-mcp/install.sh
# 或
cp -r skills/fiu-finance-mcp ~/.openclaw/skills/
```

### 2. 配置 API Key

在 [http://ai.szfiu.com](http://ai.szfiu.com) 申请，然后写进 `~/.zshrc` 或 `~/.bashrc`：

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
# 可选：覆盖端点
# export FIU_MCP_URL="http://ai.szfiu.com/api/mcp/v2"
```

### 3. 验证

```bash
./test.sh
```

五步自检：`tools/list`、`describe_tool`、港股 / 美股 / A 股行情。全通过输出 `✅ 测试完成，全部通过`。

在 OpenClaw 中输入 `/` 查看技能列表，应该能看到 `fiu-finance-mcp`。

## 使用方式

### 在 OpenClaw 中使用

```
查询腾讯控股的实时行情
显示 AAPL 的小时 K 线
贵州茅台今天的资金流向
美股现在是不是开盘时段
本周港股新上市的新股有哪些
```

### 使用命令行

```bash
cd ~/.openclaw/skills/fiu-finance-mcp

node scripts/call.js list
node scripts/call.js describe quote_spot,quote_kline
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
```

Python 版参数完全一致：

```bash
python scripts/call.py call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
```

更多可复制的示例见 [README_CN.md 的「工具调用速查」](README_CN.md#工具调用速查)。

## 调用约定

网关是 Streamable HTTP + JSON-RPC 2.0，请求头带 `Authorization: Bearer <API_KEY>`。
`call.js` 已经封装了 `initialize` → `notifications/initialized` → `tools/call` 的握手和 SSE 解析，
一般不需要自己拼请求。

每个业务工具都是**工具集**，只接受两个参数：

```json
{
  "endpoint": "get_quote",
  "params": { "market": "HK", "assetType": "stock", "symbols": ["00700.hk"] }
}
```

对应到 CLI：

```bash
node scripts/call.js call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
# 等价于
node scripts/call.js call quote_spot '{"endpoint":"get_quote","params":{"market":"HK","assetType":"stock","symbols":["00700.hk"]}}'
```

### `-p` 取值规则

| 写法 | 结果 |
|------|------|
| `-p symbols=00700.hk,AAPL.us` | `["00700.hk","AAPL.us"]`（`symbols` 总是拆成数组） |
| `-p limit=30` | 数字 `30` |
| `-p conceptFlag=Y` | 字符串 `"Y"` |
| `-p timeMode=true` | 布尔 `true` |
| `-p params='{"sortField":"changeRate"}'` | 对象，透传给下游 |

## 可用工具

24 个工具、86 个 endpoint，覆盖港股、美股、A 股、日股，债券走 `GLOBAL` 路由。
完整目录见 [README_CN.md 的「功能一览」](README_CN.md#功能一览)，权威来源始终是网关自己：

```bash
node scripts/call.js list
node scripts/call.js call describe_tool '{"toolNames":["quote_spot"],"detail":"params"}'
```

`describe_tool` 分三档：

| detail | 用途 | 限制 |
|--------|------|------|
| `summary`（默认） | 选工具集、看市场覆盖 | 一次最多 5 个名字 |
| `params` | 查字段名、必填项、枚举值 | 一次最多 5 个名字 |
| `full` | 单个 endpoint 反复调不通时排障 | 一次 1 个 endpoint |

## 常见问题

### Q: 如何获取 API Key？

A: 访问 [http://ai.szfiu.com](http://ai.szfiu.com) 申请，配置到
`FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"`。

### Q: 报 `INVALID_ARGUMENT` / `INVALID_SEMANTIC_INPUT` 怎么办？

A: 说明网关语义层校验没过，多半是漏了区分字段（`dataType`、`holdingType`、`ipoType`、
`connectType`、`costType`、`statementType` 等）。用 `describe_tool` 的 `detail=params` 查必填项。

### Q: 报 `INVALID_DOWNSTREAM_ARGS` 怎么办？

A: 语义层过了、下游还缺字段。错误体里的 `error.details.issues` 会逐条点名，例如：

```
sortField  下游 hk_sdk/post_v3_etf_list 需要字段 sortField
period     下游 cn_sdk/post_v1_stockConnect_connectBalance 需要字段 period
root       下游 us_options/post_opra_v1_chain_expiration 需要字段 root
```

补进 `-p params='{...}'` 重试即可。

### Q: 报 `UNSUPPORTED_ROUTE` 怎么办？

A: 这个 endpoint 在该市场没有下游路由。换市场，或用 `describe_tool` 看它实际支持哪些市场 ——
工具级别标注的市场是并集，单个 endpoint 可能更窄。

### Q: 支持哪些市场？

A: `HK`（港股）、`US`（美股）、`CN`（A 股沪深）、`JP`（日股）。债券类接口走 `GLOBAL`。

### Q: 代码怎么写？

A: 带完整后缀 —— `00700.hk`、`AAPL.us`、`600519.sh`、`000001.sz`、`6758.jp`；债券可传 ISIN。
日期用 `YYYY-MM-DD`；分钟 K 线、逐笔、分时这类需要精确时刻的用 `YYYY-MM-DD HH:mm:ss`。

### Q: 批量查询有上限吗？

A: 批量行情、财务、持股、新闻类查询建议控制在约 5 个标的或 5 个指标以内；`get_security_profile`
的 `symbols` 上限是 50 个。

## 开发指南

### 直接用 HTTP 调网关

```bash
curl -s -X POST "http://ai.szfiu.com/api/mcp/v2" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Protocol-Version: 2025-06-18" \
    -H "Mcp-Session-Id: $SESSION_ID" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "quote_spot",
            "arguments": {
                "endpoint": "get_quote",
                "params": {"market": "HK", "assetType": "stock", "symbols": ["00700.hk"]}
            }
        }
    }'
```

`SESSION_ID` 来自先前 `initialize` 请求响应头里的 `Mcp-Session-Id`，之后每个请求都要带上。
响应是 SSE（CRLF 换行），取最后一条 `data:` 行再解析。这些细节 `call.js` 都处理好了，
新写集成建议直接复用它。

## 相关资源

- [FIU MCP 官方站点](http://ai.szfiu.com)
- [GitHub 仓库](https://github.com/fiu-ai/openclaw-skills)
- [OpenClaw 文档](https://docs.openclaw.ai)
- [JSON-RPC 2.0 规范](https://www.jsonrpc.org/specification)

## 技术支持

如有问题，请提交 GitHub Issue 或联系 FIU 技术支持。
