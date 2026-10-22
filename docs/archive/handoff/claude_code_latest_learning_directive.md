# Claude Code 최신 학습 내용 반영 지시서

작성: Codex  
작성일: 2026-09-01  
기준: 현재 `data/mud/*.json` 및 커밋 `a0d7735`

이 문서는 Claude가 과거에 읽은 서술이 아니라 현재 저장소의 최신 학습 내용을 장면 설계에 사용하도록 하는 기준이다. 장면은 `instruction`·`infoText`·`narrative`의 핵심 의미를 시각적으로 보조해야 하며, 장면이 문구의 불일치를 임의로 덮어서는 안 된다.

## 1. Codex 변경 현황 요약

| 대상 | 변경 상태 | 최신 내용·조치 |
|---|---|---|
| `regular_joseon_silhak:3`, `3-1` | 이미 변경 | 동학·최제우·인내천·사람의 존엄과 평등을 가리키도록 narrative를 보정했다. 장면 `donghak-yongdamjeong`은 이 기준을 유지한다. |
| `regular_independence:1~3` | 이미 변경 | 단순 게이지에서 독립 의지·여러 계층·비폭력 시위, 학생·주민·태극기·만세, 임시헌장·국민 주권·민주공화제의 3개 단서 확인으로 변경했다. |
| `regular_japanese_rule_1:1~3` | 이미 변경 | 헌병 경찰·즉결 처벌·일상 통제, 토지 신고·소유권 변화·농민 부담, 비밀 결사·서약·저항의 위험을 3개 단서로 확인하도록 변경했다. |
| `regular_japanese_rule_2:1~3` | 이미 변경 | 정책·이름·학교생활, 동원 기록·피해자 증언·기억 활동, 사전 원고·맞춤법·언어생활의 자료 확인으로 변경했다. 특히 2단계는 피해 재현이 아니라 기록·증언·기억 활동이다. |
| `regular_modern_open:1~3` | 이미 변경 | 조약 배경·불평등 조항, 근대 시설 변화·이용 한계, 전차·전등 변화와 사회 조건을 함께 확인하도록 변경했다. |
| `regular_post_war:1~3` | 이미 변경 | 전쟁 피해·서로 돕기·재건 조건, 천막 교실·배움의 지속·지역별 조건, 분단의 상처·대화·교류·안전·인권 노력을 확인하도록 변경했다. |
| `regular_sejong:1~3` | 이미 변경 | 반복 탭 방지를 위해 발음 기관·삼재·해례, 한양 기준·천체 계산·농사 활용, 그림자 눈금·12지신·공공 설치의 hotspot 3개 계약으로 변경했다. |
| 조선 나머지 16개 | 변경 없음 | 현재 장면이 표현하는 기존 `infoText`·`instruction`·`narrative`를 유지한다. 완료 조건·장면 계약을 바꾸지 않는다. |

## 2. 근현대 15개 최신 장면 지시

현재 각 단계에는 공통 evidence scene이 있으므로, 아래 고유 scene으로 교체할 때 최신 서술을 기준으로 한다. `hotspots`의 좌표·ID·`interaction`·`completion.target`은 보호한다.

