# Prompt Revision Review (F3)
Date: 2026-04-27

Reviewed: `00_MASTER_SCRIPT_RULES.md`, `03_plan_prompt.md`, `04_draft_prompt_yukkuri.md`, `05_draft_prompt_zundamon.md`
Reference: `examples/example_bad_vs_good_dialogue.md`, `local_canonical/zundamon_master.md`, `local_canonical/yukkuri_master.md`

---

## Q1: Bad/Good pair selection

**04 (RM) — PASS**

4ペア（anti-pattern 1, 2, 7, 8）は `example_bad_vs_good_dialogue.md` から正確に抜粋されている。「なぜダメか」/「何が違うか」の分析は具体的・実行可能（解説役独演、質問だけ、だぜ比率、冒頭型）。問題なし。

**05 (ZM) — PASS WITH NOTE**

anti-pattern 4, 6 はネイティブ ZM 例で問題なし。anti-pattern 5 は RM キャラ（霊夢/魔理沙）の Bad 例に「ずんだもん/めたんに置き換えて読む」注記付き。機能はするが、05 を単独で読んだ LLM には RM キャラがBadに見えてやや一貫性が弱い。ブロッカーではない。

---

## Q2: Ban list coherence

**00「定型句の禁止」vs だぜ/のだ比率ルール — PASS**

禁句リストは特定定型フレーズの「同役割3シーン以上繰り返し」を禁止するもので、語尾そのものの比率ルール（だぜ 30-60%、のだ 20-40%）と対象が異なる。直接衝突なし。

**05 ZM 禁句 vs のだ 20-40% — PASS**

禁止された6フレーズ（「そうなのだ。」「ヤバいのだ？」等）を除いても、動詞活用系の「のだ」（「気づいたのだ」「走るのだ」等）で 20-40% 目標は十分到達可能。語彙の絞り込みすぎにはなっていない。

**めたん語尾ローテーション vs zundamon_master.md — PASS**

05 に追加した6語尾系統（ですわ/ですの/なのです/ということですわ/ますわよ/かしら）は `local_canonical/zundamon_master.md` lines 72-80 と完全一致。「毎文お嬢様口調にしすぎない」慣行とも矛盾しない。

---

## Q3: Prompt size

| ファイル | 推定文字数 | 目標 |
|---|---|---|
| `00_MASTER_SCRIPT_RULES.md` | ~14,500 | 管理可能 |
| `04_draft_prompt_yukkuri.md` | ~11,200 | <14K ✓ |
| `05_draft_prompt_zundamon.md` | ~10,500 | <14K ✓ |

**重複観察（機能上の問題なし、次回クリーンアップ候補）:**

- `mini_punchline` 設計タグ規則: 00/04/05 の3箇所にほぼ同文で記載。重要ルールなので3箇所は許容範囲内だが、04/05 から「00 参照」に切り替えると約80字節約。
- 「つまり〜型は最大2回」ルール: 同じく3箇所。
- 5系統最低4系統ルール: 04/05 の「必須」ブロックと「受け方5系統テンプレ」セクションの両方に記載（最も整理しやすい重複）。

---

## Q4: Humor playbook quality

**全体: PASS — 禁止リストではなく積極的ガイダンスとして機能**

`## ユーモア playbook`（00）はボケ→ツッコミ4リズム例・コールバック・キャラ温度差・「正しいだけ」禁止の4構造で構成。「〜リズム例」と明示されており閉じたリストではなく、過剰制約のリスクは低い。

**キャラ定番小ネタ（最大2個）— 適切**

4キャラ各2例の構成は現実的。コールバック 1-2回/本ルールとも整合している。

**ギャップ1件（低優先）:**

コールバック「3回以上禁止」ルールが 00 の `## ユーモア playbook` に記載されているが、`## セルフ監査` チェックリストに対応する監査項目がない。LLM が自己チェックで確認できない。次回改訂時に「コールバックが3回以上。」を監査リストに追加推奨。

---

## Summary verdict

**PASS WITH NOTES**

本番使用前の高優先対応:

1. **(Minor)** 05 anti-pattern 5 の Bad 例が RM キャラのまま。ZM 版 Bad 例に差し替えるか、「意図的に RM 例を流用」と明記する注記を追加する。
2. **(Low)** `00_MASTER_SCRIPT_RULES.md` の `## セルフ監査` にコールバック回数チェック項目を追加する（1行）。
3. **(Cosmetic)** mini_punchline / つまり型 / 5系統ルールの3点は次回クリーンアップで 04/05 から「→ 00 参照」に変更できる。機能上のブロッカーではない。
