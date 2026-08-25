# 📚 프로젝트 컨텍스트 (project_context.md)

> **작성일**: 2026-08-25  
> **버전**: v3.2 (Hotfix: 시뮬레이터 전수 정상화)  
> **라이브 주소**: https://joonssem.github.io/history_game/

---

## 🎯 프로젝트 목적

초등학교 5학년 2학기 사회(역사) 48개 차시 교육과정 전체를 커버하는 **인터랙티브 텍스트 MUD 교육 포털**. 학생들이 역사적 결정의 순간에 직접 개입해 선택의 결과를 체험하며 역사적 사고력을 키우는 블렌디드 러닝 환경.

---

## 🏗️ 현재 시스템 구조

### MUD 시나리오 구성 (data/mud/)
- **Regular MUD (1계층)**: 28종 — 각 본문 차시당 10~15분 복습형 어드벤처
- **Deep-dive MUD (2계층)**: 4종 — 대단원 종합 통사 롤플레이 (30분+, 3대 멀티 엔딩)
- **총 JSON 파일**: 33개 (index 포함), 전수 스키마 검증 통과

### Regular MUD 28종 전체 목록

**1단원 (옛 사람들의 삶과 문화)**
| mudId | 차시 | 제목 |
|---|---|---|
| regular_paleolithic | 2차시 | 구석기 생존기: 전곡리의 만능 주먹도끼 |
| regular_neolithic | 3차시 | 신석기 생존기: 암사동의 뾰족 그릇과 정착 |
| regular_bronze_age | 4~5차시 | 청동기 고인돌 거석 축조 시뮬레이터 |
| regular_gojoseon | 6차시 | 고조선 8조법: 단군왕검의 법정 |
| regular_three_kingdoms | 7~8차시 | 삼국의 전성기 한강 쟁탈전 |
| regular_three_kingdoms_life | 9~10차시 | 고분 벽화 탐정: 삼국 귀족의 삶과 가야 |
| regular_silla | 11차시 | 통일신라의 번영과 불국사의 과학 |
| regular_balhae | 12차시 | 해동성국 발해: 대조영의 건국 |
| regular_goryeo_founding | 13차시 | 왕건의 고려 건국 |
| regular_goryeo_society | 14차시 | 고려 사회 탐정: 과거제와 신분 |
| regular_goryeo_war | 15~16차시 | 서희와 강감찬: 거란 격퇴 |
| regular_goryeo_culture | 17~18차시 | 팔만대장경과 벽란도 국제 무역 |

**2단원 (사회의 새로운 변화와 오늘날의 우리)**
| mudId | 차시 | 제목 |
|---|---|---|
| regular_joseon_founding | 2~3차시 | 한양 도읍 설계: 정도전의 4대문 |
| regular_sejong | 4~5차시 | 세종대왕과 과학 발전: 훈민정음 |
| regular_joseon_status | 6차시 | 조선의 신분제: 양반·중인·상민·노비 |
| regular_joseon_diplomacy | 7차시 | 조선 외교와 병자호란: 남한산성 47일 |
| regular_myeongnyang | 8차시 | 명량대첩: 13척으로 133척을 막아선 기적 |
| regular_joseon_economy | 9차시 | 조선 후기 보부상과 모내기 대박 |
| regular_joseon_silhak | 10차시 | 실학자 탐구: 지구의와 동학의 평등 세상 |
| regular_joseon_folk | 11차시 | 조선 후기 서민 문화: 탈춤과 풍속화 |
| regular_modern_open | 12차시 | 강화도 조약과 근대 문물: 전차 달리는 한양 |

**3단원 (대한민국의 발전과 오늘의 우리)**
| mudId | 차시 | 제목 |
|---|---|---|
| regular_independence_army | 2차시 | 안중근의 하얼빈 의거와 의병 |
| regular_japanese_rule_1 | 3차시 | 1910년대 무단 통치: 헌병 경찰과 토지 수탈 |
| regular_independence | 4~5차시 | 3·1 운동과 대한민국 임시정부 |
| regular_japanese_rule_2 | 6~7차시 | 민족 말살 통치: 조선어학회와 강제 동원 |
| regular_gwangbok | 8~9차시 | 8·15 광복과 5·10 총선거 |
| regular_korean_war | 10~11차시 | 6·25 전쟁과 조국 수호 |
| regular_post_war | 12차시 | 6·25 이후 피난민의 삶과 재건 |

