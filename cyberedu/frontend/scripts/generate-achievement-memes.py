#!/usr/bin/env python3
"""Генерирует 8 уникальных квадратных мем-бейджей 512×512 без дубликатов файлов."""
from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "achievements"
SIZE = 512

# slug -> (подпись сверху, подпись снизу, hue_shift, crop_anchor)
SPECS: dict[str, tuple[str, str, float, str]] = {
    "first-step": ("ONE DOES NOT", "SIMPLY START", 0.0, "center"),
    "phishing-detective": ("SUSPICIOUS", "EMAIL DETECTED", 0.12, "left"),
    "account-defender": ("STRONG", "PASSWORD", 0.55, "right"),
    "log-analyst": ("EXPAND", "BRAIN LOGS", 0.32, "top"),
    "course-complete": ("EPIC", "HANDSHAKE", 0.78, "bottom"),
    "ai-mentor": ("TWO BUTTONS", "ASK AI", 0.22, "left"),
    "half-course": ("DRAKE", "HALF COURSE", 0.45, "right"),
    "perfect-test": ("ANCIENT", "100% SCORE", 0.92, "top"),
}

# Базовые «текстуры» из существующих уникальных файлов (если есть)
BASE_SOURCES = [
    "first-step.png",
    "half-course.png",
    "log-analyst.png",
    "course-complete.png",
    "account-defender.png",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("Impact.ttf", "Arial Bold.ttf", "Helvetica.ttc", "Arial.ttf"):
        for root in ("/System/Library/Fonts/Supplemental", "/Library/Fonts", "/System/Library/Fonts"):
            path = Path(root) / name
            if path.exists():
                try:
                    return ImageFont.truetype(str(path), size=size)
                except OSError:
                    continue
    return ImageFont.load_default()


def gradient_fallback(seed: int) -> Image.Image:
    img = Image.new("RGB", (SIZE, SIZE))
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            r = (seed * 37 + x * 3) % 256
            g = (seed * 59 + y * 2) % 256
            b = (seed * 17 + (x + y)) % 256
            px[x, y] = (r, g, b)
    return img.filter(ImageFilter.GaussianBlur(radius=2))


def crop_anchor(img: Image.Image, anchor: str) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    if anchor == "left":
        left, top = 0, (h - side) // 2
    elif anchor == "right":
        left, top = w - side, (h - side) // 2
    elif anchor == "top":
        left, top = (w - side) // 2, 0
    elif anchor == "bottom":
        left, top = (w - side) // 2, h - side
    else:
        left, top = (w - side) // 2, (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def hue_shift(img: Image.Image, amount: float) -> Image.Image:
    if amount <= 0.001:
        return img
    hsv = img.convert("HSV")
    h, s, v = hsv.split()
    h = h.point(lambda p: int((p + amount * 255) % 256))
    return Image.merge("HSV", (h, s, v)).convert("RGB")


def draw_meme_bars(img: Image.Image, top: str, bottom: str) -> Image.Image:
    out = img.copy()
    draw = ImageDraw.Draw(out)
    font = load_font(42)
    bar_h = 88
    draw.rectangle((0, 0, SIZE, bar_h), fill=(0, 0, 0))
    draw.rectangle((0, SIZE - bar_h, SIZE, SIZE), fill=(0, 0, 0))
    stroke = 2
    for text, y in ((top, 18), (bottom, SIZE - bar_h + 18)):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (SIZE - tw) // 2
        for dx, dy in ((-stroke, 0), (stroke, 0), (0, -stroke), (0, stroke)):
            draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0))
        draw.text((x, y), text, font=font, fill=(255, 255, 255))
    return out


def build_base(index: int) -> Image.Image:
    sources = [OUT / n for n in BASE_SOURCES if (OUT / n).exists()]
    if sources:
        src = sources[index % len(sources)]
        return Image.open(src).convert("RGB")
    return gradient_fallback(index * 13 + 7)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    digests: list[str] = []

    for i, (slug, (top, bottom, hue, anchor)) in enumerate(SPECS.items()):
        base = build_base(i)
        base = crop_anchor(base, anchor)
        base = base.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        base = hue_shift(base, hue)
        base = ImageEnhance.Contrast(base).enhance(1.08 + (i % 3) * 0.06)
        base = ImageEnhance.Color(base).enhance(0.9 + (i % 4) * 0.08)
        out = draw_meme_bars(base, top, bottom)
        path = OUT / f"{slug}.png"
        out.save(path, format="PNG", optimize=True)
        digest = hashlib.md5(path.read_bytes()).hexdigest()
        digests.append(digest)
        print(f"{slug}: {digest[:8]}… ({path.stat().st_size} B)")

    if len(digests) != len(set(digests)):
        raise SystemExit("ERROR: duplicate MD5 after generation")
    print(f"OK: {len(digests)} unique achievement memes")


if __name__ == "__main__":
    main()
