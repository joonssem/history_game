import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load(name):
    path = ROOT / "data" / "mud" / name
    return path, json.loads(path.read_text(encoding="utf-8"))


def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_active(simulator):
    """Keep existing completion behaviour, but use the touch-based renderer."""
    simulator["mode"] = "culture-touch"
    return simulator


def hotspot(item_id, label, x, y, feedback):
    return {"id": item_id, "label": label, "x": x, "y": y, "feedback": feedback}


def discovery(instruction, info_text, success_text, hotspots):
    return {
        "mode": "culture-touch",
        "interaction": "hotspot-discovery",
        "type": "info",
        "hotspots": hotspots,
        "required": True,
        "completion": {
            "target": 3,
            "increment": 1,
            "minActions": 3,
            "progressKey": "simulatorProgress",
            "successText": success_text,
        },
        "infoText": info_text,
        "instruction": instruction,
        "feedback": success_text,
    }


def failure(location, narrative, retry, next_stage):
    return {
        "location": location,
        "badge": "🔄 자료를 다시 비교해 보세요",
        "character": {"name": "시간 안내원 '타미'", "role": "역사 해설자", "emoji": "🤖"},
        "narrative": narrative,
        "choices": [{"text": retry, "next": next_stage, "correct": True}],
    }


def update_gojoseon():
    path, data = load("regular_gojoseon.json")
    # These stages already use hotspot discovery; their old passive mode made the audit misclassify them.
    for stage_id in ("1", "2", "4"):
        make_active(data["stages"][stage_id]["simulator"])
    data["stages"]["4"]["simulator"] = discovery(
        "🏆 <b>건국 전승·8조법·청동기 유물을 연결하세요</b>",
        "건국 전승, 법 조항, 유물은 고조선 사회의 서로 다른 모습을 알려 주는 자료입니다.",
        "✅ 건국 전승·8조법·비파형 동검 자료를 모두 연결했습니다.",
        [
            hotspot("tradition", "건국 전승", 0.2, 0.46, "단군 건국 전승은 고조선에 대한 후대의 기억과 이념을 보여 줍니다."),
            hotspot("law", "8조법", 0.5, 0.67, "남은 법 조항은 생명·농경·재산을 중요하게 여긴 사회 모습을 알려 줍니다."),
            hotspot("artifact", "비파형 동검", 0.8, 0.46, "비파형 동검과 고인돌은 고조선 문화권을 추론하는 유물 단서입니다."),
        ],
    )
    save(path, data)


def update_founding():
    path, data = load("regular_joseon_founding.json")
    for stage_id in ("1", "2"):
        make_active(data["stages"][stage_id]["simulator"])
    data["stages"]["4"]["simulator"] = discovery(
        "🏆 <b>한양의 입지·도성·궁궐·성균관 단서를 연결하세요</b>",
        "한양은 자연환경, 교통, 통치 이념이 함께 반영된 계획도시였습니다.",
        "✅ 한양의 입지·통치 공간·유교 교육 단서를 모두 연결했습니다.",
        [
            hotspot("location", "한강과 산", 0.2, 0.46, "한양은 한강 수운과 산으로 둘러싸인 지형을 함께 고려해 선택되었습니다."),
            hotspot("city", "도성과 궁궐", 0.5, 0.67, "도성과 경복궁은 새 왕조의 통치 중심을 보여 줍니다."),
            hotspot("education", "성균관", 0.8, 0.46, "성균관은 유교 교육과 관료 양성의 중심 기관이었습니다."),
        ],
    )
    save(path, data)


