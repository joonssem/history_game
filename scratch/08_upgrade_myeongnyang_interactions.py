"""Upgrade Myeongnyang's bespoke modes to explicit completion contracts."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data" / "mud" / "regular_myeongnyang.json"


def observation_simulator(stage: dict, actions: list[tuple[str, str]]) -> None:
    simulator = stage["simulator"]
    simulator["type"] = "buttons"
    simulator["required"] = True
    simulator["actions"] = [
        {"type": "observe", "label": label, "value": value}
        for label, value in actions
    ]
    simulator["completion"] = {
        "target": len(actions),
        "increment": 1,
        "minActions": len(actions),
        "progressKey": "simulatorProgress",
        "successText": "🗺️ 지형과 전력의 핵심 단서를 확인했습니다. 이제 전술을 선택하세요.",
    }


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    stages = data["stages"]
    observation_simulator(stages["1"], [
        ("판옥선 13척", "joseon-fleet"),
        ("왜선 대함대", "japanese-fleet"),
        ("울돌목 협로", "narrow-channel"),
    ])
    observation_simulator(stages["2"], [
        ("좁은 물길", "channel-width"),
        ("빠른 조류", "fast-current"),
        ("대형 함대 진입 제한", "fleet-bottleneck"),
    ])
    stages["3"]["simulator"]["required"] = True
    stages["3"]["simulator"]["completion"] = {
        "target": 100,
        "increment": 25,
        "minActions": 4,
        "progressKey": "gaugeProgress",
        "successText": "🎯 왜선 네 척을 원거리 포격으로 격파했습니다. 판옥선과 화포의 장점을 확인했습니다.",
    }
    stages["4"]["simulator"]["required"] = True
    stages["4"]["simulator"]["completion"] = {
        "target": 80,
        "increment": 1,
        "minActions": 1,
        "progressKey": "simulatorProgress",
        "successText": "🌊 조류가 역전되는 조건을 확인했습니다. 승리의 요인을 정리해 보세요.",
    }
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Upgraded four Myeongnyang simulator stages.")


if __name__ == "__main__":
    main()
