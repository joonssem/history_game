"""Normalize Regular MUD target duration to the approved 5–10 minute session."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def main() -> None:
    changed = 0
    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("tier") != "regular" or data.get("playTime") == "5-10min":
            continue
        data["playTime"] = "5-10min"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed += 1
    print(f"Normalized playTime for {changed} Regular MUD files.")


if __name__ == "__main__":
    main()
