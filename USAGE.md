[English](USAGE_EN.md) | [中文](USAGE.md)

# 使用指南

## 快速开始

### 1. 申请 API Key

打开 https://ai.szfiu.com 申请，得到一串 Key。

### 2. 安装技能

```bash
git clone https://github.com/fiu-ai/openclaw-skills.git
cd openclaw-skills
./install.sh
```

技能默认装到 `~/.openclaw/skills/`，可用 `OPENCLAW_SKILLS_DIR` 覆盖：

```bash
OPENCLAW_SKILLS_DIR=/opt/skills ./install.sh
```

如果客户端只支持本地 stdio，可使用产品手册中的 npm/npx 适配器（Node.js 20.18.1+）：

```bash
FIU_API_KEY=YOUR_API_KEY npx -y fiu-finance-mcp
```

客户端配置使用 `command: "npx"`、`args: ["-y", "fiu-finance-mcp"]` 和 `env.FIU_API_KEY`。`--api-key` 可覆盖环境变量，`--url` 可覆盖默认 HTTPS 地址。

### 3. 配置凭据

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
```

写进 `~/.bashrc` 或 `~/.zshrc` 可以长期生效。

### 4. 验证

```bash
./test.sh
```

全部 `[PASS]` 说明连通、鉴权、工具列表都正常。

---

## 使用方式

### 方式一：自然语言（推荐）

技能装好、Key 配好之后，直接问：

```text
腾讯控股现在多少钱？
比较一下 AAPL 和 MSFT 最近一年的走势。
贵州茅台最近三年的营业收入和净利润。
本周港股有哪些新股在招股？中签率怎么样？
今天港股哪些股票涨得最多？
南向资金今天净流入多少？
```

模型会按技能里的选路表挑工具集，自己补必填参数。

### 方式二：在客户端配置 MCP 服务

不装技能，直接让客户端连 MCP 服务也可以：

```json
{
  "mcpServers": {
    "fiu-finance": {
      "type": "streamableHttp",
      "url": "https://ai.szfiu.com/api/mcp/v2",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Claude Code 一条命令即可：

```bash
claude mcp add --transport http fiu-finance https://ai.szfiu.com/api/mcp/v2 \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### 方式三：命令行脚本

```bash
cd ~/.openclaw/skills/fiu-finance-mcp

# 列出全部工具
node scripts/call.js list

# 查工具集/endpoint 说明
node scripts/call.js describe quote_kline,get_kline

# 调用
node scripts/call.js call quote_spot --endpoint get_quote \
  --param market=HK --param assetType=stock --param symbols=00700.hk
```

Python 版参数完全一致：

```bash
python scripts/call.py call f10_financials --endpoint get_financial_statement \
  --param market=CN --param symbol=600519.sh --param statementType=balance --param reportType=12
```

参数较多时，直接把整个 arguments 对象作为位置参数传：

```bash
node scripts/call.js call market_ranking \
  '{"endpoint":"get_hk_ranking","params":{"rankType":"stock","sortField":"changeRate","sortType":1,"pageSize":10}}'
```

Windows PowerShell 下引号转义麻烦，建议一律用 `--endpoint` + `--param` 形式。

---

## MCP 协议说明

服务走 **MCP Streamable HTTP**，JSON-RPC 2.0 over HTTP POST。

**地址**：`https://ai.szfiu.com/api/mcp/v2`
**鉴权**：请求头 `Authorization: Bearer YOUR_API_KEY`

### 握手

```bash
curl -s https://ai.szfiu.com/api/mcp/v2 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": { "name": "curl", "version": "1.0" }
    }
  }'
```

响应头会带回 `Mcp-Session-Id`，后续请求需带上。

### 列出工具

```json
{ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }
```

### 调用工具

大多数业务工具集收两个参数：`endpoint` 和 `params`。`market_overview`、`market_flow`、`market_position_cost`、`shareholding_institution`、`macro_economics` 和 `company_announcements` 是扁平工具，业务字段直接放在 `arguments`。

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "quote_spot",
    "arguments": {
      "endpoint": "get_quote",
      "params": {
        "market": "HK",
        "assetType": "stock",
        "symbols": ["00700.hk", "09988.hk"]
      }
    }
  }
}
```

### 查参数

不确定某个 endpoint 要什么字段时，先问 `describe_tool`：

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "describe_tool",
    "arguments": {
      "toolNames": ["f10_financials", "get_financial_statement"],
      "detail": "params"
    }
  }
}
```

`toolNames` 一次最多 5 个；`detail` 支持 `summary` 和 `params`，默认使用 `summary`。

---

## 可用工具列表

28 个工具 = `describe_tool` + `search` + 26 个业务工具集，共 104 个 endpoint。

| 工具集 | 覆盖市场 | 用途 |
| --- | --- | --- |
| `describe_tool` | — | 查工具集和 endpoint 的参数定义 |
| `quote_spot` | CN HK JP US GLOBAL | 实时报价、证券搜索、静态资料 |
| `quote_intraday` | CN HK JP US GLOBAL | 盘口、逐笔成交、分时走势 |
| `quote_kline` | CN HK JP US GLOBAL | K线、历史快照、收益率序列 |
| `quote_derivatives_hk` | HK | 窝轮、牛熊证 |
| `quote_us_options` | US | 美股期权链、报价、希腊字母、排行 |
| `market_overview` | CN HK JP US | 市场统计概览 |
| `market_ranking` | CN HK JP US | 各市场使用 `get_hk_ranking`、`get_us_ranking`、`get_cn_ranking`、`get_jp_ranking` |
| `market_flow` | CN HK JP US | 个股资金流向 |
| `market_structure` | CN HK JP US | 指数、行业分类、市场微观结构 |
| `market_position_cost` | HK US | 筹码分布、成本区间 |
| `f10_profile` | CN HK US | 公司资料、管理层 |
| `f10_financials` | CN HK US | 三大报表、财务指标 |
| `f10_business_governance` | CN HK US | 业务分部、公司行动 |
| `shareholding_structure` | CN HK US | 主要股东、十大股东、持股变动 |
| `shareholding_institution` | US | 机构持仓（13F） |
| `shareholding_fund_broker` | HK US | 券商持仓、沽空 |
| `fund_data` | 全球基金 | 搜索、资料、净值、业绩、风险、完整持仓、配置、费率、排行与国家代码解析 |
| `stock_connect` | CN HK | 沪深港通资金流、持股、排行 |
| `ipo` | HK US | 新股日历、招股、基石、保荐、中签、资讯 |
| `bond_basic` | GLOBAL | 债券搜索、资料、报价、盘口 |
| `bond_analytics` | GLOBAL | 债券排行、走势、收益率、交易状态 |
| `fiu_news` | CN HK JP US GLOBAL | 新闻搜索、个股新闻、最新新闻、详情、相关新闻和摘要素材 |
| `financial_calendar` | Global | 财经日历搜索与事件详情 |
| `macro_economics` | CN-focused | 精选宏观经济数据 |
| `company_announcements` | HK US CN | 上市公司公告及附件/正文合并 |
| `reference` | CN HK JP US GLOBAL | ISIN/SEDOL/CIK 码表、代码映射、交易日历 |

完整 endpoint 与必填字段见 [docs/mcp-interfaces_CN.md](docs/mcp-interfaces_CN.md)。

---

## 常见问题

**Q：模型看不到工具？**
确认技能目录在 `~/.openclaw/skills/fiu-finance-mcp/`，`SKILL.md` 存在，然后重启客户端。走 MCP 配置的话确认客户端已重载配置。

**Q：返回 `401 缺少认证头`？**
请求没带 `Authorization`。检查 `FIU_MCP_GATEWAY_AUTHORIZATION` 是否已导出，或客户端 `headers` 配置是否写对。注意值里要包含 `Bearer ` 前缀。

**Q：返回 `401 无效的令牌`？**
Key 不对或已失效，到 https://ai.szfiu.com 重新确认。

**Q：返回 `INVALID_SEMANTIC_INPUT` 或 `INVALID_ARGUMENT`？**
少了必填的类型判别字段，或枚举值写错。用 `describe_tool` 带 `detail: "params"` 查一遍该 endpoint。

**Q：返回 `UNSUPPORTED_ROUTE`？**
这个 `market` 不支持该 endpoint 或该参数组合。例如 `get_shareholders` 的 `topten` 走 A股(Zhcall提供)，港股要用 `major`。

**Q：财务数据怎么只取年报？**
在 `params` 里带 `reportType`。港股 `F`=年报、`I`=半年报；美股 `FY`=年报、`I1/I2`=半年期；A股(Zhcall提供) `12`=年报、`6`=中报。季度取值和其他分支以 `describe_tool` 返回为准。

**Q：返回空数组？**
成功响应会包含 `code: 0` 和 `resultStatus`。当 `resultStatus=empty` 时查看 `emptyReason`：时间区间问题可扩大日期范围，筛选问题可调整标的或条件；这不是需要重试的服务故障。

完整排障见 [skills/fiu-finance-mcp/references/troubleshooting.md](skills/fiu-finance-mcp/references/troubleshooting.md)。

---

## 开发指南

### 目录约定

```
skills/<skill-name>/
├── SKILL.md            必需，英文技能定义（含 YAML frontmatter）
├── SKILL_CN.md         中文版本
├── skill.json          元数据：版本、依赖、环境变量
├── install.sh          单技能安装脚本
├── references/         按需加载的参考文档
└── scripts/            可执行辅助脚本
```

### SKILL.md 的写法

- `description` 要写清**什么时候用**，模型靠它决定是否加载技能。
- 正文保持精简，细节放 `references/`，用到再读。
- 明确写出能力边界，让模型知道什么时候该停。

### 本地调试

```bash
export FIU_MCP_GATEWAY_AUTHORIZATION="Bearer YOUR_API_KEY"
./test.sh

# 指向其他环境
FIU_MCP_URL=https://your-gateway.example.com/api/mcp/v2 ./test.sh
```

### 提交前检查

- [ ] `./test.sh` 全绿
- [ ] `SKILL.md` 与 `SKILL_CN.md` 内容一致
- [ ] `skill.json` 版本号已递增
- [ ] 没有任何真实 Key 出现在文件里

---

## 相关资源

- MCP 服务仓库：https://github.com/fiu-ai/mcp-server
- MCP 协议规范：https://modelcontextprotocol.io
- 服务地址：https://ai.szfiu.com

## 技术支持

- 问题反馈：https://github.com/fiu-ai/openclaw-skills/issues
- 提 Issue 时请附上：客户端与版本、完整错误信息、调用的工具集和 endpoint。**不要贴 API Key。**
