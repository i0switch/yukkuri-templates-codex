# 素材生成プロンプト（NotebookLM Studio 用）

Claude Code が `studio_create` に渡すプロンプトのテンプレ集。
各マーカータイプ別に、高品質な素材を生成するための指示を用意。

---

## 🎨 FIG（タイトルカード・全体像）

### メインプロンプト

```
Create a landscape-orientation infographic that serves as a title card for this video.

# Topic
{{THEME}}

# Content requirements
- Large, clear title text: "{{TITLE}}"
- 3-5 key visual elements representing the main concepts covered in the video
- Visual hierarchy: title at top, supporting icons/diagrams below
- Professional style with clean typography
- Color palette: 2-3 main colors, high contrast for readability

# Constraints
- No real brand logos or copyrighted characters
- No real person portraits
- Text should be in Japanese if the source script is Japanese
- Keep the design uncluttered; aim for clarity over decoration

# Script context
This infographic appears at the very beginning of the video. It should give viewers
an immediate sense of what the whole content is about.
```

### フォールバック（簡易版）

```
Create a simple title card infographic for "{{TITLE}}". Landscape orientation.
Include the title prominently and 2-3 key icons or visual elements related to the topic.
Professional, clean, uncluttered design.
```

---

## 📊 INFO（セクション内詳細）

### メインプロンプト

```
Create a portrait-orientation infographic that explains this specific concept in detail.

# Concept to explain
{{MARKER_DESC}}

# Section context
This infographic appears in section: "{{SECTION_TITLE}}"
The surrounding narration explains: {{SECTION_SUMMARY}}

# Content requirements
- Focus on ONE specific concept, not multiple
- Use a clear visual structure (flowchart, comparison, steps, or cause-effect)
- Include 4-8 labeled elements
- Support the narration, don't duplicate it
- Include a short headline at the top summarizing the concept in 10 words or less

# Style
- Portrait orientation
- Professional, editorial style
- Readable typography even at video thumbnail size
```

### フォールバック

```
Create a simple portrait infographic explaining: {{MARKER_DESC}}.
Use a clear visual structure with labeled elements.
Text in Japanese.
```

---

## 🗺️ MAP（マインドマップ）

### メインプロンプト

```
Create a mind map showing the relationships between concepts described here.

# Central topic
{{MARKER_DESC}}

# Structure requirements
- Central node with the main concept
- 3-6 primary branches
- Each primary branch has 2-4 sub-nodes
- Show relationships clearly with lines/arrows
- Balanced layout, not one-sided

# Content
Reference the source material in the notebook to identify:
- Hierarchical relationships
- Categories and subcategories
- Cause-effect chains
- Component-of relationships
```

### フォールバック

```
Create a mind map for: {{MARKER_DESC}}.
Central topic with 4 main branches and sub-nodes based on the notebook sources.
```

---

## 🎤 SLIDE（まとめスライド）

### メインプロンプト

```
Create a presentation slide deck summarizing this video.

# Purpose
Summary slides that viewers can pause on to review the video's key takeaways.

# Slide structure (5-7 slides)
1. Title slide: "{{TITLE}}"
2. Slide 2: What problem/question does this video address?
3. Slide 3-5: The 3 most important points from the video
4. Final slide: Key takeaway in one sentence

# Style
- Professional, clean design
- Consistent color palette
- Large, readable text (bullet points, not paragraphs)
- One key visual per content slide
- Text in Japanese

# Content source
Use the script in the notebook to identify the 3 most important points.
Prioritize content from the "まとめ" (summary) section.
```

### フォールバック

```
Create a 5-slide summary deck for "{{TITLE}}".
Cover: title, problem, 3 key points, takeaway.
Clean professional style, Japanese text.
```

---

## 🎬 VIDEO（オプション）

### メインプロンプト

```
Create a 30-60 second explainer video for this specific concept.

# Concept
{{MARKER_DESC}}

# Style
- Classic explainer video style
- Clear narration aligned with visuals
- Simple animations, not flashy
- Japanese narration and text

# Content
Focus on visually demonstrating: {{MARKER_DESC}}
The video will be used as B-roll in a longer educational video.
```

---

## 🔧 変数展開

Claude Code が台本を解析して自動的に下記を埋める：

| 変数 | 取得元 |
|------|-------|
| `{{THEME}}` | フロントマター `title` |
| `{{TITLE}}` | フロントマター `title` |
| `{{MARKER_DESC}}` | マーカー行の説明文 |
| `{{SECTION_TITLE}}` | 直前の `##` 見出し |
| `{{SECTION_SUMMARY}}` | 該当セクションの話者発言を 2〜3 文で要約 |

---

## ⚠️ 生成時の注意

- **著作権**：実在ブランドロゴ・既存キャラクター・既存作品の模写は絶対に要求しない
- **人物**：実在人物の肖像を生成させない
- **誤情報**：参考資料に無い具体的な数値・固有名詞を含めない
- **言語**：台本が日本語なら素材も日本語テキストを含める
- **文字化け対策**：日本語フォント対応が怪しい場合、英語サブタイトル併記を指示
