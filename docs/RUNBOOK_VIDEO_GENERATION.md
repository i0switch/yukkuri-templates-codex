# Video Generation Runbook

動画生成時の短い実行順。詳細ルールは `docs/pipeline_contract.md` を正本にする。

```text
plan
-> draft
-> final
-> review
-> yaml
-> estimate
-> preflight
-> imagegen
-> image audit (optional)
-> gate
-> render
-> video audit
```

## Commands

```powershell
npm run estimate:episode-duration -- <episode_id>
npm run preflight:episode -- <episode_id>
npm run sync:imagegen-ledger -- <episode_id> --check
npm run prepare:bgm -- <episode_id>
npm run gate:episode -- <episode_id>
npm run build:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
npm run audit:video -- <episode_id>
```

`render:episode` は上記の主要工程をまとめて実行するが、差分キャッシュを使う。音声は `audio-manifest.json` の発話入力hashが一致するwavを再利用し、Remotion本レンダーは `render-manifest.json` の入力hashとMP4が一致する場合にskipする。

強制再生成:

```powershell
npm run build:episode -- <episode_id> --force-audio
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4 --force-render
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4 --force
```

`--force` はBGM、音声、Remotionレンダーをまとめて再実行する。画像生成そのものは外部/imagegen工程なので、既存画像の受け入れ台帳とhashで差分判定する。

## Stop Points

- `script_final_review.md` の `script_final_sha256` が現在の `script_final.md` と一致しない場合は再レビューする
- 推定自然音声尺が `target_duration_sec` の下限未満の場合は、音声速度ではなく `07_rewrite_prompt.md` で不足分だけ台本補完する
- 推定自然音声尺が上限を超えた場合は、自然尺を優先してそのまま使う
- imagegen画像は `meta.json` と `imagegen_manifest.json` の両方に provenance を残す
- RM の AquesTalk preset は render 前に `女性１` / `まりさ` へ正規化する
- 完了前に `npm run check:cleanup` で自作一時スクリプト候補を確認する
