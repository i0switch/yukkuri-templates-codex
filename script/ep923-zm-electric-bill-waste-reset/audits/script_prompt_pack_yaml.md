# yaml

使用prompt: 10_yaml_prompt.md
episode_id: ep923-zm-electric-bill-waste-reset

script_final.md から script.yaml を生成。meta.layout_template は Scene02。meta.scene_template と scenes[].scene_template は未使用。main.kind は全scene image、sub は全scene null。dialogue[].text は script_final.md の自然な発話単位を維持し、表示都合の機械分割はしていない。visual_asset_plan[].imagegen_prompt は対象シーン全文と固定文、作風指定を含む。画像参照は assets/sNN_main.png の相対パスに統一し、BGMは select-bgm 工程で bgm/track.mp3 として追記する前提。meta.json には画像10枚の台帳を先に作り、imagegen 実行後に実ファイルと生成元を確認する。
