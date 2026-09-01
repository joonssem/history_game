"""Audit choice-position and text-length clues in MUD decision stages."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def visible_length(text: str) -> int:
    text = re.sub(r"<[^>]+>", "", text or "")
    text = re.sub(r"\s+", "", text)
    return len(text)


def main() -> None:
    stages = []
    for path in sorted(MUD_DIR.glob("*.json")):
        if path.name == "_index.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        for stage_id, stage in data.get("stages", {}).items():
            choices = stage.get("choices", [])
            if len(choices) < 2:
                continue
            correct = [c for c in choices if c.get("correct") is True]
            if len(correct) != 1:
                continue
            lengths = [visible_length(c.get("text", "")) for c in choices]
            correct_index = next(i for i, c in enumerate(choices) if c.get("correct") is True)
            correct_length = lengths[correct_index]
            wrong_lengths = [n for i, n in enumerate(lengths) if i != correct_index]
            wrong_average = sum(wrong_lengths) / len(wrong_lengths)
            stages.append({
                "mud": path.stem,
                "stage": stage_id,
                "position": correct_index + 1,
                "correct_length": correct_length,
                "wrong_average": wrong_average,
                "delta": correct_length - wrong_average,
                "lengths": lengths,
            })

    position_counts = {}
    for row in stages:
        position_counts[row["position"]] = position_counts.get(row["position"], 0) + 1
    longer_by_10 = [row for row in stages if row["delta"] >= 10]
    longer_than_all = [row for row in stages if row["correct_length"] > max(
        row["lengths"][: row["position"] - 1] + row["lengths"][row["position"] :]
    )]

    print(f"Decision stages audited: {len(stages)}")
    print(f"Correct-position counts: {dict(sorted(position_counts.items()))}")
    print(f"Correct choice >=10 chars longer than wrong average: {len(longer_by_10)}")
    print(f"Correct choice longer than every wrong choice: {len(longer_than_all)}")
    print("Top length deltas:")
    for row in sorted(stages, key=lambda item: item["delta"], reverse=True)[:20]:
        print(
            f"- {row['mud']}:{row['stage']} position={row['position']} "
            f"correct={row['correct_length']} wrong_avg={row['wrong_average']:.1f} "
            f"delta={row['delta']:.1f} lengths={row['lengths']}"
        )


if __name__ == "__main__":
    main()
