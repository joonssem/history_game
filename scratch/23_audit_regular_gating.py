"""Check Regular MUD judgement-stage interaction coverage and ordered contracts."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
counts = {}
errors = []
judgement_count = 0

for path in sorted((ROOT / "data" / "mud").glob("regular_*.json")):
    mud = json.loads(path.read_text(encoding="utf-8"))
    for stage_id, stage in mud["stages"].items():
        if len(stage.get("choices", [])) <= 1:
            continue
        judgement_count += 1
        simulator = stage.get("simulator") or {}
        interaction = simulator.get("interaction", "none")
        counts[interaction] = counts.get(interaction, 0) + 1
        if interaction != "ordered-hotspot":
            continue
        sequence = simulator.get("sequence", [])
        completion = simulator.get("completion", {})
        target = completion.get("target")
        min_actions = completion.get("minActions")
        if len(sequence) != target or len(sequence) != min_actions:
            errors.append(f"{path.name}:{stage_id} sequence/completion mismatch")
        configured = simulator.get("hotspots", [])
        if configured:
            hotspot_ids = {hotspot["id"] for hotspot in configured}
            for hotspot_id in sequence:
                if hotspot_id not in hotspot_ids:
                    errors.append(f"{path.name}:{stage_id} unknown sequence {hotspot_id}")

print(f"judgements={judgement_count}")
for interaction, count in sorted(counts.items()):
    print(f"{interaction}={count}")
if errors:
    print("\n".join(errors))
    raise SystemExit(1)
print("ordered-static=PASS")
