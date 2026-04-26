# 02_IMAGEGEN_PROMPT_PROMPT

## 目的

`image_direction` をもとに、GPT-Image-2へ渡す `imagegen_prompt` を作る。
台本やcaptionから直接プロンプトを作らない。

## 必須項目

- 使用目的
- 動画ジャンル
- Sceneテンプレート
- visual_type
- composition_type
- 台本内のどの掛け合いを補強するか
- 主役
- 前景
- 中景
- 背景
- 色
- 光
- 余白
- Remotionで文字を重ねるスペース
- 禁止要素
- 品質基準

## 完成プロンプト形式

```yaml
imagegen_prompt: |
  ゆっくり解説 / ずんだもん解説動画の{Sceneテンプレート}{slot}枠で使う高品質ビジュアル素材。
  この画像は、台本内の「{補強する掛け合い}」を視覚的に補強する。
  visual_typeは「{visual_type}」、composition_typeは「{composition_type}」。

  画面構図：
  前景には{foreground}。
  中景には{midground}。
  背景には{background}。
  視線は{視線誘導}へ流れる。

  デザイン：
  高品質な日本の解説動画内スライドのように、余白、階層、視線誘導がある完成度の高い画面。
  ただし実在ブランドや実在UIは模写しない。
  色は{color_palette}。
  光は{lighting}。
  画面下部20%は字幕とキャラ表示用に空ける。

  文字方針：
  画像内の文字は最大3語まで。
  正確な日本語タイトルや説明はRemotionで重ねるため、長文は入れない。
  入れてよい短語は{allowed_short_text}。

  禁止：
  白背景に中央アイコンだけ、汎用素材、実在ロゴ、実在UI、既存キャラクター、写真風人物、長文テキスト、細かい表。
```

