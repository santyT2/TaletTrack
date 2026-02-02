"""
Empaqueta el código fuente necesario para demo/presentación sin dependencias pesadas.
Incluye backend, frontend, docs y scripts; excluye node_modules, .venv, caches y binarios.
Uso:
    python export_source.py            # genera source_bundle.zip en la raíz
"""
from __future__ import annotations

import zipfile
from pathlib import Path
from typing import Iterable

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_BUNDLE = BASE_DIR / "source_bundle.zip"

INCLUDE_DIRS = [
    "backend",
    "frontend",
    "docs",
    "scripts",
]

INCLUDE_FILES = [
    "README.md",
    "package.json",
    "dev_manager.py",
    "run_dev_manager.bat",
]

EXCLUDE_DIRS = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
    "staticfiles",
    "media",
    "dist",
    "build",
    ".idea",
    ".vscode",
}

EXCLUDE_SUFFIXES = {".pyc", ".pyo", ".log", ".tmp"}


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIRS:
        return True
    if path.suffix in EXCLUDE_SUFFIXES:
        return True
    return False


def iter_files() -> Iterable[Path]:
    for rel in INCLUDE_FILES:
        path = BASE_DIR / rel
        if path.is_file() and not should_skip(path):
            yield path
    for rel in INCLUDE_DIRS:
        base = BASE_DIR / rel
        if not base.exists():
            continue
        for item in base.rglob("*"):
            if item.is_dir():
                continue
            if should_skip(item):
                continue
            yield item


def create_bundle(target: Path = DEFAULT_BUNDLE) -> None:
    if target.exists():
        target.unlink()
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in iter_files():
            arcname = file_path.relative_to(BASE_DIR)
            zf.write(file_path, arcname)
    print(f"Bundle creado: {target} ({target.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    create_bundle()
