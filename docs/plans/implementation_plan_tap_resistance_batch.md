# 구현 계획 — Regular 반복 탭 내성 1차 묶음

## 상태

- 상태: in-progress (5개 MUD 반영, 대표 첫 단계 브라우저 점검 완료)
- 우선순위: P1-02
- 대상: `regular_independence` 및 `regular_modern_open` 1~3단계
- 근거: `scripts/09_audit_tap_resistance.py` 구조 감사에서 비장면 후보로 선별
- 코드 구현: 1차 대상 반영 완료

## 5차 적용 결과 — `regular_bronze_age` 3단계

- 반복 슬라이더 조작으로 완료되던 거석 운반 활동을 `hotspot-discovery`로 전환했다.
- 흙 경사로·통나무 굴림대·공동 노동 세 단서를 각각 확인하도록 하고, 캔버스와 대체 버튼에서 중복 단서를 재완료할 수 없게 했다.
- `dolmen-step3`가 핫스팟 계약을 우선 처리하도록 입력 분기를 보완하고, 청동기 운반 장면을 추가했다.
- 820×1180 Chrome에서 같은 단서를 반복해도 선택지가 활성화되지 않고 세 단서 확인 후 활성화되는 것을 확인했다.

## 감사 근거

- Regular 28종 중 구조적 반복 탭 후보 66개
- 후보는 실제 학생 소요 시간을 측정한 결과가 아니라, `required` 활동이 4회 이하의 동일 동작으로 완료될 수 있는 구조 신호다.
- `regular_independence`는 1~3단계에 장면·핫스팟이 없어, 기존 장면 소유 범위와 충돌하지 않는 첫 실험 대상으로 삼는다.
- `regular_modern_open`은 4단계에 이미 `modern-open-evidence` 계약을 사용하고 있어 1~3단계에 같은 장면·상호작용을 확장했다.
- `regular_post_war`는 4단계에 이미 `post-war-evidence` 계약을 사용하고 있어 1~3단계에 같은 장면·상호작용을 확장했다.
- `regular_japanese_rule_1`은 4단계에 이미 `colonial-1910s-evidence` 계약을 사용하고 있어 1~3단계에 같은 장면·상호작용을 확장했다. 민감한 역사 주제의 피해·저항 맥락은 기존 서술 범위를 유지한다.

## 현재 문제

대상 단계의 `text-reading`·`battle-gauge` 활동은 현재 캔버스 입력이 일정량 누적되면 완료된다. 학생이 자료나 맥락을 확인하지 않고 같은 위치를 반복해서 눌러도 필수 활동을 통과할 가능성이 있다.

## 구현 방향

- 단순 클릭 횟수만으로 완료되지 않도록 자료 단서 단위의 상호작용을 선언한다.
- 각 단계의 역사 학습 목표와 직접 연결된 2~3개의 관찰 단서를 만든다.
- 단서별 피드백과 완료 진행률을 제공한다.
- 캔버스와 버튼 대체 조작이 같은 단서를 가리키도록 한다.
- 선택지 활성화 전 단서 전체 확인을 요구한다.

## 변경 예상 범위

- `data/mud/regular_independence.json`: 단계별 interaction·hotspots·completion 선언
- `js/mudEngine.js`: 이미 지원하는 공통 hotspot 완료 계약의 필요 보완만 검토
- `js/mudSimulators.js`: 공통 hotspot 렌더링·대체 조작의 누락이 있을 때만 수정
- `simulator_contract.json` 또는 `simulator_schema.md`: 새 계약이 필요할 때만 갱신

변경하지 않는 범위:

- 장면(`scene`)이 있는 다른 MUD
- `regular_independence`의 역사 서술·정답 선택지 대량 수정
- 새 프레임워크·패키지·서버 도입
- 28종 전체 일괄 변환

## 단계별 단서 설계 초안

| 단계 | 현재 학습 초점 | 단서 설계 방향 |
|---|---|---|
| 1 | 독립선언과 비폭력 참여 | 선언서의 독립 의지, 여러 계층의 참여, 비폭력 시위 |
| 2 | 아우내 장터와 지역 참여 | 학생·주민의 공동 참여, 태극기·만세 시위, 지역 확산 |
| 3 | 임시정부와 민주공화제 | 임시헌장, 국민 주권, 왕정과 민주공화제 비교 |

## 2차 적용 결과 — `regular_modern_open` 1~3단계

- 강화도 조약: 무력 위협·치외법권·해안 측량권
- 제중원·우정총국: 병원·우편 시설·이용의 한계
- 전차·전등: 전차 노선·전등·도시 생활 변화
- 모두 `modern-open-evidence` 장면과 `hotspot-discovery` 완료 계약을 사용한다.

## 3차 적용 결과 — `regular_post_war` 1~3단계

- 전쟁 피해: 전쟁 피해·서로 돕기·재건 조건
- 전후 교육: 천막 교실·배움 이어가기·지역별 조건
- 분단과 평화: 이산가족 기록·DMZ·대화·교류
- 모두 `post-war-evidence` 장면과 `hotspot-discovery` 완료 계약을 사용한다.

## 4차 적용 결과 — `regular_japanese_rule_1` 1~3단계

- 헌병 경찰: 헌병 경찰·즉결 처벌·일상 통제
- 토지 조사: 토지 신고·소유권 변화·농민 부담
- 비밀 결사: 비밀 결사·비밀 서약·저항의 위험
- 모두 `colonial-1910s-evidence` 장면과 `hotspot-discovery` 완료 계약을 사용한다.

## 완료 기준

- [x] 각 단계에 서로 다른 역사 단서 2~3개가 선언되어 있다.
- [x] 동일 위치 반복 탭으로 완료되지 않는다.
- [x] 캔버스와 대체 버튼이 동일한 진행 상태를 공유한다.
- [x] 단서 완료 전 선택지 버튼이 비활성화된다.
- [x] 1~3단계 전체의 정상 진행·오답·IF 복귀에 회귀가 없다. (2026-09-01 로컬 Chrome에서 1→2→3 정상 진입, 2·3단계 오답→IF→재시도 복귀 확인)
- [x] 기존 자동 검증과 시뮬레이터 런타임 테스트를 통과한다.
- [ ] 실제 학생 활동 시간 측정 항목은 별도 검토로 남긴다.

## 검증 명령

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
node --check js/mudEngine.js
node --check js/mudSimulators.js
python scripts/09_audit_tap_resistance.py
git diff --check
```
