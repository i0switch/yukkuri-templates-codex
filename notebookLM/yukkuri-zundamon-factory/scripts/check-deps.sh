#!/usr/bin/env bash
# 依存の健康診断

set +e

echo "🔍 Yukkuri × Zundamon Factory — 依存チェック"
echo ""

FAIL=0
WARN=0

check() {
    local name="$1"
    local cmd="$2"
    if command -v "$cmd" &> /dev/null; then
        echo "  ✓ $name: $(which $cmd)"
    else
        echo "  ❌ $name が見つかりません（コマンド: $cmd）"
        FAIL=$((FAIL + 1))
    fi
}

check_optional() {
    local name="$1"
    local cmd="$2"
    if command -v "$cmd" &> /dev/null; then
        echo "  ✓ $name: $(which $cmd)"
    else
        echo "  ⚠️  $name（任意）が見つかりません: $cmd"
        WARN=$((WARN + 1))
    fi
}

echo "[必須]"
check "Python 3" python3
check "uv"      uv
check "nlm"     nlm
check "jq"      jq

echo ""
echo "[任意]"
check_optional "Claude Code" claude
check_optional "file (MIME検出)" file
check_optional "pdfinfo"       pdfinfo
check_optional "ffprobe"       ffprobe

echo ""
echo "[nlm 状態]"
if command -v nlm &> /dev/null; then
    if nlm login --check &> /dev/null; then
        echo "  ✓ 認証済み"
    else
        echo "  ⚠️  未認証 → nlm login を実行してください"
        WARN=$((WARN + 1))
    fi

    if nlm setup list 2>/dev/null | grep -q "claude-code"; then
        echo "  ✓ Claude Code MCP 登録済み"
    else
        echo "  ⚠️  Claude Code MCP 未登録 → nlm setup add claude-code を実行"
        WARN=$((WARN + 1))
    fi
fi

echo ""
echo "[ディレクトリ]"
for d in output/scripts output/assets output/final templates workflows config prompts .claude/commands; do
    if [ -d "$d" ]; then
        echo "  ✓ $d"
    else
        echo "  ❌ $d が存在しない"
        FAIL=$((FAIL + 1))
    fi
done

echo ""
echo "========================================"
if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
    echo "✅ 全チェック PASS！すぐに使えます。"
    exit 0
elif [ $FAIL -eq 0 ]; then
    echo "⚠️  必須は揃ってますが、警告 $WARN 件あり。"
    exit 0
else
    echo "❌ 必須の不足 $FAIL 件。scripts/setup.sh を実行してください。"
    exit 1
fi
