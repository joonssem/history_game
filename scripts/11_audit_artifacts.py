"""Screen artifact cards for completeness and educational wording risks.

보고서의 마커 구간만 갱신한다. 적용 원칙 등 사람이 쓴 절은 건드리지 않는다.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _managed_block import write_managed_block  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "data" / "artifacts.json"
REPORT = ROOT / "docs" / "audits" / "artifact_audit.md"
START = "<!-- ARTIFACT_SIGNALS:START -->"
END = "<!-- ARTIFACT_SIGNALS:END -->"
REQUIRED = ("id", "name", "era", "tier", "tierName", "icon", "desc", "category", "hint")
RISK_TERMS = ("세계 최초", "최초", "증명", "위대한", "목숨을 걸고", "강력한", "모든")


def main() -> int:
    raw = json.loads(ARTIFACTS.read_text(encoding="utf-8"))
    artifacts = raw if isinstance(raw, list) else raw.get("artifacts", [])
    rows = []
    for artifact in artifacts:
        flags = []
        missing = [field for field in REQUIRED if not artifact.get(field)]
        if missing:
            flags.append("필수 필드 누락: " + ", ".join(missing))
        desc = artifact.get("desc", "")
        matched = [term for term in RISK_TERMS if term in desc]
        if matched:
            flags.append("표현 검토: " + ", ".join(matched))
        if len(desc) > 150:
            flags.append("설명 150자 초과")
        if flags:
            rows.append(
                {
                    "id": artifact.get("id", ""),
                    "name": artifact.get("name", ""),
                    "era": artifact.get("era", ""),
                    "flags": "; ".join(flags),
                }
            )

    lines = [
        f"- 감사 대상: {len(artifacts)}종",
        f"- 검토 신호: {len(rows)}종",
        "- 기준: 필수 필드 완비, 단정·과장 표현 검토, 초등학생이 읽을 수 있는 설명 길이",
        "",
        "| ID | 유물명 | 시대 | 신호 |",
        "|---|---|---|---|",
    ]
    for row in rows:
        lines.append(f"| `{row['id']}` | {row['name']} | {row['era']} | {row['flags']} |")
    if write_managed_block(REPORT, START, END, "\n".join(lines)) != 0:
        return 1
    print(f"Audited {len(artifacts)} artifact cards; {len(rows)} need wording review.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