def update_diplomacy():
    path, data = load("regular_joseon_diplomacy.json")
    data["title"] = "조선의 외교와 병자호란: 관계·전쟁·회복의 선택"
    data["header"]["interactiveTitle"] = '<i class="fas fa-map-marked-alt" style="color: #4B5563;"></i> 조선 외교와 전란 자료 탐구 시뮬레이터'
    data["header"]["roadmapTitle"] = "외교와 전란 자료 연대기"
    data["roadmap"] = [
        {"id": "1", "label": "1. 4군 6진과 북방 관계"},
        {"id": "1-1", "label": "1-F. 국경 자료 다시 보기"},
        {"id": "2", "label": "2. 병자호란과 남한산성"},
        {"id": "2-1", "label": "2-F. 전란 속 백성 다시 보기"},
        {"id": "3", "label": "3. 정묘·병자호란 뒤 변화"},
        {"id": "3-1", "label": "3-F. 한 정책으로 단정하기"},
        {"id": "4", "label": "4. 외교·전란·회복 종합"},
        {"id": "4-1", "label": "4-F. 세 자료 다시 비교"},
    ]
    stage1 = data["stages"]["1"]
    stage1["narrative"] = "<b>조선은 명과의 관계, 여진 및 일본과의 관계를 상황에 따라 다르게 조절했습니다.</b><br><br>세종 때 4군 6진을 설치하고 주민을 옮긴 일은 북방 국경과 생활을 안정시키려는 정책이었습니다. 지도에서 강·국경·주민 생활 단서를 확인하고, 조선 외교가 한 가지 방식만이 아니었음을 설명해 보세요."
    stage1["choices"] = [
        {"text": "🗺️ \"조선은 주변 나라와의 관계를 조절하면서 북방 국경과 주민 생활을 안정시키려 했다.\"", "correct": True, "feedback": "맞습니다. 사대교린은 주변 나라와의 관계를 상황에 맞게 조절하려는 외교 원칙이었습니다.", "next": "2"},
        {"text": "📌 \"4군 6진 한 사례만으로 조선 외교가 늘 전쟁만 선택했다고 단정한다.\"", "correct": False, "feedback": "국경 개척은 중요한 사례지만, 조선은 교류·회유·외교 관계도 함께 활용했습니다.", "next": "1-1"},
    ]
    stage1["simulator"] = discovery(
        "🗺️ <b>4군 6진과 북방 관계의 세 단서를 확인하세요</b>",
        "국경 지도와 주민 생활 자료를 함께 보면 북방 정책의 목적을 더 잘 이해할 수 있습니다.",
        "✅ 압록강·두만강·주민 생활 단서를 모두 확인했습니다.",
        [
            hotspot("aprokgang", "압록강", 0.2, 0.46, "4군은 압록강 일대의 국경을 안정시키려는 정책과 관련됩니다."),
            hotspot("duman", "두만강", 0.5, 0.67, "6진은 두만강 일대의 국경과 여진 관계를 살피는 단서입니다."),
            hotspot("settlers", "주민 이주", 0.8, 0.46, "국경 지역에 주민을 옮겨 생활 기반과 방어를 함께 마련하려 했습니다."),
        ],
    )
    data["stages"]["1-1"] = failure("북방 정책 자료실", "<b>한 정책만으로 조선의 외교 전체를 설명할 수는 없습니다.</b><br><br>국경 지도, 주민 이주, 주변 나라와의 관계를 함께 다시 살펴보세요.", "🔄 세 단서를 다시 비교한다.", "1")
    stage2 = data["stages"]["2"]
    stage2["badge"] = "📔 제2관문: 병자호란과 남한산성의 생활 기록"
    stage2["character"] = {"name": "남한산성 기록 조사원", "role": "전란 속 왕실과 백성의 경험을 살피는 학생", "emoji": "📔"}
    stage2["narrative"] = "<b>1636년 청의 침입으로 병자호란이 일어나자 인조와 조정은 남한산성에 머물렀습니다.</b><br><br>성 안의 식량 부족과 추위, 성 밖 백성의 피해는 전쟁이 군사 지도만의 일이 아니었음을 보여 줍니다. 성벽을 지키는 놀이가 아니라 전란 기록의 세 단서를 확인하고, 척화·주화 논쟁이 왜 생겼는지 생각해 보세요."
    stage2["choices"] = [
        {"text": "📔 \"전란 속에서는 군사적 대응뿐 아니라 식량·피난·백성 피해를 함께 고려해야 했다.\"", "correct": True, "feedback": "맞습니다. 남한산성의 기록은 전란이 왕실과 백성 모두에게 큰 피해를 주었음을 보여 줍니다.", "next": "3"},
        {"text": "⚔️ \"전쟁은 성벽을 오래 지키면 해결되며 백성의 생활과 피해는 중요하지 않다.\"", "correct": False, "feedback": "전란의 결과를 이해하려면 성 안팎의 식량, 피난, 민간인 피해를 함께 살펴야 합니다.", "next": "2-1"},
    ]
    stage2["simulator"] = discovery(
        "📔 <b>남한산성 전란 기록의 세 단서를 확인하세요</b>",
        "전란 기록은 전투만이 아니라 식량, 피난, 백성의 피해도 함께 알려 줍니다.",
        "✅ 남한산성·식량 부족·백성 피해 단서를 모두 확인했습니다.",
        [
            hotspot("fortress", "남한산성", 0.2, 0.46, "인조와 조정은 남한산성에 머물며 전란에 대응했습니다."),
            hotspot("food", "식량 부족", 0.5, 0.67, "성 안의 식량 부족과 추위는 대응 방식을 두고 논쟁이 생긴 이유 중 하나였습니다."),
            hotspot("people", "백성 피해", 0.8, 0.46, "전란 중 성 밖 백성도 피난과 약탈, 생활 터전의 파괴를 겪었습니다."),
        ],
    )
    data["stages"]["2-1"] = failure("남한산성 기록 조사실", "<b>전쟁의 결과를 성벽 방어만으로 판단할 수는 없습니다.</b><br><br>성 안의 식량과 성 밖 백성의 생활을 함께 살펴보세요.", "🔄 전란 기록의 세 단서를 다시 확인한다.", "2")
    stage3 = data["stages"]["3"]
    stage3["badge"] = "📜 제3관문: 전란 뒤 외교와 회복 정책"
    stage3["character"] = {"name": "전란 뒤 정책 조사원", "role": "변화와 한계를 비교하는 학생", "emoji": "📜"}
    stage3["narrative"] = "<b>병자호란 뒤 조선은 청과 군신 관계를 맺고 많은 사람이 끌려가는 피해를 겪었습니다.</b><br><br>효종 때 북벌을 내세운 군비 강화가 있었지만 실제 청을 공격하지는 못했습니다. 전란 뒤의 외교 관계, 군비 강화, 백성의 귀환 문제를 구분하면 ‘복수’ 한마디로 역사를 단순화하지 않을 수 있습니다."
    stage3["choices"] = [
        {"text": "📜 \"전란 뒤 조선은 청과의 관계를 받아들이는 한편 군비를 정비했고, 북벌론에는 목표와 한계가 있었다.\"", "correct": True, "feedback": "맞습니다. 전란 뒤 정책은 외교 관계, 군비 정비, 백성 피해 회복을 함께 보아야 합니다.", "next": "4"},
        {"text": "🛡️ \"북벌론 하나만으로 전란 뒤 모든 외교·사회 문제를 즉시 해결했다고 본다.\"", "correct": False, "feedback": "북벌론은 중요한 정책 방향이었지만 당시 국제 관계와 국내 사정 때문에 실현되지 못했고 피해 회복 과제도 남았습니다.", "next": "3-1"},
    ]
    stage3["simulator"] = discovery(
        "📜 <b>전란 뒤 변화의 세 단서를 확인하세요</b>",
        "전란 뒤 역사는 외교 관계, 군비 정비, 백성의 피해와 회복을 함께 살펴야 합니다.",
        "✅ 대청 관계·군비 정비·피해 회복 단서를 모두 확인했습니다.",
        [
            hotspot("relations", "대청 관계", 0.2, 0.46, "병자호란 뒤 조선은 청과 군신 관계를 맺었습니다."),
            hotspot("defense", "군비 정비", 0.5, 0.67, "효종 때 군비 정비와 북벌론이 추진되었지만 실제 북벌로 이어지지는 못했습니다."),
            hotspot("recovery", "피해 회복", 0.8, 0.46, "전란 뒤 끌려간 사람들의 귀환과 생활 회복은 오랜 과제였습니다."),
        ],
    )
    data["stages"]["3-1"] = failure("전란 뒤 정책 자료실", "<b>한 정책 구호만으로 전란 뒤 모든 변화를 설명할 수는 없습니다.</b><br><br>대청 관계, 군비 정비, 백성의 피해 회복을 다시 비교해 보세요.", "🔄 전란 뒤의 세 단서를 다시 비교한다.", "3")
    data["stages"]["4"] = {
        "location": "조선 외교와 전란 자료 종합실",
        "badge": "🧩 최종 관문: 관계·전란·회복 연결",
        "character": {"name": "역사 전시 기획자", "role": "여러 자료를 연결하는 학생", "emoji": "🧩"},
        "narrative": "<b>이제 4군 6진 지도, 남한산성 전란 기록, 전란 뒤 정책 자료를 하나의 전시로 연결합니다.</b><br><br>조선은 주변 나라와 관계를 맺고 국경을 관리했지만 국제 질서가 바뀌면서 큰 전란을 겪었습니다. 외교 정책을 단순한 승리·패배가 아니라 백성의 삶과 회복까지 포함하여 설명해 보세요.",
        "glossary": [
            {"term": "외교", "definition": "나라들이 갈등을 줄이고 필요한 관계를 맺기 위해 하는 여러 활동"},
            {"term": "전란", "definition": "전쟁으로 정치·경제·사람들의 생활에 큰 피해가 이어지는 상태"},
        ],
        "choices": [
            {"text": "🧩 \"국경 정책·전란 기록·회복 정책을 비교해 조선 외교의 선택과 백성의 피해를 함께 설명한다.\"", "correct": True, "feedback": "훌륭합니다. 여러 자료를 연결해 외교와 전란을 사람들의 삶까지 포함하여 해석했습니다.", "next": "end"},
            {"text": "🏆 \"한 번의 전쟁 결과만으로 조선 외교 전체가 성공 또는 실패라고 단정한다.\"", "correct": False, "feedback": "외교와 전란은 시기·상대·백성의 삶에 따라 여러 결과를 낳으므로 다양한 자료를 비교해야 합니다.", "next": "4-1"},
        ],
        "simulator": discovery(
            "🧩 <b>국경·전란·회복 자료를 연결해 전시를 완성하세요</b>",
            "각 자료는 조선 외교와 전란의 서로 다른 측면을 보여 줍니다.",
            "✅ 국경·전란·회복 자료를 모두 연결했습니다.",
            [
                hotspot("border", "국경 정책", 0.2, 0.46, "4군 6진은 북방 국경과 주민 생활을 안정시키려는 정책입니다."),
                hotspot("war", "전란 기록", 0.5, 0.67, "남한산성 기록은 전란이 왕실과 백성에게 준 피해를 보여 줍니다."),
                hotspot("after", "회복 정책", 0.8, 0.46, "전란 뒤에는 외교 관계와 군비 정비, 피해 회복 문제가 함께 남았습니다."),
            ],
        ),
    }
    data["stages"]["4-1"] = failure("조선 외교와 전란 자료 종합실", "<b>한 사건만으로 조선 외교 전체를 판단할 수는 없습니다.</b><br><br>국경·전란·회복 자료의 공통점과 차이를 다시 연결해 보세요.", "🔄 세 자료를 다시 비교한다.", "4")
    save(path, data)


update_gojoseon()
update_founding()
update_diplomacy()
print("Completed active interaction redesign for Joseon diplomacy, Joseon founding, and Gojoseon.")
