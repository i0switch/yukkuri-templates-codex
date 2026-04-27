# script_prompt_pack_final_episode_audit.md

使用元: _reference/script_prompt_pack/11_final_episode_audit.md

## Result

PASS

## Evidence

script_final.md はCodexレビュー済み（PASS）。script_final_review.md に記録あり（140発話・11シーン・L3リアクション5箇所）。YAMLはschema validationで0 issues。codex-imagegen スキルを使用し Codex CLIで各scene 1プロセス1画像として11枚を生成し、meta.jsonのsource_urlを`codex://generated_images/...`へ記録した。BGM source_url は DOVA-SYNDROME (ep951用: detail/16284)。gate/build/renderは最終コマンドで実行する。

## Episode

ep951-zm-food-expense-trap

## Final script excerpt

```md
s01: 節約してたのに食費が増えていた
- scene_goal: 節約行動が逆効果になっていた衝撃の事実を提示し、3つのトラップがあることを示唆する
- 140発話 / 11シーン

s11: 今週末からやること
- 具体行動: 冷蔵庫確認→メニュー決め→リスト作成→買い物、食費記録の開始
```
