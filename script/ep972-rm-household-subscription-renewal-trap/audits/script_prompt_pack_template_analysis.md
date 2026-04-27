# script_prompt_pack_template_analysis

- source_prompt: _reference/script_prompt_pack/02_template_analysis_prompt.md
- selected_template: Scene14
- pair: RM
- main_content: 16:9 generated image per scene
- sub_content: text or bullets required for every scene
- subtitle_area: Remotion subtitles; dialogue text remains natural utterance units
- character_layout: RM pair
- avoid_area: keep important visual information away from character and subtitle zones

Scene14 is selected because this topic benefits from a persistent sub frame for checklists, warnings, NG/OK contrast, and final actions while main remains image-only. Every scene receives a distinct sub payload and a generated main visual. The template is used once at meta.layout_template only; scenes[].scene_template and meta.scene_template are not used.

## scene fit

- s01: 月580円が年6,960円に化ける / main image: A neat Japanese household desk with a credit card statement, calendar renewal marks, small coins piling up, no logos, no real UI. / sub: 月580円でも年6,960円、無料体験は更新日が本番、明細名は分かりにくい、今日見るのは3か所
- s02: 無料体験は終わった後が本番 / main image: Calendar pages showing a free trial ending, a sleepy phone notification hidden under many emails, simple explainer style. / sub: 登録日は覚える、終了日は忘れる、通知メールは埋もれる、初月無料ほど油断
- s03: 明細名が知らない会社名になる罠 / main image: Abstract credit card statement with blurred merchant names, magnifying glass over date and amount, clean Japanese explainer graphic. / sub: 明細名≠サービス名、決済代行名で出る、家族利用も混ざる、検索は金額＋日付
- s04: 家族アカウントで犯人が迷子になる / main image: Family shared devices on a table, one billing thread connecting card, tablet, and streaming icon-like generic tiles, no brand logos. / sub: 家族カードを確認、共有IDの購入履歴、子どものアプリ課金、責める前に証拠
- s05: 犯人は高額請求より毎月の小銭 / main image: Five small monthly charges stacking into a large yearly total, bold simple number blocks, no dense text, warning but friendly style. / sub: 高額より少額反復、300円×5個で月1,500円、年なら18,000円、気づきにくさが本体
- s06: 明細チェックは3分類で止める / main image: Three labeled trays on a desk: keep, cancel candidate, unknown investigation, Japanese labels short, tidy finance checklist. / sub: 必要: 使っている、停止候補: 使ってない、不明: 金額＋日付で検索、保留は1週間だけ
- s07: 解約前にスクショを残す理由 / main image: Phone screen abstract cancellation confirmation, screenshot frame, check marks, calendar date circled, no real UI or brand. / sub: 契約画面を保存、次回更新日を保存、解約完了メールを保存、問い合わせ先も控える
- s08: 二重請求に見える一時保留もある / main image: Two similar charge cards, one marked pending and one confirmed with neutral icons, clock symbol showing processing delay. / sub: 仮売上の可能性、締め日のズレ、返金処理の時差、不明ならカード会社へ
- s09: 今日やる15分の整理手順 / main image: A 15-minute timer beside a credit card statement checklist with five simple steps, warm desk lighting, no real brands. / sub: 1: 明細を3か月表示、2: 同額反復を丸付け、3: メール検索、4: 停止候補を解約、5: 来月確認
- s10: 最終行動は明細を三か月だけ開く / main image: Final checklist on a cozy desk: three months, repeated amount, screenshot, next month check; celebratory but calm finance cleanup. / sub: 今日の行動: 三か月明細、探す: 同額の繰り返し、残す: 解約スクショ、来月: 消えたか確認
