// ゆっくり / ずんだもん 解説の画像生成における image_direction メタの正本スキーマ。
// このモジュールは run-codex-imagegen-pwsh.mjs / audit-image-prompts.mjs /
// validate-image-direction.mjs から共通で参照される。

export const VISUAL_TYPES = [
  'hook_poster',
  'boke_visual',
  'tsukkomi_visual',
  'myth_vs_fact',
  'danger_simulation',
  'before_after',
  'three_step_board',
  'checklist_panel',
  'ranking_board',
  'ui_mockup_safe',
  'flowchart_scene',
  'contrast_card',
  'meme_like_diagram',
  'mini_story_scene',
  'final_action_card',
];

export const COMPOSITION_TYPES = [
  'smartphone_closeup',
  'diagonal_flow',
  'product_shot',
  'three_cards',
  'split_danger_safe',
  'security_visual',
  'consultation_flow',
  'before_after_split',
  'ranking_podium',
  'flow_chart_horizontal',
  'flow_chart_vertical',
  'isometric_scene',
  'desk_top_down',
  'character_silhouette_avoid',
  'mid_hook_zoom',
];

export const SCENE_EMOTIONS = [
  '焦り',
  '驚き',
  '納得',
  '危険',
  '安心',
  '怒り',
  '混乱',
  '希望',
  '皮肉',
  'ワクワク',
];

export const DIALOGUE_ROLES = [
  '冒頭フック',
  'ボケ補強',
  'ツッコミ補強',
  '誤解訂正',
  '危険喚起',
  '比較提示',
  '手順提示',
  '中盤再フック',
  'まとめ',
  '最終行動',
];

export const REQUIRED_DIRECTION_FIELDS = [
  'scene_id',
  'dialogue_role',
  'scene_emotion',
  'visual_type',
  'composition_type',
  'image_should_support',
  'key_visual_sentence',
  'main_subject',
  'foreground',
  'midground',
  'background',
  'color_palette',
  'text_strategy',
  'layout_safety',
  'must_not_include',
  'quality_bar',
];

export const IMAGEGEN_PROMPT_REQUIRED_KEYWORDS = [
  '前景',
  '中景',
  '背景',
  '下部',
  '20',
  '禁止',
];

export const FORBIDDEN_PROMPT_PATTERNS = [
  /白背景に中央(の|に|アイコン|単独)/,
  /中央にアイコンだけ/,
  /中央にシンプルなアイコン/,
  /汎用的なアイコン/,
  /どの(動画|シーン)でも使える/,
];

export const REQUIRED_MUST_NOT_INCLUDE_TERMS = [
  '実在',
  '既存キャラ',
  '長文',
];

