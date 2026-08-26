"""Expand reviewed 2022 curriculum mappings without assigning textbook lesson numbers.

The 2022 curriculum specifies achievement standards, while publisher-specific
lesson numbers remain intentionally blank until the class textbook is confirmed.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
MAPPING_PATH = ROOT / "data" / "curriculum_mapping.json"
STANDARDS_PATH = ROOT / "data" / "curriculum_standards_2022.json"
CURRICULUM_SOURCE = {
    "institution": "국립특수교육원",
    "title": "2022 개정 공통 교육과정(초등학교) 사회과 성취수준",
    "url": "https://www.nise.go.kr/ebook/src/viewer/download.php?host=main&no=1&site=20240819_172144",
    "checkedAt": "2026-08-26",
}

STANDARDS = {
    "6사04-02": ("유적과 유물로 살펴본 옛 사람들의 생활", "역사 기록이나 유적과 유물에 나타난 고대 사람들의 생각과 생활을 추론한다."),
    "6사04-03": ("유적과 유물로 살펴본 옛 사람들의 생활", "다양한 역사 자료를 활용하여 고려 시대 사회 모습과 사람들의 생활을 추론한다."),
    "6사05-01": ("달라지는 시대, 변화하는 생활 모습", "조선 시대 사람들의 생각과 생활에 유교 문화가 미친 영향을 파악한다."),
    "6사05-02": ("달라지는 시대, 변화하는 생활 모습", "조선 후기 사회·문화적 변화와 개항기 근대 문물 수용 과정에서 달라진 사람들의 생활을 이해한다."),
    "6사06-01": ("식민 통치와 저항, 전쟁이 바꾼 사회와 생활", "일제의 식민 통치와 이에 대한 저항이 사회와 생활에 미친 영향을 이해한다."),
    "6사06-02": ("식민 통치와 저항, 전쟁이 바꾼 사회와 생활", "8·15 광복과 6·25 전쟁이 사회와 생활에 미친 영향을 파악한다."),
    "6사07-02": ("평화 통일을 위한 노력, 민주화와 산업화", "민주화와 산업화로 인해 달라진 생활 문화를 사례를 들어 이해한다."),
}
UNIT_IDS = {
    "6사04": 4,
    "6사05": 5,
    "6사06": 6,
    "6사07": 7,
}

MAPPINGS = {
    "regular_three_kingdoms": ["6사04-02"],
    "regular_three_kingdoms_life": ["6사04-02"],
    "regular_silla": ["6사04-02"],
    "regular_balhae": ["6사04-02"],
    "deep_three_kingdoms": ["6사04-02"],
    "regular_goryeo_founding": ["6사04-03"],
    "regular_goryeo_society": ["6사04-03"],
    "regular_goryeo_war": ["6사04-03"],
    "regular_goryeo_culture": ["6사04-03"],
    "regular_joseon_founding": ["6사05-01"],
    "regular_sejong": ["6사05-01"],
    "regular_joseon_status": ["6사05-01"],
    "regular_joseon_economy": ["6사05-02"],
    "regular_joseon_silhak": ["6사05-02"],
    "regular_joseon_folk": ["6사05-02"],
    "regular_modern_open": ["6사05-02"],
    "deep_joseon": ["6사05-01", "6사05-02"],
    "regular_independence_army": ["6사06-01"],
    "regular_japanese_rule_1": ["6사06-01"],
    "regular_japanese_rule_2": ["6사06-01"],
    "regular_independence": ["6사06-01"],
    "regular_gwangbok": ["6사06-02"],
    "regular_korean_war": ["6사06-02"],
    "regular_post_war": ["6사06-02"],
    "deep_modern": ["6사06-01", "6사06-02", "6사07-02"],
    "deep_prehistoric": ["6사04-01"],
}

SUPPLEMENTARY = {
    "regular_myeongnyang": "임진왜란·명량대첩은 현행 성취기준의 직접 성취 과제로 단정하지 않고 보조 역사 맥락으로 유지한다.",
    "regular_joseon_diplomacy": "조선 외교·병자호란은 현행 성취기준의 직접 성취 과제로 단정하지 않고 보조 역사 맥락으로 유지한다.",
}


def source_with_scope(standards: list[str]) -> dict:
    return {**CURRICULUM_SOURCE, "claimScope": f"2022 개정 성취기준 {', '.join(standards)}과의 주제 정합성"}


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    standards_data = json.loads(STANDARDS_PATH.read_text(encoding="utf-8"))
    for standard_id, (unit_title, text) in STANDARDS.items():
        standards_data["standards"][standard_id] = {
            "area": "역사" if standard_id.startswith(("6사04", "6사05", "6사06")) else "일반사회",
            "unitTitle": unit_title,
            "text": text,
            "source": CURRICULUM_SOURCE,
        }
    write_json(STANDARDS_PATH, standards_data)

    mapping_data = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    mappings = {item["mudId"]: item for item in mapping_data["mappings"]}
    for mud_id, standard_ids in MAPPINGS.items():
        item = mappings[mud_id]
        item["targetUnitId"] = UNIT_IDS[standard_ids[0][:4]]
        item["targetUnitTitle"] = STANDARDS[standard_ids[0]][0] if standard_ids[0] in STANDARDS else "유적과 유물로 살펴본 옛 사람들의 생활"
        item["targetLessonNumbers"] = []
        item["targetAchievementStandards"] = standard_ids
        item["status"] = "achievement-standard-mapped"
        item["reviewNote"] = "성취기준 직접 매핑 완료, 출판사별 차시 번호 및 개별 서술 근거 확인 필요"
        item["sources"] = [CURRICULUM_SOURCE["url"]]
        mud_path = MUD_DIR / next(entry["file"] for entry in json.loads((MUD_DIR / "_index.json").read_text(encoding="utf-8"))["muds"] if entry["mudId"] == mud_id)
        mud_data = json.loads(mud_path.read_text(encoding="utf-8"))
        mud_data["curriculum"] = {
            "version": "2022-revised",
            "achievementStandards": standard_ids,
            "mappingStatus": "achievement-standard-mapped",
        }
        sources = mud_data.setdefault("sources", [])
        if not any(source.get("url") == CURRICULUM_SOURCE["url"] for source in sources):
            sources.insert(0, source_with_scope(standard_ids))
        write_json(mud_path, mud_data)

    for mud_id, review_note in SUPPLEMENTARY.items():
        item = mappings[mud_id]
        item["targetUnitId"] = None
        item["targetUnitTitle"] = None
        item["targetLessonNumbers"] = []
        item["targetAchievementStandards"] = []
        item["status"] = "supplementary-content-review-required"
        item["reviewNote"] = review_note
        item["sources"] = [CURRICULUM_SOURCE["url"]]
    mapping_data["status"] = "pending-content-review"
    mapping_data["description"] = "2022 개정 성취기준 직접 매핑과 보조 역사 맥락을 구분한 매핑 기준선"
    write_json(MAPPING_PATH, mapping_data)
    print(f"Mapped {len(MAPPINGS)} MUDs; retained {len(SUPPLEMENTARY)} as supplementary content.")


if __name__ == "__main__":
    main()
