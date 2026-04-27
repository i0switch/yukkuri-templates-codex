script_final_sha256: c9135dda820743778dea19e43c3cd2d6b0c419400dfae0bd469861125cad084f

# script_final_review

- review_target: script_final.md
- reviewer: Codex
- verdict: PASS
- human_audit_issue: 冒頭が「強いパスワードを使い回せば楽かな？」から始まり、使い回しの前提説明が不足していた。
- fix_summary: s01冒頭をサイトごとに変える面倒くささから入り、連鎖乗っ取りリスクへ接続する流れに差し替えた。

## 確認結果
- s01最初の3発話の文脈ブリッジ: PASS。パスワードをサイトごとに変える面倒さという日常前提を置いてから連鎖リスクへ入っている。
- 冒頭5秒の損失提示: PASS
- 5分密度（10シーン / 130セリフ）: PASS
- キャラの掛け合い: PASS
- 解説役3連続なし: PASS
- 具体例、数字、あるある: PASS
- 中盤再フック: PASS
- 最後の具体行動: PASS
- template適合: PASS。Scene10 のsub枠に全シーンbulletsを用意。
- YAML同期: PASS。s01 dialogue と imagegen_prompt の会話抜粋を script_final.md に同期済み。

## 軽微な改善余地
- 生成画像の文字崩れが出た場合は、画像内テキスト量をさらに減らして再生成する。
