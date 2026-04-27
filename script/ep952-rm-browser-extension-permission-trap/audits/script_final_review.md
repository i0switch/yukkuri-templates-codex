script_final_sha256: 6ff2aa0fb40395d51e43a8f3338942ab3d48e775405f85b06188ae9e1a0e99b9

# script_final_review

- review_target: script_final.md
- reviewer: Codex
- verdict: PASS
- human_audit_issue: 冒頭が「便利そうな拡張を入れたら最強ね。」から始まり、視聴者の現在地が置かれていなかった。
- fix_summary: s01冒頭を日常のブラウザ拡張利用から入り、閲覧データリスクへ接続する流れに差し替えた。

## 確認結果
- s01最初の3発話の文脈ブリッジ: PASS。ブラウザ拡張が便利という日常前提を置いてから権限リスクへ入っている。
- 冒頭5秒の損失提示: PASS
- 5分密度（10シーン / 110セリフ）: PASS
- キャラの掛け合い: PASS
- 解説役3連続なし: PASS
- 具体例、数字、あるある: PASS
- 中盤再フック: PASS
- 最後の具体行動: PASS
- template適合: PASS。Scene02 のsub枠に全シーンbulletsを用意。
- YAML同期: PASS。s01 dialogue と imagegen_prompt の会話抜粋を script_final.md に同期済み。

## 軽微な改善余地
- 生成画像の文字崩れが出た場合は、画像内テキスト量をさらに減らして再生成する。
