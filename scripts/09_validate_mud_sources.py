"""Validate MUD source metadata and reject duplicate source records."""

import json
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
REQUIRED_FIELDS = ("institution", "title", "url", "checkedAt", "claimScope")


def main():
    errors = []
    files = [path for path in sorted(MUD_DIR.glob("*.json")) if path.name != "_index.json"]
    source_count = 0

    for path in files:
        data = json.loads(path.read_text(encoding="utf-8"))
        sources = data.get("sources")
        if not isinstance(sources, list) or not sources:
            errors.append(f"{path.name}: sources must be a non-empty list")
            continue

        seen_urls = set()
        has_curriculum_source = False
        has_history_source = False
        for index, source in enumerate(sources):
            prefix = f"{path.name}:sources[{index}]"
            source_count += 1
            if not isinstance(source, dict):
                errors.append(f"{prefix}: source must be an object")
                continue
            for field in REQUIRED_FIELDS:
                if not isinstance(source.get(field), str) or not source[field].strip():
                    errors.append(f"{prefix}: missing {field}")
            url = source.get("url", "")
            parsed = urlparse(url)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                errors.append(f"{prefix}: invalid http(s) URL")
            if url in seen_urls:
                errors.append(f"{prefix}: duplicate source URL {url}")
            seen_urls.add(url)
            institution = source.get("institution", "")
            title = source.get("title", "")
            if "교육과정" in title or institution in {"교육부", "국립특수교육원"}:
                has_curriculum_source = True
            if institution == "국사편찬위원회":
                has_history_source = True

        mapping_status = data.get("curriculum", {}).get("mappingStatus")
        if mapping_status == "achievement-standard-mapped":
            if not has_curriculum_source:
                errors.append(f"{path.name}: mapped MUD needs a curriculum source")
            if not has_history_source:
                errors.append(f"{path.name}: mapped MUD needs a 국사편찬위원회 history source")

    if errors:
        print(f"FAIL: {len(errors)} MUD source metadata errors")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"PASS: {source_count} source records across {len(files)} MUDs are complete and unique per MUD.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
