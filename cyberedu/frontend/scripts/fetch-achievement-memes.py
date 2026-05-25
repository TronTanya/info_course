#!/usr/bin/env python3
"""Скачивает уникальные шаблоны мемов (imgflip) и сохраняет квадрат 512×512 в public/achievements/."""
from __future__ import annotations

import io
import json
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "achievements"
SIZE = 512

# slug -> (imgflip template id для справки, url, alt)
MEMES: dict[str, tuple[int, str, str]] = {
    "first-step": (61579, "https://i.imgflip.com/1bij.jpg", "One Does Not Simply"),
    "phishing-detective": (188390779, "https://i.imgflip.com/345v97.jpg", "Woman Yelling At Cat"),
    "account-defender": (438680, "https://i.imgflip.com/9ehk.jpg", "Batman Slapping Robin"),
    "log-analyst": (93895088, "https://i.imgflip.com/1jwhww.jpg", "Expanding Brain"),
    "course-complete": (135256802, "https://i.imgflip.com/28j0te.jpg", "Epic Handshake"),
    "ai-mentor": (87743020, "https://i.imgflip.com/1g8my4.jpg", "Two Buttons"),
    "half-course": (181913649, "https://i.imgflip.com/30b1gx.jpg", "Drake Hotline Bling"),
    "perfect-test": (101470, "https://i.imgflip.com/26am.jpg", "Ancient Aliens"),
}


def center_crop_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "CyberEdu-achievement-memes/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, dict[str, str | int]] = {}

    for slug, (template_id, url, alt) in MEMES.items():
        raw = fetch(url)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        img = center_crop_square(img).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        dest = OUT / f"{slug}.png"
        img.save(dest, format="PNG", optimize=True)
        manifest[slug] = {"templateId": template_id, "src": f"/achievements/{slug}.png", "alt": alt}
        print(f"OK {slug} -> {dest} ({dest.stat().st_size} bytes)")

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done. All slugs have unique source templates.")


if __name__ == "__main__":
    main()
