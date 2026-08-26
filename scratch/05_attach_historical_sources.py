"""Attach topic-level public historical references to mapped MUD records."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
MAPPING_PATH = ROOT / "data" / "curriculum_mapping.json"
CURRICULUM_URL = "https://www.nise.go.kr/ebook/src/viewer/download.php?host=main&no=1&site=20240819_172144"

SOURCE_BY_STANDARD = {
    "6사04-01": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_h71_0030_0010", "국사편찬위원회", "우리나라의 선사 시대"),
    "6사04-02": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_h31_0040_0030_0020", "국사편찬위원회", "삼국 시대의 발전"),
    "6사04-03": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_e21_0010_0020_0060", "국사편찬위원회", "후삼국과 고려의 통일"),
    "6사05-01": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_h21_0050_0010", "국사편찬위원회", "조선 시대의 정치와 사회"),
    "6사05-02": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_h21_0050_0070", "국사편찬위원회", "실학 운동과 문화의 새 동향"),
    "6사06-01": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_h62_0040_0030", "국사편찬위원회", "일제 강점기의 민족 운동"),
    "6사06-02": ("https://contents.history.go.kr/front/ta/view.do?levelId=ta_m42_0060_0020", "국사편찬위원회", "6·25 전쟁"),
    "6사07-02": ("https://contents.history.go.kr/front/hm/main.do", "국사편찬위원회", "사료로 본 한국사"),
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    index = read_json(MUD_DIR / "_index.json")
    files = {entry["mudId"]: MUD_DIR / entry["file"] for entry in index["muds"]}
    mapping_data = read_json(MAPPING_PATH)
    for item in mapping_data["mappings"]:
        standards = item.get("targetAchievementStandards", [])
        if item.get("status") not in {"pilot-achievement-standard-mapped", "achievement-standard-mapped"}:
            continue
        urls = []
        for standard_id in standards:
            source = SOURCE_BY_STANDARD[standard_id]
            if source[0] not in urls:
                urls.append(source[0])
        if not urls:
            continue
        item["sources"] = [CURRICULUM_URL, *urls]
        mud_path = files[item["mudId"]]
        mud_data = read_json(mud_path)
        source_records = mud_data.setdefault("sources", [])
        for standard_id in standards:
            url, institution, title = SOURCE_BY_STANDARD[standard_id]
            if any(source.get("url") == url for source in source_records):
                continue
            source_records.append({
                "institution": institution,
                "title": title,
                "url": url,
                "checkedAt": "2026-08-26",
                "claimScope": f"{standard_id} 관련 주제와 자료를 확인하기 위한 참고 출처; 개별 서술은 별도 검증 필요",
            })
        write_json(mud_path, mud_data)
    write_json(MAPPING_PATH, mapping_data)
    print("Attached topic-level historical references to mapped MUDs.")


if __name__ == "__main__":
    main()
