episode_id: ep983-zm-point-card-loss
prompt_source: 08_image_prompt_prompt.md
theme: ポイントカードを増やすほど損する理由
hook: ポイントのために余計な買い物してない？
pair: ZM
layout_template: Scene21
resolution: 1280x720
既存台本流用: なし。ユーザー指定テーマから新規作成。

画像プロンプト生成。script_final.md の対象シーン全文を含め、会話全文を画像内へ並べない。見出しだけを画像内テキストとして指定し、16:9の挿入画像を1 scene 1枚で生成する。画像はmain枠専用で、sub枠やカード文字説明に逃がさない。固定プロンプトには日本語生成、会話再現禁止、キャラ会話シーン禁止、主役1つ、下部余白禁止、Scene見出し必須を入れた。ローカル仮画像やプレースホルダーを正式画像扱いしない前提でimagegen_manifestへつなげる。

判定: PASS
blocking_issues: なし
品質メモ: フック、再フック、今日やる行動が明確で、説明bot化を避けるため各sceneに反応と具体例を入れている。
