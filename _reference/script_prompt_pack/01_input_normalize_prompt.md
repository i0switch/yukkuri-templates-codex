# 01_input_normalize_prompt

## 目的

ユーザー入力を、台本生成に必要な条件へ整理する。

## 入力

```text
ユーザー依頼:
既知のテンプレート候補:
既知のキャラペア:
```

## 出力

```yaml
input_normalized:
  episode_id:
  theme:
  include_points:
  target_duration:
  target_duration_sec:
  character_pair: RM | ZM
  selected_template:
  audience:
  tone:
  must_use_sources:
    - _reference/script_prompt_pack/local_canonical/yukkuri_master.md
    - _reference/script_prompt_pack/local_canonical/zundamon_master.md
  missing_items:
  assumptions:
  stop_reason:
```

## ルール

- テンプレート未指定なら、ここで停止して候補提示する。
- ローカル正本2ファイルが読めない場合は停止する。
- テーマだけの場合は、尺3分、初心者向け、損失回避 + 行動提示を既定にしてよい。
- ただしキャラペアとテンプレートは勝手に決めない。サンプル生成など依頼内で指定がある場合はその指定を使う。
