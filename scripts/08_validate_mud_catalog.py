"""Keep the MUD navigation index and README catalog aligned with JSON sources."""

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
INDEX_PATH = MUD_DIR / "_index.json"
README_PATH = ROOT / "README.md"
START = "<!-- MUD_CATALOG:START -->"
END = "<!-- MUD_CATALOG:END -->"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def lesson_label(numbers):
    if not numbers:
        return "—"
    if len(numbers) == 1:
        return f"{numbers[0]}차시"
    return f"{numbers[0]}~{numbers[-1]}차시"


def catalog_block(entries):
    rows = [
        START,
        "| 구분 | 차시 | MUD 제목 | 데이터 파일 |",
        "|---|---|---|---|",
    ]
    for entry in entries:
        tier = "Regular" if entry["tier"] == "regular" else "Deep-dive"
        rows.append(
            f"| {tier} | {lesson_label(entry['lessonNumbers'])} | {entry['title']} | `{entry['file']}` |"
        )
    rows.append(END)
    return "\n".join(rows)


def main():
    errors = []
    index = load_json(INDEX_PATH)
    entries = index.get("muds", [])
    seen = set()

    for entry in entries:
        mud_id = entry.get("mudId")
        filename = entry.get("file")
        prefix = f"_index.json:{mud_id or filename or 'unknown'}"
        if not mud_id or not filename:
            errors.append(f"{prefix}: mudId and file are required")
            continue
        if mud_id in seen:
            errors.append(f"{prefix}: duplicate mudId")
        seen.add(mud_id)
        path = MUD_DIR / filename
        if not path.exists():
            errors.append(f"{prefix}: source file does not exist")
            continue
        source = load_json(path)
        for field in ("mudId", "tier", "unitId", "lessonNumbers", "title", "subtitle", "storyId", "themeColor", "accentColor"):
            if entry.get(field) != source.get(field):
                errors.append(f"{prefix}: {field} differs from {filename}")

    source_files = {path.name for path in MUD_DIR.glob("*.json") if path.name != "_index.json"}
    indexed_files = {entry.get("file") for entry in entries}
    for filename in sorted(source_files - indexed_files):
        errors.append(f"{filename}: missing from _index.json catalog")
    for filename in sorted(indexed_files - source_files):
        errors.append(f"{filename}: listed but no source JSON exists")

    readme = README_PATH.read_text(encoding="utf-8")
    expected = catalog_block(entries)
    if START not in readme or END not in readme:
        errors.append("README.md: managed MUD catalog markers are missing")
    else:
        actual = readme.split(START, 1)[1].split(END, 1)[0].strip()
        expected_inner = expected.split(START, 1)[1].split(END, 1)[0].strip()
        if actual != expected_inner:
            errors.append("README.md: managed MUD catalog does not match data/mud/_index.json")

    if "--print" in sys.argv:
        print(expected)
    if errors:
        print("FAIL: MUD catalog validation errors")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"PASS: {len(entries)} MUD index entries and README catalog match JSON sources.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
