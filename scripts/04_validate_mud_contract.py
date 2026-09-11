"""Validate the explicit MUD and curriculum metadata contract."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
INDEX = MUD_DIR / "_index.json"
MAPPING = ROOT / "data" / "curriculum_mapping.json"
CONTRACT = ROOT / "simulator_contract.json"
STANDARDS = ROOT / "data" / "curriculum_standards_2022.json"
VERIFIED_MAPPING_STATUS = "achievement-standards-verified-publisher-pending"


def inquiry_item_ids(
    value: object,
    prefix: str,
    errors: list[str],
    *,
    min_items: int = 1,
) -> set[str]:
    if not isinstance(value, list) or len(value) < min_items:
        errors.append(f"{prefix} must contain at least {min_items} item(s)")
        return set()
    ids: set[str] = set()
    for index, item in enumerate(value):
        item_prefix = f"{prefix}[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{item_prefix} must be an object")
            continue
        item_id = item.get("id")
        if not isinstance(item_id, str) or not item_id:
            errors.append(f"{item_prefix} missing string id")
        elif item_id in ids:
            errors.append(f"{item_prefix} duplicate id {item_id}")
        else:
            ids.add(item_id)
        if not isinstance(item.get("label"), str) or not item["label"].strip():
            errors.append(f"{item_prefix} missing label")
    return ids


def require_single_correct(value: object, prefix: str, errors: list[str]) -> None:
    if not isinstance(value, list):
        return
    correct_count = sum(item.get("correct") is True for item in value if isinstance(item, dict))
    if correct_count != 1:
        errors.append(f"{prefix} must contain exactly one correct item")


def minimum_distinct_categories(group_sizes: list[int], pick: int) -> int:
    """pick장을 고를 때 나올 수 있는 가장 적은 범주 개수.

    큰 범주부터 채우면 범주 수가 최소가 된다.
    """
    used = 0
    remaining = pick
    for size in sorted(group_sizes, reverse=True):
        if remaining <= 0:
            break
        used += 1
        remaining -= size
    return used


def check_claim_categories(
    prefix: str,
    index: int,
    claim: dict,
    min_evidence: int,
    award_categories: dict[str, str],
) -> list[str]:
    """주장별 범주 조건이 실제로 판정에 영향을 주는지 검사한다.

    minCategories가 어떤 선택으로도 실패할 수 없으면 죽은 조건이므로 알린다.
    requiredCategories가 accepts로 만족될 수 없으면 통과 불가능한 주장이므로 알린다.
    """
    problems: list[str] = []
    accepts = claim.get("accepts")
    if not isinstance(accepts, list) or not accepts:
        return problems

    categories: dict[str, int] = {}
    for evidence_id in accepts:
        category = award_categories.get(evidence_id)
        if category:
            categories[category] = categories.get(category, 0) + 1
    if not categories:
        return problems

    required = claim.get("requiredCategories")
    if required is not None:
        if not isinstance(required, list) or not all(isinstance(item, str) for item in required):
            problems.append(f"{prefix}:task.claims[{index}] requiredCategories must be a list of strings")
        else:
            for category in required:
                if category not in categories:
                    problems.append(
                        f"{prefix}:task.claims[{index}] requiredCategories '{category}' is unreachable from accepts"
                    )

    min_categories = claim.get("minCategories")
    if isinstance(min_categories, int) and min_categories > 1 and not claim.get("requiredCategories"):
        floor = minimum_distinct_categories(list(categories.values()), min_evidence)
        if floor >= min_categories:
            problems.append(
                f"{prefix}:task.claims[{index}] minCategories={min_categories} can never fail "
                f"(any {min_evidence} accepted evidence already span {floor} categories)"
            )
    return problems


def check_task_labels(prefix: str, task: dict, required_keys: tuple[str, ...]) -> list[str]:
    """화면에 보이는 섹션 제목이 편마다 맞는 말인지 검사한다.

    같은 task 유형을 다른 시대에 재사용하면 코드에 박힌 문구가 그대로 따라온다.
    2026-09-11에 map-evidence를 신석기·삼국에 쓰면서 "국제 교류를 뒷받침하는
    근거"라는 고려 벽란도 전용 문구가 노출된 사례가 있었다. 그래서 labels는
    필수로 두고, 편의 내용과 무관한 문구가 남아 있는지 함께 본다.
    """
    problems: list[str] = []
    labels = task.get("labels")
    if not isinstance(labels, dict):
        problems.append(f"{prefix}:task.labels is required so section titles match this MUD")
        return problems
    for key in required_keys:
        value = labels.get(key)
        if not isinstance(value, str) or not value.strip():
            problems.append(f"{prefix}:task.labels.{key} must be a non-empty string")
    return problems


def validate_inquiry_task(
    simulator: dict,
    prefix: str,
    supported_types: set[str],
    errors: list[str],
    awarded_ids: set[str],
    referenced_ids: list[tuple[str, str]],
    awarded_categories: dict[str, str],
    claim_checks: list[tuple[str, int, dict, int]],
) -> None:
    task = simulator.get("task")
    if not isinstance(task, dict):
        errors.append(f"{prefix}: inquiry-task requires task object")
        return
    task_type = task.get("type")
    if task_type not in supported_types:
        errors.append(f"{prefix}: unsupported inquiry task type {task_type}")
        return
    if not isinstance(task.get("prompt"), str) or not task["prompt"].strip():
        errors.append(f"{prefix}: inquiry task missing prompt")

    awards = task.get("awards", [])
    if awards:
        award_ids = inquiry_item_ids(awards, f"{prefix}:task.awards", errors)
        for award_id in award_ids:
            if award_id in awarded_ids:
                errors.append(f"{prefix}: duplicate inquiry evidence award {award_id}")
            awarded_ids.add(award_id)
        for index, award in enumerate(awards):
            if not isinstance(award, dict):
                continue
            if award.get("role") not in {"support", "limit"}:
                errors.append(f"{prefix}:task.awards[{index}] invalid role")
            if not isinstance(award.get("category"), str) or not award["category"].strip():
                errors.append(f"{prefix}:task.awards[{index}] missing category")
            elif isinstance(award.get("id"), str):
                awarded_categories[award["id"]] = award["category"]

    if task_type == "commit-revise":
        option_ids = inquiry_item_ids(task.get("options"), f"{prefix}:task.options", errors, min_items=2)
        require_single_correct(task.get("options"), f"{prefix}:task.options", errors)
        evidence_ids = inquiry_item_ids(task.get("evidence"), f"{prefix}:task.evidence", errors, min_items=2)
        required_ids = task.get("requiredEvidenceIds")
        if not isinstance(required_ids, list) or not required_ids:
            errors.append(f"{prefix}: commit-revise requires requiredEvidenceIds")
        else:
            for evidence_id in required_ids:
                if evidence_id not in evidence_ids:
                    errors.append(f"{prefix}: requiredEvidenceIds references unknown {evidence_id}")
        if len(option_ids) < 2:
            errors.append(f"{prefix}: commit-revise needs at least two judgments")

    elif task_type == "sequence":
        card_ids = inquiry_item_ids(task.get("cards"), f"{prefix}:task.cards", errors, min_items=3)
        correct_order = task.get("correctOrder")
        if not isinstance(correct_order, list) or len(correct_order) != len(card_ids) or set(correct_order) != card_ids:
            errors.append(f"{prefix}: correctOrder must contain every card id exactly once")
        meaning = task.get("meaningQuestion")
        if not isinstance(meaning, dict):
            errors.append(f"{prefix}: sequence requires meaningQuestion")
        else:
            inquiry_item_ids(meaning.get("options"), f"{prefix}:task.meaningQuestion.options", errors, min_items=2)
            require_single_correct(meaning.get("options"), f"{prefix}:task.meaningQuestion.options", errors)

    elif task_type == "map-evidence":
        location_ids = inquiry_item_ids(task.get("locations"), f"{prefix}:task.locations", errors, min_items=2)
        inquiry_item_ids(task.get("supports"), f"{prefix}:task.supports", errors, min_items=2)
        inquiry_item_ids(task.get("limits"), f"{prefix}:task.limits", errors, min_items=2)
        require_single_correct(task.get("locations"), f"{prefix}:task.locations", errors)
        require_single_correct(task.get("supports"), f"{prefix}:task.supports", errors)
        require_single_correct(task.get("limits"), f"{prefix}:task.limits", errors)
        hotspot_ids = {item.get("id") for item in simulator.get("hotspots", []) if isinstance(item, dict)}
        if hotspot_ids != location_ids:
            errors.append(f"{prefix}: map-evidence hotspots and locations must use the same ids")
        errors.extend(check_task_labels(prefix, task, ("location", "support", "limit")))

    elif task_type == "claim-evidence":
        claim_ids = inquiry_item_ids(task.get("claims"), f"{prefix}:task.claims", errors)
        allowed_ids = task.get("allowedEvidenceIds")
        if not isinstance(allowed_ids, list) or len(allowed_ids) < 2 or len(set(allowed_ids)) != len(allowed_ids):
            errors.append(f"{prefix}: claim-evidence requires unique allowedEvidenceIds")
            allowed_ids = []
        for evidence_id in allowed_ids:
            referenced_ids.append((prefix, evidence_id))
        min_evidence = task.get("minEvidence")
        max_evidence = task.get("maxEvidence")
        if not isinstance(min_evidence, int) or not isinstance(max_evidence, int) or not 1 <= min_evidence <= max_evidence:
            errors.append(f"{prefix}: invalid minEvidence/maxEvidence")
        minimum_required = min_evidence if isinstance(min_evidence, int) and min_evidence > 0 else 1
        for index, claim in enumerate(task.get("claims", [])):
            if not isinstance(claim, dict):
                continue
            accepts = claim.get("accepts")
            if not isinstance(accepts, list) or len(accepts) < minimum_required:
                errors.append(f"{prefix}:task.claims[{index}] has too few accepted evidence ids")
            else:
                for evidence_id in accepts:
                    if evidence_id not in allowed_ids:
                        errors.append(f"{prefix}:task.claims[{index}] accepts unknown {evidence_id}")
            if not isinstance(claim.get("minCategories"), int) or claim["minCategories"] < 1:
                errors.append(f"{prefix}:task.claims[{index}] invalid minCategories")
            claim_checks.append((prefix, index, claim, minimum_required))
        if not claim_ids:
            errors.append(f"{prefix}: claim-evidence needs a claim")
        limits = task.get("limits", [])
        if limits:
            inquiry_item_ids(limits, f"{prefix}:task.limits", errors)
            require_single_correct(limits, f"{prefix}:task.limits", errors)


def main() -> int:
    errors: list[str] = []
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    standards = json.loads(STANDARDS.read_text(encoding="utf-8"))["standards"]

    if index.get("curriculumVersion") != "2015-revised-grade5-semester2":
        errors.append("_index.json must identify its current content curriculum")
    if index.get("targetCurriculumVersion") != "2022-revised":
        errors.append("_index.json must identify the target curriculum")
    if index.get("mappingStatus") != VERIFIED_MAPPING_STATUS:
        errors.append("_index.json must identify verified standards with publisher mapping pending")
    if mapping.get("status") != VERIFIED_MAPPING_STATUS:
        errors.append("curriculum_mapping.json must identify verified standards with publisher mapping pending")
    if mapping.get("textbookStatus") != "publisher-and-edition-required-for-lesson-mapping":
        errors.append("curriculum_mapping.json must keep textbook lesson mapping publisher-dependent")

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

    mapping_by_id = {item["mudId"]: item for item in mapping.get("mappings", [])}
    for mud_id, item in mapping_by_id.items():
        target_standards = item.get("targetAchievementStandards", [])
        for standard_id in target_standards:
            if standard_id not in standards:
                errors.append(f"{mud_id}: unknown 2022 achievement standard {standard_id}")
        if item.get("status") in {
            "pilot-achievement-standard-mapped",
            "achievement-standard-mapped",
        }:
            source_path = MUD_DIR / entries[mud_id]["file"]
            mud_data = json.loads(source_path.read_text(encoding="utf-8"))
            mud_standards = mud_data.get("curriculum", {}).get("achievementStandards", [])
            if set(mud_standards) != set(target_standards):
                errors.append(f"{mud_id}: MUD and mapping achievement standards differ")
            if len(mud_data.get("sources", [])) < 2:
                errors.append(f"{mud_id}: mapped MUD requires curriculum and historical source metadata")

    supported = set(contract.get("supportedInteractions", []))
    supported_progress_keys = set(contract.get("supportedProgressKeys", []))
    supported_action_types = set(contract.get("supportedActionTypes", []))
    supported_completion_strategies = set(contract.get("completionStrategies", []))
    supported_inquiry_types = set(contract.get("inquiryTaskTypes", []))
    for path in sorted(MUD_DIR.glob("*.json")):
        if path.name == "_index.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        inquiry_awarded_ids: set[str] = set()
        inquiry_referenced_ids: list[tuple[str, str]] = []
        inquiry_award_categories: dict[str, str] = {}
        inquiry_claim_checks: list[tuple[str, int, dict, int]] = []
        for stage_id, stage in data.get("stages", {}).items():
            simulator = stage.get("simulator") or {}
            interaction = simulator.get("interaction")
            if interaction and interaction not in supported:
                errors.append(f"{path.name}:{stage_id}: unsupported interaction {interaction}")
            if interaction == "inquiry-task":
                validate_inquiry_task(
                    simulator,
                    f"{path.name}:{stage_id}",
                    supported_inquiry_types,
                    errors,
                    inquiry_awarded_ids,
                    inquiry_referenced_ids,
                    inquiry_award_categories,
                    inquiry_claim_checks,
                )
            if "buttonsHtml" in simulator:
                errors.append(f"{path.name}:{stage_id}: executable buttonsHtml is not allowed")
            actions = simulator.get("actions")
            if simulator.get("type") == "buttons":
                if not isinstance(actions, list) or not actions:
                    errors.append(f"{path.name}:{stage_id}: buttons simulator requires actions")
                else:
                    for action_index, action in enumerate(actions):
                        prefix = f"{path.name}:{stage_id}:actions[{action_index}]"
                        if not isinstance(action, dict):
                            errors.append(f"{prefix}: action must be an object")
                            continue
                        if action.get("type") not in supported_action_types:
                            errors.append(f"{prefix}: unsupported action type {action.get('type')}")
                        if not isinstance(action.get("label"), str) or not action["label"].strip():
                            errors.append(f"{prefix}: missing label")
                        if "value" not in action:
                            errors.append(f"{prefix}: missing value")
            if simulator.get("required"):
                completion = simulator.get("completion") or {}
                for field in contract["requiredSimulatorCompletion"]:
                    if field not in completion or not completion[field]:
                        errors.append(f"{path.name}:{stage_id}: missing completion.{field}")
                if completion.get("uniqueActions") is not None and not isinstance(completion.get("uniqueActions"), bool):
                    errors.append(f"{path.name}:{stage_id}: completion.uniqueActions must be boolean")
                progress_key = completion.get("progressKey", "gaugeProgress")
                if progress_key not in supported_progress_keys:
                    errors.append(
                        f"{path.name}:{stage_id}: unsupported completion.progressKey {progress_key}"
                    )
                strategy = completion.get("strategy", "counter")
                if strategy not in supported_completion_strategies:
                    errors.append(f"{path.name}:{stage_id}: unsupported completion.strategy {strategy}")
                if interaction == "inquiry-task" and strategy != "validated-state":
                    errors.append(f"{path.name}:{stage_id}: inquiry-task requires validated-state completion")

        for prefix, evidence_id in inquiry_referenced_ids:
            if evidence_id not in inquiry_awarded_ids:
                errors.append(f"{prefix}: allowedEvidenceIds references unawarded {evidence_id}")

        for prefix, index, claim, min_evidence in inquiry_claim_checks:
            errors.extend(
                check_claim_categories(prefix, index, claim, min_evidence, inquiry_award_categories)
            )

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
