# Pipeline Contract

このファイルを、動画生成パイプラインの単一正本にする。
`AGENTS.md`、`CLAUDE.md`、`AI_VIDEO_GENERATION_GUIDE.md`、`_reference/script_prompt_pack/README.md`、旧ルート互換文書が矛盾する場合は、このファイルを優先する。

## 正準成果物

1 episode の成果物は次の順で作る。

```text
script/{episode_id}/planning.md
script/{episode_id}/script_draft.md
script/{episode_id}/script_final.md
script/{episode_id}/audits/script_final_review.md
script/{episode_id}/script.yaml
script/{episode_id}/visual_plan.md
script/{episode_id}/image_prompt_v2.md
script/{episode_id}/image_prompts.json
script/{episode_id}/imagegen_manifest.json
script/{episode_id}/assets/
script/{episode_id}/meta.json
script/{episode_id}/audits/pre_render_gate.json
out/videos/{episode_id}.mp4
```

`script_final.md` が台本品質の正本。
`script.yaml` はレンダー入力であり、創作台本の正本ではない。
長文画像プロンプトは `image_prompts.json` に逃がしてよい。`script.yaml` には `imagegen_prompt_ref` を置ける。既存互換として inline `imagegen_prompt` も読み取る。

台本の良し悪しは `audits/script_final_review.md` のLLMレビューだけで判定する。
機械ゲートは、必要ファイル、hash鮮度、YAML構造、素材参照、台帳、音声/画像のレンダー前整合だけを確認し、文字数、発話数、平均文字数、キーワード充足で台本品質を合否判定しない。

## 出力解像度

ユーザーが解像度を指定しない限り、動画の delivery resolution は FullHD `1920x1080` にする。

- `script.yaml` の `meta.width` は `1920`、`meta.height` は `1080` を既定値にする
- ユーザーが `HD` / `720p` / `1280x720` / `4K` / `3840x2160` などを明示した場合だけ、その指定を優先する
- render 後は `audit-video.mjs` で `meta.width × meta.height` と実MP4解像度を照合する

## hybrid_user_script モード

ユーザーが手書き台本を渡し、AI が動画用成果物へ整える場合は `hybrid_user_script` モードを使う。
Codex / Claude Code / その他エージェントのどれで実行しても、成果物名と停止条件は同じにする。

追加の入口ファイル:

```text
script/{episode_id}/source_manual_script.md
script/{episode_id}/audits/manual_intake.md
```

`source_manual_script.md` はユーザー原文の保存先。
AI はこの原文を元に `planning.md`、`script_draft.md`、`script_final.md` を作る。
レビュー対象は通常フローと同じく `script_final.md` のみ。

`audits/manual_intake.md` には次を記録する。

```text
mode: hybrid_user_script
source_script: source_manual_script.md
script_author: user
image_source: user_generated
rights_confirmed: true
```

`manual_intake.md` がある episode では、prompt pack 実行証跡の代わりに `source_manual_script.md` と `manual_intake.md` を手動受け入れ証跡として扱う。

## 正準順序

```text
planning.md
-> script_draft.md
-> script_final.md
-> Codex review of script_final.md
-> script.yaml
-> visual_plan.md / image_prompt_v2.md
-> estimate natural TTS duration
-> preflight episode
-> assets generation
-> BGM selection
-> voice generation
-> pre-render gate
-> build episode
-> render
-> video audit
```

画像プロンプトは `script_final.md` の対象シーン全文を主入力にした `visual_asset_plan[].imagegen_prompt` として作る。
会話は Remotion の字幕で出すため、画像内に会話全文を並べる指示は禁止する。
対象シーンタイトルは、画像内の大きく目立つ見出しとして必ず入れる。例: `s01: 月580円が年6,960円に化ける` の場合、画像内に入れる見出しは `月580円が年6,960円に化ける` だけにし、`s01` は入れない。

5分動画の本文画像は標準20枚を目安にする。
シーン数は会話構造のために使い、画像枚数調整だけを目的に増やさない。
1シーン内で複数画像を使う場合は `main_timeline` を使い、原則5発話ごとに1枚の画像プロンプトを作る。
冒頭フック、中盤再フック、数字・比較・危険提示、最終CTAは5発話未満でも単独画像にしてよい。

