# template

- episode_id: ep952-rm-browser-extension-permission-trap
- prompt pack source: 02_template_analysis_prompt.md

template_analysis:
  layout_template: Scene02
  template_file: templates/scene-02_gray-3panel.md
  main_content:
    exists: true
    role: 16:9 image insert
  sub_content:
    exists: true
    sub_required: true
    sub_content_style: bullets
    role_if_exists: 3項目チェック、注意点、現在地
  subtitle_area:
    exists: true
    narrow: false
  character_layout: edge
  image_prompt_safety:
    keep_bottom_20_percent_empty: true
    avoid_character_area: true
  script_rules:
    sub_policy: 全シーン bullets
    dialogue_policy: script_finalの自然発話単位を維持
