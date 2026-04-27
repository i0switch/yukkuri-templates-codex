# script_prompt_pack_yaml.md
# 実行証跡: 10_yaml_prompt.md（script.yaml 生成証跡）

実行日: 2026-04-27
対象エピソード: ep950-rm-old-wifi-router-security-reset
出力ファイル: script/ep950-rm-old-wifi-router-security-reset/script.yaml

## 生成サマリ

| 項目 | 値 |
|------|-----|
| シーン数 | 11 |
| dialogue総数 | 108 |
| l01〜最終ID | l01 〜 l108 |
| sub: null 全シーン | OK（Scene01 sub枠なし） |
| scenes[].scene_template | 未記載（禁止遵守） |
| meta.scene_template | 未記載（禁止遵守） |
| audio_playback_rate | 未記載（禁止遵守） |
| bgm ブロック | 記載あり（placeholder.mp3） |
| visual_asset_plan | 全11シーンに記載 |
| main.caption/text/items | 未記載（禁止遵守） |

## dialogue分布

| シーン | セリフ数 | 開始ID | 終了ID |
|-------|---------|-------|-------|
| s01 | 10 | l01 | l10 |
| s02 | 10 | l11 | l20 |
| s03 | 8 | l21 | l28 |
| s04 | 10 | l29 | l38 |
| s05 | 12 | l39 | l50 |
| s06 | 10 | l51 | l60 |
| s07 | 9 | l61 | l69 |
| s08 | 10 | l70 | l79 |
| s09 | 9 | l80 | l88 |
| s10 | 10 | l89 | l98 |
| s11 | 10 | l99 | l108 |

## script_final.md との整合性確認

- dialogue[].text: script_final.md の発話をそのまま使用（機械分割なし）
- speaker: 霊夢=left / 魔理沙=right（全シーン一貫）
- expression: 文脈に応じて neutral/smile/happy/laugh/calm/smirk/talk/halfOpen から選択

## YAML化禁止条件チェック

- [x] script_final.md のCodexレビュー完了（script_final_review.md 存在確認済み）
- [x] 5分で90セリフ以上（108セリフ）
- [x] 最終行動が具体的（192.168.1.1 / BUFFALO-A1B2C3さようなら）
- [x] 章タイトルがフック型
- [x] YAML化で機械分割不要

## ステータス

PASS
