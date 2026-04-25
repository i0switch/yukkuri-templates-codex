#!/usr/bin/env bash
# nlm コマンドのヘルパー関数集
# Claude Code がシェル経由で nlm を叩く時の共通処理

# 認証チェック（戻り値: 0=OK, 1=要ログイン）
nlm_check_auth() {
    if nlm login --check &> /dev/null; then
        return 0
    fi
    echo "⚠️  NotebookLM 未認証。以下を実行してください："
    echo "    nlm login"
    return 1
}

# ノートブック作成して ID を返す
nlm_create_notebook() {
    local title="$1"
    nlm notebook create "$title" --json 2>/dev/null | jq -r '.id'
}

# テキストソース追加
nlm_add_text_source() {
    local notebook_id="$1"
    local title="$2"
    local file_path="$3"
    nlm source add "$notebook_id" --type text --title "$title" --file "$file_path" --json 2>/dev/null
}

# URL ソース追加
nlm_add_url_source() {
    local notebook_id="$1"
    local url="$2"
    nlm source add "$notebook_id" --type url --url "$url" --json 2>/dev/null
}

# Studio コンテンツ生成（非同期）
# $1=notebook_id, $2=type (infographic|mind_map|slides|video), $3=prompt, $4=options(JSON)
nlm_studio_create() {
    local notebook_id="$1"
    local type="$2"
    local prompt="$3"
    local options="${4:-{}}"
    nlm studio create "$notebook_id" --type "$type" --prompt "$prompt" --options "$options" --json 2>/dev/null
}

# Studio ジョブのステータス確認
nlm_studio_status() {
    local notebook_id="$1"
    local job_id="$2"
    nlm studio status "$notebook_id" "$job_id" --json 2>/dev/null | jq -r '.status'
}

# アーティファクトのダウンロード
nlm_download() {
    local notebook_id="$1"
    local artifact_id="$2"
    local output_path="$3"
    nlm download artifact "$notebook_id" "$artifact_id" --output "$output_path"
}

# ジョブ完了まで待機（タイムアウト 10 分）
nlm_wait_for_job() {
    local notebook_id="$1"
    local job_id="$2"
    local timeout="${3:-600}"
    local elapsed=0
    local interval=30

    while [ $elapsed -lt $timeout ]; do
        local status=$(nlm_studio_status "$notebook_id" "$job_id")
        case "$status" in
            completed)
                echo "completed"
                return 0
                ;;
            failed)
                echo "failed"
                return 1
                ;;
            pending|running)
                sleep $interval
                elapsed=$((elapsed + interval))
                ;;
            *)
                echo "unknown: $status"
                return 2
                ;;
        esac
    done
    echo "timeout"
    return 3
}

# レート制限チェック（当日の使用回数を記録ファイルから読む）
nlm_check_rate_limit() {
    local counter_file="${HOME}/.notebooklm-mcp-cli/daily_count.txt"
    local today=$(date +%Y-%m-%d)
    local limit="${1:-50}"

    if [ ! -f "$counter_file" ]; then
        mkdir -p "$(dirname "$counter_file")"
        echo "$today 0" > "$counter_file"
    fi

    local saved_date=$(awk '{print $1}' "$counter_file")
    local count=$(awk '{print $2}' "$counter_file")

    if [ "$saved_date" != "$today" ]; then
        echo "$today 0" > "$counter_file"
        count=0
    fi

    if [ "$count" -ge "$limit" ]; then
        echo "rate_limit_reached"
        return 1
    fi
    echo "ok ($count/$limit)"
    return 0
}

# カウンタをインクリメント
nlm_increment_counter() {
    local counter_file="${HOME}/.notebooklm-mcp-cli/daily_count.txt"
    local today=$(date +%Y-%m-%d)
    local count=$(awk '{print $2}' "$counter_file" 2>/dev/null || echo 0)
    echo "$today $((count + 1))" > "$counter_file"
}
