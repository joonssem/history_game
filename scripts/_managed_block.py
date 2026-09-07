"""감사 보고서의 생성 구간만 갈아 끼우는 공용 도우미.

왜 필요한가
-----------
감사 문서에는 스크립트가 만드는 부분(집계·표)과 사람이 쓴 부분(실행 결과·판단
근거·적용 원칙)이 함께 있다. 예전에는 스크립트가 파일 전체를 덮어썼기 때문에,
사람이 쓴 절을 지키려면 아예 재생성을 안 하는 수밖에 없었다. 실제로
`docs/audits/if_stage_audit.md`에는 "표는 최초 감사 시점 스냅숏이며 갱신하지 않음"
이라는 우회 문구가 붙어 있었다.

마커 사이만 교체하면 두 가지가 동시에 가능해진다 — 표는 항상 최신이고, 사람이 쓴
절은 그대로 남는다. `08_validate_mud_catalog.py`가 README에 이미 쓰던 방식과 같다.

마커가 없으면 조용히 덮어쓰지 않고 실패한다. 사람이 쓴 내용을 날리는 것보다
빨간 불이 켜지는 편이 낫다.
"""

from __future__ import annotations

from pathlib import Path


def write_managed_block(path: Path, start: str, end: str, body: str) -> int:
    """`path`의 start/end 마커 사이를 `body`로 교체한다.

    변경이 없으면 파일을 건드리지 않는다(불필요한 타임스탬프 변경 방지).
    성공하면 0, 실패하면 1을 돌려준다.
    """
    if not path.exists():
        print(f"FAIL: {path} does not exist — create it with the managed markers first")
        return 1

    text = path.read_text(encoding="utf-8")
    if start not in text or end not in text:
        print(f"FAIL: {path} is missing the managed markers {start} / {end}")
        return 1

    head, rest = text.split(start, 1)
    _, tail = rest.split(end, 1)
    updated = f"{head}{start}\n{body}\n{end}{tail}"

    if updated != text:
        path.write_text(updated, encoding="utf-8")
    return 0
