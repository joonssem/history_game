"""Screen artifact cards for completeness and educational wording risks."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "data" / "artifacts.json"
REPORT = ROOT / "artifact_audit.md"
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
        "# 유물·보상 카드 교육 품질 감사",
        "",
        "> 구조·표현 검토 신호를 모으는 보조 자료입니다. 역사 사실 확인과 교사 검토를 대신하지 않습니다.",
        "> 보상 ID 연결은 `scripts/03_validate_mud_integrity.py`에서 별도로 검사합니다.",
        "",
        f"- 감사 대상: {len(artifacts)}종",
        f"- 검토 신호: {len(rows)}종",
        "- 기준: 필수 필드 완비, 단정·과장 표현 검토, 초등학생이 읽을 수 있는 설명 길이",
        "",
        "## 검토 신호",
        "",
        "| ID | 유물명 | 시대 | 신호 |",
        "|---|---|---|---|",
    ]
    for row in rows:
        lines.append(f"| `{row['id']}` | {row['name']} | {row['era']} | {row['flags']} |")
    lines.extend(
        [
            "",
            "## 적용 원칙",
            "",
            "1. `최초`·`증명`처럼 범위를 넓히는 표현은 현존 자료인지, 해석인지 구분해 쓴다.",
            "2. 유물 카드가 수업의 대표 자료인지 실제 국보 지정 여부인지 혼동되지 않도록 명칭과 등급을 함께 검토한다.",
            "3. Regular 복습을 방해하지 않도록 카드를 장문 해설로 확장하지 않는다.",
            "4. 수정 시 MUD 보상 ID·이름 연결과 카탈로그 검증을 다시 실행한다.",
            "",
        ]
    )
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Audited {len(artifacts)} artifact cards; {len(rows)} need wording review.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
