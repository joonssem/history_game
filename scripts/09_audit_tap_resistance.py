"""Audit Regular MUD stages that can finish through a few repeated taps.

This is a structural screening tool, not a claim about measured student time.
It deliberately reports scene-bearing stages without modifying them so the
Claude/Codex ownership boundary remains intact.

판정 규칙은 `_tap_resistance_rule.py`에 있다. 07번 활동 시간 감사와 같은 기준을
쓰기 위해 분리했다.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _tap_resistance_rule import find_rapid_tap_stages  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def main() -> None:
    candidates = []
    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for stage_id, simulator in find_rapid_tap_stages(data.get("stages", {})):
            completion = simulator.get("completion") or {}
            candidates.append(
                {
                    "file": path.name,
                    "stage": stage_id,
                    "mode": simulator.get("mode", ""),
                    "target": completion.get("target"),
                    "minActions": completion.get("minActions", completion.get("target")),
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
