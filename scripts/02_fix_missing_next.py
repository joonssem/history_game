"""Fill missing choice transitions in the regular three-stage MUD scenarios.

The affected scenarios already contain the matching retry stages (1-1, 2-1,
and 3-1).  A correct choice advances to the next main stage; an incorrect
choice enters the retry stage for the current question.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def transition_for(stage_id: str, correct: bool) -> str:
    if stage_id not in {"1", "2", "3"}:
        raise ValueError(f"Unexpected stage with missing next: {stage_id}")
    if correct:
        return {"1": "2", "2": "3", "3": "end"}[stage_id]
    return f"{stage_id}-1"


def main() -> None:
    changed = 0
    files_changed = 0

    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        file_changed = False

        for stage_id in ("1", "2", "3"):
            stage = data.get("stages", {}).get(stage_id)
            if not stage:
                continue

            for choice in stage.get("choices", []):
                if "next" in choice and choice["next"] not in (None, ""):
                    continue

                correct = choice.get("correct")
                if not isinstance(correct, bool):
                    raise ValueError(
                        f"{path.name}:{stage_id} missing boolean correct flag"
                    )

                target = transition_for(stage_id, correct)
                if target != "end" and target not in data["stages"]:
                    raise ValueError(f"{path.name}:{stage_id} target missing: {target}")

                choice["next"] = target
                changed += 1
                file_changed = True

        if file_changed:
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            files_changed += 1

    print(f"Updated {changed} choices in {files_changed} files.")


if __name__ == "__main__":
    main()
