# Codex 전달 — 조선 후기 콘텐츠 가독성 수정 (2026-09-29, 라운드 12 §3-1)

- 작성: 연결 공방(Claude). 원본: `docs/handoff/claude_joseon_late_runtime_scenario.json`
- **`apps/**`는 고치지 않았다.** 아래 필드를 `apps/cooperative-live/convex/scenarios.ts`의 `joseon-late-market`에 다시 반영해 달라.
- 이유: 5학년이 태블릿(1180×820)에서 한 번에 읽을 수 있도록 낯선 낱말(광작·전황·고공·세곡·유리민·이문 등)을 풀어 쓰거나 괄호 설명을 붙였다.
- **사실 범위는 바꾸지 않았다.** 대조실이 확인한 문장(모내기법 보급, 광작농과 일부 몰락, 전황, 관영 수공업 쇠퇴, 호적 미등재, 임노동)의 주체·범위·"일부" 한정은 그대로다. 낱말 풀이만 더했다. `version`은 올리지 않았다(문안 수정이라 Codex 판단).
- `node scripts/15_validate_cooperative_packet.js --runtime …` 결과: PASS, 길이·과잉 단정 경고 0건(이전 `interest` 3건 해소).

## 1. 바뀐 필드 (역할별)

| 역할 | 필드 | 바뀐 내용 |
|---|---|---|
| `farmer` | `privateInfo` | "모내기법(이앙법)" 앞에 "모를 옮겨 심는" 추가. "(광작)" 괄호를 없애고 **별도 문장**으로 풀이("이렇게 한 집이 넓은 논을 짓는 일을 광작이라고 합니다."). "장시"→"장시(시장)", "품삯"→"품삯(일한 대가로 받는 돈)". 4문장→5문장 |
| `farmer` | `interest` | 104자 → 두 문장으로 줄임: "곡식을 많이 거두어 좋은 값에 팔고 싶습니다. 하지만 땅을 구하지 못하는 이웃이 생긴다는 것도 압니다." (이웃과의 긴장은 유지) |
| `farmer` | `evidence[farmer-ipbeop].label` | "모내기법으로 넓은 땅을 지음(광작)" → "모내기법으로 한 집이 넓은 논을 지음" (다른 역할이 보는 근거 목록에서 "광작"이 풀이 없이 나오는 문제 해소) |
| `bobusang` | `privateInfo` | "등짐과 봇짐을 지고 … 장시" → "짐을 지고 5일마다 서는 시장(장시)". "상평통보" 앞에 "나라에서 만든 동전인", "동전이 귀해지는 때가 있어(전황)" → "동전이 모자라는 때가 있습니다(이를 전황이라고 합니다)." 문장 분리. 4문장→5문장 |
| `bobusang` | `interest` | 111자 → 두 문장: "값이 오르내릴 것 같아, 그 차이로 이문(장사로 남는 돈)을 남길 수 있을까 생각합니다. 저는 싸게 사고 싶고 농민은 제값에 팔고 싶어 합니다." (라운드 8의 "추론으로 낮춤" 수준 유지) |
| `bobusang` | `evidence[bobusang-currency].label` | "상평통보 유통과 전황(동전 부족)" → "동전(상평통보)이 퍼졌으나 모자란 때도 있음" |
| `craftsman` | `privateInfo` 1문장 | "장시 근처 … 무명(면포)" → "장시(시장) 근처 … 무명(목화솜으로 짠 천)" (나머지 4문장 그대로) |
| `craftsman` | `evidence[jangsi-craftsman].label` | "관영 수공업 쇠퇴, 스스로 만들어 파는 수공업자 증가" → "나라 운영 수공업이 줄고 스스로 파는 사람이 늘어남" |
| `recordkeeper` | `privateInfo` 1~2문장 | "호적" → "호적(주민 명부)", "유리민" → "유리민(살던 곳을 떠난 사람)" (나머지 그대로) |
| `recordkeeper` | `evidence[record-keeper-scope].label` | "호적에 없는 유리민, 기록의 한계" → "호적에 빠진 떠돌이(유리민), 기록의 한계" |
| `laborer` | `privateInfo` | 1문장 "품삯(일한 대가로 받는 돈)", "고공(품팔이꾼)"; 2문장 "몰락 농민" → "살림이 무너진 농민(몰락 농민) 중 일부"(**"일부" 유지**); 3문장 "도성(서울)", "세곡(세금으로 낸 곡식)"; 4문장 "김매기(잡초 뽑기)"; 5문장 "몰락한 농민 모두가" → "살림이 무너진 농민 모두가"(부정문·범위 유지) |
| `laborer` | `interest` | 92자 → "일자리가 꾸준히 있으면 좋겠습니다. 넓은 땅을 짓는 사람들 덕에 일거리는 생기지만, 제 땅이 없어 늘 불안정합니다." |
| `laborer` | `evidence[laborer-wage].label` | "품삯으로 사는 고공, 세곡 하역 임노동" → "품삯을 받고 논밭 일·세곡 나르기를 하는 사람" |

## 2. 바뀐 필드 (`sharedPrompt`)

| 필드 | 바뀐 내용 |
|---|---|
| `connections[currency-tradeoff].label` | "전황이 심할 때는" → "동전이 모자란 때는" (이미 반영돼 있었다면 그대로) |
| `connections[land-vs-labor].label` | "광작으로 넓은 땅을 짓는" → "넓은 논을 짓는" (파일에 이미 있던 "이웃 가운데 일부는 품삯을 받으며" 한정 유지) |

## 3. 바꾸지 않은 것

- `publicMeta`, `groupSizes`, `firstChoices`, `policies`, `limitations`, `commonEvidenceByGroupSize`, `teacherStages`, `interventions`, `sources` — 그대로.
- **`sources[].claim`**의 "광작농", "자작농·작인층", "전황", "고공"은 그대로 뒀다. `apps/cooperative-live/components/*`에서 `sources`를 화면에 내보내는 코드를 찾지 못했다(`scenarios.ts`에만 있음). 학생·교사 화면에 노출되는 경로가 생기면 그때 풀어 쓴다.

## 4. 반영 뒤 확인 요청

- 역할 카드 한 장이 태블릿에서 스크롤 없이 읽히는지(`privateInfo`가 5문장이 된 `farmer`·`bobusang`·`laborer`·`craftsman`·`recordkeeper` 전부 5문장 이하).
- 근거 목록의 새 라벨이 버튼 줄바꿈으로 잘리지 않는지(가장 긴 것: "품삯을 받고 논밭 일·세곡 나르기를 하는 사람", 25자).
- 3인 모둠의 공통 자료(`common-craftsman`)는 바꾸지 않았다.
