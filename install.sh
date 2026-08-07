#!/bin/bash
# FIU MCP Skills 安装脚本
# 把 skills/ 下的技能安装到 OpenClaw

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_SKILLS_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/skills}"

echo "🚀 FIU MCP Skills 安装程序"
echo "=========================="
echo ""

if [ ! -d "$OPENCLAW_SKILLS_DIR" ]; then
    echo "❌ 未找到 OpenClaw skills 目录：$OPENCLAW_SKILLS_DIR"
    echo "请先安装 OpenClaw，或设置 OPENCLAW_SKILLS_DIR 指向正确路径"
    exit 1
fi

echo "📦 复制 skills 到 $OPENCLAW_SKILLS_DIR..."
cp -r "$SCRIPT_DIR/skills/"* "$OPENCLAW_SKILLS_DIR/"

echo ""
echo "✅ 安装完成！"
echo ""
echo "已安装的 skills:"
ls -1 "$SCRIPT_DIR/skills" | sed 's/^/  - /'
echo ""
echo "验证方法："
echo "1. 打开 OpenClaw 聊天"
echo "2. 输入 / 查看可用技能列表"
echo "3. 应该能看到 fiu-finance-mcp 技能"
echo ""
echo "使用前请设置环境变量（在 http://ai.szfiu.com 申请 API Key）："
echo "  export FIU_MCP_GATEWAY_AUTHORIZATION=\"Bearer YOUR_API_KEY\""
echo ""
echo "连通性自检：./test.sh"
echo ""