```yaml
main:
  kind: image
  asset: assets/s03_main.png
main_timeline:
  - slot: main_01
    slot_group: main
    asset: assets/s03_main_01.png
    start_line_id: l01
    end_line_id: l05
  - slot: main_02
    slot_group: main
    asset: assets/s03_main_02.png
    start_line_id: l06
    end_line_id: l10
visual_asset_plan:
  - slot: main_01
    slot_group: main
    purpose: "script_final直投げ型の挿入画像"
    adoption_reason: "対象会話ブロックの要点を直接画像化するため"
    image_role: "理解補助"
    composition_type: "手順図"
    imagegen_prompt_ref: "image_prompts.json#s03.main_01"
```

`main.asset` は後方互換とfallback用に残す。
`main_timeline` がある場合、Remotionは現在発話中の `dialogue[].id` に対応する画像へ切り替え、未対応時だけ `main.asset` にfallbackする。
`image_prompts.json`、`meta.json`、`imagegen_manifest.json` は `scene_id + slot` を一意キーにし、timeline画像には `slot_group: "main"` を入れる。

## 台本生成時の探索除外

台本生成、構成作成、YAML化、画像プロンプト作成の初動では、必要な正準ドキュメントと対象 episode だけを読む。
高速化のため、生成物、複製repo、依存関係、公開用コピーを再帰探索してはいけない。
通常の新規 episode 生成では `docs/agent_fast_path.md` を併用し、初動で読むファイルを最小化する。

`.claude/` は丸ごと禁止しない。必要時に限り、次は読んでよい。

- `.claude/skills/**/SKILL.md`
- `.claude/skills/**` の `SKILL.md` から明示参照されたファイル
- `.claude/commands/**`
- `.claude/*.mjs` など、ユーザーまたは手順が明示した軽量ヘルパー

ただし、台本生成の参照元として次は読まない。

- `.claude/worktrees/**`
- `.claude/**/node_modules/**`
- `.claude/**/.cache/**`
- `.claude/**/.remotion-public/**`
- `.claude/**/out/**`
- `.claude/**/public/episodes/**`
- `.claude/**/script/**/audio/**`
- `.claude/**/script/**/bgm/**`
- `.claude/**/script/**/assets/**`
- `.claude/**/notebookLM/workspace/**`
- `.claude/**/.tmp/**`
- `node_modules/**`
- `.cache/**`
- `.remotion-public/**`
- `notebookLM/**`
- `out/**`
- `public/episodes/**`
- `script/**/audio/**`
- `script/**/bgm/**`
- `script/**/assets/**`

過去 episode を参照する場合は、ユーザー指定の episode、または明示的に選んだ最大2本の軽量テキスト成果物だけに限定する。
`scripts/oneoff/**` は過去 episode 用の使い捨て修正・移行スクリプトであり、通常生成ルートの入口として読まない。

## Temporary Script Cleanup

エージェントが作業中に自作した一時スクリプト、検証用スクリプト、移行用スクリプト、対象 episode 専用の生成スクリプトは、作業完了前に必ず削除する。
`scripts/`、repo root、`tmp/`、`.cache/`、対象 episode 配下のどこに作った場合でも、使い終わったら残してはいけない。

例外は、ユーザーが明示的に保存を指示した場合、または既存の恒久コマンドとして `package.json`、テスト、ドキュメント、gate に正式接続して保守対象にした場合だけ。
その場合も、ファイル名、用途、実行コマンド、削除しない理由を完了報告に明記する。

次は禁止する。

- `create-epXXX.mjs`、`fix-epXXX.mjs`、`generate-epXXX.mjs` など episode 固有スクリプトを残す
- `oneoff`、`temp`、`tmp`、`scratch`、`debug`、`test-run` 名の自作スクリプトを残す
- 自作スクリプトを残したまま「完了」と報告する
- 古い自作スクリプトを通常生成や監査の入口として再利用する

完了前には、自分が追加したスクリプトを `git status` と `rg` で確認し、恒久化しないものを削除する。
一時スクリプトが残っている場合、その作業は未完了扱いにする。

## 視聴維持 vNext メタ

`script.yaml` では、正しい説明だけでなく会話の山場を動画へ渡すため、次を新規 episode の公開契約にする。

