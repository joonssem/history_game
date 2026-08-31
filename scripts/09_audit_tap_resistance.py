"""Audit Regular MUD stages that can finish through a few repeated taps.

This is a structural screening tool, not a claim about measured student time.
It deliberately reports scene-bearing stages without modifying them so the
Claude/Codex ownership boundary remains intact.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"

# These legacy renderers already reject duplicate targets or enforce an
# ordered/distinct interaction in their runtime state, even though the
# contract is not represented by JSON hotspots.
KNOWN_DISTINCT_INTERACTION_MODES = {
    "paleo-environment",
    "paleo-fire",
    "paleo-stone",
    "paleo-hunt",
    "paleo-community",
    "paleo-reflection",
    "mn-combat-active",
}


def main() -> None:
    candidates = []
    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for stage_id, stage in data.get("stages", {}).items():
            simulator = stage.get("simulator") or {}
            completion = simulator.get("completion") or {}
            if not simulator.get("required"):
                continue

            hotspots = simulator.get("hotspots")
            target = completion.get("target")
            min_actions = completion.get("minActions", target)
            actions = simulator.get("actions")
            if simulator.get("type") == "buttons" and isinstance(actions, list) and actions:
                # Distinct configured actions are not the repeated canvas-tap path.
                continue
            if simulator.get("mode") in KNOWN_DISTINCT_INTERACTION_MODES:
                continue
            if hotspots or not isinstance(min_actions, (int, float)):
                continue
            if min_actions <= 4:
                candidates.append(
                    {
                        "file": path.name,
                        "stage": stage_id,
                        "mode": simulator.get("mode", ""),
                        "target": target,
                        "minActions": min_actions,
                        "scene": bool(simulator.get("scene")),
                    }
                )

    print("Rapid-tap structural screening (not measured student time)")
    print(f"Candidates: {len(candidates)}")
    for item in candidates:
        protected = " [SCENE: coordinate review required]" if item["scene"] else ""
        print(
            f"- {item['file']}:{item['stage']} "
            f"mode={item['mode']} target={item['target']} "
            f"minActions={item['minActions']}{protected}"
        )


if __name__ == "__main__":
    main()
