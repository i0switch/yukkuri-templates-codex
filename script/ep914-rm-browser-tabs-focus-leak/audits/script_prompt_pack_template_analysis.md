# Script Prompt Pack Evidence

- prompt_file: _reference/script_prompt_pack/02_template_analysis_prompt.md
- episode: ep914-rm-browser-tabs-focus-leak
- input_conditions: theme, template, duration, character pair were fixed before generation.

## Output

Scene11（whiteboard-ui）を `meta.layout_template` で1つだけ採用し、`meta.scene_template` と `scenes[].scene_template` は使わないことを確認。main_content はホワイトボード風レイアウトの中央枠で16:9画像を1枚表示し、sub 枠は持たないため `sub: null` で固定する。subtitle_area はテンプレート下部固定で、字幕の折り返し・縮小は Remotion 描画側で吸収する設計のため、`dialogue[].text` は `script_final.md` の自然な発話単位を維持して機械分割しない。title_area はホワイトボードヘッダ部分で、`title_text` を任意で持つが、`main.caption` / `sub.caption` / `main.text` / `sub.text` / `bullets` は使用しない。character_layout は左右下部に霊夢・魔理沙のバストアップ、avoid_area は下部20%（字幕とキャラ）。subtitle_text_required は true。本テンプレートでは、白板風背景に挿入する状況説明ビジュアル（タブの地層、付箋、机の上の整理）が本編コンテンツ画像のメイン素材になり、画像内に会話全文を並べる指示は出さない。画像生成プロンプトには対象シーン全文＋固定文＋作風キーワード（生活空間、PC、付箋、整理）のみを渡し、抽象タグ（hook_type / visual_type / composition_type / supports_*）は混ぜない。

## Verdict

TEMPLATE READY

この証跡は、テンプレート解析を Scene11 で確定したことを残す。レンダー契約（`meta.layout_template` のみ使用、`scenes[].scene_template` 禁止、`main.kind: image` / `sub: null`、`main.caption` 禁止）に整合する。
