from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1920
HEIGHT = 1080
FONT_BOLD = Path(r"C:\Windows\Fonts\YuGothB.ttc")
FONT_REGULAR = Path(r"C:\Windows\Fonts\YuGothR.ttc")


def _font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def create_card(output_path: Path, *, title: str, lead: str, bullets: list[str], accent: str = "#1f8a70") -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), "#f7f3ea")
    draw = ImageDraw.Draw(img)

    for bbox, color in [
        ((-120, -80, 780, 600), "#ece5d8"),
        ((1320, -120, 2100, 560), "#e2efe8"),
        ((-80, 720, 760, 1220), "#e7eef7"),
        ((1280, 720, 2120, 1220), "#efe7ef"),
    ]:
        draw.ellipse(bbox, fill=color)

    shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((110, 110, WIDTH - 110, HEIGHT - 110), radius=42, fill=(0, 0, 0, 26))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img.convert("RGBA"), shadow)
    draw = ImageDraw.Draw(img)

    panel = (90, 90, WIDTH - 90, HEIGHT - 90)
    draw.rounded_rectangle(panel, radius=40, fill="#fffdf8", outline="#d8d0c4", width=3)

    title_font = _font(FONT_BOLD, 78)
    lead_font = _font(FONT_REGULAR, 34)
    bullet_font = _font(FONT_BOLD, 34)
    body_font = _font(FONT_REGULAR, 30)
    chip_font = _font(FONT_BOLD, 24)

    draw.rounded_rectangle((150, 145, 390, 205), radius=24, fill=accent)
    draw.text((190, 158), "fallback visual", font=chip_font, fill="white")
    draw.text((150, 250), title, font=title_font, fill="#183042")
    draw.text((150, 360), lead, font=lead_font, fill="#4b5f6f")

    y = 500
    for idx, bullet in enumerate(bullets, start=1):
        draw.rounded_rectangle((155, y + 8, 205, y + 58), radius=18, fill=accent)
        draw.text((173, y + 16), str(idx), font=chip_font, fill="white")
        draw.text((235, y), bullet, font=body_font, fill="#273746")
        y += 130

    note_box = (150, HEIGHT - 220, WIDTH - 150, HEIGHT - 140)
    draw.rounded_rectangle(note_box, radius=24, fill="#edf3f7")
    draw.text(
        (180, HEIGHT - 197),
        "NotebookLM が論点生成を拒否したため、動画差し込み用の補助カードをローカル生成しています。",
        font=lead_font,
        fill="#425466",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(output_path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a fallback card image for a failed marker.")
    parser.add_argument("--output", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--lead", required=True)
    parser.add_argument("--accent", default="#1f8a70")
    parser.add_argument("--bullet", action="append", default=[])
    args = parser.parse_args()

    bullets = args.bullet or ["要点を整理", "動画で差し込み", "監査で確認"]
    create_card(
        Path(args.output),
        title=args.title,
        lead=args.lead,
        bullets=bullets,
        accent=args.accent,
    )
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
