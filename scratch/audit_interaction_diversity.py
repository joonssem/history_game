"""Audit Regular MUD simulator interaction diversity.

This script is intentionally read-only. It reports data-shape counts that can be
reproduced independently of browser rendering.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def percentage(part: int, whole: int) -> str:
    return f"{part / whole * 100:.1f}%" if whole else "n/a"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--details", action="store_true")
    args = parser.parse_args()
    paths = sorted(MUD_DIR.glob("regular_*.json"))
    stage_count = 0
    simulator_rows: list[tuple[str, str, dict]] = []

    for path in paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        stages = data.get("stages", {})
        stage_count += len(stages)
        for stage_id, stage in stages.items():
            simulator = stage.get("simulator")
            if isinstance(simulator, dict) and simulator:
                simulator_rows.append((path.name, stage_id, simulator))

    interaction_counts = Counter(
        simulator.get("interaction", "<none>")
        for _, _, simulator in simulator_rows
    )
    mode_counts = Counter(
        simulator.get("mode", "<none>")
        for _, _, simulator in simulator_rows
    )
    no_interaction_mode_counts = Counter(
        simulator.get("mode", "<none>")
        for _, _, simulator in simulator_rows
        if not simulator.get("interaction")
    )
    hotspot_rows = [
        row
        for row in simulator_rows
        if isinstance(row[2].get("hotspots"), list) and row[2]["hotspots"]
    ]
    hotspot_count_distribution = Counter(
        len(simulator["hotspots"]) for _, _, simulator in hotspot_rows
    )
    hotspot_interactions = Counter(
        simulator.get("interaction", "<none>")
        for _, _, simulator in hotspot_rows
    )
    interaction_without_hotspots = Counter(
        simulator.get("interaction")
        for _, _, simulator in simulator_rows
        if simulator.get("interaction")
        and not (isinstance(simulator.get("hotspots"), list) and simulator["hotspots"])
    )
    scene_rows = [row for row in simulator_rows if row[2].get("scene")]
    unique_scenes = {simulator["scene"] for _, _, simulator in scene_rows}
    hotspot_scene_rows = [row for row in hotspot_rows if row[2].get("scene")]
    custom_radius_rows = [
        row
        for row in hotspot_rows
        if any("radius" in hotspot for hotspot in row[2]["hotspots"])
    ]
    ordered_rows = [
        row for row in simulator_rows if row[2].get("interaction") == "ordered-hotspot"
    ]
    configured_ordered_rows = [
        row
        for row in ordered_rows
        if isinstance(row[2].get("hotspots"), list) and row[2]["hotspots"]
    ]
    configured_ordered_exact_cover = []
    configured_ordered_with_distractors = []
    for row in configured_ordered_rows:
        simulator = row[2]
        hotspot_ids = {hotspot.get("id") for hotspot in simulator["hotspots"]}
        sequence_ids = set(simulator.get("sequence") or [])
        if hotspot_ids == sequence_ids:
            configured_ordered_exact_cover.append(row)
        elif hotspot_ids - sequence_ids:
            configured_ordered_with_distractors.append(row)
    ordered_with_sequence = [
        row
        for row in ordered_rows
        if isinstance(row[2].get("sequence"), list) and row[2]["sequence"]
    ]
    explicit_order_word = re.compile(r"차례|순서|먼저|마지막|→")
    ordered_with_explicit_order_instruction = [
        row
        for row in ordered_rows
        if explicit_order_word.search(str(row[2].get("instruction", "")))
    ]
    three_hotspot_rows = [row for row in hotspot_rows if len(row[2]["hotspots"]) == 3]
    layouts = Counter(
        tuple((hotspot.get("x"), hotspot.get("y")) for hotspot in simulator["hotspots"])
        for _, _, simulator in three_hotspot_rows
    )
    completion_target_counts = Counter(
        (simulator.get("completion") or {}).get("target", "<none>")
        for _, _, simulator in simulator_rows
    )
    three_target_rows = [
        row
        for row in simulator_rows
        if (row[2].get("completion") or {}).get("target") == 3
    ]
    required_rows = [row for row in simulator_rows if row[2].get("required")]
    required_interactions = Counter(
        simulator.get("interaction", "<none>") for _, _, simulator in required_rows
    )
    required_target_counts = Counter(
        (simulator.get("completion") or {}).get("target", "<none>")
        for _, _, simulator in required_rows
    )
    main_stage_rows = [row for row in simulator_rows if "-" not in row[1]]
    retry_stage_rows = [row for row in simulator_rows if "-" in row[1]]
    required_by_file: dict[str, list[tuple[str, str, dict]]] = {}
    for row in required_rows:
        required_by_file.setdefault(row[0], []).append(row)
    all_target_three_files = [
        filename
        for filename, rows in required_by_file.items()
        if rows and all((row[2].get("completion") or {}).get("target") == 3 for row in rows)
    ]
    circular_interactions = {
        "ordered-hotspot",
        "hotspot-discovery",
        "resource-allocation",
        "reflection",
    }
    all_circular_files = [
        filename
        for filename, rows in required_by_file.items()
        if rows and all(row[2].get("interaction") in circular_interactions for row in rows)
    ]

    print(f"regular files: {len(paths)}")
    print(f"all stages: {stage_count}")
    print(f"stages with simulator: {len(simulator_rows)}")
    print("interaction counts:")
    for interaction, count in interaction_counts.most_common():
        print(f"  {interaction}: {count}")
    print(f"declared interaction stages: {len(simulator_rows) - interaction_counts['<none>']}")
    print(f"hotspot-array stages: {len(hotspot_rows)} ({percentage(len(hotspot_rows), len(simulator_rows))} of simulators)")
    print("hotspot interactions:")
    for interaction, count in hotspot_interactions.most_common():
        print(f"  {interaction}: {count}")
    print(f"interaction declarations without hotspots: {dict(interaction_without_hotspots)}")
    print("hotspot-count distribution:")
    for count, stages in sorted(hotspot_count_distribution.items()):
        print(f"  {count} hotspots: {stages} stages")
    print(
        f"exactly 3 hotspots: {len(three_hotspot_rows)} "
        f"({percentage(len(three_hotspot_rows), len(hotspot_rows))} of hotspot stages; "
        f"{percentage(len(three_hotspot_rows), len(simulator_rows))} of simulator stages)"
    )
    print(f"scene declarations: {len(scene_rows)} stages, {len(unique_scenes)} unique scene keys")
    print(f"hotspot stages with scene: {len(hotspot_scene_rows)}")
    print(f"hotspot stages with any custom radius: {len(custom_radius_rows)}")
    print(f"ordered-hotspot with explicit sequence: {len(ordered_with_sequence)}/{len(ordered_rows)}")
    print(
        "configured ordered-hotspot whose sequence covers every hotspot: "
        f"{len(configured_ordered_exact_cover)}/{len(configured_ordered_rows)}"
    )
    print(
        "configured ordered-hotspot with distractor hotspots outside sequence: "
        f"{len(configured_ordered_with_distractors)}/{len(configured_ordered_rows)}"
    )
    print(
        "ordered-hotspot instructions with explicit order wording: "
        f"{len(ordered_with_explicit_order_instruction)}/{len(ordered_rows)}"
    )
    print(f"required simulators: {len(required_rows)}/{len(simulator_rows)}")
    print(f"simulators on main-path IDs: {len(main_stage_rows)}; retry/IF IDs: {len(retry_stage_rows)}")
    print("required interaction counts:")
    for interaction, count in required_interactions.most_common():
        print(f"  {interaction}: {count}")
    print("required completion.target distribution:")
    for target, count in sorted(required_target_counts.items(), key=lambda item: str(item[0])):
        print(f"  {target}: {count}")
    print("completion.target distribution:")
    for target, count in sorted(completion_target_counts.items(), key=lambda item: str(item[0])):
        print(f"  {target}: {count}")
    print(
        f"completion.target == 3: {len(three_target_rows)} "
        f"({percentage(len(three_target_rows), len(simulator_rows))} of simulator stages)"
    )
    print(
        f"Regular files whose every required simulator has target 3: "
        f"{len(all_target_three_files)}/{len(required_by_file)}"
    )
    print(
        f"Regular files whose every required simulator uses the circular hotspot family: "
        f"{len(all_circular_files)}/{len(required_by_file)}"
    )
    print(f"distinct coordinate layouts among 3-hotspot stages: {len(layouts)}")
    print("most common 3-hotspot layouts:")
    for layout, count in layouts.most_common(10):
        print(f"  {count}: {layout}")
    print("most common simulator modes:")
    for mode, count in mode_counts.most_common(20):
        print(f"  {mode}: {count}")
    print("modes among simulators without interaction:")
    for mode, count in no_interaction_mode_counts.most_common():
        print(f"  {mode}: {count}")
    print("required simulators without interaction:")
    for filename, stage_id, simulator in required_rows:
        if not simulator.get("interaction"):
            completion = simulator.get("completion") or {}
            print(
                f"  {filename}:{stage_id} mode={simulator.get('mode')} "
                f"target={completion.get('target')} minActions={completion.get('minActions')}"
            )

    if args.details:
        print("ordered-hotspot details:")
        for filename, stage_id, simulator in ordered_rows:
            labels_by_id = {
                hotspot.get("id"): hotspot.get("label")
                for hotspot in simulator.get("hotspots", [])
            }
            sequence = simulator.get("sequence") or []
            labels = [labels_by_id.get(item, item) for item in sequence]
            instruction = " ".join(str(simulator.get("instruction", "")).split())
            print(
                f"  {filename}:{stage_id} | mode={simulator.get('mode')} | "
                f"sequence={' -> '.join(labels)} | instruction={instruction}"
            )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
