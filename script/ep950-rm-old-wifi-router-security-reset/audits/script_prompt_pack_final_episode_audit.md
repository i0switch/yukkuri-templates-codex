# script_prompt_pack_final_episode_audit.md
# 実行証跡: 11_final_episode_audit.md（Codex review PASS 証跡）

実行日: 2026-04-27
対象エピソード: ep950-rm-old-wifi-router-security-reset
監査ファイル参照: script/ep950-rm-old-wifi-router-security-reset/audits/script_final_review.md

## Codex レビュー結果サマリ

| 監査項目 | 結果 |
|---------|------|
| script_final.md が存在する | PASS |
| script_final_review.md が存在する | PASS |
| dialogue総数（108件） | PASS（90〜130範囲内） |
| シーン数（11件） | PASS（10〜12範囲内） |
| 魔理沙3連続なし | PASS |
| 霊夢が質問・相槌だけでない | PASS（自虐・ツッコミ・感情爆発あり） |
| 中盤再フック存在（40〜60%） | PASS（s06=55%地点） |
| L3+リアクション2件以上 | PASS（6シーン: s02/s03/s06/s07/s10/s11） |
| 具体的行動で終わる | PASS（「192.168.1.1を開く」「BUFFALO-A1B2C3さようなら」） |
| 冒頭5秒フック | PASS（「5年！？変えたことある？」） |
| 章タイトルがフック型 | PASS（「大嘘だった」「機種バレ」「放置5年の末路」等） |
| 具体的数字・URL | PASS（192.168.1.1 / 12文字以上 / 15分 / 2〜3分） |
| 既存ep重複なし | PASS（Wi-Fiルーターセキュリティは初出） |
| 魔理沙「だぜ」自然使用 | PASS |
| 霊夢比率（約50%） | PASS（霊夢55/魔理沙53） |

## script.yaml 整合性確認

| 確認項目 | 結果 |
|---------|------|
| meta.id 一致 | PASS |
| layout_template: Scene01 | PASS |
| pair: RM | PASS |
| voice_engine: aquestalk | PASS |
| aquestalk_preset 設定 | PASS（れいむ/まりさ） |
| sub: null 全シーン | PASS |
| audio_playback_rate 未記載 | PASS |
| scene_template 未記載 | PASS |
| bgm ブロック存在 | PASS |
| visual_asset_plan 全シーン | PASS（11/11） |
| dialogue 機械分割なし | PASS |

## 総合判定

**PASS** — ep950-rm-old-wifi-router-security-reset は script.yaml 生成完了。
次工程: 画像生成（codex-imagegen × 11枚）→ 音声生成 → gate:episode → render:episode

## ステータス

PASS
