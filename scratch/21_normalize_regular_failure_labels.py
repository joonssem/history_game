"""Replace counterfactual failure labels in Regular MUDs with evidence-reading labels."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def transform(value):
    if isinstance(value, str):
        return value.replace("역사의 IF", "자료 해석")
    if isinstance(value, list):
        return [transform(item) for item in value]
    if isinstance(value, dict):
        return {key: transform(item) for key, item in value.items()}
    return value


changed = []
for path in sorted(MUD_DIR.glob("regular_*.json")):
    original = path.read_text(encoding="utf-8")
    data = json.loads(original)
    updated = transform(data)
    serialized = json.dumps(updated, ensure_ascii=False, indent=2) + "\n"
    if serialized != original:
        path.write_text(serialized, encoding="utf-8")
        changed.append(path.name)

print(f"Normalized failure labels in {len(changed)} Regular MUDs: {', '.join(changed)}")
