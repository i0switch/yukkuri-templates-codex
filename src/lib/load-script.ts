export type DialogueSpeaker = 'left' | 'right';
export type SceneRole = 'intro' | 'hook' | 'body' | 'cta' | 'outro';
export type ContentKind = 'text' | 'bullets' | 'image';
export type TypographyFamily = 'gothic' | 'mincho';

export interface TypographyConfig {
  subtitle_family?: TypographyFamily;
  content_family?: TypographyFamily;
  title_family?: TypographyFamily;
  subtitle_stroke_color?: string;
  subtitle_stroke_width?: number;
  content_stroke_color?: string;
  content_stroke_width?: number;
  title_stroke_color?: string;
  title_stroke_width?: number;
}

export interface ImageAssetRequirements {
  description?: string;
  imagegen_prompt?: string;
  image_direction?: ImageDirection;
  visual_type?: VisualType;
  supports_dialogue?: string[];
  supports_moment?: string;
  style?: string;
  aspect?: string;
  negative?: string;
  scene_goal?: string;
  template_slot?: 'main' | 'sub' | 'chapter' | 'comparison' | 'summary';
  visual_tone?: string;
  composition?: string;
  spacing?: string;
}

export type VisualType =
  | 'hook_poster'
  | 'boke_visual'
  | 'tsukkomi_visual'
  | 'myth_vs_fact'
  | 'danger_simulation'
  | 'before_after'
  | 'three_step_board'
  | 'checklist_panel'
  | 'ranking_board'
  | 'ui_mockup_safe'
  | 'flowchart_scene'
  | 'contrast_card'
  | 'meme_like_diagram'
  | 'mini_story_scene'
  | 'final_action_card';

export interface ImageDirection {
  scene_id?: string;
  dialogue_role?: string;
  scene_emotion?: string;
  visual_type?: VisualType;
  composition_type?: string;
  image_should_support?: string;
  key_visual_sentence?: string;
  main_subject?: string;
  secondary_subjects?: string[];
  foreground?: string;
  midground?: string;
  background?: string;
  color_palette?: string;
  text_strategy?: {
    image_text_allowed?: boolean;
    image_text_max_words?: number;
    image_text_examples?: string[];
  };
  layout_safety?: {
    keep_bottom_20_percent_empty?: boolean;
    avoid_character_area?: boolean;
    avoid_sub_area_overlap?: boolean;
  };
  must_not_include?: string[];
  quality_bar?: string;
}

export interface VisualAssetPlan {
  required?: boolean;
  slot: 'main' | 'sub' | 'chapter' | 'comparison' | 'summary';
  purpose: string;
  image_role?: '理解補助' | '不安喚起' | '笑い' | '比較' | '手順整理' | '証拠提示' | 'オチ補助';
  composition_type?:
    | 'NG / OK 比較'
    | '失敗例シミュレーション'
    | '誇張図解'
    | '証拠写真風'
    | 'チェックリスト'
    | '手順図'
    | '原因マップ'
    | 'ビフォーアフター'
    | 'ツッコミ待ち構図'
    | '事故寸前構図';
  supports_dialogue?: string[];
  supports_moment?: string;
  visual_type?: VisualType;
  image_direction?: ImageDirection;
  insert_timing?: string;
  asset?: string;
  imagegen_prompt?: string;
  audit_points?: string[];
}

export interface SceneTextContent {
  kind: 'text';
  text: string;
}

export interface SceneBulletContent {
  kind: 'bullets';
  items: string[];
}

export interface SceneImageContent {
  kind: 'image';
  asset: string;
  caption?: string;
  asset_requirements?: ImageAssetRequirements;
}

export type SceneContent = SceneTextContent | SceneBulletContent | SceneImageContent;

export interface DialogueLine {
  id: string;
  speaker: DialogueSpeaker;
  text: string;
  expression?: string;
  emphasis?: {
    words: string[];
    style: 'punch' | 'danger' | 'surprise' | 'number' | 'action';
    se: 'pop' | 'warning' | 'question' | 'reveal' | 'success' | 'fail' | 'none';
    pause_after_ms: 0 | 200 | 300 | 500;
  };
  typography?: Pick<TypographyConfig, 'subtitle_family' | 'subtitle_stroke_color' | 'subtitle_stroke_width'>;
  pre_pause_sec?: number;
  post_pause_sec?: number;
  wav_sec?: number;
  start_sec?: number;
  end_sec?: number;
}

export interface EpisodeScene {
  id: string;
  role: SceneRole;
  motion_mode: 'normal' | 'punch' | 'compare' | 'warning' | 'checklist' | 'reveal' | 'recap';
  scene_goal?: string;
  viewer_question?: string;
  visual_role?: string;
  visual_asset_plan?: VisualAssetPlan[];
  typography?: TypographyConfig;
  title_text?: string;
  main: SceneContent;
  sub?: SceneContent | null;
  dialogue: DialogueLine[];
  duration_sec: number;
  tail_pad_sec?: number;
}

export interface EpisodeMeta {
  id: string;
  title: string;
  layout_template: string;
  pair: string;
  fps: number;
  width: number;
  height: number;
  audience: string;
  tone: string;
  bgm_mood: string;
  voice_engine: string;
  target_duration_sec: number;
  image_style?: string;
  typography?: TypographyConfig;
}

export interface EpisodeCharacter {
  character: string;
  voicevox_speaker_id?: number;
  aquestalk_preset?: string;
  speaking_style?: string;
}

export interface EpisodeRenderData {
  meta: EpisodeMeta;
  characters: {
    left: EpisodeCharacter;
    right: EpisodeCharacter;
  };
  bgm?: {
    source_url?: string;
    file: string;
    license?: string;
    volume: number;
    fade_in_sec: number;
    fade_out_sec: number;
  };
  scenes: EpisodeScene[];
  total_duration_sec: number;
  public_dir: string;
  base_layout_width: number;
  base_layout_height: number;
}

export const loadEpisodeRenderData = (raw: unknown) => raw as EpisodeRenderData;











