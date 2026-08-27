"""Expand two colonial-period Regular MUDs with evidence-synthesis final stages."""
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"


def write(name: str, data: dict) -> None:
    (MUD_DIR / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def completion(text: str) -> dict:
    return {"target": 3, "increment": 1, "minActions": 3, "progressKey": "simulatorProgress", "successText": text}


def add_stage(data: dict, stage: dict, retry: dict) -> None:
    data["roadmap"] = [entry for entry in data["roadmap"] if entry["id"] not in {"4", "4-1"}]
    data["roadmap"].extend([{"id": "4", "label": stage["roadmapLabel"]}, {"id": "4-1", "label": retry["roadmapLabel"]}])
    stage.pop("roadmapLabel")
    retry.pop("roadmapLabel")
    data["stages"]["4"] = stage
    data["stages"]["4-1"] = retry


def add_source(data: dict, title: str, url: str, scope: str) -> None:
    data["sources"] = [source for source in data["sources"] if source.get("url") != url]
    data["sources"].append({"institution": "국사편찬위원회", "title": title, "url": url, "checkedAt": "2026-08-27", "claimScope": scope})


def expand_independence() -> None:
    path = MUD_DIR / "regular_independence.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["stages"]["1"]["narrative"] = (
        "<b>1919년 3월 1일, 독립선언서가 발표된 뒤 학생과 시민은 여러 곳에서 만세 시위에 참여했습니다.</b><br><br>"
        "3·1 운동에는 다양한 계층의 사람이 참여했고, 많은 시위가 비폭력을 내세웠습니다. 선언서의 뜻과 "
        "시위 방법을 함께 살펴본 뒤 어떤 원칙을 지키려 했는지 생각해 봅시다."
    )
    data["stages"]["1"]["choices"][0]["feedback"] = "3·1 운동은 독립 의지를 널리 알리고 여러 계층이 참여한 운동이었습니다."
    data["stages"]["1-1"]["narrative"] = "<b>❌ [자료 다시 보기: 선언과 참여]</b><br>독립선언서와 만세 시위는 식민 지배에 대한 독립 의지를 알린 서로 다른 자료입니다.<br><br>선언의 내용과 시위의 방법을 다시 비교해 보세요."
    data["stages"]["2"]["narrative"] = (
        "<b>아우내 장터에서도 주민들이 만세 시위에 참여했고, 유관순은 그 과정에서 활동한 인물 가운데 한 명입니다.</b><br><br>"
        "시위에 참여한 사람들의 이름과 역할을 한 사람의 영웅담으로만 좁히지 말고, 지역 주민과 학생이 "
        "어떻게 함께 행동했는지 자료로 살펴봅시다."
    )
    data["stages"]["2"]["choices"][0]["feedback"] = "아우내 장터 시위는 유관순을 비롯한 학생과 지역 주민이 함께 참여한 만세 운동이었습니다."
    data["stages"]["2-1"]["narrative"] = "<b>❌ [자료 다시 보기: 지역의 참여]</b><br>역사적 운동은 한 사람의 용기뿐 아니라 여러 참여자의 선택과 행동으로 이루어집니다.<br><br>지역 주민과 학생의 참여를 함께 살펴보세요."
    data["stages"]["3"]["choices"][0]["feedback"] = "임시 헌장 제1조는 대한민국이 민주공화제임을 선언했고, 임시의정원을 통한 대의제를 규정했습니다."
    data["stages"]["3"]["choices"][0]["next"] = "4"
    data["stages"]["3-1"]["narrative"] = "<b>❌ [자료 다시 보기: 임시 헌장의 원칙]</b><br>임시 헌장은 민주공화제와 대의제, 여러 기본권을 담았습니다.<br><br>국호만이 아니라 어떤 원칙을 선언했는지 확인해 보세요."
    add_stage(data, {
        "roadmapLabel": "4. 선언·시위·헌장 자료 종합", "location": "독립운동 자료 연구실", "badge": "🔎 제4관문: 독립운동의 여러 목소리",
        "character": {"name": "어린이 역사 연구원", "role": "자료 종합 담당", "emoji": "🔎"},
        "narrative": "<b>독립선언서, 지역 만세 시위 기록, 대한민국 임시 헌장은 서로 다른 방식으로 독립운동을 보여 줍니다.</b><br><br>선언은 독립의 뜻을, 시위 기록은 여러 사람의 참여를, 헌장은 앞으로 세울 나라의 원칙을 알려 줍니다. 세 자료를 연결해 설명해 봅시다.",
        "glossary": [{"term": "민주공화제", "definition": "국민이 주권을 가지고 대표를 통해 나라를 운영하는 정치 원리"}, {"term": "대의제", "definition": "국민이 뽑은 대표가 의사를 모아 결정하는 제도"}],
        "choices": [{"text": "🔎 \"선언서의 독립 의지, 지역 시위의 참여, 임시 헌장의 민주공화제 원칙을 함께 설명한다.\"", "correct": True, "feedback": "세 자료를 연결하면 독립운동의 뜻·참여·국가 구상을 함께 이해할 수 있습니다.", "next": "end"}, {"text": "📜 \"독립선언서 한 장만으로 시위 참여와 임시정부의 원칙까지 모두 알 수 있다고 말한다.\"", "correct": False, "feedback": "선언서는 중요한 자료지만 시위의 모습과 임시정부의 원칙은 다른 자료를 함께 살펴야 합니다.", "next": "4-1"}],
        "simulator": {"mode": "culture-touch", "interaction": "hotspot-discovery", "type": "info", "hotspots": [{"id": "declaration", "label": "독립선언서", "x": 0.22, "y": 0.48, "feedback": "독립국과 자주민임을 선언한 자료입니다."}, {"id": "protest", "label": "만세 시위 기록", "x": 0.5, "y": 0.65, "feedback": "학생·시민·지역 주민의 다양한 참여를 보여 주는 자료입니다."}, {"id": "charter", "label": "임시 헌장", "x": 0.78, "y": 0.48, "feedback": "민주공화제와 대의제 원칙을 담은 자료입니다."}], "required": True, "completion": completion("🔎 선언·시위·헌장 자료를 모두 확인했습니다. 이제 근거를 종합하세요."), "infoText": "자료마다 알려 주는 내용이 다르므로 함께 비교해야 합니다.", "instruction": "🔎 <b>독립운동을 보여 주는 세 자료를 비교하세요</b>", "feedback": "자료의 성격과 범위를 구분해 보세요."},
    }, {"roadmapLabel": "4-F. 한 자료로 단정", "location": "독립운동 자료 연구실", "badge": "↩️ 근거 보완: 자료의 범위", "character": {"name": "시간 안내원 타미", "role": "역사 해설자", "emoji": "🤖"}, "narrative": "<b>한 자료는 과거의 한 측면을 보여 줍니다.</b><br><br>선언·시위·헌장이 각각 무엇을 알려 주는지 나누어 본 뒤 다시 종합해 보세요.", "choices": [{"text": "🔄 세 자료의 역할을 구분해 독립운동을 다시 설명한다.", "next": "4", "correct": True}]})
    add_source(data, "대한민국 임시 헌장", "https://contents.history.go.kr/mobile/hm/view.do?levelId=hm_123_0060", "임시 헌장의 민주공화제·대의제·기본권 관련 3~4단계 서술")
    write("regular_independence.json", data)