- `scenes[].motion_mode`: `normal` / `punch` / `compare` / `warning` / `checklist` / `reveal` / `recap`
- `visual_asset_plan[].image_role`: `理解補助` / `不安喚起` / `笑い` / `比較` / `手順整理` / `証拠提示` / `オチ補助`
- `visual_asset_plan[].composition_type`: `NG / OK 比較` / `失敗例シミュレーション` / `誇張図解` / `証拠写真風` / `チェックリスト` / `手順図` / `原因マップ` / `ビフォーアフター` / `ツッコミ待ち構図` / `事故寸前構図`

字幕の語単位色替え、文字アニメーション、`dialogue[].emphasis` 由来のSE再生は廃止済み。
新規 episode では `dialogue[].emphasis` と `dialogue[].text` 内の `**強調語**` マークアップを使わない。
既存 episode に `emphasis` が残っていても、renderer は無視し、validator は互換警告だけを出す。

60秒以上 `motion_mode: normal` が続く、40〜60%地点の再フックが `normal`、ラスト行動が `normal` の場合は gate で止める。

hybrid_user_script では、AI が `image_prompt_v2.md` と `visual_asset_plan[].imagegen_prompt` を作り、ユーザーが任意の画像生成ツールで画像を生成して `script/{episode_id}/assets/sNN_main.png` に保存する。
画像生成ツール名は固定しない。
保存済みの実画像、ファイル名、meta 台帳、権利確認を正本にする。

## 停止条件

次の条件を満たすまで、後続工程へ進まない。

- `script_final.md` の Codex レビューが終わるまで、YAML 化、画像生成、音声生成、render へ進まない
- `audits/script_final_review.md` の `script_final_sha256` が現在の `script_final.md` と一致しない場合は stale として進まない
- `audits/script_final_review.md` がない episode は render しない
- `audits/script_final_review.md` が `verdict: PASS` ではない episode は render しない。`FAIL` の場合は、LLMレビューに書かれた品質理由を直し、hash付きレビューを再作成してから進む
- `script.yaml` に `meta.layout_template` がない episode は gate / build / render へ進めない
- `meta.scene_template` と `scenes[].scene_template` は使わない
- gate が FAIL の episode は build / render へ進めない
- MP4 がない episode は完成扱いしない
- video audit が未実行または FAIL の episode は完成扱いしない
- image gen 未実行、失敗、NOT_AVAILABLE、ローカル仮 PNG のみの場合は正式画像生成済みと言わない
- `source_type: "imagegen"` の画像は、`generation_tool: "codex-imagegen"`、`source_url: "codex://generated_images/..."` または `generation_id`、`rights_confirmed: true`、`license`、`imagegen_prompt`、`scene_id`、`slot`、`purpose`、`adoption_reason` が揃うまで gate / build / render へ進めない
- `source_type: "imagegen"` の画像は `imagegen_manifest.json` に scene_id、slot、file、source_url または generation_id、元ファイル名、prompt_sha256 を記録し、meta.json と一致させる
- hybrid_user_script で `source_type: "user_generated"` を使う画像は、`generation_tool` と `rights_confirmed: true` がない限り gate / build / render へ進めない
- placeholder、fallback、local card、copied、出所不明画像は `user_generated` として扱わない

## Prompt Pack

新規生成では `_reference/script_prompt_pack/` の非 legacy ファイルだけを使う。

台本品質のローカル正本は、キャラペアに対応する1ファイルだけ読む。

- RM / ゆっくり解説: `_reference/script_prompt_pack/local_canonical/yukkuri_master.md`
- ZM / ずんだもん解説: `_reference/script_prompt_pack/local_canonical/zundamon_master.md`

キャラペアが未確定なら、`01_input_normalize_prompt.md` で `character_pair` を確定してから対象ペアの正本だけを読む。RM/ZM両方のローカル正本を同時に読まない。

正準順序:

```text
00_MASTER_SCRIPT_RULES.md
01_input_normalize_prompt.md
02_template_analysis_prompt.md
03_plan_prompt.md
04_draft_prompt_yukkuri.md または 05_draft_prompt_zundamon.md
07_rewrite_prompt.md（必要な場合のみ）
08_image_prompt_prompt.md
10_yaml_prompt.md
11_final_episode_audit.md
```

画像プロンプトは `script_final.md` の対象会話全文、固定プロンプト、台本に合わせた雰囲気指定から作る生成入力であり、独立した品質監査の対象にしない。

