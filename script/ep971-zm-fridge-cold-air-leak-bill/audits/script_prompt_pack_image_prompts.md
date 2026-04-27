# script_prompt_pack_image_prompts

使用prompt: 08_image_prompt_prompt.md

episode_id: ep971-zm-fridge-cold-air-leak-bill

script_finalの対象シーン全文を主入力にし、画像プロンプト内では話者名を話者A/話者Bへ匿名化した。画像は会話を載せず、シーンの要点を16:9で補強する。

このファイルはprompt pack実行証跡であり、Codexレビュー監査ではない。既存script配下の台本本文は使わず、今回のテーマとテンプレート制約に合わせて新規生成した。


## 画像プロンプト補足

画像は会話の代替ではなく、main枠に入る理解補助の16:9素材として設計した。プロンプトには対象シーンの会話全文を主入力として含めるが、画像内には会話全文や長文説明を並べないよう明示した。既存キャラクターや実在UIの模写を避けるため、話者名は話者A/話者Bへ匿名化し、冷蔵庫ドア・パッキン断面・霜の結晶・1万円札・電気代明細・消費電力グラフなどの具体的な家電診断小物と概念図で表現する。

テンプレートの字幕・キャラクター位置に干渉しないよう、下部には重要情報を置かない指示を全画像に入れた。白背景中央アイコンだけになるのを避け、各シーンのimage_roleとcomposition_typeを明記した。image_roleとcomposition_typeの対応は以下の通り。

- s01: image_role=不安喚起、composition_type=事故寸前構図（電気代明細と冷蔵庫ドアの対比）
- s02: image_role=理解補助、composition_type=チェックリスト（4つの危険信号を視覚化）
- s03: image_role=不安喚起、composition_type=失敗例シミュレーション（5年間の損失積み上がり）
- s04: image_role=理解補助、composition_type=原因マップ（パッキン→冷気→モーター連鎖図）
- s05: image_role=不安喚起、composition_type=誇張図解（詰めすぎ×霜の二重連鎖、7割以下）
- s06: image_role=手順整理、composition_type=手順図（1万円札テスト4辺チェック手順）
- s07: image_role=手順整理、composition_type=証拠写真風（除霜の段階写真風ステップ図）
- s08: image_role=手順整理、composition_type=チェックリスト（8割ルール＋壁5cm隙間）
- s09: image_role=比較、composition_type=ビフォーアフター（旧機種vs新型消費電力比較）
- s10: image_role=手順整理、composition_type=手順図（テスト→結果確認→コメント報告の3ステップ）

実在ブランド、ウォーターマーク、長文日本語、細かい表、sprite sheet、8枚グリッド、一括生成は禁止し、codex-imagegenで1シーン1プロセス1画像として生成する前提にした。image_prompt_v2.mdの各シーンプロンプトと整合している。
