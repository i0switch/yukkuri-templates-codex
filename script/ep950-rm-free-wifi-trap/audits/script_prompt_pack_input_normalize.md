# script_prompt_pack_input_normalize

## 使用プロンプト
- `_reference/script_prompt_pack/01_input_normalize_prompt.md`

## input_normalized
```yaml
episode_id: ep950-rm-free-wifi-trap
theme: 無料Wi-Fiでやりがちな危険設定。カフェやホテルのWi-Fiでログイン、買い物、同じパスワード入力をしてしまう人向けに、損失回避と安全な使い方を5分で解説。
include_points:
  - カフェやホテルの無料Wi-Fi
  - 偽SSID
  - 鍵マークへの過信
  - ログイン、買い物、カード情報入力の危険
  - 同じパスワード入力の連鎖被害
  - 自動接続設定
  - モバイル回線への切り替え
  - 入力してしまった後の初動
target_duration: 5分程度
target_duration_sec: 300
character_pair: RM
selected_template: Scene01
audience: カフェやホテルのWi-Fiでログイン、買い物、同じパスワード入力をしてしまう一般ユーザー
tone: 損失回避を強めつつ、怖がらせるだけでなく今日の設定確認へ落とす
must_use_sources:
  - _reference/script_prompt_pack/local_canonical/yukkuri_master.md
missing_items: []
assumptions:
  - 5分想定のため10シーン、100セリフを目標にする
  - Scene01はsub枠なしのためsubはnull方針
  - YAML、画像生成プロンプト、script_finalレビューは今回の担当外
stop_reason: null
```

## 判定
- 入力条件は十分。
- テンプレート、pair、episode_id、尺が明示されているため停止なしで計画へ進行。
