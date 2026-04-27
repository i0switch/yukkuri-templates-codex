# script_prompt_pack_template_analysis

- source_prompt: _reference/script_prompt_pack/02_template_analysis_prompt.md
- selected_template: Scene10
- pair: ZM
- main_content: 16:9 generated image per scene
- sub_content: text or bullets required for every scene
- subtitle_area: Remotion subtitles; dialogue text remains natural utterance units
- character_layout: ZM pair
- avoid_area: keep important visual information away from character and subtitle zones

Scene10 is selected because this topic benefits from a persistent sub frame for checklists, warnings, NG/OK contrast, and final actions while main remains image-only. Every scene receives a distinct sub payload and a generated main visual. The template is used once at meta.layout_template only; scenes[].scene_template and meta.scene_template are not used.

## scene fit

- s01: 空き容量ゼロは写真だけのせいじゃない / main image: Smartphone storage nearly full warning, photos, chat cache bubbles, app boxes growing, clean Japanese explainer style, no real UI. / sub: 容量ゼロで撮影失敗、写真だけが犯人ではない、キャッシュも膨らむ、今日消す順番を決める
- s02: まず容量ランキングを見る / main image: Generic phone storage ranking with five large colored bars, magnifying glass, no real app names or UI, bright tidy design. / sub: 設定で容量ランキング、上位5個だけ見る、小物消しは後回し、大物ほど効果大
- s03: 動画は一撃で数GBを食べる / main image: Large video files as heavy boxes on a phone, one labeled 4K, cloud backup icon nearby, caution sign, no brand. / sub: 4K動画は重い、送信済み動画も確認、バックアップ前に消さない、長尺から見直す
- s04: チャットのキャッシュが静かに太る / main image: Chat bubbles turning into storage boxes, cache sponge absorbing data, simple icons, no app logos, clean white green style. / sub: キャッシュは一時データ、写真・動画添付が残る、アプリ内設定を確認、トーク削除は慎重
- s05: 犯人は写真ではなくアプリかもしれない / main image: A phone with oversized app blocks pushing photos aside, storage scale tipping toward apps, warning but playful illustration. / sub: アプリ本体＋データ、ゲームは特に重い、使わないアプリを確認、削除前にログイン情報
- s06: クラウド同期中に消すと事故る / main image: Phone and cloud connected by arrows, one wrong delete path marked caution, backup progress bar, no real service logos. / sub: 同期中は待つ、本体のみ削除を確認、クラウド側削除に注意、復元期限も見る
- s07: 消していい順番は安全な順にする / main image: Five-step staircase for safe storage cleanup, downloads trash, cache broom, duplicate videos, unused app, photos protected at top. / sub: 1: 不要ダウンロード、2: キャッシュ、3: 重複動画、4: 未使用アプリ、5: 写真は最後
- s08: 自動ダウンロードを止める / main image: Automatic download conveyor belt feeding a phone storage box, a pause switch, clean settings-themed illustration without real UI. / sub: 自動保存を確認、動画の自動DLを止める、高画質保存を見直す、月1回だけ点検
- s09: 今日の10分チェック / main image: Ten-minute timer, phone storage checklist, five highlighted steps, friendly productivity illustration, no dense text. / sub: 容量ランキングを見る、上位5個をメモ、不要DLを削除、キャッシュ整理、バックアップ確認
- s10: 買い替え前に確認すること / main image: Forked road: cleanup first vs buying new phone, phone breathing with free space, shopping cart waiting, no brand. / sub: 本体劣化とは限らない、容量不足で重くなる、整理後に再確認、買い替えは最後
- s11: 最終行動は容量ランキングを開く / main image: Final friendly storage dashboard with top five blocks, protected photos folder, comment bubbles, clean ending card style no dense text. / sub: 今日の行動: 容量ランキング、見るのは上位5個、写真削除は最後、見つけた大物を共有
