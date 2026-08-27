"""Normalize group labels and potentially demeaning terms in MUD content."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
REPLACEMENTS = {
    "왜군": "일본군",
    "까막눈": "글을 배우기 어려웠던",
    "미신": "근거 없는 믿음",
}


def transform(value):
    if isinstance(value, str):
        for old, new in REPLACEMENTS.items():
            value = value.replace(old, new)
        return value
    if isinstance(value, list):
        return [transform(item) for item in value]
    if isinstance(value, dict):
        return {key: transform(item) for key, item in value.items()}
    return value


changed = []
for path in sorted(MUD_DIR.glob("*.json")):
    if path.name == "_index.json":
        continue
    original = path.read_text(encoding="utf-8")
    updated = json.dumps(transform(json.loads(original)), ensure_ascii=False, indent=2) + "\n"
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(path.name)

print(f"Normalized group terms in {len(changed)} MUDs: {', '.join(changed)}")
