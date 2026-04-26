# 00 Core Principles

## 目的

ゆっくり解説 / ずんだもん解説動画を、短文穴埋めではなく自然会話から作る。

## 絶対原則

- テンプレ穴埋め禁止
- DraftとYAMLを分ける
- YAMLでも自然な発話単位を維持する
- 表示都合の機械分割は禁止
- キャラの役割固定禁止
- 語尾だけでキャラを立てない
- 画像生成とRemotion描画を分ける
- 実物監査を行う
- 自己採点PASSを最終根拠にしない

## 正準フロー（4段階）

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml
```

`script_final.md` のCodexレビューが終わるまで、YAML化、画像生成、音声生成、レンダーへ進まない。

## 画像レイヤー（任意の補助）

```text
visual_plan.md           # 任意の事前メモ
image_prompt_v2.md       # 直投げ型 imagegen_prompt の生成
画像生成（assets/sNN_main.png）
visual_audit.md / image_audit.json   # 任意確認、非ブロッキング
```

画像レイヤーは pre-render-gate / build-episode の停止条件にしない。

## 禁止

- 初稿やYAMLで表示都合の短文に切る
- `script.yaml` を直接生成する
- `hook_type`, `visual_type`, `myth_vs_fact`, `boke_or_reaction`, `composition_type`, `supports_dialogue`, `supports_moment` を画像生成プロンプトへ入れる
- 画像内に会話全文を並べさせる
- 本文枠の説明文、箇条書き、画像キャプション、Remotionカードを生成する
- `remotion_card_plan.md` を新規成果物にする
- ファイル存在だけで画像監査PASSにする
- `script_audit.json` / `audit_script_draft.json` を生成する