**Deep-dive MUD 4종**
| mudId | 단원 | 제목 |
|---|---|---|
| deep_prehistoric | 1단원 | 선사시대 대서사 (선사 → 삼국 통합 롤플레이) |
| deep_three_kingdoms | 1단원 | 삼국의 운명을 바꾼 결전 |
| deep_joseon | 2단원 | 조선 왕조 대서사 |
| deep_modern | 3단원 | 근현대 격동의 역사 |

---

## 🎮 인터랙티브 시뮬레이터 모드 (js/mudSimulators.js)

| 모드명 | 설명 | 사용 사례 |
|---|---|---|
| paleo-fire | 불 피우기 연타 게이지 | 구석기 불 피우기 |
| paleo-stone | 돌 떼어내기 게이지 | 구석기 주먹도끼 제작 |
| paleo-intro | 동굴 배경 정보화면 | 구석기 자연환경 탐색 |
| dolmen-step1~4 | 고인돌 4단계 물리 시뮬레이터 | 청동기 거석 운반 |
| 
eolithic-pottery | 빗살무늬 토기 빚기 게이지 | 신석기 토기 제작 |
| 
eolithic-settle / weave | 신석기 정착 / 직조 | 신석기 생활 |
| mn-map-idle / choose | 명량 작전 지도 | 전술 결정 |
| mn-combat-active | 왜선 격파 캔버스 인터랙션 | 명량해전 포격 |
| mn-current-switch | 조류 역전 슬라이더 | 울돌목 조류 조작 |
| hanyang-map/gates/bakseok | 한양 도성 정보 | 한양 도읍 설계 |
| economy-farm/market | 농업/시장 경제 | 조선 후기 경제 |
| silhak-globe | 지구의 시각화 | 실학자 탐구 |
| gwangbok-flag | 태극기 정밀 컬러링 | 광복·태극기 |
| gwangbok-vote / precise-vote | 투표용지 기표 | 5·10 총선거 |
| precise-taegeukgi | 태극기 렌더링 | 독립 선언 |
| 	ext-reading | 📜 사료 두루마리 탐구 | 조약·선언·법령 사료 |
| attle-gauge | ⚔️ 호국 결전 게이지 | 전투·영토·저항 활동 |
| culture-touch | ✨ 문화 파티클 터치 | 문화재·예술·생활 활동 |

---

## 🧩 핵심 JS 파일 구조

| 파일 | 역할 |
|---|---|
| js/mudEngine.js | MUD 메인 엔진: JSON fetch, 스테이지 렌더링, 선택지 로직, 회고록 |
| js/mudSimulators.js | 캔버스 인터랙티브 렌더링 및 터치 이벤트 처리 |
| js/app.js | 커리큘럼 UI 렌더링, 차시별 MUD 버튼 매핑 |
| js/encyclopedia.js | 유물 도감: localStorage 저장, 수집률, 탐험가 레벨 |
| js/quizGame.js | 골든벨 퀴즈 허브 |
| js/storyEngine.js | 스토리 보조 엔진 |
| js/miniGames.js | 미니게임 |
| js/soundEffects.js | Web Audio API 기반 효과음 |

---

## 🐛 알려진 미해결 이슈

1. **선택지 
ext 필드 누락 (95건)**: 최신 Track 1에서 추가된 7종 MUD의 정답/오답 선택지 중 
ext 필드가 없는 경우가 있어 좌측 화살표(결단 버튼) 클릭 시 이동이 안 되는 버그 존재. → ix_missing_next.py 스크립트로 자동 수정 예정.
2. **오답 선택지 피드백 연출 일원화 필요**: 오답 선택 후 IF 스테이지로 넘어가는 방식이 MUD마다 일관되지 않음.

---

## 📦 데이터 파일 구조

`
data/
├── history_curriculum_48_lessons.json   # 48개 차시 커리큘럼 정의
├── artifacts.json                       # 국보 유물 도감 20종 DB
└── mud/
    ├── _index.json                      # 전체 MUD 메타데이터 인덱스
    ├── deep_*.json (4개)                # 대단원 Deep-dive MUD
    └── regular_*.json (28개)            # 차시별 Regular MUD
`

---

## 🌐 배포 정보

- **플랫폼**: GitHub Pages (자동 배포)
- **저장소**: https://github.com/joonssem/history_game
- **최신 커밋**: 9822f23 (Hotfix: 시뮬레이터 전수 정상화)
- **배포 URL**: https://joonssem.github.io/history_game/
