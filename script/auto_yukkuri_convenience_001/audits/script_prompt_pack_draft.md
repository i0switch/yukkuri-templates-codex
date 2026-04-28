# Script Prompt Pack Evidence: draft

prompt_file: 04_draft_prompt_yukkuri.md
episode_id: auto_yukkuri_convenience_001
verdict: PASS

## Draft Generation Record

The RM draft was generated from the normalized input, Scene12 template analysis, `00_MASTER_SCRIPT_RULES.md`, and `_reference/script_prompt_pack/local_canonical/yukkuri_master.md` as the single local canonical source for the RM pair.

## Draft Output Files

- `script/auto_yukkuri_convenience_001/script_draft.md`
- `script/auto_yukkuri_convenience_001/script_final.md`

## Character Checks

- 霊夢 is the viewer representative and does not become the expert.
- 霊夢 uses失敗談、言い訳、ボケ、生活実感、行動宣言.
- 魔理沙 is the explainer and frames store design without making stores into villains.
- 魔理沙の「だぜ」は自然な範囲で使い、不自然な `するだぜ` 型はない。

## Structure Checks

- 10 scenes.
- Natural dialogue units are preserved.
- No subtitle-driven mechanical line splitting.
- s01 starts from a concrete loss/あるある: water-only trip becoming a sweets-heavy bag.
- s08 is the midpoint rehook: the culprit is not willpower alone, but the arrangement that increases reasons to buy.
- s10 ends on one concrete action after Codex review fix: decide one intended item before entering the convenience store.

## Scene Coverage

1. s01: ついで買いは設計通り — hook and misconception reversal.
2. s02: 入口からレジまで歩かされる — movement and product contact.
3. s03: 必要品の近くに誘惑がある — adjacent add-on purchases.
4. s04: レジ横は最後の関門 — last-second small-item addition.
5. s05: 限定品が今買う理由を作る — limited-time framing.
6. s06: 小さい金額は痛みが薄い — small purchases accumulating.
7. s07: 空腹と疲れで判断が緩む — state-dependent buying.
8. s08: 意志の弱さだけじゃない — midpoint rehook.
9. s09: カゴを見るだけで戻れる — countermeasure context.
10. s10: 買う物を一つ決める — final action and comment prompt.

## Review Fix Applied

Codex review noted that the final CTA mixed two actions. The script was revised so the final action is consistently `次にコンビニへ入る前に買う物を一つだけ決めること`.

## Self Check

- Unsupported hard claims are softened with `店によって違う`, `なりやすい`, and `見えやすくなる`.
- Existing scripts were not reused.
- No legacy prompt pack files were used.
- No `script_audit.json`, `audit_script_draft.json`, or `script_generation_audit.json` was generated.
