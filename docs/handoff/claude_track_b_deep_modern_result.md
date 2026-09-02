# Claude Track B — Deep-dive MUD 고도화 결과 보고 (`deep_modern` 2차 파일럿)

TASK-20260902-04 | Track B Deep-dive 고도화 (deep_modern 2차 파일럿) | 담당: Claude | 상태: DONE

`deep_joseon` 1차 파일럿(`claude_track_b_deep_dive_result.md`)에서 확인한 설계 규칙(모든 판단 단계에 `required`+`completion` 기본 적용, 오답 선택지 톤 정상화, 기존 상호작용 재사용 우선)을 이어서 `data/mud/deep_modern.json`에 적용했다.

## 0. 작업 시작 시 확인 사항

착수 전 `git status`로 확인한 결과 `deep_modern.json`은 아무도 손대지 않은 깨끗한 상태였다(중복 작업 없음). 다만 `js/mudEngine.js`·`js/mudSimulators.js`가 다른 프로세스에 의해 uncommitted 상태로 수정 중이었다 — Track B 규칙대로 이 두 파일은 읽기만 했고 수정하지 않았다.

## 1. 수정한 파일

- `data/mud/deep_modern.json`만 수정했다.

## 2. 발견한 핵심 문제 (우선순위순)

1. **판단 단계 7개 전부 게이팅 없음**: `deep_joseon`의 원래 상태와 같은 근본 버그였다 — `culture-touch`(연속 탭 게이지)·`battle-gauge`·`precise-taegeukgi`·`precise-vote`·`text-reading` 전부 `required` 선언이 없어 서술문을 읽지 않고도 바로 선택지를 고를 수 있었다.
2. **스테이지 3(6·25 전쟁)의 `battle-gauge` 시각 표현이 서술문과 충돌**: `js/mudSimulators.js:276`의 레거시 `battle-gauge` 분기는 붉은 원과 "⚔️ 호국 결전 🛡️ / 화면을 터치하여 승기를 잡으세요!"를 그린다. 그런데 이 스테이지의 서술문은 "이를 영웅 놀이로 재현하기보다... 두려움과 피해를 살펴봅시다"라고 명시하고 있어, 시뮬레이터 시각 표현이 서술문의 의도(자료 기반 성찰)와 정반대로 전투 게임화를 보여주고 있었다. `implementation_plan_scene_phase38.md`가 Regular MUD 3곳에서 지적한 것과 같은 레거시 버그가 Deep-dive에도 있었던 것이다.
3. **선택지 길이 편향**: 이분 판단 7단계 중 6곳에서 정답-오답 글자 수 격차가 7~22자였다(스테이지 3이 22자로 가장 큼).

## 3. 수정한 내용과 수정하지 않은 내용

### 수정함

| 스테이지 | 이전 | 이후 |
|---|---|---|
| 1. 3·1 만세 운동 | `culture-touch` 연속 탭 게이지, 게이팅 없음 | `hotspot-discovery` 3단서(독립선언서·전국 확산·아우내 장터), `required` |
| 2. 한국광복군 태극기 | `precise-taegeukgi`, 게이팅 없음 | 기존 상호작용 유지, `required`+`completion.target:6` 추가 |
| 3. 6·25 전쟁과 낙동강 | `battle-gauge`(호국 결전 그래픽), 게이팅 없음 | `hotspot-discovery` 3단서(분단·낙동강 지도·학도의용군 기록)로 전환. **레거시 전투 그래픽 완전 제거** |
| 4. 4·19 혁명 | `precise-vote`, 게이팅 없음 | 기존 상호작용 유지, `required`+`completion.target:2` 추가 |
| 5. 5·18·6월 항쟁 | `culture-touch` 연속 탭 게이지, 게이팅 없음 | `hotspot-discovery` 3단서(5·18·희생·구호), `required` |
| 6. 경제 성장과 전태일 | `text-reading`, 게이팅 없음 | `hotspot-discovery` 3단서(수출 성장·노동 조건·전태일의 외침), `required` |
| 7. 성찰·3분기 엔딩 | `precise-taegeukgi`, 게이팅 없음 | 기존 상호작용 유지, `required`+`completion.target:6` 추가 |

오답 선택지 4곳(스테이지 1·2·3·5)의 문장에 정책적으로 그럴듯한 세부 사유를 보강해 정답과의 길이 격차를 줄였다(예: 스테이지 3 "22자 → 9자"). `next`/`correct`/`sound`, IF 분기(`1-fail`~`6-fail`), 엔딩 3종 구조는 그대로 두었다.

### 수정하지 않음

- 스테이지 6·7의 격차(11자·10자)는 `deep_joseon` 스테이지 8과 같은 이유(성찰/3분기 엔딩의 배드 엔딩이 의도적으로 짧고 단정적)로 이번엔 그대로 두었다.
- `1-fail`~`6-fail`의 `text-reading` IF 스테이지는 게이팅 대상이 아니라서(단일 선택지 재시도) 손대지 않았다.
- 선택지가 단서를 직접 인용하도록 다시 쓰는 작업(`deep_joseon` 보고서의 다음 규칙 1번)은 이번에도 범위에 넣지 않았다 — 다음 파일럿 후보로 남긴다.

