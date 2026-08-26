"""Require two confirmed interactions for safe legacy touch simulator modes.

Only modes already handled by MudSimulators as gauge-progress interactions are
changed here. Bespoke `mn-*` modes are intentionally excluded for separate
interaction testing.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
PREFIXES = ("culture-touch", "text-reading", "battle-gauge", "economy")
COMPLETION = {
    "target": 100,
    "increment": 50,
    "minActions": 2,
    "progressKey": "gaugeProgress",
    "successText": "✅ 관찰과 조작을 마쳤습니다. 이제 확인한 단서를 바탕으로 선택하세요.",
}


def supported(mode: str | None) -> bool:
    return isinstance(mode, str) and mode.startswith(PREFIXES)


def main() -> None:
    changed_stages = 0
    changed_files = 0
    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for stage_id, stage in data.get("stages", {}).items():
            if "-" in stage_id:
                continue
            simulator = stage.get("simulator")
            if not simulator or simulator.get("required") or not supported(simulator.get("mode")):
                continue
            simulator["required"] = True
            simulator["completion"] = COMPLETION.copy()
            changed_stages += 1
            changed = True
        if changed:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files += 1
    print(f"Gated {changed_stages} simulator stages in {changed_files} Regular MUD files.")


if __name__ == "__main__":
    main()
