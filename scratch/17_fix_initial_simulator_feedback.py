import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
updated = []

for path in MUD_DIR.glob("*.json"):
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = False
    for stage in data.get("stages", {}).values():
        simulator = stage.get("simulator") or {}
        completion = simulator.get("completion") or {}
        success_text = completion.get("successText")
        if success_text and simulator.get("feedback") == success_text:
            simulator["feedback"] = "단서를 하나씩 확인해 선택지를 열어 보세요."
            changed = True
    if changed:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        updated.append(path.name)

print("Updated initial simulator feedback in: " + ", ".join(updated))
