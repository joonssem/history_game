# 시뮬레이터 runtime 구조 결정

## 상태 소유와 수명주기

`MudEngine`이 현재 MUD와 stage의 시뮬레이터 상태를 소유한다. MUD 진입 시
`resetSimulatorStates()`, stage 진입 시 `setupSimulator()`가 상태를 초기화한다.
`MudSimulators`는 입력 좌표를 action으로 해석하고 화면을 그리지만, 진행률을 임의의
필드에 직접 기록하지 않고 엔진의 `getSimulatorState()`, `setSimulatorProgress()`,
`registerSimulatorAction()`, `updateSimulatorCompletion()`을 사용한다.

## 공통 interaction 경계

hotspot 활동은 `interactionHandlers` registry에서 처리기를 선택한다. 처리기는 상태가
실제로 변했을 때만 `true`를 반환하며, dispatcher 호출자는 이때만 행동 수를 기록한다.
따라서 빈 좌표, 중복 단서, 잘못된 순서는 완료 조건의 `minActions`에 포함되지 않는다.

## 레거시 adapter

구석기 JSON의 `paleoFireStep` 등 기존 `progressKey`는 당장 삭제하지 않는다.
`setSimulatorProgress()`가 공통 진행률과 선언된 레거시 키를 함께 갱신하고,
`getSimulatorState()`가 구형 mode별 상태를 adapter로 제공한다. 새 활동은
`simulatorProgress`와 JSON hotspot 계약을 사용한다.

## 버튼 활동

JSON의 실행 가능한 `buttonsHtml`과 인라인 `onclick`은 제거했다. `actions`에는 의미
기반 `type`, `value`, `label`만 선언하며, `MudEngine.runSimulatorAction()`이 허용된
action만 실행한다. 지원 action과 progress key는 `simulator_contract.json` 및
`scripts/04_validate_mud_contract.py`가 검증한다.

## 남은 구조 부채

- 고인돌·투표·태극기·명량 전용 상태는 여전히 엔진의 별도 필드로 유지된다.
- 일부 레거시 mode는 입력 판정과 Canvas 렌더링이 한 객체에 함께 있다.
- renderer를 완전한 순수 함수로 만드는 작업은 시각 회귀 테스트 기반을 만든 뒤 진행한다.
