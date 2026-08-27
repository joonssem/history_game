import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
INDEX = MUD_DIR / "_index.json"
MAPPING = ROOT / "data" / "curriculum_mapping.json"
VERIFIED_STATUS = "achievement-standards-verified-publisher-pending"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


index = read(INDEX)
index["mappingStatus"] = VERIFIED_STATUS
write(INDEX, index)

mapping = read(MAPPING)
mapping["status"] = VERIFIED_STATUS
mapping["textbookStatus"] = "publisher-and-edition-required-for-lesson-mapping"
mapping["verifiedAgainst"] = {
    "document": "2022 개정 공통 교육과정(초등학교) 사회과 성취기준·성취수준",
    "institution": "국립특수교육원",
    "checkedAt": "2026-08-27",
    "url": "https://www.nise.go.kr/ebook/src/viewer/download.php?host=main&no=1&site=20240819_172144",
}

for item in mapping["mappings"]:
    if item["status"] == "pilot-achievement-standard-mapped":
        item["status"] = "achievement-standard-mapped"
    if item["status"] == "achievement-standard-mapped":
        item["reviewNote"] = "2022 개정 성취기준 직접 매핑 검증 완료, 출판사·교과서 판본별 차시 번호 확인 필요"
    else:
        item["reviewNote"] = "성취기준 직접 과제로 단정하지 않는 보조 역사 맥락, 출판사·교과서 판본 확인 뒤 활용 위치 결정"

write(MAPPING, mapping)

for mud_id in ("regular_paleolithic", "regular_neolithic", "regular_bronze_age", "regular_gojoseon"):
    path = MUD_DIR / f"{mud_id}.json"
    data = read(path)
    data["curriculum"]["mappingStatus"] = "achievement-standard-mapped"
    write(path, data)

print("Finalized achievement-standard verification; publisher lesson mapping remains pending.")
