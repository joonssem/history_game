import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "data" / "mud" / "regular_paleolithic.json"
data = json.loads(path.read_text(encoding="utf-8"))

# The five survival decisions remain gated by hands-on interaction. The final
# reflection is deliberately optional: it consolidates learning without
# forcing another three taps after five required activities.
data["stages"]["6"]["simulator"]["required"] = False
data["stages"]["6"]["simulator"]["instruction"] = "🏆 <b>구석기 생존의 핵심 단서를 돌아보세요!</b>"
data["stages"]["6"]["simulator"]["feedback"] = "생존의 단서를 모두 살펴보았습니다. 주먹도끼를 도감에서 확인하세요."

# Remove repeated explanatory clauses from the two longest decision screens;
# the glossary and hotspot feedback retain the same concepts.
data["stages"]["1"]["narrative"] = (
    "<b>빙하기 한반도, 매서운 삭풍이 불어옵니다!</b><br><br>"
    "구석기 사람들은 열매를 채집하고 짐승을 사냥하며 이동 생활을 했습니다. "
    "맹수와 비바람을 피할 수 있는 지형을 찾아보세요. 어디로 향해야 할까요?"
)
data["stages"]["4"]["narrative"] = (
    "<b>주먹도끼를 완성했지만, 도구만으로는 무리를 먹여 살릴 수 없습니다.</b><br><br>"
    "사냥감의 발자국이 평원과 바위 절벽이 만나는 곳에 모여 있습니다. "
    "동물의 이동 경로와 지형을 관찰하며 사냥 전략을 선택하세요."
)
data["stages"]["6"]["narrative"] = (
    "<b>불, 주먹도끼, 사냥, 나눔이 하나의 생존 지혜로 이어졌습니다.</b><br><br>"
    "환경을 관찰하고 도구를 만들며 무리와 협력한 판단이 생존을 지켰습니다.<br><br>"
    "연천 전곡리 아슐리안형 주먹도끼는 동아시아의 높은 뗀석기 기술을 보여 주는 유물입니다."
)

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Optimized paleolithic activity duration while preserving five required survival interactions.")
