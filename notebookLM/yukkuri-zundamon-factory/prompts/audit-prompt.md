# 監査プロンプト

`/audit` コマンドから呼び出される監査ロジックのプロンプト化テンプレ。

---

## 🔍 監査実行プロンプト

```
あなたは動画解説台本の品質監査官です。下記の台本・素材・メタデータを
`workflows/05-audit.md` の全チェック項目に従って監査し、
指定フォーマットのレポートを出力してください。

# 入力
- 台本: {{SCRIPT_CONTENT}}
- 最終台本: {{FINAL_SCRIPT_CONTENT}}
- メタJSON: {{META_JSON}}
- 素材ファイル一覧: {{ASSET_FILE_LIST}}
- 各素材のサイズ/MIMEタイプ: {{ASSET_METADATA}}

# 参照する基準
- 品質基準: {{QUALITY_CRITERIA_JSON}}  # config/quality-criteria.json
- キャラ設定: {{CHARACTERS_JSON}}       # config/characters.json
- マーカー仕様: {{MARKER_SPEC_MD}}      # templates/asset-marker-spec.md

# 実施すること
1. チェック項目 A〜F を順にすべて実行
2. 各項目について PASS / WARNING / FAIL を判定
3. FAIL があればどの工程への差し戻しが必要か判断
4. 監査レポート Markdown を生成

# 出力形式
workflows/05-audit.md の「📋 レポート書式」セクションに厳密に従う。
前置き・解説は一切含めず、レポート Markdown のみを出力。
```

---

## 📊 チェック実装例（疑似コード）

```python
def audit(slug):
    script = read(f"output/scripts/{slug}.md")
    final = read(f"output/final/{slug}.md")
    meta = json.load(f"output/final/{slug}-meta.json")
    assets = list_dir(f"output/assets/{slug}/")

    results = []

    # A. 台本構造
    results.append(check_yaml_frontmatter(script))
    results.append(check_title_match(script, meta))
    results.append(check_section_count(script, min=3))
    results.append(check_time_markers(script))

    # B. キャラ一貫性
    style = meta["style"]
    if style == "yukkuri":
        results.append(count_endings(script, "のよ|ね|じゃない", min=5, speaker="霊夢"))
        results.append(count_endings(script, "だぜ|なんだぜ", min=5, speaker="魔理沙"))
    elif style == "zundamon":
        results.append(count_endings(script, "のだ", min=8, speaker="ずんだもん"))
        results.append(count_endings(script, "ですわ|ですのよ", min=5, speaker="めたん"))

    # C. マーカー整合性
    markers = extract_markers(script)
    results.append(check_marker_count(markers, min=4))
    results.append(check_mandatory_markers(markers, required=["FIG:1", "SLIDE:1"]))
    results.append(check_marker_numbering(markers))
    results.append(check_marker_placement(markers, script))
    results.append(check_marker_desc_length(markers, max=40))

    # D. 素材ファイル
    for m in markers:
        if m.status == "downloaded":
            results.append(check_file_exists(m.path))
            results.append(check_file_size(m.path, min_kb=10))
            results.append(check_mime_type(m.path, expected=m.type))
    failed_ratio = count_failed(markers) / len(markers)
    results.append(check_failed_ratio(failed_ratio, max=0.3))

    # E. 最終台本
    results.append(check_file_exists(f"output/final/{slug}.md"))
    results.append(check_all_markers_replaced(final))
    results.append(check_relative_paths_resolve(final))

    # F. 参考資料
    results.append(check_references_section(script))
    results.append(check_no_verification_comments(script))

    return compile_report(results)
```

---

## 🔁 自動修正トリガー

レポートで FAIL が出た場合、下記の判断を Claude Code が行う：

| FAIL カテゴリ | 次のアクション |
|-------------|---------------|
| A, B（台本構造・キャラ） | `/generate-script` 再実行（該当部分のみ） |
| C（マーカー整合性） | 台本のマーカー部分のみ修正 → 再監査 |
| D（素材ファイル） | `/fetch-assets --retry <marker>` で該当素材だけ再生成 |
| E（最終台本） | マージ処理のみ再実行 → 再監査 |
| F（参考資料） | WARNING のみ、自動修正しない |

---

## 📝 レポート生成時の注意

- 判定理由は具体的に書く（数値・該当箇所の引用）
- 推奨アクションは実行可能なコマンド形式で書く
- 監査対象のバージョン/タイムスタンプを必ず記録
- WARNING は PASS 扱いだが、「手動確認推奨」を明記