| 단계 | 최신 핵심 내용 | 고유 scene |
|---|---|---|
| `independence:1` | 독립선언서의 뜻, 여러 계층 참여, 많은 시위의 비폭력 원칙 | `tapgol-declaration` |
| `independence:2` | 아우내 장터의 학생·지역 주민 공동 참여. 유관순 개인 영웅담으로만 좁히지 않음 | `aunae-market-rally` |
| `independence:3` | 임시헌장, 국민 주권, 민주공화제·대의제 | `shanghai-provisional-government` |
| `japanese_rule_1:1` | 헌병 경찰의 행정·사법·치안 권한과 일상·자유 제한 | `gendarme-rule-ordinance` |
| `japanese_rule_1:2` | 토지 신고, 소유권 변화, 농민 부담. 결과를 한 숫자로 단정하지 않음 | `land-survey-office` |
| `japanese_rule_1:3` | 비밀 결사의 목적·서약·활동 위험. 특정 행동을 영웅적으로만 평가하지 않음 | `secret-society-oath` |
| `japanese_rule_2:1` | 황국신민화 정책, 이름 통제, 학교생활과 교육에 미친 영향 | `imperial-subject-policy` |
| `japanese_rule_2:2` | 노동·군사 동원과 성폭력 등 인권 침해를 자극적으로 재현하지 않고 기록·증언·기억 활동을 살핌 | `memorial-candlelight` |
| `japanese_rule_2:3` | 조선어학회의 맞춤법 통일·사전 편찬, 학술 활동과 언어생활의 의미 | `korean-language-society` |
| `modern_open:1` | 강화도 조약의 체결 배경, 해안 측량권·치외법권 등 불평등 조항 | `ganghwa-treaty-hall` |
| `modern_open:2` | 병원·우편 시설의 변화와 이용 기회의 차이 | `jejungwon-postal` |
| `modern_open:3` | 전차·전등의 도시 변화. 시설 하나가 모든 사람의 삶을 바꾸었다고 단정하지 않음 | `hanyang-tram-street` |
| `post_war:1` | 전쟁 피해·피난 생활의 어려움과 서로 돕기·재건 조건 | `busan-shanty-rebuild` |
| `post_war:2` | 천막 교실에서도 이어진 배움, 지역·가정별 조건. 한 가지 성공 신화로 만들지 않음 | `tent-classroom` |
| `post_war:3` | 이산가족·분단의 상처와 대화·교류·안전·인권을 위한 여러 노력. 평화는 개인 다짐만으로 완성되지 않음 | `dmz-reunion-peace` |

## 3. 조선 20개 최신 내용 기준

조선 20개는 Codex가 현재 장면 학습 내용을 새로 바꿀 계획이 없다. Claude는 다음 예외만 반영한다.

- `regular_joseon_silhak:3`: 동학·용담정·인내천·평등과 사람의 존엄을 중심에 둔다. 과학·홍대용 장면으로 되돌리지 않는다.
- `regular_sejong:1~3`: 현재 hotspot label과 feedback이 최신 학습 단서다. 2·3단계 JSON에는 과거 문구와 새 문구가 중복 표기된 흔적이 있으므로, Claude는 문구를 고치지 말고 현재 파싱 결과를 Codex에 보고한다.
- `regular_joseon_folk:1`, `regular_joseon_status:1~3`, `regular_joseon_economy:1~4` 등은 자료 범위·계층·지역·시기 차이를 단일 영웅·단일 집단·단일 성공 서사로 과장하지 않는다.

## 4. 변경 예정이지만 아직 확정하지 않은 내용

`regular_japanese_rule_2:1~3`은 Codex의 민감한 역사 주제 상호작용 검토(P1-04) 대상이다. 현재 문구를 장면 기준으로 사용하되, Codex가 향후 문구를 변경하기 전까지 Claude가 임의로 예측해 장면을 바꾸지 않는다. `regular_joseon_silhak:3`의 이전 narrative 불일치는 이미 수정되어 변경 예정이 아니다.

## 5. 공통 시각 원칙

- 근현대 장면에 무기·군인·폭력·구타·구속·부상·군함·대포를 그리지 않는다.
- 일장기·욱일기·신사 도리이 등 가해 주체의 국가·정치 상징을 넣지 않는다.
- 강제 이송·수용·피해 현장을 재현하지 않고 기록물·추모·자료 탐색으로 대체한다.
- 인물은 필요할 때 동일 크기 실루엣으로만 표현하고 특정 실존 인물을 영웅화하지 않는다.
- 배경에 학습 문장을 직접 삽입하지 않는다. 텍스트는 기존 UI의 `instruction`·feedback이 담당한다.
- `setLineDash` 사용 후 즉시 `[]`로 복원하고, 상단 UI 영역을 침범하지 않는다.
