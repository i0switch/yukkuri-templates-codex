# template_analysis

使用prompt: 02_template_analysis_prompt.md
episode_id: ep922-rm-ai-scam-mail-guard

template_analysis:
  layout_template: Scene02
  template_file: templates/scene-02_gray-3panel.md
  main_content:
    exists: true
    role: 16:9画像を主役にする
    readable_density: 中密度
    safe_area: 下部20%を空ける
  sub_content:
    exists: true
    canonical_empty_value: null
  subtitle_area:
    exists: true
    narrow: false
    avoid_notes: 下部字幕帯と左右キャラ領域を避ける
  title_area:
    exists: false
    use_title_text: false
  character_layout: edge
  avoid_area: 下部字幕帯、左右キャラ領域
  subtitle_text_required: true
  script_rules:
    sub_policy: 本文コンテンツ枠は画像のみ方針に合わせてsub:null
    dialogue_policy: 自然な発話単位を維持
