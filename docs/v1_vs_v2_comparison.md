# v1 vs v2 Comparison

## 対象エピソード

- `ep914-rm-browser-tabs-focus-leak`
- `ep915-zm-default-app-chaos`

## 台本比較

| 指標 | v1 | v2 | 改善内容 |
|---|---:|---:|---|
| Draft段階の表示都合短文化 | あり | なし | Draftは自然会話、機械分割はしない（YAML変換でも維持） |
| 抽象タグ依存 | 高 | 低 | `hook_type` / `visual_type` / `composition_type` / `boke_or_reaction` / `myth_vs_fact` / `supports_*` を本文・画像プロンプトから排除 |
| 平均セリフ長 | 短め固定 | 揺らぎあり | 12〜40字程度で会話の息継ぎを作る |
| シーンパターン | 型に寄る | 混在 | 同一展開の連続を避ける |
| 具体例 | あるが短文化 | 数字・場所・状況を会話内へ配置 | 自然な発話に統合 |
| 小オチ/引き | タグ化 | 会話内に残す | テンプレ臭を抑える |
| Codexレビュー対象 | 複数JSON | `script_final.md` のみ | `audits/script_final_review.md` の1ファイル |

## 画像比較

| 指標 | v1 | v2 | 改善内容 |
|---|---:|---:|---|
| 抽象タグ混入 | あり | なし | `imagegen_prompt` 本文には対象シーン全文＋固定文＋作風語のみ |
| 画像内日本語 | 制限的 | 許可（会話全文の貼り付けだけ禁止） | 読ませる情報の必要分は画像内に入れてよい |
| 金額・比較・手順を画像内へ | 寄りやすい | 任せる | テンプレで吸収、固定文で会話除外 |
| 画像監査 | ブロッキング | 任意（非ブロッキング） | `pre-render-gate` / `build-episode` の停止条件にしない |
| 中間ファイル `image_direction` | 必須 | 廃止 | 直投げ型 |

## レンダー比較

| 指標 | v1 | v2 |
|---|---|---|
| `meta.layout_template` | あり | あり (`Scene01`〜`Scene21` の1つだけ) |
| `meta.scene_template` | 使用 | 新規禁止 |
| `scenes[].scene_template` | 使用 | 使用禁止 |
| `main.kind` | `text` / `bullets` も許容 | 原則 `image` のみ |
| `main.caption` / `sub.caption` | 使用 | 使わない |
| `bullets` | 使用 | 使わない |
| `remotion_card_plan.md` | 生成 | 生成しない |
| 既定解像度 | FullHD | HD (1280×720) |

## 残課題

- v1由来の旧ルートドキュメント群は `legacy/v1_root_docs/` に退避済み
- 修正用プロンプト/ は `legacy/migration_prompts_v1_to_v2/` に退避済み
- `_reference/script_prompt_pack/` の互換 stub 4本は `legacy/` に退避済み
- ep914 / ep915 のサンプル script.md には旧抽象タグが残るため要清掃

## 次の改善案

- prompt pack の証跡（`audits/script_prompt_pack_*.md`）を「証跡 (evidence)」と「監査 (audit)」で命名分離するか、CLAUDE.md側で概念分離を明文化する
- 5分以上の正式尺で gate / render / video audit を回す
