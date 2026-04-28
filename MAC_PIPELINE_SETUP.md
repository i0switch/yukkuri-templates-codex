# Mac版パイプライン構築手引き

この手引きは、Mac上で `yukkuri-templates Codex` の動画生成パイプラインを動かすための入口。
成果物、順序、停止条件、完了条件は `docs/pipeline_contract.md` を正本にする。

## 先に結論

- ZM / ずんだもん動画は、VOICEVOX Engine を起動できればMacで構築しやすい。
- RM / ゆっくり動画は、現状の音声生成が Windows 用 `AquesTalkPlayer.exe` 前提なので、Macネイティブでは追加対応が必要。
- ユーザーが解像度を指定しない限り、`script.yaml` は `meta.width: 1920`、`meta.height: 1080` にする。
- `script_final.md` のレビューがPASSするまで、YAML化、画像生成、音声生成、renderへ進まない。
- gate、MP4、video audit PASS が揃うまで完成扱いしない。

## 前提環境

推奨:

```bash
node --version
npm --version
git --version
ffmpeg -version
ffprobe -version
```

足りない場合:

```bash
brew install node git ffmpeg
```

依存関係:

```bash
npm ci
```

Remotion は `package.json` の依存で入るため、基本は `npx remotion ...` または `npm run ...` 経由で実行する。

## VOICEVOX Engine

ZM動画では VOICEVOX Engine が必要。

確認先:

```bash
curl http://127.0.0.1:50021/version
```

別URLで起動している場合:

```bash
export VOICEVOX_BASE_URL="http://127.0.0.1:50021"
```

ZMの `script.yaml` は次の整合を守る。

```yaml
meta:
  pair: ZM
  voice_engine: voicevox
characters:
  left:
    character: zundamon
    voicevox_speaker_id: 3
  right:
    character: metan
    voicevox_speaker_id: 2
```

## RM / AquesTalk の注意

現状の `scripts/aquestalk.mjs` は Windows 用 `AquesTalkPlayer.exe` を直接呼ぶ。
そのためMacでは、RM動画の音声生成はそのままでは通らない。

MacでRMを通す選択肢:

1. Windows環境でRM音声を生成して、生成済み `script/{episode_id}/audio/` と `audio-manifest.json` をMac側へ持ち込む
2. Wine等で `AquesTalkPlayer.exe` を実行できるようにしたうえで、`AQUESTALKPLAYER_PATH` を設定する
3. Mac対応のAquesTalk音声アダプタを別途実装し、`scripts/aquestalk.mjs` の呼び出し先を差し替える

未対応のままRMを `build:episode` / `render:episode` へ進めると、AquesTalk実行ファイル未検出で止まる。

RMの `script.yaml` は次の整合を守る。

```yaml
meta:
  pair: RM
  voice_engine: aquestalk
```

`aquestalk_preset` は render 前に `女性１` / `まりさ` へ正規化されている必要がある。

## 最初に読むファイル

通常の新規episode生成では、最初に次を読む。

```text
docs/pipeline_contract.md
docs/agent_fast_path.md
_reference/script_prompt_pack/00_MASTER_SCRIPT_RULES.md
RMなら _reference/script_prompt_pack/local_canonical/yukkuri_master.md
ZMなら _reference/script_prompt_pack/local_canonical/zundamon_master.md
選択テンプレートに必要な templates/scene-XX_*.md
```

キャラペアが未確定なら、先に `_reference/script_prompt_pack/01_input_normalize_prompt.md` で確定してから、対応するローカル正本だけを読む。

## 成果物の順序

1 episode の正準順序:

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
`script.yaml` はレンダー入力であり、台本の正本ではない。

## 実行コマンド

`<episode_id>` を対象IDに置き換える。

尺推定:

```bash
npm run estimate:episode-duration -- <episode_id>
```

軽量preflight:

```bash
npm run preflight:episode -- <episode_id>
```

