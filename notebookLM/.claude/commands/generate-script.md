---
description: テーマから style ごとの台本を生成
argument-hint: テーマ：<自由文> / スタイル：<yukkuri|zundamon|both> [/ 尺：<分>]
---

# /generate-script

1. 引数から `テーマ` `スタイル` `尺` を読む。
2. `workspace/projects/<slug>/` が無ければ `python scripts/init_project.py --title "<title>" --theme "<theme>"` で初期化する。
3. 必ず次を読む。
   - `ゆっくり.txt`
   - `ずんだもん.txt`
   - `templates/yukkuri-template.md`
   - `templates/zundamon-metan-template.md`
   - `templates/asset-marker-spec.md`
   - `config/characters.json`
   - `config/quality-criteria.json`
   - `prompts/script-generation-prompt.md`
4. `request.yaml` と `project_brief.md` を今回の入力に合わせて同期する。
5. 対象 style ごとに `workspace/projects/<slug>/<style>/script/script_v1.md` を生成する。
   - 長尺では 1 枚あたりの情報量を減らし、60〜90 秒ごとに差し替えられる粒度で marker を増やす。
   - 15 分前後なら `FIG` と `SLIDE` を含めて 10〜14 マーカーを目安にする。
6. 生成直後に `python scripts/validate_script.py --script "<script_path>"` を実行する。
7. 合格なら `run_state.json` の `script_generation` を `done` にし、不合格なら修正して再生成する。
8. 完了時は slug、style、script path を短く伝える。
