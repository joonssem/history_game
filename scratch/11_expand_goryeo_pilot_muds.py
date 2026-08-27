"""Expand two Goryeo Regular MUDs and replace outcome-only narratives with evidence use."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MUD_DIR = ROOT / "data" / "mud"

def completion(message):
    return {"target": 3, "increment": 1, "minActions": 3, "progressKey": "simulatorProgress", "successText": message}

def load(name):
    return json.loads((MUD_DIR / name).read_text(encoding="utf-8"))

def save(name, data):
    (MUD_DIR / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def add_source(data, title, url, scope):
    data["sources"] = [item for item in data["sources"] if item.get("url") != url]
    data["sources"].append({"institution": "국사편찬위원회", "title": title, "url": url, "checkedAt": "2026-08-27", "claimScope": scope})

def append_stages(data, stage, retry):
    data["roadmap"] = [item for item in data["roadmap"] if item["id"] not in {"4", "4-1"}]
    data["roadmap"].extend([{"id": "4", "label": stage.pop("roadmapLabel")}, {"id": "4-1", "label": retry.pop("roadmapLabel")}])
    data["stages"]["4"] = stage
    data["stages"]["4-1"] = retry

def expand_war():
    data = load("regular_goryeo_war.json")
    one, two, three = data["stages"]["1"], data["stages"]["2"], data["stages"]["3"]
    one["narrative"] = "<b>993년 거란의 침입 때 고려는 항전과 협상을 함께 고민했습니다.</b><br><br>서희는 고려의 고구려 계승과 압록강 일대 교통로 문제를 내세워 거란과 협상했습니다. 협상 뒤 고려는 거란과의 관계 조정, 압록강 동쪽 지역의 영유권 인정, 이후 축성이라는 과정을 거쳤습니다. 어떤 근거를 제시하겠습니까?"
    one["glossary"][0]["definition"] = "거란 장수 소손녕과 협상하여 고려의 북방 영유권과 외교 관계를 조정한 사건"
    one["choices"][0]["text"] = "🗣️ \"고려의 고구려 계승과 압록강 일대 길 문제를 근거로 제시하고, 외교 관계와 국경 문제를 함께 협상한다.\""
    one["choices"][0]["feedback"] = "서희의 담판 뒤 고려는 압록강 동쪽 지역의 영유권을 인정받고, 이후 여러 성을 쌓아 강동 6주를 개척했습니다."
    data["stages"]["1-1"]["narrative"] = "<b>❌ [자료 다시 보기: 외교의 조건]</b><br>서희의 담판은 말 한마디로 끝난 일이 아니라 국경·교통로·외교 관계의 조건을 함께 조정한 과정입니다."
    two["narrative"] = "<b>1018년 거란의 세 번째 침입 때 고려는 흥화진 등 북방 방어 거점을 활용해 맞섰습니다.</b><br><br>전쟁 기록에는 병력 수와 전술에 서로 다른 전승도 남아 있습니다. 특정 장면을 과장하기보다 방어 거점·지형·병력 운영이 어떤 역할을 했는지 살펴봅시다."
    two["glossary"][0]["definition"] = "거란의 세 번째 침입 때 고려군을 지휘해 귀주에서 큰 승리를 거둔 문신 출신 지휘관"
    two["choices"][0]["text"] = "🌊 \"지형과 방어 거점을 살피고, 적의 이동을 늦추며 고려군이 대응할 시간을 확보한다.\""
    two["choices"][0]["feedback"] = "흥화진과 강동 6주 지역은 이후 전쟁에서 북방 방어의 중요한 거점이 되었습니다."
    data["stages"]["2-1"]["narrative"] = "<b>❌ [자료 다시 보기: 방어의 조건]</b><br>전쟁의 결과는 한 번의 기습만으로 설명하기 어렵습니다. 거점·지형·병력·보급의 조건을 함께 살펴보세요."
    three["narrative"] = "<b>귀주 전투에서 고려군은 거란군을 크게 물리쳤고, 이후 거란의 대규모 침입은 이어지지 않았습니다.</b><br><br>하지만 전쟁은 많은 피해와 재건 과제도 남겼습니다. 전투 결과뿐 아니라 국경 방어와 이후 관계 조정까지 고려해 어떤 결론을 내리겠습니까?"
    three["glossary"][0]["definition"] = "1019년 무렵 귀주에서 고려군이 거란군을 크게 물리친 전투로, 이후 대규모 거란 침입이 이어지지 않았다"
    three["choices"][0]["text"] = "🛡️ \"전투의 승리와 함께 북방 방어를 정비하고, 전쟁 뒤의 피해와 외교 관계도 살핀다.\""
    three["choices"][0]["feedback"] = "귀주대첩 뒤 고려는 개경을 재건하고 천리장성을 쌓는 등 국방을 강화했습니다."
    three["choices"][0]["next"] = "4"
    data["stages"]["3-1"]["narrative"] = "<b>❌ [자료 다시 보기: 전쟁 뒤의 과제]</b><br>승패만으로 전쟁의 의미를 설명할 수 없습니다. 방어 거점, 전쟁 피해, 이후 국경과 외교를 함께 살펴보세요."
    append_stages(data, {
      "roadmapLabel": "4. 외교·방어·재건 자료 종합", "location": "고려 북방 자료 연구실", "badge": "🔎 제4관문: 거란 침입을 설명하는 근거", "character": {"name":"어린이 역사 연구원","role":"자료 종합 담당","emoji":"🔎"},
      "narrative": "<b>서희의 담판 기록, 강동 6주 지도, 귀주 전투와 천리장성 자료는 서로 다른 시기의 대응을 보여 줍니다.</b><br><br>고려는 외교·방어·재건을 함께 활용했습니다. 세 자료를 연결해 거란 침입의 극복 과정을 설명해 봅시다.",
      "glossary": [{"term":"국경","definition":"나라의 영토와 다른 지역이 맞닿는 경계"},{"term":"재건","definition":"전쟁이나 재난 뒤 무너진 시설과 생활 기반을 다시 세우는 일"}],
      "choices": [{"text":"🔎 \"담판의 조건, 강동 6주의 방어 역할, 귀주대첩 뒤 재건을 연결해 고려의 대응을 설명한다.\"","correct":True,"feedback":"외교만 또는 전투만으로는 충분하지 않습니다. 서로 다른 대응을 연결하면 역사적 과정을 더 잘 설명할 수 있습니다.","next":"end"},{"text":"⚔️ \"귀주 전투 한 장면만으로 고려가 거란과의 모든 문제를 단번에 해결했다고 설명한다.\"","correct":False,"feedback":"귀주대첩은 중요하지만, 그 전의 외교·방어와 이후 재건·관계 조정도 함께 살펴야 합니다.","next":"4-1"}],
      "simulator":{"mode":"culture-touch","interaction":"hotspot-discovery","type":"info","hotspots":[{"id":"diplomacy","label":"서희의 담판","x":0.22,"y":0.48,"feedback":"국경·교통로·외교 관계의 조건을 조정한 외교 자료입니다."},{"id":"defense","label":"강동 6주","x":0.5,"y":0.65,"feedback":"압록강 동쪽의 북방 방어와 교통의 거점이 된 지역입니다."},{"id":"rebuild","label":"귀주대첩 뒤 재건","x":0.78,"y":0.48,"feedback":"전투 뒤 개경 재건과 천리장성 축조로 국방을 강화한 자료입니다."}],"required":True,"completion":completion("🔎 외교·방어·재건 자료를 모두 확인했습니다. 이제 근거를 종합하세요."),"infoText":"전쟁의 극복은 한 사람이나 한 전투만이 아니라 여러 대응의 연결로 이해할 수 있습니다.","instruction":"🔎 <b>세 가지 대응 자료를 비교하세요</b>","feedback":"한 사건만으로 전체 과정을 단정하지 마세요."}
    }, {"roadmapLabel":"4-F. 한 전투로 단정","location":"고려 북방 자료 연구실","badge":"↩️ 근거 보완: 과정 비교","character":{"name":"시간 안내원 타미","role":"역사 해설자","emoji":"🤖"},"narrative":"<b>전쟁의 결과는 외교, 방어, 재건의 과정과 연결되어 있습니다.</b><br><br>각 자료가 알려 주는 내용을 구분해 다시 설명해 보세요.","choices":[{"text":"🔄 세 자료를 연결해 고려의 대응 과정을 다시 설명한다.","next":"4","correct":True}]})
    add_source(data, "강동 6주", "https://contents.history.go.kr/front/tg/print.do?levelId=tg_002_1060&treeId=&whereStr=", "서희 담판의 조건·강동 6주의 개척·방어 역할 관련 1·4단계 서술")
    add_source(data, "강감찬의 귀주 대첩", "https://contents.history.go.kr/front/hm/print.do?levelId=hm_048_0030&tabId=03&treeId=010401&whereStr=", "귀주대첩의 맥락과 전쟁 결과 관련 2~4단계 서술")
    save("regular_goryeo_war.json", data)

def expand_culture():
    data = load("regular_goryeo_culture.json")
    one, two, three = data["stages"]["1"], data["stages"]["2"], data["stages"]["3"]
    one["narrative"] = "<b>몽골 침입기 고려에서는 대장경판을 새기는 일이 이루어졌습니다.</b><br><br>경판 제작에는 목재 선택·가공·글자 새김 등 여러 과정이 필요했고, 오늘날 보존 상태를 설명할 때도 제작 과정과 보관 환경을 구분해 살펴야 합니다. 어떤 제작 원리를 확인하겠습니까?"
    one["glossary"][0]["definition"] = "몽골 침입기에 다시 새긴 8만여 장의 불교 경전 목판으로, 제작·보관 기술을 함께 살필 수 있는 문화유산"
    one["choices"][0]["text"] = "🪵 \"목재 가공과 글자 새김의 과정을 확인하고, 경판과 보관 건축물의 역할을 구분해 살핀다.\""
    one["choices"][0]["feedback"] = "경판 제작 기술과 해인사 장경판전의 보관 환경은 서로 다른 자료로 살펴볼 수 있습니다."
    data["stages"]["1-1"]["narrative"] = "<b>❌ [자료 다시 보기: 제작과 보관]</b><br>문화유산의 보존은 장인의 제작 과정과 이후 보관 환경을 함께 살펴야 설명할 수 있습니다."
    two["narrative"] = "<b>1377년 청주 흥덕사에서 찍은 『직지』는 현존하는 가장 오래된 금속활자 인쇄본으로 알려져 있습니다.</b><br><br>금속활자는 글자를 다시 조합할 수 있는 기술이지만, 책의 내용·제작 목적·전해지는 방식까지 한꺼번에 알려 주지는 않습니다. 어떤 자료로 의미를 설명하겠습니까?"
    two["choices"][0]["feedback"] = "『직지』는 고려의 금속활자 인쇄 기술을 보여 주는 중요한 자료이며, 현존하는 가장 오래된 금속활자 인쇄본으로 알려져 있습니다."
    data["stages"]["2-1"]["narrative"] = "<b>❌ [자료 다시 보기: 기술과 자료의 범위]</b><br>금속활자는 중요한 기술이지만 한 기술만으로 당시 모든 사람이 책을 읽었다고 단정할 수는 없습니다."
    three["narrative"] = "<b>벽란도는 고려 수도 개경 인근의 예성강 하구에 있던 무역항입니다.</b><br><br>송·일본·아라비아 상인과의 교류 기록은 고려가 넓은 교역망과 연결되어 있었음을 보여 줍니다. 다만 한 항구의 기록만으로 고려 사회 전체가 똑같이 국제 교류를 했다고 단정할 수는 없습니다."
    three["choices"][0]["text"] = "🌍 \"벽란도의 교역 기록을 통해 고려가 여러 지역과 연결되었음을 설명하되, 자료가 보여 주는 범위를 구분한다.\""
    three["choices"][0]["feedback"] = "벽란도는 고려의 국제 교류를 보여 주는 중요한 항구였고, 고려라는 이름은 서아시아 기록에 'Corea' 등으로 나타납니다."
    three["choices"][0]["next"] = "4"
    data["stages"]["3-1"]["narrative"] = "<b>❌ [자료 다시 보기: 교류의 범위]</b><br>무역항 기록은 국제 교류를 보여 주지만, 당시 모든 지역과 계층의 생활을 그대로 보여 주지는 않습니다."
    append_stages(data, {
      "roadmapLabel":"4. 제작·인쇄·교류 자료 종합","location":"고려 문화 자료 연구실","badge":"🔎 제4관문: 고려 문화의 여러 연결","character":{"name":"어린이 역사 연구원","role":"자료 종합 담당","emoji":"🔎"},
      "narrative":"<b>팔만대장경판, 『직지』, 벽란도 교역 기록은 각각 제작 기술, 인쇄 기술, 국제 교류를 보여 줍니다.</b><br><br>세 자료를 연결하되, 어느 한 자료가 고려 사회 전체를 설명하지는 않는다는 점도 함께 생각해 봅시다.",
      "glossary":[{"term":"문화유산","definition":"과거 사람들이 남긴 생활·기술·생각을 알려 주는 유물과 기록"},{"term":"교역","definition":"지역 사이에서 물건과 기술, 정보가 오가는 활동"}],
      "choices":[{"text":"🔎 \"경판 제작, 금속활자 인쇄, 벽란도 교역을 연결해 고려의 문화와 교류를 설명하고 자료의 범위를 구분한다.\"","correct":True,"feedback":"서로 다른 자료를 함께 보면 고려의 기술·문화·교류를 균형 있게 설명할 수 있습니다.","next":"end"},{"text":"📜 \"『직지』 한 권만 보고 고려의 모든 문화와 모든 사람의 생활을 알 수 있다고 말한다.\"","correct":False,"feedback":"『직지』는 중요한 자료이지만, 제작·교류·생활의 다른 모습은 다른 자료와 함께 살펴야 합니다.","next":"4-1"}],
      "simulator":{"mode":"culture-touch","interaction":"hotspot-discovery","type":"info","hotspots":[{"id":"tripitaka","label":"팔만대장경판","x":0.22,"y":0.48,"feedback":"목재 가공과 판각, 보관 기술을 살필 수 있는 자료입니다."},{"id":"jikji","label":"직지 금속활자본","x":0.5,"y":0.65,"feedback":"고려의 금속활자 인쇄 기술을 보여 주는 현존 자료입니다."},{"id":"byeokrando","label":"벽란도 교역 기록","x":0.78,"y":0.48,"feedback":"고려가 여러 지역과 연결된 해상 교류를 보여 주는 자료입니다."}],"required":True,"completion":completion("🔎 제작·인쇄·교류 자료를 모두 확인했습니다. 이제 근거를 종합하세요."),"infoText":"자료마다 알려 주는 범위가 다르므로 함께 비교해야 합니다.","instruction":"🔎 <b>고려 문화의 세 자료를 비교하세요</b>","feedback":"한 문화유산만으로 시대 전체를 단정하지 마세요."}
    }, {"roadmapLabel":"4-F. 한 유물로 단정","location":"고려 문화 자료 연구실","badge":"↩️ 근거 보완: 자료의 범위","character":{"name":"시간 안내원 타미","role":"역사 해설자","emoji":"🤖"},"narrative":"<b>문화유산 하나는 과거의 한 측면을 보여 줍니다.</b><br><br>제작·인쇄·교류 자료가 각각 알려 주는 내용을 구분해 다시 설명해 보세요.","choices":[{"text":"🔄 세 자료를 연결해 고려 문화를 다시 설명한다.","next":"4","correct":True}]})
    add_source(data, "고려의 문화", "https://contents.history.go.kr/mobile/ta/view.do?levelId=ta_m21_0040_0020_0030", "고려의 금속활자·벽란도·대외 교류 관련 2~4단계 서술")
    save("regular_goryeo_culture.json", data)

def main():
    expand_war(); expand_culture(); print("Expanded two Goryeo pilot MUDs to four evidence-based main stages.")

if __name__ == "__main__": main()
