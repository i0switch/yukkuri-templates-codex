# script_prompt_pack_image_prompts.md
# 実行証跡: 08_image_prompt_prompt.md（各シーン imagegen_prompt 実行証跡）

実行日: 2026-04-27
対象エピソード: ep950-rm-old-wifi-router-security-reset
参照ファイル: script/ep950-rm-old-wifi-router-security-reset/image_prompt_v2.md

## 生成プロンプト一覧

| シーンID | アセット | プロンプト形式 | visual_role サマリ |
|---------|---------|-------------|-----------------|
| s01 | assets/s01_main.png | script_final直投げ型 | 5年放置ルーター・時計・危険サイン概念図 |
| s02 | assets/s02_main.png | script_final直投げ型 | 初期PW公開リスト・管理画面侵入・DNS書き換えフロー |
| s03 | assets/s03_main.png | script_final直投げ型 | SSID名→機種特定→脆弱性→攻撃フロー図 |
| s04 | assets/s04_main.png | script_final直投げ型 | 192.168.1.1入力→ログイン画面の手順UI図 |
| s05 | assets/s05_main.png | script_final直投げ型 | 無線LAN設定画面・SSID変更・PW変更フォーム図 |
| s06 | assets/s06_main.png | script_final直投げ型 | ルーター内部ソフトウェア概念図・5年未更新タイムライン |
| s07 | assets/s07_main.png | script_final直投げ型 | 踏み台攻撃フロー図・自宅ルーター→攻撃経路 |
| s08 | assets/s08_main.png | script_final直投げ型 | FW更新ボタン→進捗→完了・2〜3分切断タイムライン |
| s09 | assets/s09_main.png | script_final直投げ型 | QRコード生成・A4メモ冷蔵庫貼り付け流れ図 |
| s10 | assets/s10_main.png | script_final直投げ型 | 3ステップチェックリスト・「管理画面を開くだけ」強調図 |
| s11 | assets/s11_main.png | script_final直投げ型 | Before/After 3ステップ完了・シールド付きルーター図 |

## プロンプト共通仕様確認

- [x] 対象シーン全文を貼り付けた直投げ型
- [x] 「ゆっくり解説動画向けの挿入画像を日本語で生成してください」の定型文含む
- [x] 「会話等は画像に入れないでください」の禁止文含む
- [x] 「16:9の横長構図」指定含む
- [x] 作風キーワード: セキュリティ警告・実用的・清潔感・ネットワーク図解
- [x] 【禁止追記】含む
- [x] image_direction / visual_type 等 v2禁止フィールド: 含まない

## 生成状況

生成済み: 0件（画像生成は後工程）
プロンプト準備: 11件 COMPLETE

## ステータス

PASS（プロンプト準備完了）
