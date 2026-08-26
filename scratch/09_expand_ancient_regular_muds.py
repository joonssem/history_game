"""Expand the Unified Silla and Balhae pilot MUDs with evidence synthesis stages."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def load(name: str) -> dict:
    return json.loads((MUD_DIR / name).read_text(encoding="utf-8"))


def save(name: str, data: dict) -> None:
    (MUD_DIR / name).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def expand_silla() -> None:
    data = load("regular_silla.json")
    data["roadmap"] = [item for item in data["roadmap"] if item["id"] not in {"4", "4-1"}]
    data["roadmap"].extend([
        {"id": "4", "label": "4. 통치·문화·교류 자료 종합"},
        {"id": "4-1", "label": "4-F. 한 자료만으로 판단"},
    ])

    stage1 = data["stages"]["1"]
    stage1["choices"][0]["feedback"] = (
        "신문왕은 국학을 세우고 9주 5소경을 정비했으며, 녹읍을 폐지하고 관료전을 지급해 "
        "왕 중심의 통치 체제를 강화했습니다."
    )
    data["stages"]["1-1"]["narrative"] = (
        "<b>❌ [자료 다시 보기: 통치 체제의 과제]</b><br>귀족의 권한만 그대로 두는 선택으로는 "
        "넓어진 영토를 안정적으로 다스리기 어렵습니다.<br><br>9주 5소경, 국학, 토지 제도가 "
        "어떤 문제를 해결하려 했는지 다시 비교해 보세요."
    )

    stage2 = data["stages"]["2"]
    stage2["glossary"][1]["definition"] = (
        "불국사 삼층석탑에서 발견된 통일신라 시대의 이른 목판 인쇄 자료"
    )
    stage2["choices"][0]["feedback"] = (
        "석가탑의 단정한 비례와 다보탑의 복잡한 구조는 서로 다른 아름다움을 보여 줍니다. "
        "청운교·백운교까지 함께 살피면 불국사의 공간 구성을 이해할 수 있습니다."
    )

    stage3 = data["stages"]["3"]
    stage3["narrative"] = (
        "<b>토함산에 화강암을 다듬어 인공 석굴 사원을 만들고 본존불을 모시려 합니다!</b><br><br>"
        "석굴암은 돌을 짜 맞춘 둥근 천장, 본존불과 여러 조각상의 배치, 석실로 들어오는 빛이 "
        "어우러진 문화유산입니다. 장식 하나만 강조하기보다 구조와 불상의 조화를 고려해야 합니다. "
        "어떤 방식으로 완성하시겠습니까?"
    )
    stage3["glossary"][0]["definition"] = (
        "화강암을 다듬어 돔 구조를 만들고 불상들을 질서 있게 배치한 통일신라의 인공 석굴 사원"
    )
    stage3["choices"][0]["text"] = (
        "🌕 \"돔을 이루는 돌을 안정적으로 짜 맞추고, 본존불과 주변 조각의 배치를 조화롭게 구성한다.\""
    )
    stage3["choices"][0]["feedback"] = (
        "석굴암은 건축 구조와 섬세한 불상 조각이 조화를 이룬 통일신라 불교 예술의 대표 유산입니다."
    )
    stage3["choices"][0]["next"] = "4"
    stage3["simulator"]["hotspots"][1] = {
        "id": "sculpture-layout",
        "label": "불상 배치",
        "x": 0.5,
        "y": 0.65,
        "feedback": "본존불과 주변 조각상은 석굴 안에서 질서와 조화를 이루도록 배치되었습니다.",
    }
    stage3["simulator"]["completion"]["successText"] = (
        "🌕 석굴암의 돔 구조·불상 배치·조각 표현을 모두 확인했습니다."
    )
    data["stages"]["3-1"]["narrative"] = (
        "<b>❌ [자료 다시 보기: 구조와 예술의 조화]</b><br>천장의 결합 원리를 무시하면 석굴의 "
        "안정성을 확보하기 어렵습니다.<br><br>돔 구조, 불상 배치, 조각 표현이 어떻게 함께 "
        "문화유산을 이루는지 다시 확인해 보세요."
    )

    data["stages"]["4"] = {
        "location": "통일신라 자료 연구실",
        "badge": "🔎 제4관문: 통일신라를 설명하는 세 가지 근거",
        "character": {"name": "어린이 역사 연구원", "role": "자료 종합 담당", "emoji": "🔎"},
        "narrative": (
            "<b>신문왕의 제도, 불국사와 석굴암, 주변 나라와의 교류 자료를 함께 살펴보았습니다.</b><br><br>"
            "이제 어느 한 인물이나 문화유산만으로 시대 전체를 설명하지 말고, 통치 체제와 문화, "
            "교류가 통일신라의 발전과 어떤 관련이 있는지 근거를 모아 설명해야 합니다."
        ),
        "glossary": [
            {"term": "자료 종합", "definition": "성격이 다른 여러 자료의 공통점과 차이를 연결해 설명하는 방법"},
            {"term": "문화 교류", "definition": "사람과 물자가 오가며 서로의 기술·종교·생활 문화에 영향을 주는 일"},
        ],
        "choices": [
            {
                "text": "🔎 \"지방 제도 정비, 불교 예술, 당과의 교류 자료를 함께 근거로 들어 통일신라의 모습을 설명한다.\"",
                "correct": True,
                "feedback": "좋습니다. 서로 다른 자료를 연결하면 통치·문화·교류가 어우러진 시대 모습을 더 균형 있게 설명할 수 있습니다.",
                "next": "end",
            },
            {
                "text": "🛕 \"불국사 한 곳만 살펴본 뒤 통일신라의 정치와 생활까지 모두 같았다고 결론 내린다.\"",
                "correct": False,
                "feedback": "문화유산 하나는 중요한 자료이지만 시대 전체를 설명하기에는 부족합니다. 다른 성격의 자료와 비교해야 합니다.",
                "next": "4-1",
            },
        ],
        "simulator": {
            "mode": "culture-touch",
            "interaction": "hotspot-discovery",
            "type": "info",
            "hotspots": [
                {"id": "government", "label": "9주 5소경", "x": 0.22, "y": 0.48, "feedback": "넓어진 영토를 다스리기 위해 지방 제도를 정비한 통치 자료입니다."},
                {"id": "culture", "label": "불국사·석굴암", "x": 0.5, "y": 0.65, "feedback": "불교 신앙과 건축·조각 기술을 보여 주는 문화유산 자료입니다."},
                {"id": "exchange", "label": "당과의 교류", "x": 0.78, "y": 0.48, "feedback": "사람과 물자의 이동을 통해 문화가 서로 영향을 주었음을 보여 줍니다."},
            ],
            "required": True,
            "completion": {"target": 3, "increment": 1, "minActions": 3, "progressKey": "simulatorProgress", "successText": "🔎 통치·문화·교류 자료를 모두 확인했습니다. 이제 근거를 종합하세요."},
            "infoText": "세 자료는 서로 다른 측면에서 통일신라의 발전을 보여 줍니다.",
            "instruction": "🔎 <b>서로 다른 성격의 자료 세 가지를 비교하세요</b>",
            "feedback": "한 자료만으로 시대 전체를 판단하지 마세요.",
        },
    }
    data["stages"]["4-1"] = {
        "location": "통일신라 자료 연구실",
        "badge": "↩️ 근거 보완: 자료 하나의 한계",
        "character": {"name": "시간 안내원 '타미'", "role": "역사 해설자", "emoji": "🤖"},
        "narrative": (
            "<b>문화유산 하나만으로는 정치 제도와 교류, 다양한 사람들의 생활까지 모두 알 수 없습니다.</b><br><br>"
            "성격이 다른 자료를 함께 살펴보고, 각 자료가 알려 주는 범위를 구분해 다시 판단해 보세요."
        ),
        "choices": [{"text": "🔄 세 자료가 알려 주는 내용을 구분해 다시 종합한다.", "next": "4", "correct": True}],
    }
    source_url = "https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_m61_0050_0020"
    data["sources"] = [source for source in data["sources"] if source.get("url") != source_url]
    data["sources"].append({
        "institution": "국사편찬위원회",
        "title": "통일 신라의 발전",
        "url": source_url,
        "checkedAt": "2026-08-27",
        "claimScope": "9주 5소경·토지 제도·불교 예술·당과의 교류를 종합한 4단계 서술",
    })
    save("regular_silla.json", data)


def expand_balhae() -> None:
    data = load("regular_balhae.json")
    data["roadmap"] = [item for item in data["roadmap"] if item["id"] not in {"4", "4-1"}]
    data["roadmap"].extend([
        {"id": "4", "label": "4. 여러 자료로 본 발해"},
        {"id": "4-1", "label": "4-F. 단일 자료로 단정"},
    ])

    stage1 = data["stages"]["1"]
    stage1["narrative"] = (
        "<b>고구려 멸망 뒤 당의 영주에 옮겨졌던 고구려 유민과 말갈 집단이 동쪽으로 이동합니다.</b><br><br>"
        "대조영이 이끄는 집단은 당의 추격군과 맞선 뒤 동모산 일대에 새로운 나라를 세웠습니다. "
        "서로 다른 사람들이 함께 살아갈 나라의 기틀을 어떻게 마련하겠습니까?"
    )
    stage1["glossary"][0]["definition"] = (
        "고구려 유민과 말갈 집단을 이끌고 698년 동모산 일대에 나라를 세운 발해의 건국자"
    )
    stage1["choices"][0]["text"] = (
        "🦅 \"고구려 유민과 말갈 집단을 모아 동모산 일대에 나라를 세우고 공동체의 질서를 마련한다.\""
    )
    stage1["choices"][0]["feedback"] = (
        "대조영이 이끈 고구려 유민과 말갈 집단은 함께 발해 건국의 주역이 되었습니다."
    )
    stage1["choices"][1]["text"] = "🏕️ \"각 집단이 따로 흩어진 채 공동의 방어와 통치 체계를 만들지 않는다.\""
    stage1["choices"][1]["feedback"] = "추격을 받는 상황에서 흩어지면 공동체를 지키고 새 나라의 기반을 마련하기 어렵습니다."
    data["stages"]["1-1"]["narrative"] = (
        "<b>❌ [자료 다시 보기: 발해 건국의 구성원]</b><br>발해는 한 집단만의 힘이 아니라 대조영이 이끈 "
        "고구려 유민과 말갈 집단이 함께 세운 나라였습니다.<br><br>누가 건국 과정에 참여했는지 다시 확인해 보세요."
    )

    stage2 = data["stages"]["2"]
    stage2["narrative"] = (
        "<b>발해는 무왕 때 당과 대립하기도 했고, 문왕 때에는 당의 제도를 받아들이며 신라·일본과 교류했습니다.</b><br><br>"
        "선왕 때에는 넓은 영역과 여러 지방 행정 구역을 갖추어 당에서 '해동성국'이라 불렸습니다. "
        "발해의 발전을 가장 균형 있게 설명한 것은 무엇입니까?"
    )
    stage2["choices"][0]["text"] = (
        "🌏 \"주변 나라와 경쟁하고 교류하면서 제도를 정비하고 영역을 넓혀 해동성국으로 발전했다.\""
    )
    stage2["choices"][0]["feedback"] = (
        "발해는 전쟁만으로 성장한 것이 아니라 당·신라·일본 등과 관계를 맺고 제도와 교통로를 정비하며 발전했습니다."
    )
    stage2["choices"][1]["text"] = "⚔️ \"한 번의 전투만으로 이후의 제도 정비와 교류까지 모두 이루어졌다고 본다.\""
    stage2["choices"][1]["feedback"] = "국가의 발전은 한 전투만으로 설명할 수 없습니다. 영역·제도·교류 자료를 함께 살펴봐야 합니다."
    data["stages"]["2-1"]["narrative"] = (
        "<b>❌ [자료 다시 보기: 발전의 여러 요인]</b><br>발해의 발전 과정에는 대외 경쟁뿐 아니라 제도 정비와 "
        "주변 나라와의 교류도 있었습니다.<br><br>한 가지 원인만 고르지 말고 여러 자료를 연결해 보세요."
    )

    stage3 = data["stages"]["3"]
    stage3["narrative"] = (
        "<b>발해 유적과 외교 문서를 조사하니 서로 다른 문화 요소가 나타납니다.</b><br><br>상경성의 온돌과 "
        "기와, 일부 무덤 구조와 일본에 보낸 국서는 고구려 계승 의식을 보여 줍니다. 동시에 발해에는 "
        "말갈 문화와 당의 제도, 발해가 새롭게 만든 요소도 함께 나타납니다. 자료를 어떻게 해석해야 할까요?"
    )
    stage3["glossary"][0]["definition"] = (
        "방바닥 일부를 덥히는 난방 시설로, 발해 유적에서도 발견되어 고구려 생활 문화의 영향을 보여 주는 자료"
    )
    stage3["choices"][0]["text"] = (
        "🏛️ \"온돌·무덤·외교 문서에서 고구려 계승을 찾되, 말갈과 당 등 여러 문화 요소도 함께 살핀다.\""
    )
    stage3["choices"][0]["feedback"] = (
        "좋습니다. 발해는 고구려 계승 의식을 분명히 드러냈고, 여러 집단과 주변 문화의 요소도 함께 지닌 나라였습니다."
    )
    stage3["choices"][0]["next"] = "4"
    stage3["choices"][1]["text"] = "❓ \"온돌 한 가지만 보고 발해의 모든 주민과 문화가 완전히 같았다고 단정한다.\""
    stage3["choices"][1]["feedback"] = "유물 하나만으로 발해의 다양한 주민 구성과 문화 전체를 단정할 수 없습니다. 여러 자료를 비교해야 합니다."
    stage3["simulator"]["infoText"] = (
        "온돌·기와·무덤과 외교 문서는 고구려 계승을 보여 주지만, 발해 문화 전체는 여러 요소가 어우러져 형성되었습니다."
    )
    stage3["simulator"]["feedback"] = "각 자료가 알려 주는 범위와 한계를 함께 생각하세요."
    data["stages"]["3-1"]["narrative"] = (
        "<b>❌ [자료 다시 보기: 증거와 해석]</b><br>온돌은 중요한 계승 자료이지만 발해의 주민과 문화 전체를 "
        "혼자 설명하지는 못합니다.<br><br>유적, 문서, 주민 구성 자료를 함께 비교해 다시 해석해 보세요."
    )

    data["stages"]["4"] = {
        "location": "발해 자료 비교실",
        "badge": "🔎 제4관문: 유물·문서·주민 자료 종합",
        "character": {"name": "어린이 역사 연구원", "role": "자료 해석 담당", "emoji": "🔎"},
        "narrative": (
            "<b>발해를 설명하는 자료는 한 종류가 아닙니다.</b><br><br>온돌과 무덤 같은 유적, 일본에 보낸 국서 같은 "
            "문서, 고구려 유민과 말갈 집단이 함께했다는 주민 구성 기록을 비교해, 자료가 공통으로 말하는 점과 "
            "각 자료만으로는 알기 어려운 점을 구분해야 합니다."
        ),
        "glossary": [
            {"term": "계승", "definition": "앞선 사회의 제도나 문화를 이어받되 새로운 환경에서 변화시키는 것"},
            {"term": "해석", "definition": "자료가 만들어진 배경과 한계를 고려해 역사적 의미를 설명하는 것"},
        ],
        "choices": [
            {
                "text": "🔎 \"발해는 고구려 계승 의식을 지녔고 고구려 유민과 말갈 집단 등이 함께했으며, 여러 문화 요소가 어우러졌다고 설명한다.\"",
                "correct": True,
                "feedback": "여러 자료가 보여 주는 계승성과 다양성을 함께 담은 균형 있는 설명입니다.",
                "next": "end",
            },
            {
                "text": "🧱 \"온돌이 발견되었으므로 발해의 모든 주민과 문화는 고구려와 완전히 같았다고 설명한다.\"",
                "correct": False,
                "feedback": "온돌은 계승을 보여 주는 중요한 자료지만 주민 구성과 문화 전체를 단독으로 증명하지는 못합니다.",
                "next": "4-1",
            },
        ],
        "simulator": {
            "mode": "culture-touch",
            "interaction": "hotspot-discovery",
            "type": "info",
            "hotspots": [
                {"id": "artifact", "label": "온돌·무덤", "x": 0.22, "y": 0.48, "feedback": "고구려 생활·무덤 문화의 영향을 살필 수 있는 유적 자료입니다."},
                {"id": "document", "label": "일본에 보낸 국서", "x": 0.5, "y": 0.65, "feedback": "발해 왕실이 고구려 계승 의식을 드러낸 외교 문서입니다."},
                {"id": "people", "label": "주민 구성 기록", "x": 0.78, "y": 0.48, "feedback": "고구려 유민과 말갈 집단 등이 발해 건국과 사회 구성에 함께했음을 보여 줍니다."},
            ],
            "required": True,
            "completion": {"target": 3, "increment": 1, "minActions": 3, "progressKey": "simulatorProgress", "successText": "🔎 유적·문서·주민 자료를 모두 확인했습니다. 공통점과 한계를 종합하세요."},
            "infoText": "자료마다 알려 주는 내용이 다르므로 여러 자료를 함께 비교해야 합니다.",
            "instruction": "🔎 <b>발해를 설명하는 세 종류의 자료를 비교하세요</b>",
            "feedback": "한 자료의 결론을 발해 전체로 확대하지 마세요.",
        },
    }
    data["stages"]["4-1"] = {
        "location": "발해 자료 비교실",
        "badge": "↩️ 근거 보완: 단정 대신 비교",
        "character": {"name": "시간 안내원 '타미'", "role": "역사 해설자", "emoji": "🤖"},
        "narrative": (
            "<b>역사 자료 하나는 과거의 한 측면만 보여 줍니다.</b><br><br>온돌·무덤, 외교 문서, 주민 구성 기록이 "
            "각각 무엇을 알려 주는지 구분한 뒤 공통점과 차이를 다시 종합해 보세요."
        ),
        "choices": [{"text": "🔄 세 종류의 자료를 비교해 발해의 계승성과 다양성을 다시 설명한다.", "next": "4", "correct": True}],
    }
    source_url = "https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i100800"
    data["sources"] = [source for source in data["sources"] if source.get("url") != source_url]
    data["sources"].append({
        "institution": "국사편찬위원회",
        "title": "발해 건국",
        "url": source_url,
        "checkedAt": "2026-08-27",
        "claimScope": "고구려 유민과 말갈 집단의 건국 참여 및 주민 구성의 다양성",
    })
    evidence_url = "https://contents.history.go.kr/mobile/eh/view.do?levelId=eh_r0120_0010"
    data["sources"] = [source for source in data["sources"] if source.get("url") != evidence_url]
    data["sources"].append({
        "institution": "국사편찬위원회",
        "title": "발해의 문화유산",
        "url": evidence_url,
        "checkedAt": "2026-08-27",
        "claimScope": "온돌·치미·무덤 자료에서 확인되는 고구려 문화 계승과 자료 해석",
    })
    save("regular_balhae.json", data)


def main() -> None:
    expand_silla()
    expand_balhae()
    print("Expanded Unified Silla and Balhae to four evidence-based main stages.")


if __name__ == "__main__":
    main()
