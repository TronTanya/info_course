#!/usr/bin/env python3
"""Совместимость: запускает generate_fake_course_progress.py (тот же процесс)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

if __name__ == "__main__":
    path = Path(__file__).resolve().parent / "generate_fake_course_progress.py"
    spec = importlib.util.spec_from_file_location("_generate_fake_course_progress", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Не удалось загрузить generate_fake_course_progress.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()
