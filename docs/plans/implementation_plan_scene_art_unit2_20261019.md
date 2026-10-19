# 장면 그래픽 교체 계획 — 2단원 정규 MUD (한지 채색화풍, 인물 없음)

- 작성: 2026-10-19 (Claude Sonnet 5.5)
- 상태: `planned` — 사용자 결정 완료(화풍 A 한지 채색, **인물은 그리지 않음**). 구현 전 사용자 확인 대기.
- 근거: [`graphics_upgrade_proposal_20261019.md`](./graphics_upgrade_proposal_20261019.md), 시안 [`graphics_scene_preview.html`](../prototypes/graphics_scene_preview.html)
- 정정: 시안 단계에서 "2단원 14편"이라 했으나 2단원 정규 MUD는 **9편(14차시)**, 장면은 **34종**이다.

## 1. 결정

1. 화풍은 한지 채색화풍으로 한다(종이 결 + 먹선 + 광물성 채색). 플랫 안은 쓰지 않는다.
2. **인물을 그리지 않는다.** 장면에는 배·건물·도구·지도·문서 같은 사물만 둔다. 학생 화면의 이모지 인물 칩(이순신 등)은 이번 범위에서 건드리지 않는다. 인물 이름·역할은 글로만 쓴다.
3. 새 라이브러리 없이 SVG만 쓴다.

## 2. 구조 (최소 변경)

- 장면은 `assets/scenes/<scene-id>.svg` 파일 한 장씩 둔다(약 34개, 파일당 5~12KB 목표). 480×230 비율(현재 캔버스와 같다).
- `js/mudSimulators.js`의 `drawConfiguredSceneBackground(ctx, w, h, scene)` 맨 앞에서 해당 SVG가 로드되어 있으면 `ctx.drawImage`로 배경을 그리고 `return true`한다. 없으면 기존 캔버스 코드가 그대로 돈다. 그래서 장면을 하나씩 바꿔도 앱이 깨지지 않는다.
- 로드는 `js/sceneArt.js`(신규, 30줄 안팎)가 `new Image()`로 미리 읽고 캐시한다. 로드 전에는 기존 그림이 보인다.
- 핫스팟 원·진행 문구는 기존 그대로 두고, 라벨 겹침만 한 군데(`drawPaleoActivity`, 약 630~655행)에서 "원 아래 알약" 모양으로 바꾼다. 맞음·틀림·발견 색상 로직은 그대로다.
- `index.html`에 스크립트 한 줄 추가, 캐시버스터 갱신. 공용 협동 엔진 파일은 건드리지 않는다.

## 3. 장면 목록 (인물 없이 그릴 소재)

| MUD | 장면 | 소재 |
|---|---|---|
| 조선 건국 | hanyang-site-selection, gyeongbokgung-naming, hanyang-gates-pavement, joseon-founding-evidence | 한양 산세와 도성, 경복궁 건물, 4대문·박석 마당, 자료 책상 |
| 명량해전 | namhae-suguninmul, hansando-hakikjin, `drawPreciseMyeongnyang` 5모드 | 판옥선·왜선, 울돌목 물살, 학익진 배열도(시안과 같은 방식) |
| 조선 경제 | ianbeop-farming, sangpum-crops, sangpyeongtongbo-market, hanyang-commerce-summary | 모내기 논(사람 없이 모·논), 상품 작물, 상평통보와 장시 좌판, 시전 거리 |
| 실학 | hongdaeyong-globe, hwaseong-geojunggi, donghak-yongdamjeong, silhak-summary | 지구의, 거중기, 용담정, 책과 도구 |
| 세종 | hunminjeongeum-lab, chiljeongsan-observatory, angbuilgu-street, sejong-evidence | 훈민정음 책, 천문대 기구, 앙부일구, 실록 |
| 서민 문화 | kim-hongdo-studio, pansori-performance, talchum-dance, joseon-folk-evidence | 화실의 붓·종이, 북·부채·돗자리 무대, 탈(사람 없이), 책 |
| 개항 이후 | ganghwa-treaty-hall, jejungwon-postal, hanyang-tram-street, modern-open-evidence | 조약 문서·건물, 우체·병원 건물, 전차와 전선, 신문 |
| 신분제 | hopae-registration, jungin-medicine, commoner-harvest, joseon-status-evidence | 호패, 약재, 곡식 더미, 문서 |
| 병자호란 | joseon-border, joseon-namhansanseong, joseon-postwar, joseon-diplomacy-exhibit | 국경 지도, 남한산성 성곽, 복구된 들판, 전시 |

## 4. 단계

1. **시범(작은 묶음)**: 구조(`sceneArt.js`·훅·라벨 알약) + 명량 2장면(`namhae-suguninmul`, `hansando-hakikjin`) + 서민 문화 1장면. 로컬 Chrome 캡처로 현재 화면과 비교, 사용자 검토.
2. 승인 시 한 MUD씩(약 4장면) 교체 → MUD마다 스크린샷 확인.
3. 검증(매 묶음): `node --check js/*.js`, `python scripts/01_validate_game_data.py`, `scripts/06_validate_static_assets.py`(정적 자산 검사에 SVG 경로 포함 여부 확인), Chrome에서 핫스팟 클릭·완료 흐름(1180×820, 820×1180, 390×844).
4. 완료 뒤 `walkthrough.md`·`DECISIONS.md`(D-046) 기록.

## 5. 위험과 대응

- **고증**: 판옥선·왜선·한양도성·호패 등은 공공누리 박물관 자료와 대조해 그린다. 확인 못 한 디테일은 단순화한다(시안 때의 움집·배 모양은 아직 대조 전).
- **캔버스 해상도 흐림**: SVG를 캔버스 `drawImage`로 그리므로 `devicePixelRatio`를 맞춘 크기로 그린다.
- **접근성**: 장면은 장식이다. 정보는 기존 글·핫스팟 라벨이 계속 담당한다. 핫스팟 아래 알약은 대비 4.5:1 이상 유지.
- **파일 수**: 34개 파일을 처음 로드할 때 지연이 생기지 않도록 MUD를 열 때 해당 편의 장면만 미리 읽는다.
- **범위 밖**: 1·3단원 장면, 협동 활동 삽화, 유물·완료 연출. 2단원 결과를 본 뒤 별도로 계획한다.

## 6. 사용자 확인이 필요한 것

1. 위 단계 1(시범)부터 진행해도 되는지.
2. 시범 장면 선택(명량 2 + 서민 문화 1)이 맞는지.
