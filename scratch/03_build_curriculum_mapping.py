"""Build an explicit legacy-to-2022 curriculum mapping scaffold.

The target curriculum is intentionally left unmapped until an education expert
confirms the textbook sequence and achievement-standard alignment.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "data" / "mud" / "_index.json"
OUTPUT = ROOT / "data" / "curriculum_mapping.json"


def main() -> None:
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    existing_by_id = {}
    if OUTPUT.exists():
        existing = json.loads(OUTPUT.read_text(encoding="utf-8"))
        existing_by_id = {item["mudId"]: item for item in existing.get("mappings", [])}
    mappings = []
    for item in index["muds"]:
        mapping = {
            "mudId": item["mudId"],
            "legacyCurriculum": "2015-revised-grade5-semester2",
            "legacyUnitId": item["unitId"],
            "legacyLessonNumbers": item["lessonNumbers"],
            "targetCurriculum": "2022-revised",
            "targetUnitId": None,
            "targetLessonNumbers": [],
            "status": "unmapped",
            "reviewNote": "2022 개정 교육과정 교과서 차시 확인 필요",
        }
        previous = existing_by_id.get(item["mudId"], {})
        for field in (
            "targetUnitId",
            "targetUnitTitle",
            "targetLessonNumbers",
            "targetAchievementStandards",
            "status",
            "reviewNote",
            "sources",
        ):
            if field in previous:
                mapping[field] = previous[field]
        mappings.append(mapping)

    result = {
        "version": "1.0",
        "status": "pending-content-review",
        "source": "data/mud/_index.json",
        "description": "기존 차시 연결과 2022 개정 교육과정 연결을 분리한 매핑 기준선",
        "mappings": mappings,
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(mappings)} mapping records to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
