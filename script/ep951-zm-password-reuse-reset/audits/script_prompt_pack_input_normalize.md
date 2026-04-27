# script_prompt_pack_input_normalize

## 使用prompt
- `_reference/script_prompt_pack/01_input_normalize_prompt.md`

## input_normalized
```yaml
episode_id: ep951-zm-password-reuse-reset
theme: パスワード使い回しを今日やめる3ステップ。通販、SNS、メールで同じパスワードを使っている初心者向けに、漏洩時の連鎖被害、優先順位、パスワード管理の始め方を5分で解説。
include_points:
  - 漏洩時の連鎖被害
  - メール、通販、SNSの優先順位
  - パスワード管理アプリの始め方
  - 長いパスワードと2段階認証
target_duration: 5分
target_duration_sec: 300
character_pair: ZM
selected_template: Scene01
audience: 通販、SNS、メールで同じパスワードを使っている初心者
tone: 損失回避を強く刺しつつ、今日できる行動へ落とす
must_use_sources:
  - _reference/script_prompt_pack/local_canonical/yukkuri_master.md
  - _reference/script_prompt_pack/local_canonical/zundamon_master.md
missing_items: []
assumptions:
  - 10シーン、100セリフで5分想定にする
  - 画像生成プロンプトとYAMLは本担当範囲外
  - Scene01のためsubはnull方針
stop_reason: null
```

## 判定
- PASS: 必須入力は揃っている。
