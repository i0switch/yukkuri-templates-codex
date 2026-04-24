export type DialogueSpeaker = 'left' | 'right';
export type SceneRole = 'intro' | 'hook' | 'body' | 'cta' | 'outro';
export type ContentKind = 'text' | 'bullets' | 'image';

export interface ImageAssetRequirements {
  description?: string;
  imagegen_prompt?: string;
  style?: string;
  aspect?: string;
  negative?: string;
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
  pre_pause_sec?: number;
  post_pause_sec?: number;
  wav_sec?: number;
  start_sec?: number;
  end_sec?: number;
}

export interface EpisodeScene {
  id: string;
  scene_template: string;
  role: SceneRole;
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
