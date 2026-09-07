"""반복 탭으로 건너뛸 수 있는 시뮬레이터 단계의 공용 판정 규칙.

`07_audit_activity_duration.py`와 `09_audit_tap_resistance.py`가 같은 기준을 쓰도록
판정을 이 파일 하나에서 정의한다.

왜 분리했나
-----------
두 스크립트가 각자 판정을 들고 있어 규칙이 네 군데 갈렸고, 그 결과 07번이
`regular_paleolithic`을 반복 탭 위험으로 계속 오탐했다. 갈렸던 지점은 다음과 같다.

===========================  ===================  ==========================
항목                          이전 09번             이전 07번
===========================  ===================  ==========================
레거시 중복거부 모드 제외      있음                 없음  ← 오탐 원인
completion.uniqueActions 제외  없음                 있음
minActions 기본값              completion.target    99 (사실상 판정 안 함)
검사 대상 스테이지             전체                 본 스테이지만
===========================  ===================  ==========================

통일 기준은 **제외 조건의 합집합**이다. 아래 다섯 가지는 각각 "이 단계는 같은 곳을
반복해서 눌러도 통과되지 않는다"는 서로 다른 근거이므로, 하나라도 해당하면
반복 탭 후보가 아니다.

이 모듈은 구조 선별 도구이지 실제 학생 소요 시간 측정이 아니다.
"""

from __future__ import annotations


# 런타임 렌더러가 중복 입력을 자체적으로 거부하거나 순서를 강제하는 레거시 모드.
# JSON hotspots로 계약이 표현되지 않아 구조 검사만으로는 안전함을 알 수 없으므로
# 여기에 이름으로 적어 둔다. 새 렌더러가 같은 성질을 가지면 여기 추가한다.
KNOWN_DISTINCT_INTERACTION_MODES = {
    "paleo-environment",
    "paleo-fire",
    "paleo-stone",
    "paleo-hunt",
    "paleo-community",
    "paleo-reflection",
    "mn-combat-active",
}

# 이 값 이하의 조작 수로 완료되면 반복 탭으로 건너뛸 수 있다고 본다.
RAPID_TAP_MAX_ACTIONS = 4


def is_rapid_tap_candidate(simulator: dict | None) -> bool:
    """이 시뮬레이터가 반복 탭으로 건너뛸 수 있는 구조인지 판정한다."""
    if not simulator or not simulator.get("required"):
        return False

    completion = simulator.get("completion") or {}

    # 1. JSON 핫스팟이 있으면 정해진 좌표를 찾아 눌러야 한다.
    if simulator.get("hotspots"):
        return False

    # 2. 버튼형에 서로 다른 action이 정의돼 있으면 반복 탭 경로가 아니다.
    actions = simulator.get("actions")
    if simulator.get("type") == "buttons" and isinstance(actions, list) and actions:
        return False

    # 3. 완료 조건이 서로 다른 조작을 요구하면 같은 곳을 반복해도 끝나지 않는다.
    if completion.get("uniqueActions"):
        return False

    # 4. 런타임에서 중복 입력을 거부하는 레거시 렌더러.
    if simulator.get("mode") in KNOWN_DISTINCT_INTERACTION_MODES:
        return False

    # 5. 필요한 조작 수. minActions가 없으면 target이 실질 요구치다.
    min_actions = completion.get("minActions", completion.get("target"))
    if isinstance(min_actions, bool) or not isinstance(min_actions, (int, float)):
        return False

    return min_actions <= RAPID_TAP_MAX_ACTIONS


def find_rapid_tap_stages(stages: dict) -> list[tuple[str, dict]]:
    """스테이지 묶음에서 반복 탭 후보를 찾는다.

    IF 재시도 스테이지(`1-1` 등)도 포함한다. 재시도 화면에서도 같은 우회가
    가능하므로 두 스크립트 모두 전체 스테이지를 대상으로 한다.
    """
    found = []
    for stage_id, stage in (stages or {}).items():
        simulator = (stage or {}).get("simulator") or {}
        if is_rapid_tap_candidate(simulator):
            found.append((stage_id, simulator))
    return found
