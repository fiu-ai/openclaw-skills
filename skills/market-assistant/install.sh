#!/bin/bash
# market-assistant skill installation script

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Installing market-assistant skill..."
echo ""

# Check required binaries
MISSING_BINARIES=""
for cmd in curl jq date bash; do
    if ! command -v $cmd &> /dev/null; then
        MISSING_BINARIES="$MISSING_BINARIES $cmd"
    fi
done

if [ -n "$MISSING_BINARIES" ]; then
    echo "⚠️  Warning: Missing recommended binaries:$MISSING_BINARIES"
    echo "   These tools are required for full functionality."
    echo ""
fi

# Check FIU_MCP_TOKEN
if [ -z "$FIU_MCP_TOKEN" ]; then
    echo "⚠️  FIU_MCP_TOKEN environment variable is not set."
    echo ""
    echo "   To use this skill, you need to:"
    echo "   1. Get your JWT token from: https://mcp.szfiu.com/auth/login"
    echo "   2. Set the environment variable:"
    echo ""
    echo "   export FIU_MCP_TOKEN=\"your_jwt_token_here\""
    echo ""
else
    echo "✅ FIU_MCP_TOKEN is set"
fi

echo ""
echo "📖 Documentation:"
echo "   - SKILL.md (English)"
echo "   - SKILL_CN.md (中文)"
echo "   - docs/MCP_TOOLS.md (Complete tool reference)"
echo ""
echo "🚀 Usage examples:"
echo "   mcp_router.sh hk_sdk quote symbol=00700.HK fields=snapshot"
echo "   mcp_router.sh toolkit search keyword=腾讯"
echo ""
echo "✅ Installation complete!"