"""Screen Regular retry/IF stages for minimum evidence cues.

This is a review aid, not an automatic content approval. It does not modify
MUD JSON and deliberately ignores simulator scene ownership.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"
REPORT = ROOT / "if_stage_audit.md"
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
        "# Regular 재시도(IF) 단계 교육 품질 감사",
        "",
        "> 구조 감사 보조 자료입니다. 실제 수업 관찰이나 교육과정 검토를 대신하지 않습니다.",
        "> 장면(`simulator.scene`), 핫스팟, 상호작용, 완료조건은 이 감사에서 변경하지 않습니다.",
        "",
        f"- 감사 대상: Regular 재시도 단계 전체",
        f"- 보완 검토 신호: {len(rows)}개",
        "- 최소 기준: 근거 설명 120자 이상, 자료·비교 단서 2개 이상, 원 단계 복귀 선택지 1개",
        "",
        "## 보완 검토 신호",
        "",
        "| 파일 | 단계 | 표지 | 설명 글자 수 | 단서 | 신호 |",
        "|---|---:|---|---:|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| `{row['file']}` | {row['stage']} | {row['label']} | {row['chars']} | "
            f"{row['cues']} | {row['flags']} |"
        )
    lines.extend(
        [
            "",
            "## 적용 원칙",
            "",
            "1. Regular은 10분 이내 복습이므로 실패 화면을 별도 탐구 단계로 확장하지 않습니다.",
            "2. 보완 시 역사적 결과를 단정하기보다 원 단계의 자료·기록·비교 단서를 한두 문장으로 연결합니다.",
            "3. 장면 단계의 좌표·핫스팟·완료조건 변경이 필요하면 Claude에 MUD·단계별 변경을 먼저 전달합니다.",
            "4. 최종 승인 전 교사 검토와 학생 재시도 관찰을 별도로 수행합니다.",
            "",
        ]
    )
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Audited {len(rows)} Regular retry stages needing review signals.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
