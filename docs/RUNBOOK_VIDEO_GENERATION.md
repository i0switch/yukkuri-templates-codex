# Video Generation Runbook

動画生成時の短い実行順。詳細ルールは `docs/pipeline_contract.md` を正本にする。

```text
plan
-> draft
-> final
-> review
-> yaml
-> estimate
-> imagegen
-> image audit (optional)
-> gate
-> render
-> video audit
```

## Commands

```powershell
npm run estimate:episode-duration -- <episode_id>
npm run gate:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
npm run audit:video -- <episode_id>
```

`python scripts/run_pipeline.py --episode script/<episode_id> --dry-run` は参考/skeleton。完成判定は Node gate、render、video audit を正本にする。

## Stop Points

- `script_final_review.md` の `script_final_sha256` が現在の `script_final.md` と一致しない場合は再レビューする
- 推定自然音声尺が `target_duration_sec` の90〜110%から外れる場合は、音声速度ではなく台本量を直す
- imagegen画像は `meta.json` と `imagegen_manifest.json` の両方に provenance を残す
