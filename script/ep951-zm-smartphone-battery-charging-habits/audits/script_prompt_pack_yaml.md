# script_prompt_pack_yaml.md
# 実行証跡: 10_yaml_prompt.md

# script_prompt_pack_yaml — ep951-zm-smartphone-battery-charging-habits

## 実行日時
2026-04-27

## script.yaml 生成証跡

### 生成ファイル
- 保存先: script/ep951-zm-smartphone-battery-charging-habits/script.yaml

### メタ情報確認

| 項目 | 値 | 確認 |
|---|---|---|
| meta.id | ep951-zm-smartphone-battery-charging-habits | PASS |
| meta.layout_template | Scene05 | PASS |
| meta.pair | ZM | PASS |
| meta.voice_engine | voicevox | PASS |
| meta.width | 1920 | PASS |
| meta.height | 1080 | PASS |
| meta.fps | 30 | PASS |
| meta.target_duration_sec | 300 | PASS |
| characters.left.character | zundamon | PASS |
| characters.left.voicevox_speaker_id | 3 | PASS |
| characters.right.character | metan | PASS |
| characters.right.voicevox_speaker_id | 2 | PASS |

### 禁止項目確認

| 禁止項目 | チェック |
|---|---|
| aquestalk_preset の記載 | なし ✓ |
| scenes[].scene_template の記載 | なし ✓ |
| meta.scene_template の記載 | なし ✓ |
| audio_playback_rate の記載 | なし ✓ |
| main.caption / main.text / main.items の記載 | なし ✓ |
| sub: null 以外（Scene05は全シーンsub: null） | なし ✓ |

### シーン・dialogue確認

| 確認項目 | 値 | 確認 |
|---|---|---|
| シーン数 | 11（s01〜s11） | PASS |
| 総dialogue数 | 113 | PASS（90以上） |
| main.kind | 全シーン image | PASS |
| main.asset | assets/sNN_main.png 形式 | PASS |
| visual_asset_plan | 全シーン含む | PASS |
| bgm ブロック | 含む | PASS |
| dialogue[].id | l01〜lNN 形式 | PASS |
| dialogue[].speaker | left / right のみ | PASS |
| dialogue[].expression | 文脈に応じた値 | PASS |

### YAML化許可条件確認

| 条件 | チェック |
|---|---|
| script_final.md のCodexレビュー完了 | PASS |
| 5分で90セリフ以上 | PASS（113発話） |
| 最終行動が具体的 | PASS |
| 章タイトルがフック型 | PASS |
| 機械分割なし | PASS |

## ステータス
- PASS
- script.yaml 生成・検証完了
