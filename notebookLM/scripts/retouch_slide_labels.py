from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE_SIZE = (2752, 1536)
FONT_PATH = Path(r"C:\Windows\Fonts\YuGothB.ttc")
BG_FILL = (248, 245, 239)
TEXT_DARK = (70, 70, 78)
TEXT_LIGHT = (103, 103, 110)
TEXT_TEAL = (52, 166, 194)
DARK_PANEL = (33, 56, 78)
DARK_PANEL_ALT = (24, 46, 66)


def _scale_box(box: tuple[int, int, int, int], size: tuple[int, int]) -> tuple[int, int, int, int]:
    width, height = size
    base_width, base_height = BASE_SIZE
    sx = width / base_width
    sy = height / base_height
    left, top, right, bottom = box
    return (
        int(left * sx),
        int(top * sy),
        int(right * sx),
        int(bottom * sy),
    )


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), size=size)


def _draw_label(
    draw: ImageDraw.ImageDraw,
    image_size: tuple[int, int],
    *,
    box: tuple[int, int, int, int],
    radius: int = 24,
    fill: tuple[int, int, int] = BG_FILL,
    text: str | None = None,
    text_fill: tuple[int, int, int] = TEXT_DARK,
    font_size: int = 48,
) -> None:
    scaled_box = _scale_box(box, image_size)
    scaled_radius = max(8, int(radius * (image_size[0] / BASE_SIZE[0])))
    draw.rounded_rectangle(scaled_box, radius=scaled_radius, fill=fill)
    if not text:
        return
    font = _load_font(max(14, int(font_size * (image_size[0] / BASE_SIZE[0]))))
    left, top, right, bottom = scaled_box
    text_box = draw.textbbox((0, 0), text, font=font)
    text_width = text_box[2] - text_box[0]
    text_height = text_box[3] - text_box[1]
    x = left + (right - left - text_width) / 2
    y = top + (bottom - top - text_height) / 2 - 2
    draw.text((x, y), text, fill=text_fill, font=font)


def retouch_slide_page(image_path: Path) -> None:
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)
    page_name = image_path.name.lower()

    if page_name.endswith("p01.png"):
        _draw_label(
            draw,
            image.size,
            box=(1080, 18, 1670, 122),
            radius=18,
            text="信号制御室",
            text_fill=TEXT_LIGHT,
            font_size=44,
        )
        _draw_label(
            draw,
            image.size,
            box=(1165, 488, 1600, 574),
            radius=16,
            text="脳内制御センター",
            text_fill=TEXT_DARK,
            font_size=46,
        )
        for box, fill in (
            ((786, 652, 962, 707), DARK_PANEL),
            ((1540, 676, 1844, 727), DARK_PANEL),
            ((1616, 1063, 1849, 1117), DARK_PANEL),
            ((171, 1296, 325, 1341), DARK_PANEL_ALT),
            ((2544, 592, 2731, 645), DARK_PANEL),
            ((2336, 1238, 2460, 1282), DARK_PANEL),
        ):
            _draw_label(draw, image.size, box=box, radius=12, fill=fill)
    elif page_name.endswith("p04.png"):
        _draw_label(
            draw,
            image.size,
            box=(2326, 430, 2702, 604),
            radius=20,
            text="活性化",
            text_fill=TEXT_TEAL,
            font_size=82,
        )

    image.save(image_path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Retouch residual English labels on generated slide PNG files.")
    parser.add_argument("images", nargs="+")
    args = parser.parse_args()

    for raw_path in args.images:
        retouch_slide_page(Path(raw_path))
        print(f"retouched: {raw_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
