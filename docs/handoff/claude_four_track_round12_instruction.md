# 4트랙 라운드 12 지시서 — 남은 문구 보완, 재시도 단계 전수 점검, 단계별 활동 제목, 조선 후기 가독성

> 작성: 2026-09-29, 기획 세션(Opus). 기준: `origin/main` 최신(`1dfcd1c` 이후).
> **먼저 읽을 것**: `docs/handoff/claude_session_close_20260928.md`(9/28 규칙 변경 요약). 주말에 다른 PC에서 작업이 많이 진행됐다.
> 입력:
> - Codex 감사 `docs/audits/early_regular_stage_coherence_and_sejong_tone_review_20260928.md` — "오류" 7묶음은 `50735ad`에서 반영 완료, **"보완 필요"는 남아 있다**
> - 리허설 기록 `docs/audits/cooperative_live_deployment_rehearsal_20260928.md` — `header.interactiveTitle` 고정 문제
> - 10/28 공개수업 일정: `INBOX.md` "10월 28일 공개수업 역산" — Claude 몫 10/5~10/9 "텍스트 길이·태블릿 가독성·과잉 단정 감사"

## §0 공통 규칙

- main에 push하지 않는다. 자기 `feat/*` 브랜치에만 커밋한다.
- `apps/**`, `cooperative-mud/**`는 읽기만 한다(Codex 영역).
- **9/28 규칙(반드시 지킨다)**
  1. **문구를 고치면 한 단계의 모든 칸을 함께 본다.** 이야기·선택지·단서·장소·안내·선택지 `feedback`·재시도 버튼·로드맵 라벨·헤더가 한 묶음이다.
  2. **MUD JSON을 고쳤으면 자동 보고서를 다시 만들어 함께 커밋한다.** `python scripts/07_audit_activity_duration.py`, `python scripts/10_audit_if_stages.py`, `python scripts/11_audit_artifacts.py`를 돌리고 바뀐 `activity_duration_audit.md`·`docs/audits/if_stage_audit.md`·`docs/audits/artifact_audit.md`를 커밋에 넣는다. **9/29에 이것을 빠뜨려 CI가 깨졌다.**
  3. 화면 파일(`js/`, `css/`)을 고치면 `index.html`의 `?v=`를 올린다.
  4. 학생 화면에 개발 용어(MUD, SIMULATOR, Deep-dive)를 새로 쓰지 않는다.
  5. 문구를 고치면 브라우저로 확인한다. 자동 검사는 모양만 본다.
- 사실 확인은 공식 출처만. 원문을 열지 못하면 "확인 불가".
- **파일 소유(겹치지 않게 고정)**

  | 파일 | 소유 |
  |---|---|
  | `regular_paleolithic`, `regular_neolithic`, `regular_bronze_age`, `regular_three_kingdoms`, `regular_three_kingdoms_life`, `regular_silla`, `regular_balhae`, `regular_goryeo_founding`, `regular_sejong` | 관문 설계실 |
  | `regular_joseon_founding`, `regular_joseon_folk` | 조작대 |
  | 위 11편을 **뺀** 나머지 정규 17편 | 대조실 |
  | `docs/handoff/claude_joseon_late_*` | 연결 공방 |
  | `js/mudEngine.js`, `scripts/18_*`, `index.html` | 조작대 |

- 검증(공통): `01`, `03`, `04`, `05`, `06`, `08`, `09`, `16 --ci`, `17`, 그리고 보고서 3종 재생성 후 `git diff --check`

## §1 관문 설계실 — Codex 감사 "보완 필요" 반영 (앞 9편 + 세종)

- 대상: 위 소유 표의 9편
- Codex 감사 문서의 **"보완 필요" 항목을 모두 처리한다**(이미 반영된 "오류" 7묶음은 제외). 대표 항목:
  - 구석기: "최대의 혁명", "생존율을 획기적으로", "아슐리안형", "만물의 영장" 같은 최상급·진보 서술
  - **신석기: 빗살무늬가 균열을 막는다는 단정. 2-1(재시도 단계)의 "겉이 매끈하면 굽는 과정에서 쉽게 갈라집니다"도 포함한다.** 라운드 3에서 본 단계만 고치고 재시도 단계를 놓쳤다.
  - 청동기: 모든 고인돌을 군장 무덤·권력 척도로 단정
  - 삼국의 성장, 통일 신라, 고려 건국, 세종의 보완 항목
- **재시도 단계(`N-1`)도 이번에는 반드시 본다.** 라운드 4~10 사실 대조는 재시도 단계를 범위에서 뺐고, 그 틈으로 오류가 남았다.
- 산출물: 데이터 수정 + `docs/audits/early_regular_stage_coherence_and_sejong_tone_review_20260928.md`의 체크박스를 `[x]`로 바꾸고 처리 내용을 한 줄씩 적는다. 반영하지 않은 항목은 이유를 적는다.