def expand_rule() -> None:
    path = MUD_DIR / "regular_japanese_rule_1.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["stages"]["1"]["narrative"] = "<b>1910년대 조선 총독부는 헌병 경찰 제도를 통해 행정·사법·치안 업무에 넓은 권한을 행사했습니다.</b><br><br>조선 태형령은 조선인에게만 적용된 차별적 법령이었습니다. 제도가 사람들의 일상과 자유에 어떤 영향을 주었는지 자료를 근거로 살펴봅시다."
    data["stages"]["1"]["choices"][0]["text"] = "✊ \"헌병 경찰의 권한과 조선태형령이 누구에게 어떻게 적용되었는지 기록으로 확인한다.\""
    data["stages"]["1"]["choices"][0]["feedback"] = "헌병 경찰은 치안뿐 아니라 일상 행정에 넓게 관여했고, 태형은 조선인에게만 적용되었습니다."
    data["stages"]["1-1"]["narrative"] = "<b>❌ [자료 다시 보기: 제도와 영향]</b><br>식민 통치의 부당함은 감정적 표현만으로 판단하기보다 헌병 경찰의 권한과 차별적 법령을 확인하며 설명할 수 있습니다."
    data["stages"]["2"]["narrative"] = "<b>토지 조사 사업은 토지 소유와 세금을 파악하는 방식으로 진행되었고, 신고 과정과 국·공유지 처리 방식은 농민 생활에 큰 영향을 주었습니다.</b><br><br>이 사업의 결과를 한 숫자로 단정하기보다 신고주의, 총독부 소유 토지 증가, 소작농 증가라는 자료를 연결해 살펴봅시다."
    data["stages"]["2"]["glossary"][0]["definition"] = "1910년부터 1918년까지 토지 소유와 세금을 조사한 사업으로, 신고 방식과 토지 처리 과정이 농민 생활에 영향을 주었다"
    data["stages"]["2"]["choices"][0]["text"] = "📜 \"신고 방식과 총독부 소유 토지 증가가 농민의 소작화에 어떤 영향을 주었는지 자료로 확인한다.\""
    data["stages"]["2"]["choices"][0]["feedback"] = "신고하지 못한 땅과 여러 국·공유지가 총독부 소유로 넘어갔고, 소작농이 늘어나는 결과로 이어졌습니다."
    data["stages"]["2"]["choices"][0]["next"] = "3"
    data["stages"]["2-1"]["narrative"] = "<b>❌ [자료 다시 보기: 토지 조사 사업의 결과]</b><br>농민 생활의 변화는 신고 방식, 토지 소유 변화, 소작 관계를 함께 살펴야 설명할 수 있습니다."
    data["stages"]["3"]["narrative"] = "<b>1910년대에는 강한 감시와 탄압 때문에 여러 형태의 민족 운동이 비밀리에 이루어졌습니다.</b><br><br>비밀 결사와 여성 단체, 군자금 모금 등은 서로 방식이 달랐습니다. 특정 행동을 영웅적으로만 평가하기보다, 왜 비밀 조직이 필요했는지와 어떤 제약이 있었는지 살펴봅시다."
    data["stages"]["3"]["choices"][0]["text"] = "🕊️ \"강한 감시 속에서 비밀 결사와 다양한 참여 방식이 왜 나타났는지 자료를 통해 이해한다.\""
    data["stages"]["3"]["choices"][0]["feedback"] = "강한 탄압 때문에 공개 활동이 어려웠고, 여러 사람이 서로 다른 방식으로 독립운동을 이어 갔습니다."
    data["stages"]["3"]["choices"][0]["next"] = "4"
    data["stages"]["3-1"]["narrative"] = "<b>❌ [자료 다시 보기: 저항의 조건]</b><br>1910년대 활동은 강한 감시와 처벌 위험 속에서 이루어졌습니다. 참여자의 선택과 제약을 함께 살펴보세요."
    add_stage(data, {
        "roadmapLabel": "4. 통치·수탈·저항 자료 종합", "location": "식민지 시기 자료 연구실", "badge": "🔎 제4관문: 제도와 삶의 변화", "character": {"name": "어린이 역사 연구원", "role": "자료 종합 담당", "emoji": "🔎"},
        "narrative": "<b>헌병 경찰 제도, 토지 조사 사업, 비밀 결사 기록은 1910년대의 서로 다른 모습을 보여 줍니다.</b><br><br>통치 제도는 일상과 자유를 제한했고, 경제 정책은 농민 생활에 영향을 주었으며, 그 속에서 여러 저항 활동이 이어졌습니다. 자료의 연결을 근거로 설명해 봅시다.",
        "glossary": [{"term": "식민 통치", "definition": "다른 나라가 군사·정치·경제 권한을 이용해 한 지역을 지배하는 방식"}, {"term": "소작농", "definition": "자신의 땅이 아닌 지주의 땅을 빌려 농사짓고 일정한 소작료를 내는 농민"}],
        "choices": [{"text": "🔎 \"헌병 경찰의 통제, 토지 소유 변화, 비밀 결사의 활동을 연결해 1910년대의 삶과 저항을 설명한다.\"", "correct": True, "feedback": "제도·경제·저항 자료를 함께 보면 식민 통치가 사람들의 삶에 미친 영향과 대응을 더 잘 이해할 수 있습니다.", "next": "end"}, {"text": "🧾 \"토지 조사 사업 한 가지만 보고 1910년대의 통치와 저항까지 모두 설명할 수 있다고 말한다.\"", "correct": False, "feedback": "토지 자료는 경제적 영향을 보여 주지만, 통치 방식과 다양한 저항 활동은 다른 자료도 필요합니다.", "next": "4-1"}],
        "simulator": {"mode": "culture-touch", "interaction": "hotspot-discovery", "type": "info", "hotspots": [{"id": "police", "label": "헌병 경찰", "x": 0.22, "y": 0.48, "feedback": "행정·사법·치안에 넓게 관여한 통치 제도 자료입니다."}, {"id": "land", "label": "토지 조사 사업", "x": 0.5, "y": 0.65, "feedback": "신고 방식과 토지 소유 변화가 농민 생활에 미친 영향을 살필 수 있습니다."}, {"id": "resistance", "label": "비밀 결사 기록", "x": 0.78, "y": 0.48, "feedback": "강한 탄압 속에서도 여러 방식의 저항이 이어졌음을 보여 줍니다."}], "required": True, "completion": completion("🔎 통치·수탈·저항 자료를 모두 확인했습니다. 이제 근거를 종합하세요."), "infoText": "서로 다른 자료를 연결하면 당시 사람들의 삶과 대응을 함께 설명할 수 있습니다.", "instruction": "🔎 <b>1910년대의 세 가지 자료를 비교하세요</b>", "feedback": "자료 하나만으로 시대 전체를 단정하지 마세요."},
    }, {"roadmapLabel": "4-F. 한 자료로 단정", "location": "식민지 시기 자료 연구실", "badge": "↩️ 근거 보완: 자료 비교", "character": {"name": "시간 안내원 타미", "role": "역사 해설자", "emoji": "🤖"}, "narrative": "<b>한 종류의 자료는 당시 사회의 일부만 보여 줍니다.</b><br><br>통치·경제·저항 자료가 각각 알려 주는 내용을 구분해 다시 설명해 보세요.", "choices": [{"text": "🔄 세 종류의 자료를 비교해 1910년대를 다시 설명한다.", "next": "4", "correct": True}]})
    add_source(data, "헌병 경찰 제도", "https://contents.history.go.kr/front/tg/print.do?levelId=tg_004_1540&treeId=&whereStr=", "헌병 경찰·조선태형령·일상 통제 관련 1·4단계 서술")
    add_source(data, "토지 조사 사업", "https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_047_0010", "신고주의와 총독부 소유 토지 변화 관련 2·4단계 서술")
    write("regular_japanese_rule_1.json", data)


def main() -> None:
    expand_independence()
    expand_rule()
    print("Expanded two colonial-period pilot MUDs to four evidence-based main stages.")


if __name__ == "__main__":
    main()
