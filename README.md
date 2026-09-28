# 🧭 초등 5학년 역사 인터랙티브 MUD 포털 (History Explorer MUD)

> **초등학교 5학년 2학기 사회(역사) 전 단원(48차시) 교수·학습 과정안 기반 텍스트 MUD & 캔버스 인터랙티브 교육 포털**
>
> 🌐 **정적 포털:** [https://joonssem.github.io/history_game/](https://joonssem.github.io/history_game/)
>
> 🧪 **실시간 협동 기술 Preview:** [https://history-game-kappa-gilt.vercel.app](https://history-game-kappa-gilt.vercel.app) — 가상 데이터 검증용이며 실제 학생 운영 전 개인정보 검토가 필요합니다.

---

## 📖 프로젝트 개요

본 프로젝트는 초등학교 5학년 2학기 사회(역사) 콘텐츠와 **국사편찬위원회 우리역사넷(재미있는 초등역사)** 자료를 바탕으로, 학생들이 주도적으로 역사의 주역이 되어 의사결정을 내리고 시뮬레이션을 조작하는 **체험·참여형 MUD(Multi-User Dungeon/Visual Text Novel) 교육 플랫폼**입니다.

- **대상 학년**: 초등학교 5~6학년
- **현재 콘텐츠 기준**: 2015 개정 초등 5학년 2학기 사회 (총 3개 단원, 48개 차시)
- **목표 교육과정**: 2022 개정 교육과정 교과서에 맞춘 재매핑 진행 중 (`data/curriculum_mapping.json`)
- **성취기준 매핑**: 전체 32개 MUD 중 30개를 `[6사04-01]`~`[6사07-02]`의 2022 개정 성취기준과 직접 연결했습니다. 명량대첩·병자호란 MUD 2종은 보조 역사 맥락으로 분리했으며, 출판사·교과서 판본별 차시 번호는 확인 대기입니다. 자세한 판단은 [`curriculum_alignment_report_2022.md`](./docs/audits/curriculum_alignment_report_2022.md)에 기록합니다.
- **활동 시간 감사**: Regular MUD는 10분 이내, 설계 목표 약 9분의 개인 복습 활동입니다. 자동 설계 지표 결과는 [`activity_duration_audit.md`](./activity_duration_audit.md)에서 관리합니다.
- **활동 계층**: Regular MUD는 10분 이내(약 9분 목표)의 복습용이고, Deep-dive MUD는 여러 차시를 잇는 확장 탐구 활동입니다. 두 계층은 같은 시간·성공 기준으로 평가하지 않습니다.
- **핵심 목표**: 단순 암기를 넘어 역사적 순간 속 '결단의 순간'을 체험하며 역사적 사고력과 문제 해결력 신장
- **배포 구조**: 개인형 포털과 정적 협동 MUD는 GitHub Pages에서 운영합니다. 별도 실시간 협동 앱은 Vercel + Convex + Auth0 기술 Preview까지 구현했지만, 실제 학생 적용은 개인정보·국외 처리 검토가 끝날 때까지 금지합니다. Supabase 도입안은 보류 상태입니다.

---

## 📊 현재 구축 현황 (2026-09-28 기준)

| 구분 | 수량 | 설명 |
|---|---|---|
| Regular MUD (1계층) | **28종** | 단원별 차시에 1:1로 연결된 약 9분 복습 활동 |
| └ 탐구형 관문 파일럿 | **4종** | 신석기·삼국 한강·고려 문화·개항. 첫 판단→자료 확인→판단 수정, 순서 배열, 지도 근거, 주장·근거·한계 연결 |
| Deep-dive MUD (2계층) | **4종** | 대단원 종합 통사 롤플레이 (3대 멀티 엔딩) |
| 정규 편 연대표 띠 | **28칸** | 포털과 MUD 완료 화면에서 선사~현대의 현재 위치·완료 편을 보여 줌 |
| 정적 협동 MUD | **3편** | 고조선 8조법·시조 설화·한강 유역, 대면 정보 공유 중심 |
| 수집형 유물 도감 | **36종** | MUD·스토리 클리어 시 자동 언락 및 탐험가 레벨 |
| 유물·유적 비교 추론 | **11페어** | 관찰→근거 선택→주장 완성→학계 관점 비교. 유적을 비교 대상으로 쓰는 페어 포함 |
| 미니게임 | **4종** | 유물 카드·역사 연표·원인과 결과·유물 탐정 |
| 단원별 골든벨 퀴즈 | **3개 단원** | 초성 퀴즈 & 사료 연계 문항 |
| 실시간 협동 활동 | **3편** | 고조선 8조법(기술 회귀용)·고려 초기 "새 고려의 첫 회의"·조선 후기 장시. 모두 기술 Preview이며 실기기 리허설과 개인정보 검토 전에는 학생에게 쓰지 않음 |

## 🔁 교실 기반 개발 순환

이 프로젝트는 실제 수업을 핵심 검증 환경으로 삼는다.

```text
기획 → 작은 구현 → 실제 수업 → 학생 행동·의견 관찰
→ 진단 데이터 확인 → 가설 → 작은 수정 → 다시 수업
```

2026-09-01 수업에서는 1단원 2·3차시 활동이 연속으로 4분 이내 완료되었다. 2026-09-04에는 고조선 협동 MUD, 2026-09-08에는 시조 설화 협동 MUD를 실제 수업에서 운영했다. 이후에는 활동을 무조건 늘리기보다 선택지 편향·완료 조건·읽기 속도·교실 내 정보 공유를 구분해 진단한다. 상세 기준은 [`PRD.md`](./PRD.md), [`EXPERIMENTS.md`](./EXPERIMENTS.md), [`BACKLOG.md`](./BACKLOG.md)에 기록한다.

탐구형 관문 파일럿 4편과 유물·유적 비교, 연대표 띠는 아직 **학생 관찰 기록이 없다**. 새 기능을 넓히기 전에 수업 관찰([`classroom_observation_inquiry_pilot.md`](./docs/plans/classroom_observation_inquiry_pilot.md))을 먼저 한다.

2026-09-28에는 수업 전날 점검에서 한 단계 안의 장소·안내·재시도 버튼이 이야기와 다른 주제를 말하는 오류를 찾았다. 여러 작업이 한 단계의 칸을 나눠 고친 흔적이었다. 고려 사회(1단원 14차시)부터 3단원 끝까지 20편을 사람이 점검해 고쳤고, 재발을 막는 검사(`scripts/16`의 화면 차시 표시 대조, `scripts/18`의 단계 일관성 경고)를 추가했다. 선사~발해 9편은 아직 같은 기준으로 점검하지 않았다. 경과는 [`BACKLOG.md`](./BACKLOG.md)의 `P1-STAGE-COHERENCE`에 있다.

게임성 확장은 문제 수를 단순히 늘리는 대신 탐험·발견·자료 추론·유물 활용·근거 공유를 중심으로 검토한다. 개인형 포털은 서버 없이 동작하고, 실시간 공동 상태가 필요한 협동 수업만 별도 앱과 Convex를 사용한다. 시스템 경계와 결정 근거는 [`TECH_STACK.md`](./TECH_STACK.md)와 [`DECISIONS.md`](./DECISIONS.md)에 기록한다.

## 🤝 협동 MUD 실험

정적 협동 MUD 3편은 기존 개인형 MUD와 분리된 짧은 모둠 활동이다. 학생마다 서로 다른 역할·자료를 보고 실제 말로 정보를 공유한 뒤, 개인 판단을 수정하거나 모둠의 설명을 만든다.

핵심 흐름은 `비대칭 정보 → 개인 판단 → 정보 공유 → 추가 증거 → 판단 수정 → 공동 결정`이다. 학생은 실제 모둠 인원(3~5명)과 자기 번호를 선택하고, 기기 화면을 역할 카드로 사용한다. 정적 버전은 GitHub Pages와 기기별 `localStorage`만 사용하며 로그인·실시간 채팅·투표 동기화·개인정보 수집을 하지 않는다. 고조선 편에는 단계 뒤로 가기와 빠른 모둠용 선택형 추가 미션도 제공한다.

고조선 편과 시조 설화 편은 실제 수업 운영을 마쳤고, 한강 유역 편은 수업 검증을 기다리고 있다. 비대칭 정보가 대면 대화를 만들었지만 교사가 모둠 진행 상황을 볼 수 없다는 제약도 확인했다. 관찰 기록은 [`EXPERIMENTS.md`](./EXPERIMENTS.md)의 `EXP-006`·`EXP-007`에 있다.

이 제약을 해결하는 실시간 수직 슬라이스는 `apps/cooperative-live/`에 구현했다. 교사 Auth0 로그인, 학생 QR·6자리 코드 입장, 3~24명 균형 편성, 모둠 미리보기·재섞기, 진행 대시보드, 힌트·심화 개입, 종료 삭제를 지원한다. QR 원문은 서버에 저장하지 않으며, 가상 학생 21명의 병렬 입장과 5개 모둠 편성·개입·삭제를 자동 검증했다. 교사는 활동을 만들 때 시나리오를 고른다. 등록된 시나리오는 고조선 8조법(기술 회귀용), 1단원 13차시 고려 초기 "새 고려의 첫 회의", 10월 28일 공개수업용 조선 후기 장시 활동(역할 5개)이다. 고려 초기와 조선 후기는 자동 검증과 Preview 배포를 마쳤고, 교사 1명과 기기 4~8대로 하는 실제 리허설을 기다린다. 단, 현재는 **가상 데이터 기술 Preview**이며 [`P1-COLLAB-PRIVACY`](./BACKLOG.md#p1-collab-privacy--convex-개인정보국외-처리-착수-게이트)가 해제되기 전 실제 학생에게 사용하지 않는다.

- [협동 MUD 허브](./cooperative-mud/)
- **[수업 진행 안내](./cooperative-mud/TEACHING.md)** — 교실에서 바로 보는 준비·진행·관찰 문서
- [고조선 8조법 바로 시작](./cooperative-mud/gojoseon-law/) — 1단원 6차시
- [삼국·가야 시조 설화 바로 시작](./cooperative-mud/founding-myths/) — 1단원 7차시. 네 나라의 시조 이야기를 하나씩 나눠 읽고 말로 모은 뒤, 옛사람들이 왜 그렇게 이야기했는지 모둠의 설명 문장을 만든다. 친구 이야기를 듣기 **전에** 각자 판단을 먼저 기록하는 순서로 만들었다
- [한강 유역 쟁탈 바로 시작](./cooperative-mud/han-river/) — 1단원 8차시. 들·물길·바닷길·연표를 나눠 조사하고, 세 나라가 왜 모두 이 땅을 원했는지 근거로 설명한다. 전투 장면 없이 지리와 교역로로 다룬다
- **[수업 구조도](https://claude.ai/code/artifact/97e312bf-7cf9-4b4c-be07-6d0a4fd2c9a2)** — 기존 7단계 화면 위에 QR 입장·학생 호(號)·타이머 페이싱·교사 대시보드·데이터 경계를 얹은 전체 구조 *(비공개 링크 · 저장소 소유자 계정에서 열림)*
- [실시간 협동 앱 실행·검증 안내](./apps/cooperative-live/README.md)
- [구현 계획](./docs/plans/implementation_plan_cooperative_mud_gojoseon_law_v01.md)
- [실시간 확장 설계](./docs/plans/COLLABORATIVE_MUD_PLAN.md) · [아키텍처](./docs/plans/COLLABORATIVE_MUD_ARCHITECTURE.md) · [MVP](./docs/plans/COLLABORATIVE_MUD_MVP.md)

---

## 🕹️ MUD 시나리오 전체 목록

> 아래 차시 번호는 현재 콘텐츠의 기존(2015 개정) 기준선입니다. 2022 개정 교육과정의 단원·차시 매핑은 교육과정 및 사용 교과서 확인 후 확정합니다. 전체 기계 인덱스는 [`data/mud/_index.json`](./data/mud/_index.json)을 기준으로 합니다.

### 자동 동기화 전체 목록

<!-- MUD_CATALOG:START -->
| 구분 | 차시 | MUD 제목 | 데이터 파일 |
|---|---|---|---|
| Regular | 2차시 | 구석기 생존기: 전곡리의 만능 주먹도끼 | `regular_paleolithic.json` |
| Regular | 3차시 | 신석기 생존기: 암사동의 뾰족 그릇과 정착 | `regular_neolithic.json` |
| Regular | 4~5차시 | 청동기 고인돌 축조자: 거석 운반과 군장의 탄생 | `regular_bronze_age.json` |
| Regular | 6차시 | 단군왕검의 고조선 개국: 8조법과 비파형 동검 | `regular_gojoseon.json` |
| Regular | 7~8차시 | 삼국의 전성기 한강 쟁탈전: 근초고왕·광개토대왕·진흥왕 | `regular_three_kingdoms.json` |
| Regular | 9~10차시 | 고분 벽화 탐정: 삼국 귀족의 맥적과 가야 철갑옷 | `regular_three_kingdoms_life.json` |
| Regular | 13차시 | 고려 건국기: 태조 왕건의 후삼국 통일과 훈요 10조 | `regular_goryeo_founding.json` |
| Regular | 14차시 | 고려 사회 탐정: 손변의 지혜로운 재판과 과거 홍패 | `regular_goryeo_society.json` |
| Regular | 2~3차시 | 한양 도읍 설계자: 정도전의 사대문과 경복궁 | `regular_joseon_founding.json` |
| Regular | 7차시 | 명량해전: 13척과 울돌목의 물길 | `regular_myeongnyang.json` |
| Regular | 8차시 | 조선 후기 보부상과 모내기 대박 | `regular_joseon_economy.json` |
| Regular | 9차시 | 실학자 탐구: 지구의와 동학의 평등 세상 | `regular_joseon_silhak.json` |
| Regular | 8~9차시 | 8·15 광복의 환희와 대한민국 정부 수립: 최초의 5·10 총선거 | `regular_gwangbok.json` |
| Deep-dive | 2~6차시 | 군장의 결단: 고인돌 마을에서 고조선까지 | `deep_prehistoric.json` |
| Deep-dive | 7~12차시 | 삼국 통일의 대서사시: 화랑의 맹세와 발해의 건국 | `deep_three_kingdoms.json` |
| Deep-dive | 2~9차시 | 조선 500년의 붓: 사관의 기록과 실학의 꿈 | `deep_joseon.json` |
| Deep-dive | 2~13차시 | 독립과 민주의 횃불: 잃어버린 빛을 찾아서 | `deep_modern.json` |
| Regular | 4~5차시 | 세종대왕과 과학 발전: 애민의 바른 소리 | `regular_sejong.json` |
| Regular | 4~5차시 | 3·1 만세 운동과 대한민국 임시정부: 자주독립의 횃불 | `regular_independence.json` |
| Regular | 10~12차시 | 6·25 전쟁의 상처와 평화: 지도와 기록으로 살피기 | `regular_korean_war.json` |
| Regular | 15~16차시 | 서희의 외교 담판과 강감찬의 귀주대첩 | `regular_goryeo_war.json` |
| Regular | 17~18차시 | 팔만대장경과 벽란도: 세계와 만난 고려 문화 | `regular_goryeo_culture.json` |
| Regular | 10차시 | 조선 후기 서민 문화: 신명 나는 탈춤과 풍속화 | `regular_joseon_folk.json` |
| Regular | 11~12차시 | 강화도 조약과 근대 문물의 도입: 전차 달리는 한양 | `regular_modern_open.json` |
| Regular | 2차시 | 의병 항쟁과 안중근의 동양평화론: 독립과 평화의 근거 | `regular_independence_army.json` |
| Regular | 11차시 | 통일신라의 번영과 불국사의 과학: 신문왕과 김대성 | `regular_silla.json` |
| Regular | 12차시 | 해동성국 발해: 대조영의 건국과 고구려 계승 | `regular_balhae.json` |
| Regular | 6차시 | 조선의 신분제: 양반, 중인, 상민, 노비의 삶 | `regular_joseon_status.json` |
| Regular | 7차시 | 조선의 외교와 병자호란: 관계·전쟁·회복의 선택 | `regular_joseon_diplomacy.json` |
| Regular | 3차시 | 1910년대 무단 통치: 헌병 경찰과 토지 조사 사업의 수탈 | `regular_japanese_rule_1.json` |
| Regular | 6~7차시 | 민족 말살 통치와 강제 동원: 한글을 지킨 조선어학회 | `regular_japanese_rule_2.json` |
| Regular | 12차시 | 6·25 전쟁 이후 달라진 사회: 피난민의 삶과 재건의 희망 | `regular_post_war.json` |
<!-- MUD_CATALOG:END -->

> 아래 표는 [`data/lesson_track.json`](./data/lesson_track.json)(정규 편 연대표 띠)과 각 MUD 파일에서 만든 것이다. "연대표"는 띠의 순서이고, 차시는 단원별 차시다. 차시 번호가 바뀌면 연대표 파일과 MUD 파일을 함께 고친다(`scripts/16`이 화면 차시 표시와 대조한다).
> "단서 탐색·선택"은 장면의 단서를 확인한 뒤 판단을 고르고, 틀리면 재시도 단계에서 근거를 다시 보는 방식이다. 단원 끝에는 골든벨 퀴즈가 있다.

### 🏛️ 1단원. 유적과 유물로 살펴본 옛 사람들의 생활

| 연대표 | 차시 | 시대 | MUD 제목 | 활동 방식 |
|---|---|---|---|---|
| 1 | 2차시 | 구석기 | 구석기 생존기: 전곡리의 만능 주먹도끼 | 단서 탐색·선택 |
| 2 | 3차시 | 신석기 | 신석기 생존기: 암사동의 뾰족 그릇과 정착 | 탐구형 관문(파일럿) |
| 3 | 4~5차시 | 청동기 | 청동기 고인돌 축조자: 거석 운반과 군장의 탄생 | 단서 탐색·선택 |
| 4 | 6차시 | 고조선 | 단군왕검의 고조선 개국: 8조법과 비파형 동검 | 단서 탐색·선택 |
| 5 | 7~8차시 | 삼국 | 삼국의 전성기 한강 쟁탈전: 근초고왕·광개토대왕·진흥왕 | 탐구형 관문(파일럿) |
| 6 | 9~10차시 | 삼국 | 고분 벽화 탐정: 삼국 귀족의 맥적과 가야 철갑옷 | 단서 탐색·선택 |
| 7 | 11차시 | 통일신라 | 통일신라의 번영과 불국사의 과학: 신문왕과 김대성 | 단서 탐색·선택 |
| 8 | 12차시 | 발해 | 해동성국 발해: 대조영의 건국과 고구려 계승 | 단서 탐색·선택 |
| 9 | 13차시 | 고려 | 고려 건국기: 태조 왕건의 후삼국 통일과 훈요 10조 | 단서 탐색·선택 |
| 10 | 14차시 | 고려 | 고려 사회 탐정: 손변의 지혜로운 재판과 과거 홍패 | 단서 탐색·선택 |
| 11 | 15~16차시 | 고려 | 서희의 외교 담판과 강감찬의 귀주대첩 | 단서 탐색·선택 |
| 12 | 17~18차시 | 고려 | 팔만대장경과 벽란도: 세계와 만난 고려 문화 | 탐구형 관문(파일럿) |
| — | — | 선사 | 🌌 선사시대 Deep-dive (3대 멀티 엔딩) | 대단원 종합 |
| — | — | 삼국 | 🏹 삼국 Deep-dive (3대 멀티 엔딩) | 대단원 종합 |

### 🏯 2단원. 달라지는 시대, 변화하는 생활 모습

| 연대표 | 차시 | 시대 | MUD 제목 | 활동 방식 |
|---|---|---|---|---|
| 13 | 2~3차시 | 조선 전기 | 한양 도읍 설계자: 정도전의 사대문과 경복궁 | 단서 탐색·선택 |
| 14 | 4~5차시 | 조선 전기 | 세종대왕과 과학 발전: 애민의 바른 소리 | 단서 탐색·선택 |
| 15 | 6차시 | 조선 전기 | 조선의 신분제: 양반, 중인, 상민, 노비의 삶 | 단서 탐색·선택 |
| 16 | 7차시 | 조선 후기 | 명량해전: 13척과 울돌목의 물길 | 단서 탐색·선택 |
| 17 | 7차시 | 조선 후기 | 조선의 외교와 병자호란: 관계·전쟁·회복의 선택 | 단서 탐색·선택 |
| 18 | 8차시 | 조선 후기 | 조선 후기 보부상과 모내기 대박 | 단서 탐색·선택 |
| 19 | 9차시 | 조선 후기 | 실학자 탐구: 지구의와 동학의 평등 세상 | 단서 탐색·선택 |
| 20 | 10차시 | 조선 후기 | 조선 후기 서민 문화: 신명 나는 탈춤과 풍속화 | 단서 탐색·선택 |
| 21 | 11~12차시 | 개항기 | 강화도 조약과 근대 문물의 도입: 전차 달리는 한양 | 탐구형 관문(파일럿) |
| — | — | 조선 | 🏯 조선 Deep-dive (3대 멀티 엔딩) | 대단원 종합 |

### 🇰🇷 3단원. 식민 통치와 저항, 전쟁이 바꾼 사회와 생활

| 연대표 | 차시 | 시대 | MUD 제목 | 활동 방식 |
|---|---|---|---|---|
| 22 | 2차시 | 개항기 | 의병 항쟁과 안중근의 동양평화론: 독립과 평화의 근거 | 단서 탐색·선택 |
| 23 | 3차시 | 일제강점기 | 1910년대 무단 통치: 헌병 경찰과 토지 조사 사업의 수탈 | 단서 탐색·선택 |
| 24 | 4~5차시 | 일제강점기 | 3·1 만세 운동과 대한민국 임시정부: 자주독립의 횃불 | 단서 탐색·선택 |
| 25 | 6~7차시 | 일제강점기 | 민족 말살 통치와 강제 동원: 한글을 지킨 조선어학회 | 단서 탐색·선택 |
| 26 | 8~9차시 | 광복·대한민국 | 8·15 광복의 환희와 대한민국 정부 수립: 최초의 5·10 총선거 | 단서 탐색·선택 |
| 27 | 10~12차시 | 광복·대한민국 | 6·25 전쟁의 상처와 평화: 지도와 기록으로 살피기 | 단서 탐색·선택 |
| 28 | 12차시 | 광복·대한민국 | 6·25 전쟁 이후 달라진 사회: 피난민의 삶과 재건의 희망 | 단서 탐색·선택 |
| — | — | 근현대 | 🇰🇷 근현대 Deep-dive (3대 멀티 엔딩) | 대단원 종합 |

---

## 🏆 나의 도감 — 국보 유물 수집 (36종)

- **MUD 클리어 보상**: 각 MUD 완료 시 대표 국보·보물 유물 자동 언락
- **localStorage 영구 저장**: 로그인·회원가입 불필요
- **탐험가 레벨 시스템**: Lv.1 초보 탐험가 → Lv.MAX 역사 대마법사
- **등급 체계**: 전설의 국보(LEGENDARY) / 국가 지정 보물(TREASURE) / 살아있는 역사(RARE)
- **수집률 프로그레스 바**: 실시간 수집 현황 표시

## 🧩 확장 역사 활동

- **유물·유적 비교 추론 11페어**: 학생이 실제로 해금한 시대 마커 유물을 기준으로 활동을 제안한다. 두 대상을 관찰하고 근거를 골라 주장을 완성한 뒤 학계 관점과 비교한다. 유적(마을·무덤 등)을 비교 대상으로 쓰는 페어도 있고, 도감에서 바로 들어갈 수 있다.
- **정규 편 연대표 띠**: 포털과 MUD 완료 화면에서 28편을 선사~현대 순서로 보여 주고, 완료한 편과 지금 위치를 표시한다. 같은 시대명은 같은 연대 범위로 표기한다(`DECISIONS.md` D-036·D-037).
- **유물 카드 짝맞추기**: 유물 이름과 특징을 연결한다.
- **역사 연표 순서 맞추기**: 사건 카드를 시간 순서로 배열한다.
- **원인과 결과 순서 맞추기**: 여러 단계를 인과관계에 따라 배열한다.
- **유물 탐정: 이게 뭘까?**: 실제 해금 유물만 출제하며 시대→종류→설명 순으로 힌트를 공개한다.
- **학생 피드백**: MUD 완료 화면과 유물 비교 결과 화면에서 이메일을 수집하지 않는 Google 설문으로 이동할 수 있다.

---

## 🎨 UI/UX 디자인 시스템 (초등 맞춤 전통 테마)

* **배경 색상**: #F9F6F0 (따뜻한 한지 미색)
* **기본 글꼴색**: #2C2724 (전통 먹색 차콜)
* **포인트 색상**: #8A3B29 (단청 적토색), #2E5B70 (단청 청록색)
* **시대별 동적 MUD 컬러 테마**: 구석기(바위 브라운) → 신석기(테라코타) → 청동기(황금 앰버) → 삼국(결전 크림슨) → 고려(비색 그린) → 조선(한양 적토) → 근현대(자주독립 블루)
* **웹 폰트**: SchoolSafetyNotification (타이틀), Pretendard (본문), MaruBuri (사료 강조)

---

## 🛠️ 기술 스택

* **개인형·정적 협동 Frontend**: Pure Vanilla HTML5 / CSS3 / ES6+ JavaScript
* **실시간 협동 Frontend**: Next.js 16 / React 19 / TypeScript
* **Graphics**: HTML5 Canvas 기반 커스텀 2D 인터랙티브 시뮬레이션 엔진
* **Audio**: Web Audio API Synth 기반 효과음 (외부 의존성 없음)
* **State & Backend**: 개인형·정적 협동은 `localStorage`, 실시간 기술 Preview는 Convex
* **Authentication**: 실시간 교사만 Auth0 Google 로그인, 학생은 계정 없이 세션 한정 난수 토큰 사용
* **Deployment**: 정적 포털은 GitHub Pages, 실시간 기술 Preview는 Vercel
* **Data**: JSON 기반 MUD 시나리오 (32개 파일), 커리큘럼 DB, 유물 DB, 교육과정 매핑 기준선
* **보류된 후보**: Supabase 익명 플레이 로그 — Convex와 백엔드를 이중 운영하지 않기 위해 보류

## 🚀 로컬 실행과 검증

정적 포털은 `fetch()`로 JSON을 읽으므로 `file://`로 직접 열지 말고 로컬 서버를 사용한다.

```powershell
python -m http.server 8000
# http://localhost:8000 접속
```

주요 정적 데이터·계약·자산 검증(`.github/workflows/quality-gate.yml`이 push마다 같은 검사를 돈다):

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
node scripts/05_test_simulator_runtime.js
node scripts/16_validate_lesson_track.js --ci   # 연대표 띠·화면 차시 표시 대조
python scripts/06_validate_static_assets.py
python scripts/07_audit_activity_duration.py    # 보고서 재생성 — 변경분도 커밋한다
python scripts/10_audit_if_stages.py            # 보고서 재생성 — 변경분도 커밋한다
python scripts/11_audit_artifacts.py            # 보고서 재생성 — 변경분도 커밋한다
```

CI가 `07`·`10`·`11`의 보고서(`activity_duration_audit.md`, `docs/audits/if_stage_audit.md`, `docs/audits/artifact_audit.md`)를 다시 만들어 `git diff`로 비교한다. MUD 문구를 고친 뒤 보고서를 다시 만들지 않으면 CI가 실패한다.

검토 목록을 만드는 보조 감사(실패 조건 아님):

```powershell
python scripts/12_audit_choice_bias.py        # 정답 선택지 길이 편향
node scripts/14_lint_inquiry_semantics.js      # 탐구형 관문 의미 점검
node scripts/17_lint_sensitive_wording.js      # 3단원 민감 표현
node scripts/18_audit_stage_coherence.js       # 한 단계 안 칸끼리의 주제 불일치 경고
```

자동 검사는 문구의 뜻이 맞는지까지 보지 못한다. MUD 문구를 고쳤다면 브라우저에서 해당 단계의 정답·오답·재시도 화면까지 직접 확인한다([`BROWSER_REGRESSION_CHECKLIST.md`](./BROWSER_REGRESSION_CHECKLIST.md)).

실시간 협동 앱은 Node.js 20.9 이상이 필요하다.

```powershell
Set-Location apps/cooperative-live
Copy-Item .env.example .env.local
npm ci
npm run dev
# 전체 검사: npm run check
```

외부 계정 없이 살펴볼 때는 `.env.local`의 `NEXT_PUBLIC_DEMO_MODE=true`를 사용한다. 실제 Convex·Auth0 연결과 환경변수 경계는 [실시간 협동 앱 README](./apps/cooperative-live/README.md)를 따른다.

---

## 📱 기기 호환성

* **태블릿·모바일**: 스마트패드, 크롬북, 웨일북, 아이패드, 갤럭시 탭 — 터치 반응형 지원
* **PC·전자칠판**: 빔프로젝터, 전자칠판 전체화면 최적화
* **브라우저**: Chrome, Edge, Whale, Safari 지원

---

## 📂 관련 문서

* 📋 [agents.md](./agents.md) — AI 에이전트 협업 체계 및 Phase별 개발 기록
* 📖 [project_context.md](./project_context.md) — 전체 MUD 목록, 시뮬레이터 명세, 미해결 이슈
* 🧪 [BROWSER_REGRESSION_CHECKLIST.md](./BROWSER_REGRESSION_CHECKLIST.md) — 브라우저·태블릿 수동 회귀 점검 기준
* 🏺 [TEACHING_artifact_comparison.md](./TEACHING_artifact_comparison.md) — 유물 2개 비교·추론 활동 수업 진행 안내 (프로토타입)
* 🧭 [PRD.md](./PRD.md) — 제품 목표, 사용자, 범위, 수용 기준
* 📝 [BACKLOG.md](./BACKLOG.md) — 미완료 기획·검토 항목
* 📥 [INBOX.md](./INBOX.md) — 사용자 입력·관찰 원문
* 🧪 [EXPERIMENTS.md](./EXPERIMENTS.md) — 수업 실험과 관찰 결과
* 🗺️ [ROADMAP.md](./ROADMAP.md) — 단계별 개발 방향
* 🧱 [ARCHITECTURE.md](./ARCHITECTURE.md) — 현재 구조와 목표 확장
* ⚖️ [DECISIONS.md](./DECISIONS.md) — 장기 설계 결정과 근거
* 🧾 [walkthrough.md](./walkthrough.md) — 완료 작업의 누적 기록
* 🧱 [TECH_STACK.md](./TECH_STACK.md) — 기술 선택과 시스템 경계
* ⚡ [apps/cooperative-live/README.md](./apps/cooperative-live/README.md) — 실시간 협동 기술 Preview 실행·보안·검증 안내
* 🔀 [USER_FLOWS.md](./USER_FLOWS.md) — 학생·기능별 사용자 흐름과 플로우차트
* 🖼️ [WIREFRAMES.md](./WIREFRAMES.md) — 핵심 화면 저충실도 와이어프레임
* 👀 [classroom_observation_inquiry_pilot.md](./docs/plans/classroom_observation_inquiry_pilot.md) — 탐구형 관문·연대표 띠 수업 관찰 기록지
* 🔎 [docs/audits/](./docs/audits/) — 사실 대조·레드팀 감사·자동 감사 보고서. 최근: [단계 정합성 검토](./docs/audits/stage_coherence_review_20260928.md), [3단원 문구 후속 감사](./docs/audits/unit3_b72c7a26_wording_followup_20260928.md)
* 🤝 [docs/handoff/](./docs/handoff/) — Claude·Codex 간 작업 지시서와 전달 문서

---

## 👨‍🏫 기여 및 문의

- **기획 및 제작**: [joonssem](https://github.com/joonssem)
- **저장소**: [https://github.com/joonssem/history_game](https://github.com/joonssem/history_game)
- **라이선스**: MIT License
