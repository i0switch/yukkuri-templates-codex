export type DialogueSpeaker = 'left' | 'right';
export type SceneRole = 'intro' | 'hook' | 'body' | 'cta' | 'outro';
export type ContentKind = 'text' | 'bullets' | 'image';
export type TypographyFamily = 'gothic' | 'mincho';

export interface TypographyConfig {
  subtitle_family?: TypographyFamily;
  content_family?: TypographyFamily;
  title_family?: TypographyFamily;
}

export interface ImageAssetRequirements {
  description?: string;
  imagegen_prompt?: string;
  style?: string;
  aspect?: string;
  negative?: string;
  scene_goal?: string;
  template_slot?: 'main' | 'sub' | 'chapter' | 'comparison' | 'summary';
  visual_tone?: string;
  composition?: string;
  spacing?: string;
}

export interface VisualAssetPlan {
  required?: boolean;
  slot: 'main' | 'sub' | 'chapter' | 'comparison' | 'summary';
  purpose: string;
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
  typography?: Pick<TypographyConfig, 'subtitle_family'>;
  pre_pause_sec?: number;
  post_pause_sec?: number;
  wav_sec?: number;
  start_sec?: number;
  end_sec?: number;
}

export interface EpisodeScene {
  id: string;
  scene_template?: string;
  role: SceneRole;
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
  scene_template?: string;
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











