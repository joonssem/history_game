"""Audit MUD activity depth against the intended individual-session duration.

This is a deterministic design heuristic, not a substitute for classroom timing.
It highlights scenarios that need student usability testing first.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
REPORT = ROOT / "activity_duration_audit.md"

PASSIVE_MODES = {"text-reading", "info", None}


def visible_length(value: str) -> int:
    text = re.sub(r"<[^>]+>", " ", value or "")
    return len(re.sub(r"\s+", "", text))


def estimate_seconds(data: dict) -> int:
    seconds = 0
    for stage_id, stage in data.get("stages", {}).items():
        if "-" in stage_id:
            continue
        narrative_chars = visible_length(stage.get("narrative", ""))
        choice_chars = sum(visible_length(choice.get("text", "")) for choice in stage.get("choices", []))
        glossary_chars = sum(
            visible_length(item.get("term", "")) + visible_length(item.get("definition", ""))
            for item in stage.get("glossary", [])
        )
        seconds += round((narrative_chars + choice_chars + glossary_chars) / 4.5)
        if stage.get("choices"):
            seconds += 18
        simulator = stage.get("simulator") or {}
        completion = simulator.get("completion") or {}
        if simulator.get("required"):
            seconds += 18 + int(completion.get("minActions", completion.get("target", 1))) * 8
        elif simulator:
            seconds += 12 if simulator.get("mode") in PASSIVE_MODES else 22
    return seconds


def audit(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    main_stages = [stage for stage_id, stage in data.get("stages", {}).items() if "-" not in stage_id]
    simulators = [stage.get("simulator") or {} for stage in main_stages if stage.get("simulator")]
    required = [sim for sim in simulators if sim.get("required")]
    active = [sim for sim in simulators if sim.get("mode") not in PASSIVE_MODES]
    estimated = estimate_seconds(data)
    flags = []
    if data.get("tier") == "regular":
        if estimated < 300:
            flags.append("5분 미만 추정")
        if estimated > 600:
            flags.append("10분 초과 추정")
        if len(main_stages) < 4:
            flags.append("핵심 단계 4개 미만")
        if not required:
            flags.append("필수 조작 없음")
        if len(active) < 2:
            flags.append("능동 활동 2개 미만")
    return {
        "mudId": data["mudId"],
        "tier": data.get("tier", "regular"),
        "declared": data.get("playTime", "미기록"),
        "stages": len(main_stages),
        "simulators": len(simulators),
        "active": len(active),
        "required": len(required),
        "estimatedMinutes": round(estimated / 60, 1),
        "flags": flags,
    }


def main() -> int:
    rows = [audit(path) for path in sorted(MUD_DIR.glob("*.json")) if path.name != "_index.json"]
    regular = [row for row in rows if row["tier"] == "regular"]
    flagged = [row for row in regular if row["flags"]]
    lines = [
        "# MUD 활동 시간·상호작용 전수 감사",
        "",
        "> 대상: 학생 개인 iPad 10세대, 수업 마무리 활동, Regular MUD 목표 5~10분",
        "> 추정치는 읽기량·선택 판단·시뮬레이터 조작 수에 기반한 설계 지표이며 실제 학생 시간 측정을 대신하지 않습니다.",
        "",
        f"- Regular MUD: {len(regular)}종",
        f"- 보완 우선 대상: {len(flagged)}종",
        f"- 기준 충족 추정: {len(regular) - len(flagged)}종",
        "",
        "## 전수 결과",
        "",
        "| MUD | 선언 시간 | 핵심 단계 | 시뮬레이터 | 능동 활동 | 필수 활동 | 추정 시간 | 보완 신호 |",
        "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for row in sorted(regular, key=lambda item: (not item["flags"], item["estimatedMinutes"], item["mudId"])):
        flags = ", ".join(row["flags"]) if row["flags"] else "기준 충족 추정"
        lines.append(
            f"| `{row['mudId']}` | {row['declared']} | {row['stages']} | {row['simulators']} | "
            f"{row['active']} | {row['required']} | {row['estimatedMinutes']}분 | {flags} |"
        )
    lines.extend([
        "",
        "## 해석과 적용 순서",
        "",
        "1. `필수 조작 없음`은 선택지만 빠르게 눌러 통과할 수 있으므로 가장 먼저 보완합니다.",
        "2. `능동 활동 2개 미만`은 정보 화면을 조작 활동으로 교체하거나 관찰·배열·분류 과제를 추가합니다.",
        "3. `핵심 단계 4개 미만`은 학습 목표와 직접 연결되는 판단·성찰 단계를 추가합니다.",
        "4. 자동 추정 통과 후에도 초등학생 3명 이상으로 실제 5~10분 소요 시간을 측정합니다.",
        "",
    ])
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Audited {len(rows)} MUDs; {len(flagged)}/{len(regular)} regular MUDs need review.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
