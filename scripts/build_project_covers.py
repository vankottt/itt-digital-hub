#!/usr/bin/env python3
"""Language-light warranty OG cover in ITT colours. No client brands, no claims."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "stories"
FONT_PATH = ROOT / "conference-kit/02-itt-branded/fonts/IBMPlexSans-Medium.ttf"

INK = (4, 14, 49)
SIGNAL = (0, 44, 255)
ON_DARK = (247, 248, 253)
MUTED = (154, 168, 196)


def node(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, fill, ring=None, width: int = 3) -> None:
    box = (cx - r, cy - r, cx + r, cy + r)
    draw.ellipse(box, fill=fill, outline=ring, width=width if ring else 0)


def arrow(draw: ImageDraw.ImageDraw, x0: int, y: int, x1: int, color, width: int = 5) -> None:
    draw.line((x0, y, x1, y), fill=color, width=width)
    head = 16
    draw.polygon([(x1, y), (x1 - head, y - 9), (x1 - head, y + 9)], fill=color)


def double_arrow(draw: ImageDraw.ImageDraw, x0: int, y: int, x1: int, color) -> None:
    draw.line((x0, y, x1, y), fill=color, width=6)
    head = 18
    draw.polygon([(x1, y), (x1 - head, y - 10), (x1 - head, y + 10)], fill=color)
    draw.polygon([(x0, y), (x0 + head, y - 10), (x0 + head, y + 10)], fill=color)


def centred(draw: ImageDraw.ImageDraw, text: str, xy: tuple[float, float], font: ImageFont.ImageFont, fill) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((xy[0] - tw / 2, xy[1]), text, font=font, fill=fill)


def warranty_cover() -> Image.Image:
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), INK)
    glow = Image.new("RGB", (w, h), SIGNAL)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse((720, 280, 1680, 1240), fill=90)
    glow = Image.composite(glow, img, mask.filter(ImageFilter.GaussianBlur(120)))
    img = Image.blend(img, glow, 0.22)
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(str(FONT_PATH), 26)
    small = ImageFont.truetype(str(FONT_PATH), 22)

    panel = (140, 120, 1780, 960)
    d.rounded_rectangle(panel, radius=40, fill=(8, 18, 56), outline=(27, 61, 255), width=2)

    centred(d, "Distribution model", (960, 175), small, MUTED)
    y1 = 330
    xs = [360, 720, 1080, 1440]
    top = ["Manufacturer", "Distributors", "Retailers", "Customer"]
    for i, x in enumerate(xs):
        node(d, x, y1, 34, (16, 28, 72), MUTED, 2)
        centred(d, top[i], (x, y1 + 52), font, ON_DARK)
        if i < len(xs) - 1:
            arrow(d, x + 48, y1, xs[i + 1] - 48, MUTED, 4)

    centred(d, "Direct digital relationship", (960, 560), small, MUTED)
    y2 = 720
    left, mid, right = 460, 960, 1460
    node(d, left, y2, 48, ON_DARK)
    node(d, mid, y2, 70, SIGNAL)
    node(d, right, y2, 48, ON_DARK)
    double_arrow(d, left + 62, y2, mid - 86, SIGNAL)
    double_arrow(d, mid + 86, y2, right - 62, SIGNAL)
    d.line((xs[0], y1 + 36, left, y2 - 52), fill=SIGNAL, width=3)
    centred(d, "Manufacturer", (left, y2 + 66), font, ON_DARK)
    centred(d, "Platform", (mid, y2 + 88), font, ON_DARK)
    centred(d, "Customer", (right, y2 + 66), font, ON_DARK)

    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "warranty-relation-cover.png"
    warranty_cover().save(path, "PNG", optimize=True)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