## 4. 필수 시뮬레이터별 입력·완료 조건·피드백

| 스테이지 | 입력 방식 | 완료 조건 |
|---|---|---|
| 1 | 핫스팟 3곳 터치 | target 3 / minActions 3 |
| 2 | 태극기 태극·4괘 순차 터치(기존 상호작용) | target 6 / minActions 6 |
| 3 | 핫스팟 3곳 터치 | target 3 / minActions 3 |
| 4 | 도장 찍기·투표함 넣기(기존 상호작용) | target 2 / minActions 2 |
| 5 | 핫스팟 3곳 터치 | target 3 / minActions 3 |
| 6 | 핫스팟 3곳 터치 | target 3 / minActions 3 |
| 7 | 태극기 태극·4괘 순차 터치(기존 상호작용) | target 6 / minActions 6 |

## 5. 실제 플레이 시간

`deep_joseon` 보고서와 같은 이유로 에이전트 클릭 속도를 확정 시간으로 쓰지 않는다. 브라우저(로컬 8798)에서 스테이지 2의 `precise-taegeukgi` 게이팅을 실제 클릭 6회로 완주해 `progress: 0→6`, 선택지 `disabled: true→false` 전환을 직접 확인했고, 스테이지 3은 게이팅 전환 후 화면을 렌더링해 레거시 전투 그래픽이 사라지고 3개 핫스팟 배경으로 바뀐 것을 스크린샷으로 확인했다. 전체 8단계 정상 완주 타임런과 태블릿 터치 검증은 하지 않았다 — 이유는 `deep_joseon` 보고서와 동일(실제 교실 측정 필요).

## 6. 선택지 편향과 자료 근거 여부

`scripts/12_audit_choice_bias.py` 기준 수정 전 `deep_modern`은 상위 20위 안에 3건(스테이지 1·2·3, 델타 11~20)이 있었으나, 수정 후 전역 상위 20위 목록에서 완전히 빠졌다. 정답 위치는 원본 JSON에서 항상 1번이지만 런타임 셔플이 적용된다(계약 검증 경고와 동일).

## 7. 역사적 정합성·정서 안전성 점검

- `historical_language_audit.md` Phase 26이 이미 `deep_modern`의 서술문을 정리해 두었다(학도의용군을 "영웅 놀이"가 아닌 자료 기반 성찰로, 광복군 진공작전을 국제적 지위 단정이 아닌 복합 원인으로). 이번에 추가한 21개 핫스팟 문장도 같은 기준(집단 비하 없음, 확정된 가정 결과 없음, 자료 인용형 서술)을 따랐다.
- **스테이지 3의 `battle-gauge` 제거가 이번 작업에서 가장 중요한 정서 안전성 개선이다.** 서술문은 이미 "영웅 놀이로 재현하지 말자"고 안내하면서 시뮬레이터는 "승기를 잡으세요"라는 전투 게임화 그래픽을 보여주는 모순이 있었는데, 이를 해소했다. D-011은 "근현대 민감 주제"를 대상으로 명시했는데, 6·25 전쟁과 학도의용군도 그 정신(피해 재현·전투 게임화 지양, 자료·기록 중심)이 그대로 적용돼야 한다고 판단해 이번에 함께 정리했다.
- 스테이지 6 노동 조건 문장은 "하루 14시간 노동" 등 기존 서술문 표현을 그대로 재사용했고 새로운 수치·주장을 추가하지 않았다.

## 8. 남은 위험과 다음 실험 제안

- **공용 엔진 요청**: 없음. 기존 계약(`required`/`completion`)과 기존 두 상호작용(`precise-taegeukgi`, `precise-vote`)만 재사용했다.
- **레거시 `battle-gauge`의 다른 잔존 사례 점검 필요**: 이번에 `deep_modern:3` 한 곳을 찾았지만, `js/mudSimulators.js:276` 분기는 `scene`이 선언되지 않고 `mode`가 `battle-gauge`로 시작하는 모든 스테이지에서 발동한다. Regular MUD 96곳은 Phase 38에서 전수 점검됐지만 Deep-dive 4종(특히 아직 손대지 않은 스테이지들)은 전수 점검되지 않았을 수 있다 — 남은 Deep-dive 파일 또는 Regular MUD 회귀 점검 때 `grep -l '"mode": "battle-gauge"' data/mud/*.json` 후 각 파일에 `scene`이 선언돼 있는지 확인하는 것을 다음 작업으로 제안한다.
- **선택지-단서 인용형 전환**은 여전히 미착수 상태로 두 파일럿(`deep_joseon`, `deep_modern`) 모두에 남아 있다.
- 실제 학생 대상 플레이 시간·태블릿 터치 실측은 이번에도 하지 않았다.

## 9. 검증 결과

`python scripts/03_validate_mud_integrity.py`, `04_validate_mud_contract.py`, `09_validate_mud_sources.py`, `12_audit_choice_bias.py` 전부 통과. `node scripts/05_test_simulator_runtime.js`, `node --check js/mudEngine.js`, `node --check js/mudSimulators.js` 전부 통과. 브라우저 콘솔 오류 0건.
