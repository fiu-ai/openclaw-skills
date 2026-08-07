---
name: fiu-finance-mcp
description: "FIU MCP 金融数据助手。用于查询港股、美股、A股、日股、ETF基金、债券、美股期权、新股 IPO、F10 基本面、股东持仓、市场排行、资金流、K线、盘口成交、新闻资讯和参考码表等金融数据。"
user-invocable: true
allowed-tools: [Read, Bash]
metadata:
  openclaw:
    requires:
      env: [FIU_MCP_GATEWAY_AUTHORIZATION]
      binaries: [node, bash]
      primaryCredential: FIU_MCP_GATEWAY_AUTHORIZATION
---

# FIU MCP 金融数据助手

覆盖港股、美股、A股、日股和全球债券：行情报价、盘口成交、K线走势、市场排行、资金流、F10 基本面、股东持仓、ETF 基金、新股 IPO、美股期权、新闻资讯和参考码表。

服务地址：`http://ai.szfiu.com`，MCP 入口：`http://ai.szfiu.com/api/mcp/v2`（Streamable HTTP，请求头 `Authorization: Bearer <API_KEY>`）。

## 使用方法

优先使用当前会话已暴露的 FIU MCP 工具。业务工具统一是「模块工具 + endpoint」两段式：

```json
{
  "endpoint": "get_quote",
  "params": {
    "market": "HK",
    "assetType": "stock",
    "symbols": ["00700.hk"]
  }
}
```

当没有原生 MCP 工具入口，或需要命令行调试、批量验证、复现调用时，使用脚本：

```bash
node scripts/call.js list
node scripts/call.js describe quote_kline,get_kline
node scripts/call.js call quote_spot --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk
```

Python 等价实现在 `scripts/call.py`，优先使用 `requests`，未安装时退回标准库 `urllib`。

脚本默认连接 `http://ai.szfiu.com/api/mcp/v2`，可用 `FIU_MCP_URL` 或 `--url` 覆盖。

## 首次使用

1. 打开 `http://ai.szfiu.com` 申请 API Key。
2. 在 MCP 客户端配置 Streamable HTTP 地址 `http://ai.szfiu.com/api/mcp/v2`，并加请求头 `Authorization: Bearer <API_KEY>`。
3. 使用脚本时导出同一个值：`export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer <API_KEY>"`。

详细配置与鉴权规则见 `references/setup-and-auth.md`。

## 数据范围

| 数据范围 | 能力说明 |
| --- | --- |
| 行情报价 | 证券搜索、证券资料、股票/ETF/指数/窝轮/债券基础行情和扩展行情 |
| 盘口成交 | 买卖盘、逐笔成交、分时走势、迷你分时、成交统计 |
| K线走势 | 1m 到 1y 各周期、历史走势、收益率走势、前后复权 |
| 市场分析 | 市场概况、涨跌分布、排行、资金流、行业、概念、指数成分、筹码成本 |
| F10 基本面 | 公司资料、高管、主营构成、三大报表、财务指标、公司行动 |
| 股东持仓 | 主要股东、十大股东、持股变动、机构持股、基金持股、券商持股、沽空 |
| ETF基金 | 基金净值、资产配置、行业配置、基金业绩、ETF 列表和成分 |
| 互联互通 | 港股通、沪深港通额度余额、净买入、持股比例、成交排行 |
| 新股 IPO | 港股/美股 IPO 日历、发行详情、承销商、基石、保证金、招股/递表公告 |
| 债券 | 债券搜索、资料、行情、买卖盘、排行、走势、收益率、交易状态 |
| 美股期权 | 期权链、到期日、Greeks、报价、成交、排行、概览 |
| 新闻资讯 | 新闻搜索、语义检索、个股新闻、最新新闻、详情、相关新闻、统计 |
| 参考数据 | ISIN、SEDOL、CIK、ADR、货币、交易代码、交易状态、交易时段、代码映射 |

## 参考文档加载

先判断问题属于哪类能力，再按需加载 `references/` 下对应文档，不要一次性加载全部。

| 用户需求类型 | 优先加载文档 |
| --- | --- |
| 工具集选择、适用市场、不适用场景 | `references/toolsets.md` |
| 配置、鉴权、连接状态 | `references/setup-and-auth.md` |
| 工具不可见、401、参数校验失败、超时 | `references/troubleshooting.md` |
| 调用示例与自然语言测试问题 | `references/examples.md` |

## 使用技巧

1. **先描述再调用。** 不确定 endpoint 或参数时先调 `describe_tool`：`summary`（默认）用于选路，`params` 用于取字段，`full` 用于单个 endpoint 反复报错时排查。
2. **多数 endpoint 需要类型判别字段。** `ipoType`、`connectType`、`dataType`、`holdingType`、`actionType`、`referenceType`、`optionType` 等是必填项，合法取值由 `describe_tool` 给出，不要猜。
3. **查询合并有度。** 批量行情、财务、持仓、新闻查询通常不超过 5 个主体或 5 个指标。
4. **市场判断。** `CN` 表示 A股/沪深市场；`GLOBAL` 表示跨市场数据，当前主要是债券，普通股票不要用 `GLOBAL`。
5. **能力边界。** 公告全文、信息披露全文、研报全文不支持。F10 返回结构化报表和事件，`fiu_news` 返回新闻资讯。

## 核心函数

### `call(tool_name, arguments)`

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `tool_name` | `string` | 模块工具名，如 `quote_spot`、`quote_kline`、`f10_financials`、`fiu_news` |
| `arguments.endpoint` | `string` | 具体能力枚举值，如 `get_quote`、`get_kline`、`news_search` |
| `arguments.params` | `object` | 业务参数，字段按 `describe_tool` 或工具 schema 传入 |

### `describe(toolNames, detail)`

查询工具集、模块工具或 endpoint 的参数、市场范围和能力边界。一次最多 5 个名称；`detail=full` 只能查 1 个 endpoint。

### `list()`

查看当前暴露的工具列表。仅用于调试或工具不可见排查，不作为业务调用的第一步。

### `help()`

仅 CLI 提供，不是 MCP 工具。打印子命令语法、参数、示例和两个环境变量。离线可用，不需要 API Key，退出码 0。

```bash
node scripts/call.js help     # 不带任何参数运行也是同样输出
python scripts/call.py -h     # Python 版用 -h / --help，不支持 help 子命令
```

不确定命令怎么写时用它；要确定**调什么**，仍然用 `describe` —— `help` 不返回任何工具集或 endpoint 信息。

## 注意事项

- FIU 覆盖范围内的数据优先使用 FIU MCP，不用网页搜索兜底。
- 当前会话没有 `describe_tool` 或业务模块工具时，说明 MCP 未连接，应提示检查连接，不要编造数据。
- 代码格式使用完整后缀：港股 `00700.hk`，美股 `AAPL.us`，A股 `600519.sh`/`000001.sz`，日股 `6758.jp`；债券可传 ISIN。
- 日期格式默认 `YYYY-MM-DD`，分钟 K线、逐笔、分时用 `YYYY-MM-DD HH:mm:ss`。
- API Key 只放在请求头，不要放进 `params`。
- 不提供确定性买卖建议，只基于查询结果做客观数据解读。