`_reference/script_prompt_pack/legacy/01_plan_prompt.md` などの旧番号系は参照禁止。
旧番号系は過去互換の退避資料であり、正準 pipeline の入口ではない。

## 監査と証跡

`script/{episode_id}/audits/` には監査と証跡が共存するが、意味を混同しない。

- 監査: `audits/script_final_review.md` のみ。Codex が `script_final.md` をレビューした結果。
- 証跡: `audits/script_prompt_pack_*.md` 群。prompt pack を実行した記録。

`script_audit.json`、`audit_script_draft.json`、`script_generation_audit.json` は生成しない。
証跡ファイルは、使用prompt名と工程出力を残すための記録であり、文字数や分量で台本品質を判定する場所ではない。

`script_final_review.md` では、LLMが `script_final.md` 本文を読んで `PASS` / `FAIL` を出す。
判断軸は、フック、掛け合い、具体例、視聴維持、キャラ口調、説明bot化、行動CTA、尺オーバー由来の不自然な削除有無にする。
`FAIL` の場合は、どこが悪いか、どこをどう直すかを本文に書く。
文字数、発話数、平均文字数、キーワード数は合否理由にしない。

hybrid_user_script では、prompt pack 証跡の代わりに `audits/manual_intake.md` を使ってよい。
ただし `audits/script_final_review.md` は省略しない。

## ユーザー生成画像の meta.json 契約

ユーザーが外部ツールで生成した画像を使う場合、`meta.json` の該当 asset entry は次を必須にする。

```json
{
  "file": "assets/s01_main.png",
  "source_type": "user_generated",
  "generation_tool": "ChatGPT Images / Claude / Midjourney / other",
  "rights_confirmed": true,
  "license": "user confirmed generated asset for this episode",
  "scene_id": "s01",
  "slot": "main",
  "purpose": "script_final直投げ型の挿入画像",
  "adoption_reason": "sceneの要点に一致",
  "imagegen_prompt": "image_prompt_v2.md と同じプロンプト"
}
```

`source_type: "user_generated"` は、Codex以外で生成された画像を正式に受け入れるための値。
Claude Codeで実行する場合も同じ値を使う。

## Codex imagegen 画像の meta.json 契約

Codex imagegen で生成した画像を使う場合、`meta.json` の該当 asset entry は次を必須にする。

```json
{
  "file": "assets/s01_main.png",
  "type": "image",
  "source_type": "imagegen",
  "generation_tool": "codex-imagegen",
  "source_url": "codex://generated_images/{session}/{filename}",
  "rights_confirmed": true,
  "license": "AI generated by codex-imagegen for this episode",
  "scene_id": "s01",
  "slot": "main",
  "purpose": "script_final直投げ型の挿入画像",
  "adoption_reason": "sceneの要点に一致",
  "imagegen_prompt": "image_prompt_v2.md または image_prompts.json と同じプロンプト"
}
```

`imagegen_manifest.json` には次を記録する。

```json
{
  "version": 1,
  "images": [
    {
      "scene_id": "s01",
      "slot": "main",
      "slot_group": "main",
      "file": "assets/s01_main.png",
      "source_url": "codex://generated_images/{session}/{filename}",
      "generation_id": "{optional-id}",
      "original_file": "{generated filename}",
      "prompt_sha256": "{sha256 of imagegen_prompt}"
    }
  ]
}
```

## 尺調整

5分指定は `270〜330秒` を許容範囲にする。発話数は目安であり、最終判断はTTSエンジン別の推定自然音声秒数とbuild後の実音声秒数で行う。
`target_duration_sec` は下限不足を見つけて台本量を増やすための目安であり、allowed_max 超過時に `script_final.md` を短くする指示ではない。

- RM / AquesTalk 初期係数: `5.2秒/発話`
- ZM / VOICEVOX 初期係数: `3.3秒/発話`（`speedScale: 1.15` 前提）
- `npm run estimate:episode-duration -- <episode_id>` を音声生成前に実行する。既存の `tts-duration-profile.json` / `audio-manifest.json` / `line-durations.json` がある場合は実測平均を優先する
- `audio_playback_rate` や `atempo` で尺合わせしない
- 推定自然音声尺またはbuild後の実音声尺が下限未満の場合は、`07_rewrite_prompt.md` で不足分だけ `script_final.md` を台本補完し、再レビューしてから進む
- 推定自然音声尺またはbuild後の実音声尺が allowed_max を超えた場合は、自然尺を優先してそのまま使う。尺合わせ目的で `script_final.md` を削除、短文化、圧縮しない
- `recommended_action: keep_natural_overrun_do_not_trim` が出た場合、尺合わせ目的の削除、短縮、要約、圧縮、発話統合をしてはいけない。事実誤り、重複、キャラ崩れ、文脈破綻など品質理由の局所修正だけを別理由で行える
- 尺オーバー後に `script_final.md` を修正した場合は、理由が品質修正であっても `script_final_review.md` を必ず再作成し、hash一致を確認してから進む
- `script.yaml` からMarkdown側を同期した場合、`script_final_review.md` はstale扱いにし、再レビューする

