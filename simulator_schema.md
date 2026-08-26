# MUD 시뮬레이터 활동 유형

MUD의 `simulator` 객체는 화면 모드(`mode`)와 활동 판정 방식(`interaction`)을 분리한다.

## 공통 필드

```json
{
  "mode": "paleo-fire",
  "interaction": "ordered-hotspot",
  "type": "gauge",
  "required": true,
  "completion": {
    "target": 3,
    "increment": 1,
    "minActions": 3,
    "progressKey": "paleoFireStep",
    "successText": "활동 완료"
  },
  "hotspots": [
    { "id": "example", "label": "탐색 대상", "x": 0.5, "y": 0.5, "feedback": "발견한 단서" }
  ],
  "sequence": ["example"]
}
```

## interaction 유형

- `hotspot-discovery`: 여러 단서를 각각 한 번씩 발견한다.
- `ordered-hotspot`: 지정된 순서에 따라 단서를 선택한다.
- `resource-allocation`: 자원 또는 역할 대상을 각각 확인·배분한다.
- `reflection`: 학습 내용을 나타내는 단서를 확인한다.
- `gauge`: 기존 단순 게이지형 활동과의 호환 유형이다.

`mode`는 역사적 콘텐츠와 시각 표현을 식별하고, `interaction`은 재사용 가능한 입력 판정 방식을 식별한다. 새 MUD는 가능한 한 `interaction`을 선언하고, 완료 조건의 `progressKey`가 실제 엔진 상태와 일치하는지 검증해야 한다.

`hotspots`는 캔버스에서 탐색할 대상의 상대 좌표(`x`, `y`)와 피드백을 정의한다. `ordered-hotspot` 유형은 `sequence`에 선언된 ID 순서를 따른다. 이 필드를 사용하면 시대별 JavaScript 분기를 추가하지 않고도 새 활동을 만들 수 있다.
