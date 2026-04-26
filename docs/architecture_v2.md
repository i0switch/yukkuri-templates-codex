# Architecture v2

## なぜv2にするのか

旧方式には、動画化まで通せても品質が落ちる構造が残っていた。

- Draft段階で表示都合の短文化を適用していた
- テンプレ穴埋め型になっていた
- 会話が短文羅列になっていた
- キャラが質問役と訂正役に固定されやすかった
- 画像生成が抽象タグに引っ張られていた
- 画像内に説明文、表、矢印、金額を描かせていた
- 監査が実台本や実画像を十分に見ていなかった
- gate通過や自己採点PASSを品質PASSと混同していた

v2 は、創作品質、表示制約、素材生成、監査責任を分けるための設計である。

## v2の基本思想

- 創作工程と表示工程を分離する
- 台本はDraftで自然会話として作り、最後にYAMLへ変換する
- `script.yaml` でも自然な発話単位を維持し、表示調整はRemotion側で行う
- 画像生成とRemotion描画の責任を分ける
- 画像生成は背景、物体、情景、雰囲気に寄せる
- 本文コンテンツ枠は画像のみで見せ、Remotionで描画する文章は会話字幕に限定する
- 台本レビューはCodexが `script_final.md` だけを見る
- 画像監査は実画像、実プロンプト、実ファイルを見て行う

## 正準フロー

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml
-> visual_plan.md
-> image_prompt_v2.md
-> assets生成または素材設計
-> visual_audit.md / image_audit.json
-> render前チェック
-> render
-> video audit
```

## 台本生成方針

`planning.md` では、視聴者、悩み、感情曲線、情報ゴール、各シーンの役割を設計する。

`script_draft.md` では、自然な会話を優先する。セリフ長は制限しない。目安として1発話12〜40字程度で揺らし、1シーン6〜12発話にする。

禁止:

- `script.yaml` を直接書く
- 最初から表示都合で短く切る
- 誤解、訂正、質問、回答だけを連発する
- 語尾だけでキャラを立てる
- 同じ結論や注意喚起を繰り返す

`script_final.md` は内容品質の正本であり、Codexレビュー対象はこのファイルのみである。レビュー結果は `audits/script_final_review.md` の1ファイルにだけ残す。`script_audit.json` / `audit_script_draft.json` / `script_generation_audit.json` は生成しない。`script.yaml` はレンダー用だが、発話単位と情報順序を維持する派生物である。字幕の折り返しや収まりはRemotion側で調整する。

## 証跡 (evidence) と 監査 (audit) の分離

`script/{episode_id}/audits/` 配下には2種類のファイルが共存する。

- **監査 (audit)**: `audits/script_final_review.md` の1ファイルのみ。Codexによる `script_final.md` のレビュー結果。
- **証跡 (evidence)**: `audits/script_prompt_pack_*.md` 群と `audits/yaml_conversion_v2.md` / `audits/image_prompt_audit.json` / `audits/image_result_audit.json`。prompt pack や各工程の実行記録。`scripts/validate-script-prompt-pack-evidence.mjs` が期待するファイル名で残す。

`script_prompt_pack_draft.md` のようにファイル名に「draft」が含まれていても、それは prompt pack 実行証跡であり、「draft段階の監査JSON」ではない。前者は許容、後者（`audit_script_draft.json` 等）は禁止。

## 画像生成方針

AI画像で作るもの:

- 背景
- 物体
- 情景
- 雰囲気
- 一瞬の状況
- 余白のあるメインビジュアル

Remotionで描画するもの:

- 会話字幕、sub 枠のテキスト・箇条書き

新規 episode では、main 枠に `text` や `bullets` を入れない。sub 枠はテキスト/箇条書きを許容する。
画像キャプションもRemotionテキスト描画になるため使わない。
`remotion_card_plan.md` は廃止し、正確な要点や手順は台本の会話字幕か、sub 枠のテキスト/箇条書き、または生成画像の視覚表現として処理する。

画像生成プロンプトに、`hook_type`、`visual_type`、`myth_vs_fact`、`boke_or_reaction` などの抽象メタタグを混ぜない。分類が必要な場合は内部メモに留め、画像生成には具体的な場所、物体、人物の状況、感情、見せたい一瞬、余白だけを渡す。

## 監査方針

`script_final.md` のCodexレビューでは、次を見る。

- 冒頭の掴み
- キャラの掛け合い
- 文脈の自然さ
- 具体例、数字、生活感
- 視聴者共感
- 小オチまたは次への引き
- テンプレ臭のなさ
- 役割固定の有無

画像監査では、ファイル存在だけでPASSしない。次を見る。

- 台本sceneとの一致
- テーマとの一致
- 画像内テキストの破綻
- 情報量過多
- main枠での見やすさ
- 下部20%安全域
- 字幕、キャラとの衝突
- ゆっくり/ずんだもん動画として自然か

## 失敗時の扱い

- FAILした工程の次へ進まない
- 失敗理由を `audits/` に残す
- 再生成は1シーン最大3回
- 3回連続FAILしたら停止し、`regeneration_plan` を作る
- gate通過だけで品質PASSにしない
- レンダーできても video audit が FAIL なら完成扱いしない

## NOT_AVAILABLEの扱い

OCR、Vision API、画像生成APIが使えない場合は、成功扱いしない。

必ず次を記録する。

```json
{
  "status": "NOT_AVAILABLE",
  "pass": false,
  "human_review_required": true
}
```

NOT_AVAILABLE はクラッシュではないが、PASSでもない。

## 解像度とレイアウト

### base layout（内部座標系）
- 全テンプレート（`templates/scene-XX_*.md`、`src/compositions/Scene*.tsx`）は **1920×1080 座標** でレイアウトを記述する
- 将来 4K 出力にも耐える共通基盤として固定
- `scripts/build-episode.mjs` が `script.render.json.base_layout_width: 1920, base_layout_height: 1080` を埋め込む

### delivery resolution（出力解像度）
- `script.yaml` の `meta.width × meta.height` で指定
- **デフォルトは FullHD（1920×1080）**
- ユーザーから明示的な指定があればその解像度を優先（HD 1280×720 / 4K 3840×2160 等）
- `src/components/SceneRenderer.tsx` が `scale = meta.width / 1920` でレイアウトを縮小/拡大して描画

### 座標を書く時のルール
- テンプレート md / Scene*.tsx の LAYOUT 定数は **1920×1080 を前提に書く**
- HD 用に座標を別途調整する必要はない（自動でスケール）

### audit-video.mjs の挙動
- `meta.width × meta.height` を delivery profile として ffprobe 結果と照合
- レンダー出力が `meta.width × meta.height` になっていなければ FAIL