## 差分生成キャッシュ

動画生成は品質ゲートを維持したまま、未変更成果物を再利用してよい。

- 音声は `script/{episode_id}/audio-manifest.json` に発話ごとの `input_hash`、`duration_sec`、`file_sha256` を記録する
- build 後は `script/{episode_id}/tts-duration-profile.json` に `actual_seconds_per_line` を記録し、次回の尺推定へ使う
- 発話本文、話者、音声エンジン、speaker/preset が一致し、wavのhashも一致する場合は音声再生成をskipする
- Remotion本レンダーは `script/{episode_id}/render-manifest.json` に `script_final.md`、`script.yaml`、画像プロンプト、画像ファイル、BGM、`script.render.json`、描画コードを含む入力hashを記録する
- 入力hashが一致し、MP4が存在する場合は `render:episode` のRemotion本レンダーをskipしてよい
- `--force-audio` は音声だけ、`--force-render` はRemotion本レンダーだけ、`--force` はBGM・音声・Remotion本レンダーを強制再実行する
- 差分生成は `gate:episode` と `audit:video` の代替ではない。完成条件は従来どおり gate PASS、MP4存在、video audit PASS を必須にする

## 軽量 preflight とレンダー分離

`npm run preflight:episode -- <episode_id>` は、AquesTalk preset 正規化、画像台帳 hash 照合、尺推定、YAML validator を render 前にまとめて確認する。

RM / AquesTalk の preset は、`reimu` / `marisa` / `れいむ` / `霊夢` / `魔理沙` などの論理名を使わず、render 前に `女性１` / `まりさ` へ正規化する。validator は正規化後の値だけを許可する。

`npm run sync:imagegen-ledger -- <episode_id>` は `script.yaml` / `image_prompts.json` の prompt と `meta.json` / `imagegen_manifest.json` の prompt hash を同期する。`--check` は差分がある場合に失敗する。

`npm run check:cleanup` は root / `scripts/` / `tmp/` / `.cache/` の自作一時スクリプト候補を検出する。既存 `scripts/oneoff/**` は過去作業置き場として検出対象から外す。

`render:episode` は episode 専用の Remotion entrypoint を `.cache/remotion-entry/<episode_id>/` に生成し、`src/generated/episode-compositions.ts` を render 用に上書きしない。これにより複数 episode の render が composition ID を消し合う事故を避ける。

サブエージェントで分担する場合も、成果物契約は変えない。台本エージェントは `script_final.md` とレビューまで、YAMLエージェントは `script.yaml` と尺/テンプレ整合、画像エージェントは画像プロンプトと画像台帳、音声/レンダーエージェントはBGM・音声・`script.render.json`・Remotion、監査エージェントはgate・video audit・偽完成チェックを担当する。

## 静止画テンプレート

静止画 42 枚生成はテンプレート確認用の補助作業。
動画生成パイプラインの正準成果物、停止条件、完了条件ではない。

必要な場合だけ次を使う。

```powershell
npm run render:test-stills
npm run render:01-rm
npm run render:01-zm
```

## 完了条件

完成と言ってよいのは、次がすべて揃った時だけ。

- `script/{episode_id}/script_final.md`
- `script/{episode_id}/audits/script_final_review.md`
- `npm run gate:episode -- <episode_id>` が PASS
- `out/videos/{episode_id}.mp4`
- `node scripts/audit-video.mjs <episode_id>` が PASS

画像プロンプトは生成入力であり、完成ブロッカーになる監査対象ではない。生成後画像の目視確認は必要な場合だけ任意で行う。

## 検証コマンド

```powershell
npm run gate:prompt-pack
npm run test:script-prompt-pack-evidence
```