画像生成対象の確認:

```bash
npm run imagegen:episode -- <episode_id> --dry-run
```

画像生成:

```bash
npm run imagegen:episode -- <episode_id> --parallel=3
```

失敗分だけ再試行:

```bash
npm run imagegen:episode -- <episode_id> --retry-failed
```

画像台帳の同期確認:

```bash
npm run sync:imagegen-ledger -- <episode_id> --check
```

BGM選定:

```bash
npm run prepare:bgm -- <episode_id>
```

pre-render gate:

```bash
npm run gate:episode -- <episode_id>
```

音声とrender用JSON生成:

```bash
npm run build:episode -- <episode_id>
```

MP4 render:

```bash
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
```

video audit:

```bash
npm run audit:video -- <episode_id>
```

一時スクリプト確認:

```bash
npm run check:cleanup
```

## 差分再生成

音声だけ強制再生成:

```bash
npm run build:episode -- <episode_id> --force-audio
```

Remotion本レンダーだけ強制再実行:

```bash
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4 --force-render
```

BGM、音声、Remotion本レンダーをまとめて再実行:

```bash
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4 --force
```

画像生成は外部/imagegen工程なので、`--force` では画像そのものは再生成されない。
画像を差し替える場合は `imagegen:episode --only=sNN` や `--force` を意図的に使う。

## 完了条件

完成扱いできるのは次が揃ったときだけ。

- `script_final.md` が存在する
- `audits/script_final_review.md` が存在し、現在の `script_final.md` のsha256と一致する
- `script_final_review.md` の verdict が PASS
- `script.yaml` に `meta.layout_template` がある
- 画像は `meta.json` と `imagegen_manifest.json` の台帳が揃っている
- `npm run gate:episode -- <episode_id>` がPASS
- `out/videos/<episode_id>.mp4` が存在する
- `npm run audit:video -- <episode_id>` がPASS

## よくある停止理由

VOICEVOXに接続できない:

```bash
curl http://127.0.0.1:50021/version
export VOICEVOX_BASE_URL="http://127.0.0.1:50021"
```

RMでAquesTalkが見つからない:

```bash
export AQUESTALKPLAYER_PATH="/path/to/AquesTalkPlayer.exe"
```

ただしMacネイティブでは `AquesTalkPlayer.exe` 前提のままなので、Wine等の実行環境か音声アダプタ対応が必要。

画像台帳で止まる:

```bash
npm run sync:imagegen-ledger -- <episode_id>
npm run sync:imagegen-ledger -- <episode_id> --check
```

gateで `script_final_review` が stale:

```bash
shasum -a 256 script/<episode_id>/script_final.md
```

現在のhashで `script/{episode_id}/audits/script_final_review.md` を再作成する。

尺が短すぎる:

- 音声速度を変えない
- `script_final.md` に不足分だけ自然な会話を補完する
- 補完後に `script_final_review.md` を再作成する

尺が長すぎる:

- 自然尺を優先する
- 尺合わせ目的で削除、短文化、要約、圧縮しない
- 品質理由の局所修正だけ許可する

## Macでまず通す最小ルート

Mac初回検証は、ZM episode から始めるのが安全。

```bash
npm ci
curl http://127.0.0.1:50021/version
npm run estimate:episode-duration -- <episode_id>
npm run preflight:episode -- <episode_id>
npm run imagegen:episode -- <episode_id> --dry-run
npm run imagegen:episode -- <episode_id> --parallel=3
npm run sync:imagegen-ledger -- <episode_id> --check
npm run prepare:bgm -- <episode_id>
npm run gate:episode -- <episode_id>
npm run build:episode -- <episode_id>
npm run render:episode -- <episode_id> out/videos/<episode_id>.mp4
npm run audit:video -- <episode_id>
npm run check:cleanup
```

RMはAquesTalk対応が終わってから同じルートに乗せる。
