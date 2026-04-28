# Script Prompt Pack Evidence: draft

prompt_file: 05_draft_prompt_zundamon.md
episode_id: auto_zundamon_storage_001
verdict: PASS

## Draft Generation Record

The ZM draft was generated from the normalized input, Scene21 template analysis, `00_MASTER_SCRIPT_RULES.md`, and `_reference/script_prompt_pack/local_canonical/zundamon_master.md` as the single local canonical source for the ZM pair.

## Draft Output Files

- `script/auto_zundamon_storage_001/script_draft.md`
- `script/auto_zundamon_storage_001/script_final.md`

## Character Checks

- ずんだもん is the viewer representative and does not become the expert.
- ずんだもん uses焦り、ボケ、生活実感、驚き、行動宣言.
- 四国めたん is the calm explainer and uses short correction before explanation.
- めたん語尾 is varied: `ですわ`, `ですの`, `のです`, `ますの`, `くださいませ`.
- ずんだもん語尾 is not attached mechanically to every line; `だね`, `じゃん` style equivalents and direct reactions are mixed naturally.

## Structure Checks

- 10 scenes.
- Natural dialogue units are preserved.
- No subtitle-driven mechanical line splitting.
- s01 starts from a visible loss: photos deleted but storage did not open.
- s05 is the midpoint rehook: app-internal temporary data and offline video storage are identified as the hidden main culprit.
- s10 ends on one concrete action: open storage, inspect top apps, safely clean one unnecessary offline/cache item.

## Scene Coverage

1. s01: 写真を消したのに減らない — concrete loss and hook.
2. s02: 容量はアプリ別に太る — app-level storage model.
3. s03: LINEの中に残る写真 — messaging app media blind spot.
4. s04: キャッシュは便利な荷物 — cache as useful but bulky temporary data.
5. s05: 動画アプリのオフライン保存 — midpoint hidden culprit.
6. s06: ダウンロードとスクショの積み重ね — small files accumulating.
7. s07: バックアップ済みでも本体に残る — backup/delete distinction.
8. s08: ストレージ画面で犯人を見る — procedure.
9. s09: 消す前に守るデータ — safety boundary.
10. s10: 上位3アプリだけ見る — final action and comment prompt.

## Self Check

- Unsupported hard claims are softened with `ことがあります`, `ケースによります`, `画質や長さによります`, and `人によります`.
- Existing scripts were not reused.
- No legacy prompt pack files were used.
- No `script_audit.json`, `audit_script_draft.json`, or `script_generation_audit.json` was generated.
