"""Screen Regular retry/IF stages for minimum evidence cues.

This is a review aid, not an automatic content approval. It does not modify
MUD JSON and deliberately ignores simulator scene ownership.

보고서의 마커 구간만 갱신한다. 실행 결과·적용 원칙 등 사람이 쓴 절은 건드리지 않는다.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _managed_block import write_managed_block  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
REPORT = ROOT / "docs" / "audits" / "if_stage_audit.md"
START = "<!-- IF_STAGE_SIGNALS:START -->"
END = "<!-- IF_STAGE_SIGNALS:END -->"
EVIDENCE_CUES = ("자료", "기록", "비교", "근거", "살펴", "단서")


def plain(value: str) -> str:
    return re.sub(r"\s+", "", re.sub(r"<[^>]+>", " ", value or ""))


def main() -> int:
    rows: list[dict[str, object]] = []
    for path in sorted(MUD_DIR.glob("regular_*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for stage_id, stage in data.get("stages", {}).items():
            if "-" not in stage_id:
                continue
            narrative = plain(stage.get("narrative", ""))
            cues = [cue for cue in EVIDENCE_CUES if cue in narrative]
            choices = stage.get("choices", [])
            flags = []
            if len(narrative) < 120:
                flags.append("근거 설명 120자 미만")
            if len(cues) < 2:
                flags.append("자료·비교 단서 2개 미만")
            if len(choices) != 1:
                flags.append("복귀 선택지 수 확인")
            if flags:
                rows.append(
                    {
                        "file": path.name,
                        "stage": stage_id,
                        "label": stage.get("badge", ""),
                        "chars": len(narrative),
                        "cues": ", ".join(cues) or "없음",
                        "flags": ", ".join(flags),
                    }
                )

    lines = [
        f"- 감사 대상: Regular 재시도 단계 전체",
        f"- 보완 검토 신호: {len(rows)}개",
        "- 최소 기준: 근거 설명 120자 이상, 자료·비교 단서 2개 이상, 원 단계 복귀 선택지 1개",
        "",
        "| 파일 | 단계 | 표지 | 설명 글자 수 | 단서 | 신호 |",
        "|---|---:|---|---:|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| `{row['file']}` | {row['stage']} | {row['label']} | {row['chars']} | "
            f"{row['cues']} | {row['flags']} |"
        )
    if write_managed_block(REPORT, START, END, "\n".join(lines)) != 0:
        return 1
    print(f"Audited {len(rows)} Regular retry stages needing review signals.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
