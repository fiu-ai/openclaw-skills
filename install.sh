#!/bin/bash
# FIU MCP Skills 安装脚本
# 自动安装 skills 到 OpenClaw

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_SKILLS_DIR="$HOME/.openclaw/skills"

echo "🚀 FIU MCP Skills 安装程序"
echo "=========================="
echo ""

# 检查 OpenClaw 目录是否存在
if [ ! -d "$OPENCLAW_SKILLS_DIR" ]; then
    echo "❌ 未找到 OpenClaw skills 目录：$OPENCLAW_SKILLS_DIR"
    echo "请先安装 OpenClaw"
    exit 1
fi

# 复制 skills
echo "📦 复制 skills 到 $OPENCLAW_SKILLS_DIR..."
cp -r "$SCRIPT_DIR/skills/"* "$OPENCLAW_SKILLS_DIR/"

# 验证安装
echo ""
echo "✅ 安装完成！"
echo ""
echo "已安装的 skills:"
ls -1 "$OPENCLAW_SKILLS_DIR" | grep -E "market-assistant" || echo "  - market-assistant"
echo ""
echo "验证方法："
echo "1. 打开 OpenClaw 聊天"
echo "2. 输入 / 查看可用技能列表"
echo "3. 应该能看到 market-assistant 技能"
echo ""
echo "使用前请设置环境变量:"
echo "  export FIU_MCP_TOKEN=\"your_jwt_token_here\""
echo ""
