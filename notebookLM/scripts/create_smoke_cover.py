from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


def main() -> int:
    width, height = 2752, 1536
    img = Image.new("RGB", (width, height), "#f6f1e8")
    draw = ImageDraw.Draw(img)

    for bbox, color in [
        ((-120, -80, 980, 760), "#efe7da"),
        ((1700, -120, 2900, 860), "#efe9df"),
        ((-150, 980, 1050, 1760), "#e9efe8"),
        ((1650, 900, 2900, 1780), "#e8eef6"),
    ]:
        draw.ellipse(bbox, fill=color)

    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((170, 280, width - 170, height - 180), radius=64, fill=(0, 0, 0, 28))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    img = Image.alpha_composite(img.convert("RGBA"), shadow)
    draw = ImageDraw.Draw(img)

    panel_box = (150, 250, width - 190, height - 210)
    draw.rounded_rectangle(panel_box, radius=60, fill="#fffaf2", outline="#d7cfc2", width=4)

    for i, color in enumerate(["#153a63", "#2f6fa6", "#6fc1cc"]):
        x0 = 220 + i * 86
        draw.rounded_rectangle((x0, 330, x0 + 52, 470), radius=20, fill=color)

    font_bold = str(Path(r"C:\Windows\Fonts\YuGothB.ttc"))
    font_regular = str(Path(r"C:\Windows\Fonts\YuGothR.ttc"))
    title_font = ImageFont.truetype(font_bold, 160)
    sub_font = ImageFont.truetype(font_bold, 80)
    label_font = ImageFont.truetype(font_bold, 54)
    body_font = ImageFont.truetype(font_regular, 42)
    badge_font = ImageFont.truetype(font_bold, 40)

    draw.text((430, 300), "カフェインの真実", font=title_font, fill="#14263c")
    draw.text((430, 485), "眠気をブロックする仕組みと3つの注意点", font=sub_font, fill="#23384d")
    draw.text(
        (430, 610),
        "睡眠不足を消す薬ではなく、眠気信号を一時的に弱める仕組み",
        font=body_font,
        fill="#576575",
    )

    cards = [
        ((250, 760, 820, 1160), "#fff3ea", "#df6b3f", "01", "仕組み", "アデノシン受容体を\n一時的にふさぐ"),
        ((930, 760, 1500, 1160), "#edf7ff", "#3d84bb", "02", "覚醒感", "眠気のブレーキが外れ\n集中しやすく見える"),
        ((1610, 760, 2180, 1160), "#fff2e8", "#d98041", "03", "注意点", "睡眠負債は残るので\n量と時間帯が重要"),
    ]
    for box, fill, accent, number, title, body in cards:
        draw.rounded_rectangle(box, radius=42, fill=fill, outline=accent, width=5)
        draw.rounded_rectangle((box[0] + 26, box[1] + 24, box[0] + 126, box[1] + 90), radius=22, fill=accent)
        draw.text((box[0] + 54, box[1] + 29), number, font=badge_font, fill="white")
        draw.text((box[0] + 32, box[1] + 125), title, font=label_font, fill="#23384d")
        draw.text((box[0] + 32, box[1] + 230), body, font=body_font, fill="#4b5562")

    footer_box = (2260, 790, width - 300, 1120)
    draw.rounded_rectangle(footer_box, radius=40, fill="#153a63")
    draw.text((2315, 845), "動画で見るポイント", font=badge_font, fill="#b8e6f0")
    draw.text(
        (2315, 930),
        "・なぜ眠気が消えたように見えるのか\n・なぜ切れた後に反動が来るのか\n・どう使うと失敗しにくいのか",
        font=body_font,
        fill="white",
    )

    note_box = (250, 1215, width - 300, 1315)
    draw.rounded_rectangle(note_box, radius=30, fill="#f0ede5")
    draw.text(
        (305, 1245),
        "結論: カフェインは「元気の追加」ではなく、「眠気信号の遮断」で効いて見える。",
        font=body_font,
        fill="#283746",
    )

    output_path = (
        Path(__file__).resolve().parents[1]
        / "workspace"
        / "projects"
        / "smoke-zundamon-caffeine-rerun"
        / "zundamon"
        / "materials"
        / "generated"
        / "slide_1_p01.png"
    )
    img.convert("RGB").save(output_path)
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