## §2 대조실 — 재시도 단계 전수 사실 점검 (나머지 17편)

- 대상: 위 소유 표의 "나머지 정규 17편"의 **재시도 단계(`N-1`)만**
- 왜: 라운드 4~10의 사실 대조는 "IF 단계의 가상 실패 서술은 대상이 아니다"로 범위를 좁혔다. 그런데 재시도 단계에는 가상 서술만 있는 게 아니라 **"왜 틀렸는지 설명하는 사실 문장"** 도 들어 있다. 신석기 2-1의 균열 문장이 그 예다.
- 방법
  1. 17편의 재시도 단계에서 **사실을 단정하는 문장만** 뽑는다. 가상 상황 묘사("만약 ~했다면")는 그대로 둔다.
  2. 공식 출처와 대조하고, 확인된 오류와 원문 범위를 넘는 단정만 고친다.
  3. 고칠 때 재시도 단계의 **복귀 버튼과 원래 단계**가 여전히 맞는지 함께 본다(9/28 규칙 1).
- 산출물: `docs/audits/retry_stage_fact_check_20260929.md`(편마다 뽑은 문장, 판정, 근거, 조치), 확인된 오류만 고친 데이터

## §3 연결 공방 — 조선 후기 공개수업 콘텐츠 가독성 감사와 교사 자료

- 일정표상 Claude 몫(10/5~10/9)을 앞당긴다.
- **§3-1 가독성 감사**
  - 대상: `docs/handoff/claude_joseon_late_runtime_scenario.json`(앱에 등록된 콘텐츠의 원본)
  - 볼 것: 5학년이 **태블릿(1180×820)에서 한 번에 읽을 수 있는지**. 문장 길이, 한자어·낯선 낱말(광작, 전황, 고공, 세곡, 유리민 등), 한 화면 분량.
  - 낯선 낱말은 **풀어 쓰거나 괄호 설명**을 붙이는 방향으로 제안한다. 대조를 마친 사실 범위는 바꾸지 않는다.
  - `node scripts/15_validate_cooperative_packet.js --runtime …`의 길이 경고 3건(역할 `interest`)도 여기서 처리한다.
  - **JSON을 고치면 Codex가 앱에 다시 반영해야 한다.** 바뀐 필드 목록을 `docs/handoff/codex_joseon_late_content_update_20260929.md`에 적는다. `apps/**`는 직접 고치지 않는다.
- **§3-2 교사 자료 초안**(일정표 10/19~10/22 몫을 미리)
  - `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`에 이어서 쓴다.
  - 도입 발문 2개, 모둠 활동 중 막힌 모둠에 던질 발문 3개, 발표 사례를 고르는 기준(최초 해석 → 질문 → 수정이 드러난 모둠)
  - 실시간 앱이 안 될 때 쓰는 **종이 역할 카드 인쇄용 형식**(D-036과 무관, 정적 폴백의 최소형)

## §4 조작대 — 단계별 활동 제목

- 문제: `js/mudEngine.js:79`가 `header.interactiveTitle`을 **편을 열 때 한 번만** 표시한다. 단계가 바뀌어도 제목이 그대로라, 조선 건국 박석 단계에서도 "한양 4대문 배치", 서민 문화 1·2단계에서도 "탈춤 추임새" 제목이 보인다.
- 할 일
  1. **엔진**: 단계에 선택 필드 `interactiveTitle`이 있으면 그 단계에서 그것을 표시하고, 없으면 `header.interactiveTitle`을 쓴다. 단계가 바뀔 때마다 갱신한다. 캐시버스터를 올린다.
  2. **데이터**: 소유한 2편(`regular_joseon_founding`, `regular_joseon_folk`)에 단계별 제목을 넣는다. 제목은 그 단계의 실제 활동을 가리키고 개발 용어를 쓰지 않는다.
  3. **검사**: `scripts/18`에 "편 제목이 특정 단계의 활동만 가리키는데 다른 단계에 단계별 제목이 없다"는 신호를 경고로 추가한다. 나머지 26편에서 같은 문제가 의심되는 곳을 **목록으로만** 뽑아 `walkthrough.md`에 남긴다(다음 라운드에서 소유 창이 채운다).
  4. **브라우저 확인**: 조선 건국 2·3단계, 서민 문화 1·2·3단계에서 제목이 바뀌는지, 단계별 제목이 없는 편은 기존과 같은지 직접 확인한다.
- `regular_*.json`의 새 선택 필드는 `scripts/04` 계약 검사를 통과해야 한다. 필요하면 04에 선택 필드로 등록한다.

## §5 완료 보고

- 검증 결과(공통 목록 + 보고서 재생성 여부)
- 바뀐 파일, 확인 불가 항목, 다른 창·Codex에 넘길 항목
- 조작대는 브라우저 확인 결과를 반드시 포함한다
