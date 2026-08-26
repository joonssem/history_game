"""Validate the JSON contracts used by the MUD engine."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
ARTIFACTS = ROOT / "data" / "artifacts.json"
STORIES = ROOT / "data" / "stories.json"
INDEX = MUD_DIR / "_index.json"


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def warn(warnings: list[str], message: str) -> None:
    warnings.append(message)


def is_supported_mode(mode: str) -> bool:
    exact = {
        "dolmen-step1",
        "dolmen-step2",
        "dolmen-step3",
        "dolmen-step4",
        "gwangbok-vote",
        "precise-vote",
        "gwangbok-flag",
        "precise-taegeukgi",
        "paleo-fire",
        "paleo-stone",
        "neolithic-pottery",
        "mn-combat-active",
        "mn-current-switch",
        "mn-map-choose",
        "mn-map-idle",
    }
    prefixes = ("economy-", "battle-gauge", "culture-touch", "text-reading", "mn-")
    return mode in exact or mode.startswith(prefixes)


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    correct_positions: list[int] = []
    artifact_data = json.loads(ARTIFACTS.read_text(encoding="utf-8"))
    artifact_ids = {item["id"] for item in artifact_data}
    artifact_names = {item["id"]: item.get("name") for item in artifact_data}
    if len(artifact_ids) != len(artifact_data):
        fail(errors, "artifacts.json contains duplicate IDs")

    index_data = json.loads(INDEX.read_text(encoding="utf-8"))
    index_files = {item["file"] for item in index_data["muds"]}
    actual_files = {path.name for path in MUD_DIR.glob("*.json") if path.name != "_index.json"}
    for missing in sorted(index_files - actual_files):
        fail(errors, f"_index.json references missing file: {missing}")
    for extra in sorted(actual_files - index_files):
        fail(errors, f"MUD file missing from _index.json: {extra}")

    for path in sorted(MUD_DIR.glob("*.json")):
        if path.name == "_index.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        stages = data.get("stages", {})
        if "1" not in stages:
            fail(errors, f"{path.name}: missing starting stage 1")
            continue

        for stage_id, stage in stages.items():
            choices = stage.get("choices", [])
            if len(choices) > 1:
                correct_indices = [
                    index for index, choice in enumerate(choices) if choice.get("correct") is True
                ]
                if not correct_indices or len(correct_indices) == len(choices):
                    fail(
                        errors,
                        f"{path.name}:{stage_id} must contain both correct and incorrect choices, "
                        f"found {len(correct_indices)} correct of {len(choices)}",
                    )
                elif len(correct_indices) == 1:
                    correct_positions.append(correct_indices[0] + 1)

            for choice_index, choice in enumerate(choices):
                target = choice.get("next")
                if not target:
                    fail(errors, f"{path.name}:{stage_id}:{choice_index} missing next")
                elif target != "end" and not str(target).startswith("ending_") and str(target) not in stages:
                    fail(errors, f"{path.name}:{stage_id}:{choice_index} dangling target {target}")
                elif str(target).startswith("ending_") and target not in data.get("endings", {}):
                    fail(errors, f"{path.name}:{stage_id}:{choice_index} missing ending {target}")

            simulator = stage.get("simulator") or {}
            mode = simulator.get("mode")
            if mode and not is_supported_mode(mode):
                fail(errors, f"{path.name}:{stage_id} unsupported simulator mode {mode}")

        reachable: set[str] = set()
        queue: deque[str] = deque(["1"])
        while queue:
            stage_id = queue.popleft()
            if stage_id in reachable or stage_id not in stages:
                continue
            reachable.add(stage_id)
            for choice in stages[stage_id].get("choices", []):
                target = choice.get("next")
                if target and target != "end" and not str(target).startswith("ending_"):
                    queue.append(str(target))

        for unreachable in sorted(set(stages) - reachable):
            fail(errors, f"{path.name}: unreachable stage {unreachable}")

        for reward in data.get("rewards", []):
            artifact_id = reward.get("artifactId")
            if artifact_id not in artifact_ids:
                fail(errors, f"{path.name}: unknown reward artifact {artifact_id}")
            elif reward.get("name") != artifact_names[artifact_id]:
                fail(
                    errors,
                    f"{path.name}: reward name mismatch for {artifact_id} "
                    f"(reward={reward.get('name')!r}, card={artifact_names[artifact_id]!r})",
                )

    story_data = json.loads(STORIES.read_text(encoding="utf-8"))
    for story in story_data:
        for scene in story.get("scenes", []):
            reward = scene.get("reward") or {}
            artifact_id = reward.get("artifactId")
            if artifact_id and artifact_id not in artifact_ids:
                fail(errors, f"{story.get('id')}: unknown story artifact {artifact_id}")

    if correct_positions and len(set(correct_positions)) == 1:
        warn(
            warnings,
            "All multi-choice stages currently place the correct choice at "
            f"position {correct_positions[0]}; runtime shuffling is required.",
        )

    if errors:
        print(f"FAIL: {len(errors)} integrity errors")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print("PASS: MUD integrity, transitions, rewards, index, and simulator modes are valid.")
    for warning in warnings:
        print(f"WARNING: {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
