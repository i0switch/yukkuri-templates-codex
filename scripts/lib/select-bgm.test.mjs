import assert from 'node:assert/strict';
import {selectBgmTrack} from './select-bgm.mjs';

const upbeat = await selectBgmTrack({tone: '軽快で実用的', character_pair: 'RM'});
assert.equal(upbeat.id, 'dova-16211');
assert.equal(upbeat.title, 'upbeat step');

const moodOverride = await selectBgmTrack({bgm_mood: 'upbeat', tone: '未登録トーン', character_pair: 'ZM'});
assert.equal(moodOverride.id, 'dova-16211');

const fallback = await selectBgmTrack({tone: '未登録トーン'});
assert.equal(fallback.id, 'dova-16211');

console.log('select-bgm tests passed');