export function validateImageDirection(direction, sceneId) {
  const issues = [];
  if (!direction || typeof direction !== 'object') {
    return [{level: 'error', sceneId, field: '_root', message: 'image_direction が存在しない'}];
  }

  for (const field of REQUIRED_DIRECTION_FIELDS) {
    const value = direction[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      issues.push({level: 'error', sceneId, field, message: `必須フィールドが欠けている: ${field}`});
    }
  }

  if (direction.visual_type && !VISUAL_TYPES.includes(direction.visual_type)) {
    issues.push({level: 'error', sceneId, field: 'visual_type', message: `不正な visual_type: ${direction.visual_type}`});
  }
  if (direction.composition_type && !COMPOSITION_TYPES.includes(direction.composition_type)) {
    issues.push({level: 'error', sceneId, field: 'composition_type', message: `未登録の composition_type: ${direction.composition_type}`});
  }

  const ts = direction.text_strategy;
  if (ts && typeof ts === 'object') {
    if (typeof ts.image_text_max_words !== 'number') {
      issues.push({level: 'error', sceneId, field: 'text_strategy.image_text_max_words', message: 'image_text_max_words が数値で指定されていない'});
    } else if (ts.image_text_max_words > 3) {
      issues.push({level: 'error', sceneId, field: 'text_strategy.image_text_max_words', message: `画像内文字は最大3語まで: 現在 ${ts.image_text_max_words}`});
    }
    if (ts.image_text_allowed === undefined) {
      issues.push({level: 'warn', sceneId, field: 'text_strategy.image_text_allowed', message: 'image_text_allowed が未設定'});
    }
  } else {
    issues.push({level: 'error', sceneId, field: 'text_strategy', message: 'text_strategy オブジェクトが存在しない'});
  }

  const ls = direction.layout_safety;
  if (ls && typeof ls === 'object') {
    if (ls.keep_bottom_20_percent_empty !== true) {
      issues.push({level: 'error', sceneId, field: 'layout_safety.keep_bottom_20_percent_empty', message: '下部20%の余白フラグが true ではない'});
    }
    if (ls.avoid_character_area !== true) {
      issues.push({level: 'error', sceneId, field: 'layout_safety.avoid_character_area', message: 'キャラ表示エリア回避フラグが true ではない'});
    }
    if (ls.avoid_sub_area_overlap === false) {
      issues.push({level: 'error', sceneId, field: 'layout_safety.avoid_sub_area_overlap', message: 'サブ枠との重複回避フラグが false'});
    } else if (ls.avoid_sub_area_overlap === undefined) {
      issues.push({level: 'warn', sceneId, field: 'layout_safety.avoid_sub_area_overlap', message: 'avoid_sub_area_overlap が未設定'});
    }
  } else {
    issues.push({level: 'error', sceneId, field: 'layout_safety', message: 'layout_safety オブジェクトが存在しない'});
  }

  if (Array.isArray(direction.must_not_include)) {
    const joined = direction.must_not_include.join(' ');
    for (const term of REQUIRED_MUST_NOT_INCLUDE_TERMS) {
      if (!joined.includes(term)) {
        issues.push({level: 'warn', sceneId, field: 'must_not_include', message: `must_not_include に "${term}" 関連の禁止が見当たらない`});
      }
    }
  } else {
    issues.push({level: 'error', sceneId, field: 'must_not_include', message: 'must_not_include は配列で指定する'});
  }

  return issues;
}

export function validateImagegenPromptString(promptText, sceneId) {
  const issues = [];
  if (typeof promptText !== 'string' || promptText.trim().length === 0) {
    return [{level: 'error', sceneId, field: 'imagegen_prompt', message: 'imagegen_prompt が空'}];
  }
  if (promptText.length < 200) {
    issues.push({level: 'warn', sceneId, field: 'imagegen_prompt', message: `imagegen_prompt が短すぎる (${promptText.length} 文字、推奨 250 文字以上)`});
  }
  if (promptText.length > 1200) {
    issues.push({level: 'warn', sceneId, field: 'imagegen_prompt', message: `imagegen_prompt が長すぎる (${promptText.length} 文字、推奨 600 文字以下)`});
  }
  for (const kw of IMAGEGEN_PROMPT_REQUIRED_KEYWORDS) {
    if (!promptText.includes(kw)) {
      issues.push({level: 'error', sceneId, field: 'imagegen_prompt', message: `imagegen_prompt に必須キーワード "${kw}" が含まれない`});
    }
  }
  for (const pat of FORBIDDEN_PROMPT_PATTERNS) {
    if (pat.test(promptText)) {
      issues.push({level: 'error', sceneId, field: 'imagegen_prompt', message: `imagegen_prompt に禁止パターン ${pat} が含まれる（白背景中央アイコン化の兆候）`});
    }
  }
  if (!/Remotion/i.test(promptText)) {
    issues.push({level: 'warn', sceneId, field: 'imagegen_prompt', message: 'imagegen_prompt に Remotion 重ね用余白の言及がない'});
  }
  return issues;
}

export function checkVisualTypeDistribution(directions) {
  const issues = [];
  if (!Array.isArray(directions) || directions.length < 2) return issues;
  for (let i = 1; i < directions.length; i += 1) {
    const prev = directions[i - 1];
    const curr = directions[i];
    if (prev?.visual_type && curr?.visual_type && prev.visual_type === curr.visual_type) {
      issues.push({
        level: 'error',
        sceneId: curr.scene_id || `idx_${i}`,
        field: 'visual_type',
        message: `visual_type が前シーンと同じ (${curr.visual_type})。連続使用は禁止`,
      });
    }
  }
  return issues;
}

export function summarizeIssues(issues) {
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  return {
    total: issues.length,
    errors: errors.length,
    warns: warns.length,
    errorList: errors,
    warnList: warns,
  };
}
