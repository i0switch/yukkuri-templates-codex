# script_prompt_pack_final_episode_audit.md

使用元: _reference/script_prompt_pack/11_final_episode_audit.md

## Result

PASS

## Evidence

script_final.md はCodexレビュー済み（PASS）。script_final_review.md に記録あり（134発話・11シーン・L3リアクション4箇所）。YAMLはschema validationで0 issues。codex-imagegen スキルを使用し Codex CLIで各scene 1プロセス1画像として11枚を生成し、meta.jsonのsource_urlを`codex://generated_images/...`へ記録した。BGM source_url は DOVA-SYNDROME (ep950用: detail/22683)。gate/build/renderは最終コマンドで実行する。

## Episode

ep950-rm-wifi-slow-fix

## Final script excerpt

```md
s01: 速度を計測したら衝撃だった
- scene_goal: 速度計測で衝撃の結果を提示し、原因はルーター側にあることを示唆する
- 134発話 / 11シーン

s11: 今日やること1つだけ
- 具体行動: ルーターを棚の外に出す→速度計測→前後比較→5GHz切り替え挑戦
```
