"""Validate the explicit MUD and curriculum metadata contract."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
INDEX = MUD_DIR / "_index.json"
MAPPING = ROOT / "data" / "curriculum_mapping.json"
CONTRACT = ROOT / "simulator_contract.json"


def main() -> int:
    errors: list[str] = []
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))

    if index.get("curriculumVersion") != "2015-revised-grade5-semester2":
        errors.append("_index.json must identify its current content curriculum")
    if index.get("targetCurriculumVersion") != "2022-revised":
        errors.append("_index.json must identify the target curriculum")
    if index.get("mappingStatus") != "pending-content-review":
        errors.append("_index.json must keep 2022 mapping pending until reviewed")
    if mapping.get("status") != "pending-content-review":
        errors.append("curriculum_mapping.json must remain pending-content-review")

    entries = {item.get("mudId"): item for item in index.get("muds", [])}
    mapped_ids = {item.get("mudId") for item in mapping.get("mappings", [])}
    actual_files = {path.name for path in MUD_DIR.glob("*.json") if path.name != "_index.json"}
    indexed_files = set()

    for mud_id, entry in entries.items():
        filename = entry.get("file")
        if not isinstance(filename, str):
            errors.append(f"{mud_id}: missing index file")
            continue
        indexed_files.add(filename)
        path = MUD_DIR / filename
        if not path.exists():
            errors.append(f"{mud_id}: index references missing {filename}")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("mudId") != mud_id:
            errors.append(f"{filename}: mudId does not match index ({mud_id})")
        if not isinstance(data.get("stages"), dict) or "1" not in data["stages"]:
            errors.append(f"{filename}: missing starting stage 1")

    for filename in sorted(actual_files - indexed_files):
        errors.append(f"{filename}: missing from _index.json")
    if set(entries) != mapped_ids:
        errors.append("curriculum_mapping.json must contain exactly one record per indexed MUD")

    supported = set(contract.get("supportedInteractions", []))
    for path in sorted(MUD_DIR.glob("*.json")):
        if path.name == "_index.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        for stage_id, stage in data.get("stages", {}).items():
            simulator = stage.get("simulator") or {}
            interaction = simulator.get("interaction")
            if interaction and interaction not in supported:
                errors.append(f"{path.name}:{stage_id}: unsupported interaction {interaction}")
            if simulator.get("required"):
                completion = simulator.get("completion") or {}
                for field in contract["requiredSimulatorCompletion"]:
                    if field not in completion or not completion[field]:
                        errors.append(f"{path.name}:{stage_id}: missing completion.{field}")

    if errors:
        print(f"FAIL: {len(errors)} contract errors")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print(
        "PASS: MUD contract, index coverage, simulator interactions, "
        "and curriculum mapping separation are valid."
    )
    print(f"INFO: {len(entries)} MUDs tracked; 2022 mapping status: {mapping['status']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
