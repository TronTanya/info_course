#!/usr/bin/env python3
"""Импорт 17 кошачьих мемов в квадратные бейджи 512×512 для /public/achievements/."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "achievements"

_ASSET_CANDIDATES = [
    ROOT / "assets" / "achievement-memes",
    Path.home() / ".cursor" / "projects" / "Users-tanya-Desktop-13" / "assets",
]


def resolve_assets_dir() -> Path:
    import os

    override = os.environ.get("ACHIEVEMENT_MEME_ASSETS")
    if override:
        p = Path(override)
        if p.is_dir():
            return p
    for candidate in _ASSET_CANDIDATES:
        if candidate.is_dir():
            return candidate
    raise SystemExit(
        "Assets folder not found. Put PNGs in frontend/assets/achievement-memes/ "
        f"or set ACHIEVEMENT_MEME_ASSETS. Tried: {_ASSET_CANDIDATES}"
    )

SIZE = 512

# slug -> исходный файл (17 уникальных мемов)
SLUG_SOURCE: dict[str, str] = {
    "first-step": "Unknown-15-3c259305-50ac-4429-9898-02f225abc576.png",
    "phishing-detective": "Unknown-16-52cbd0db-8d9d-4381-ace0-e8a49fe20d40.png",
    "account-defender": "Unknown-12-9c417f1f-cc55-4b24-9b27-ee536a9f880d.png",
    "log-analyst": "Unknown-9-c14e6c7f-ecc6-4483-bd74-7e47c03f4da3.png",
    "course-complete": "Unknown-6-db5636fc-ea2d-42c1-96e7-a0e7561c0515.png",
    "ai-mentor": "Unknown-4-68df9356-8120-48fd-9952-a988641c51e7.png",
    "half-course": "Unknown-5-2f7b300f-ea5c-4cc1-92f8-f49ce2d53f55.png",
    "perfect-test": "Unknown-17-118e7e04-0c3e-4bef-b9fc-4c4a8a81230c.png",
    "first-lecture": "Unknown-11-fa606a47-bdd5-4a4e-84b0-70ac161e771d.png",
    "test-survivor": "Unknown-10-7d77ae74-b3bf-4ea9-b8ef-303236823fdb.png",
    "two-modules": "Unknown-2-2bab0946-6434-4cc4-a573-e3819e8a2275.png",
    "three-modules": "Unknown-13-586551e4-fbcd-4470-8070-5125029c7f8f.png",
    "practice-sent": "Unknown-14-dc56d1e2-541a-4071-beb1-2193591b5d97.png",
    "mentor-regular": "Unknown-3-188267f8-5504-4049-88aa-0f609c6483b1.png",
    "test-retry": "Unknown-8-9c9252a7-55d6-45c4-9778-6104262b8a82.png",
    "all-lectures": "Unknown-7-a11b779e-d3ac-496f-b941-0a4856c279db.png",
    "almost-done": "Unknown-bd28b6a2-ec50-4a3d-9c70-518c8377decc.png",
}


def center_crop_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def process(src: Path, dest: Path) -> None:
    with Image.open(src) as raw:
        img = raw.convert("RGB")
        square = center_crop_square(img).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        square.save(dest, format="PNG", optimize=True)


def main() -> None:
    assets = resolve_assets_dir()

    digests: set[bytes] = set()
    for slug, filename in SLUG_SOURCE.items():
        src = assets / filename
        if not src.is_file():
            raise SystemExit(f"Missing source: {src}")
        dest = OUT / f"{slug}.png"
        process(src, dest)
        digest = dest.read_bytes()
        if digest in digests:
            raise SystemExit(f"Duplicate output bytes for {slug}")
        digests.add(digest)
        print(f"OK {slug} <- {filename}")

    print(f"Done: {len(SLUG_SOURCE)} cat meme badges in {OUT}")


if __name__ == "__main__":
    main()
