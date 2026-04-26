# 05_AUDIT_SCRIPTS: 監査スクリプト作成

## 目的

「テーマと無関係な画像」「実物を見ない画像PASS」を防ぐため、画像監査スクリプトの骨格を作る。

## 作成するファイル

```text
scripts/audit_image_result.py
```

## 共通方針

- 実装できる決定論的チェックはコードで実装する
- 外部APIが必要なものは、使える場合は実装する
- APIキーや依存がない場合は `NOT_AVAILABLE` として扱う
- ただし、NOT_AVAILABLEをPASS扱いしない
- NOT_AVAILABLEの場合は `human_review_required: true` を付ける

## 台本レビュー

台本Draft監査スクリプトは作らない。
Codexレビュー対象は `script_final.md` のみ。

## `audit_image_result.py`

入力:

```text
画像ファイル
visual_plan.md
episode_meta.json または yaml
```

出力:

```text
audits/audit_image_result.json
```

実装するチェック:

- OCRが使える場合: 画像内テキスト抽出
- OCRが使えない場合: `ocr_status: NOT_AVAILABLE`
- Vision APIが使える場合: scene_goalとの整合性を採点
- Vision APIが使えない場合: `vision_status: NOT_AVAILABLE`
- 日本語単語数4語超ならFAIL
- 抽象メタ語が画像内またはprompt内にあればFAIL
- テーマキーワード不一致ならFAILまたはhuman review
- 下部20%安全域チェックは、可能なら画像座標で実装。難しければ手動確認フラグ

禁止:

- ファイル存在だけでPASS

## テスト

`scripts/test_fixtures/` に簡易テスト用の台本を作って、以下を確認してください。

- NOT_AVAILABLEがPASSにならない
