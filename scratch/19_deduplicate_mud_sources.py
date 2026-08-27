import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
changed = []

for path in sorted(MUD_DIR.glob("*.json")):
    if path.name == "_index.json":
        continue
    data = json.loads(path.read_text(encoding="utf-8"))
    sources = data.get("sources", [])
    unique = []
    seen = set()
    for source in sources:
        url = source.get("url")
        if url in seen:
            continue
        seen.add(url)
        unique.append(source)
    if len(unique) != len(sources):
        data["sources"] = unique
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        changed.append(f"{path.name} ({len(sources)} → {len(unique)})")

print("Deduplicated source metadata: " + ", ".join(changed))
