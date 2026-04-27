# script_prompt_pack_input_normalize.md
# 実行証跡: 01_input_normalize_prompt.md

実行日: 2026-04-27
対象エピソード: ep950-rm-old-wifi-router-security-reset

## 基本メタ情報確認

| 項目 | 値 | 確認結果 |
|------|-----|---------|
| episode_id | ep950-rm-old-wifi-router-security-reset | OK |
| pair | RM（霊夢＝left / 魔理沙＝right） | OK |
| layout_template | Scene01 | OK |
| voice_engine | aquestalk | OK |
| aquestalk_preset (left) | れいむ | OK |
| aquestalk_preset (right) | まりさ | OK |
| target_duration_sec | 300（5分） | OK |
| width | 1920 | OK |
| height | 1080 | OK |
| fps | 30 | OK |
| scene_count | 11 | OK |
| dialogue_count | 110前後 | OK（108セリフ確認） |

## テーマ確認

- タイトル: Wi-Fiルーター5年放置、今夜15分で安全にする3ステップ
- 視聴者想定: Wi-Fiルーターを設置後ほぼ触っていない一般家庭ユーザー
- 既存ep重複チェック: ep920〜ep941との重複なし（Wi-Fiルーターセキュリティは初出）

## 禁止項目確認

- [ ] audio_playback_rate: 記載なし → OK
- [ ] scenes[].scene_template: 記載なし → OK
- [ ] meta.scene_template: 記載なし → OK
- [ ] sub: null（全シーン Scene01 sub枠なし） → OK

## ステータス

PASS
