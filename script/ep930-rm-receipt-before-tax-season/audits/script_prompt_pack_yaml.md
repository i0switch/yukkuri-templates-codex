# script_prompt_pack_yaml.md

source_prompt: 10_yaml_prompt.md

## 変換対象

- input: script_final.md
- output: script.yaml
- episode_id: ep930-rm-receipt-before-tax-season
- layout_template: Scene02
- pair: RM
- scene_count: 10
- dialogue_count: 100

## 変換方針

script_final.md の自然な発話単位を維持して、dialogue[].text へ移した。表示都合の機械分割はしていない。meta.scene_template と scenes[].scene_template は生成していない。テンプレートは meta.layout_template の1か所だけに固定した。

main.kind は全シーン image のみ。main.asset は assets/sNN_main.png に統一した。sub は今回のレンダー契約安定と Main Content Render Rule を優先して全シーン null にした。説明テキスト、箇条書き、画像キャプション、remotion_card_plan は生成していない。

visual_asset_plan[].imagegen_prompt には対象シーンの会話全文、固定プロンプト、台本全体から判断した画像雰囲気を入れた。会話全文を画像内文字として描かせる指示は入れていない。下部20%余白、実在ブランド、実在UI、既存キャラクター、長文日本語、細かい表、ウォーターマーク禁止を明記した。

## 判定

PASS。YAML化で台本の順序、ボケ、ツッコミ、中盤再フック、最後の具体行動を消していない。
