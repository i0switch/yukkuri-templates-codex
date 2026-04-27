# yaml

使用prompt: 10_yaml_prompt.md

episode_id: ep970-rm-usb-cable-fire-risk

script_final.md の自然な発話単位を維持して script.yaml に変換した。dialogue[].text はコンポーネントへ直書きせず YAMLを正本にする。meta.layout_template は Scene02 のみを使い、scenes[] は時間ブロックとして扱う。main.kind は image、sub は全10シーンで kind=bullets（4〜6項目）、visual_asset_plan[].imagegen_prompt と main.asset_requirements.imagegen_prompt は同一内容にした。

motion_mode設定: s01=warning、s02=checklist、s03=warning、s04=punch、s05=reveal（中盤再フック）、s06=checklist、s07=checklist、s08=checklist、s09=compare、s10=recap。

emphasis設定:
- s01: l01（霊夢）に emphasis.words=[「発火事故」]、style=danger、se=warning、pause_after_ms=300
- s05: l03（霊夢L3リアクション）に emphasis.words=[「PSEなし」]、style=danger、se=warning、pause_after_ms=300
- s10: l01（霊夢まとめ）に emphasis.words=[「被覆に触れてみてくれ」]、style=highlight、se=chime、pause_after_ms=200

audio_playback_rateは設定しない（音声速度変更禁止ルール準拠）。pair=RM、voice_engine=aquestalk、bgmブロック含む。scenes[].scene_templateおよびmeta.scene_templateは使用禁止を維持した。sub: nullはScene02では使用しない。

この証跡は、指定prompt packを使った判断過程と採用理由を残すためのもの。本文は既存script/配下の台本から転記せず、今回のテーマ、視聴者、テンプレート、品質基準に合わせて新規生成した。既存episodeの構造はファイル配置とschema確認だけに使い、本文、比喩、言い回し、シーンタイトル、ネタは流用していない。監査で再確認しやすいよう、採用理由と禁止事項への対応を明文化して残す。
