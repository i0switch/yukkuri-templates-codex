# script_prompt_pack_final_episode_audit

使用prompt: 11_final_episode_audit.md

episode_id: ep971-zm-fridge-cold-air-leak-bill

判定: PASS。5分前後のシーン数・発話数、中盤再フック、具体例、最終行動CTA、画像プロンプト方針、YAML契約をすべて満たす。

このファイルはprompt pack実行証跡であり、Codexレビュー監査ではない。既存script配下の台本本文は使わず、今回のテーマとテンプレート制約に合わせて新規生成した。


## 最終監査チェック結果

| 確認項目 | 結果 | 根拠 |
|---|---|---|
| シーン数 | PASS | 10シーン（s01〜s10）、全シーンScene02 |
| 発話数 | PASS | 80発話（8発話×10シーン）、目標80発話 |
| 推定尺 | PASS | 80×3.8=304秒（目標270〜330秒内） |
| 冒頭フック | PASS | 「また電気代が高かった」→冷蔵庫犯人という即フック |
| 中盤再フック(s05) | PASS | 詰めすぎ×霜の二重連鎖、7割以下の衝撃数字 |
| s09コミュニティ誘導 | PASS | 冷蔵庫何年ものコメント誘導あり |
| s10 CTA1点集中 | PASS | 1万円札テスト30秒のみに絞る |
| L3以上リアクション最低2回 | PASS | s01 L3、s05 L4、s09 L3（計3回） |
| 「なのだ」率20〜40% | PASS | 37.5%（15/40発話） |
| めたん3連続禁止 | PASS | 全シーン交互進行を維持 |
| sub枠全シーン必須 | PASS | 全10シーンに4〜6項目のsub bullets |
| 画像プロンプト10本 | PASS | image_prompt_v2.mdにs01〜s10全10本記載 |
| YAML voice_engine | PASS | voicevox、aquestalk_preset記載なし |
| YAML pair | PASS | ZM |
| speaker_id正確性 | PASS | zundamon=3、metan=2 |
| layout_template | PASS | Scene02単一指定、scene_template使わず |

## 視聴体験スコア

- watchability_checks: すべてOK（フック・テンポ・具体例・行動誘導）
- conversation_experience_score: 4.3 / 5.0
  - ずんだもんのボケ・勘違いが視聴者の疑問を的確に代弁している
  - めたんの「冷静な刺し」が各シーンで1〜2回明確に入っている
  - 数字の密度が高く、抽象論で終わるシーンがない
  - s05の二重連鎖暴露が中盤の視聴維持に有効
  - s10のオルタナティブクロージング（30秒やるか800円払うか）がCTAとして機能的
