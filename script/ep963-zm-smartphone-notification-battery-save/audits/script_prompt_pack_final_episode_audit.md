# script_prompt_pack_final_episode_audit.md

使用元: _reference/script_prompt_pack/11_final_episode_audit.md

## Result

PASS

## Evidence

全成果物の整合性を確認した。script_final.mdのsha256ハッシュとaudits/script_final_review.mdのsha256が一致している。script.yamlの発話はscript_final.mdから機械分割せずそのまま維持されており、キャラクター口調（ずんだもんの「なのだ/のだ」、めたんの「ですわ/のです/わ」）が全シーンで保たれている。画像はCodex CLIで全10枚生成済みで`assets/sXX_main.png`に配置済み。BGMはDOVA-SYNDROMEライセンスのmp3を`bgm/track.mp3`に配置済み。

## Checklist

- [x] planning.md 存在確認
- [x] script_draft.md 存在確認
- [x] script_final.md 存在確認
- [x] audits/script_final_review.md PASS確認
- [x] script_final sha256 一致確認 (64674e3d15ef8e39bceb21758477f95f86068a8baca95490e06a723c2b4514de)
- [x] script.yaml 生成済み
- [x] assets/s01_main.png〜s10_main.png 全10枚生成済み
- [x] bgm/track.mp3 配置済み
- [x] meta.json 生成済み
- [x] キャラクター役割一貫性確認
- [x] 尺推定: 319.2秒（270〜330秒範囲内）

## Episode

ep963-zm-smartphone-notification-battery-save
