"""Validate local assets referenced by the static application shell."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    references = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html)
    missing: list[str] = []
    for reference in references:
        if reference.startswith(("http://", "https://", "data:", "#", "mailto:")):
            continue
        path = ROOT / reference.split("?", 1)[0].split("#", 1)[0]
        if not path.exists():
            missing.append(reference)

    if not (ROOT / ".nojekyll").exists():
        missing.append(".nojekyll")
    if missing:
        print("FAIL: missing local assets")
        print("\n".join(f"- {item}" for item in missing))
        return 1

    print(f"PASS: {len(references)} HTML asset references and .nojekyll are present")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
