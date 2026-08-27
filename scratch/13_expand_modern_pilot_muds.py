"""Expand three modern-history Regular MUDs with evidence-synthesis final stages."""
from __future__ import annotations
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]; D=R/'data'/'mud'
def save(n,d):(D/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def add(d,label,retry,narrative,terms,hot,ok,bad,src):
 d['roadmap']=[x for x in d['roadmap'] if x['id'] not in {'4','4-1'}]+[{'id':'4','label':label},{'id':'4-1','label':retry}];d['stages']['3']['choices'][0]['next']='4'
 d['stages']['4']={'location':'근현대 자료 연구실','badge':'🔎 제4관문: 자료를 연결해 설명하기','character':{'name':'어린이 역사 연구원','role':'자료 종합 담당','emoji':'🔎'},'narrative':narrative,'glossary':terms,'choices':[{'text':ok,'correct':True,'feedback':'서로 다른 자료를 연결하면 변화의 원인과 결과를 한쪽으로 치우치지 않게 설명할 수 있습니다.','next':'end'},{'text':bad,'correct':False,'feedback':'한 자료나 한 결과만으로 시대 전체를 단정할 수 없습니다. 다른 자료와 비교해 보세요.','next':'4-1'}],'simulator':{'mode':'culture-touch','interaction':'hotspot-discovery','type':'info','hotspots':hot,'required':True,'completion':{'target':3,'increment':1,'minActions':3,'progressKey':'simulatorProgress','successText':'🔎 세 자료를 모두 확인했습니다. 이제 근거를 종합하세요.'},'infoText':'자료마다 알려 주는 범위와 관점이 다릅니다.','instruction':'🔎 <b>세 자료를 비교하세요</b>','feedback':'한 자료만으로 시대 전체를 단정하지 마세요.'}}
 d['stages']['4-1']={'location':'근현대 자료 연구실','badge':'↩️ 근거 보완: 자료 비교','character':{'name':'시간 안내원 타미','role':'역사 해설자','emoji':'🤖'},'narrative':'<b>한 자료는 과거의 한 측면을 보여 줍니다.</b><br><br>자료의 성격과 한계를 구분해 다시 설명해 보세요.','choices':[{'text':'🔄 세 자료를 비교해 다시 설명한다.','next':'4','correct':True}]}
 d['sources']=[x for x in d['sources'] if x.get('url')!=src[1]];d['sources'].append({'institution':'국사편찬위원회','title':src[0],'url':src[1],'checkedAt':'2026-08-27','claimScope':src[2]})
def modern():
 d=json.loads((D/'regular_modern_open.json').read_text(encoding='utf-8'))
 d['stages']['1']['narrative']='<b>강화도 조약은 일본의 무력 위협 속에 체결되었고, 조선의 자주국을 내세우면서도 해안 측량권·치외법권 등 조선에 불리한 조항을 담았습니다.</b><br><br>조약문과 체결 배경을 함께 살펴봅시다.'
 d['stages']['2']['narrative']='<b>개항 뒤 병원·우편·교통 같은 새로운 시설이 등장했지만, 도입 과정과 이용 기회는 사람마다 달랐습니다.</b><br><br>새 문물이 생활에 준 변화와 한계를 함께 살펴봅시다.'
 d['stages']['3']['narrative']='<b>전차와 전등은 도시 생활을 바꾼 근대 시설이었습니다.</b><br><br>하지만 시설 하나가 곧 모든 사람의 삶을 바꾸었다고 단정할 수는 없습니다. 이용 장소와 당시 사회의 조건을 함께 생각해 봅시다.'
 add(d,'4. 조약·시설·도시 생활 자료 종합','4-F. 근대화를 한 방향으로 단정','<b>강화도 조약문, 제중원·우정총국 기록, 전차·전등 자료는 개항기 변화의 서로 다른 측면을 보여 줍니다.</b><br><br>주권 침해의 위험과 새로운 시설이 만든 생활 변화를 함께 설명해 봅시다.',[{'term':'불평등 조약','definition':'국가 사이 권리와 의무가 한쪽에 불리하게 정해진 조약'},{'term':'근대 문물','definition':'새로운 기술·제도·시설과 그로 인한 생활 변화'}],[{'id':'treaty','label':'강화도 조약문','x':.22,'y':.48,'feedback':'개항과 함께 주권 침해 조항이 들어간 외교 자료입니다.'},{'id':'institution','label':'병원·우편 시설','x':.5,'y':.65,'feedback':'의료와 통신의 새로운 제도·시설 자료입니다.'},{'id':'city','label':'전차·전등','x':.78,'y':.48,'feedback':'도시의 시간과 이동을 바꾼 생활 자료입니다.'}],'🔎 "조약의 불평등성, 근대 시설의 도입, 도시 생활 변화를 함께 근거로 개항기를 설명한다."','🚋 "전차가 생겼으므로 개항기의 주권 문제와 모든 사람의 생활 문제가 자동으로 해결됐다고 말한다."',('강화도 조약','https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i400800','강화도 조약의 체결 배경과 조항 관련 1·4단계 서술'));save('regular_modern_open.json',d)
def rule2():
 d=json.loads((D/'regular_japanese_rule_2.json').read_text(encoding='utf-8'))
 d['stages']['1']['narrative']='<b>1930년대 후반 이후 일제는 황국신민화 정책으로 우리말·역사 교육과 이름, 신앙 생활을 통제하려 했습니다.</b><br><br>정책 문서와 당시 사람들의 생활 기록을 통해 무엇이 강요되었는지 살펴봅시다.'
 d['stages']['2']['narrative']='<b>전시 동원 체제 아래 많은 사람이 노동과 군사 동원, 성폭력 등 심각한 인권 침해를 겪었습니다.</b><br><br>피해를 자극적으로 재현하지 않고, 기록·증언·기억 활동이 왜 중요한지 생각해 봅시다.'
 d['stages']['3']['narrative']='<b>조선어학회는 맞춤법 통일과 사전 편찬을 추진했고, 1942년 탄압을 받았습니다.</b><br><br>학술 활동과 언어 생활이 식민 통치 아래에서 어떤 의미를 가졌는지 자료로 살펴봅시다.'
 add(d,'4. 정책·피해 기록·언어 운동 자료 종합','4-F. 한 자료로 피해와 저항을 단정','<b>황국신민화 정책 자료, 강제 동원 관련 기록과 증언, 조선어학회 자료는 일제 말기 사람들의 삶과 대응을 서로 다르게 보여 줍니다.</b><br><br>피해자의 존엄을 존중하며 제도·피해·언어 운동의 연결을 설명해 봅시다.',[{'term':'강제 동원','definition':'전시 체제에서 개인의 의사에 반해 노동·군사 등에 동원한 일'},{'term':'증언','definition':'직접 겪은 일을 말하거나 기록해 과거를 알리는 자료'}],[{'id':'policy','label':'황국신민화 정책','x':.22,'y':.48,'feedback':'우리말·역사·이름 등을 통제하려 한 정책 자료입니다.'},{'id':'record','label':'강제 동원 기록','x':.5,'y':.65,'feedback':'전시 동원과 인권 침해의 피해를 알리는 기록·증언 자료입니다.'},{'id':'language','label':'조선어학회 자료','x':.78,'y':.48,'feedback':'맞춤법·사전 편찬과 언어 운동을 보여 주는 자료입니다.'}],'🔎 "정책의 강요, 강제 동원 피해, 조선어학회의 언어 운동을 함께 근거로 당시를 설명한다."','📚 "사전 원고 한 장만 보고 모든 피해자의 경험과 식민 통치 전체를 알 수 있다고 말한다."',('민족 말살 정책','https://contents.history.go.kr/front/ta/print.do?levelId=ta_m71_0100_0010_0030_0010&whereStr=','황국신민화·언어 통제·전시 동원 관련 1~4단계 서술'));save('regular_japanese_rule_2.json',d)
def postwar():
 d=json.loads((D/'regular_post_war.json').read_text(encoding='utf-8'))
 d['stages']['1']['narrative']='<b>정전 협정 뒤에도 전쟁 피해, 피난 생활, 이산가족 문제는 오래 이어졌습니다.</b><br><br>판자촌 사진과 구호·재건 기록은 당시 사람들이 처한 어려움과 서로 돕는 모습을 함께 보여 줍니다.'
 d['stages']['2']['narrative']='<b>전후 교육은 천막 교실 같은 임시 환경에서도 이어졌지만, 지역과 가정의 형편에 따라 배움의 조건은 달랐습니다.</b><br><br>교육을 한 가지 성공 신화가 아니라 재건 과정의 한 부분으로 살펴봅시다.'
 d['stages']['3']['narrative']='<b>이산가족 기록과 비무장지대 자료는 분단이 개인과 가족에게 남긴 상처를 보여 줍니다.</b><br><br>평화는 개인의 다짐만으로 만들어지지 않습니다. 대화·교류·안전·인권을 위한 여러 노력을 함께 생각해 봅시다.'
 add(d,'4. 피해·재건·분단 자료 종합','4-F. 한 원인으로 전후 사회 단정','<b>피난 생활 사진, 천막 교실 기록, 이산가족과 분단 자료는 전후 사회의 서로 다른 과제를 보여 줍니다.</b><br><br>전쟁 피해와 재건, 교육, 평화를 위한 노력을 연결해 설명해 봅시다.',[{'term':'정전','definition':'전쟁을 멈추기로 한 합의로, 평화 조약과는 구별된다'},{'term':'이산가족','definition':'분단과 전쟁으로 서로 떨어져 살게 된 가족'}],[{'id':'refugee','label':'피난 생활 기록','x':.22,'y':.48,'feedback':'전쟁 뒤 주거·생계의 어려움과 재건 노력을 보여 줍니다.'},{'id':'school','label':'천막 교실','x':.5,'y':.65,'feedback':'어려운 조건에서도 이어진 교육과 지역별 차이를 살필 수 있습니다.'},{'id':'family','label':'이산가족 기록','x':.78,'y':.48,'feedback':'분단이 가족과 개인에게 남긴 긴 시간의 상처를 보여 줍니다.'}],'🔎 "전쟁 피해, 재건과 교육, 이산가족 자료를 연결해 전후 사회의 변화와 과제를 설명한다."','🕊️ "한 가족의 상봉 이야기만으로 전후 재건과 분단 문제가 모두 해결됐다고 말한다."',('6·25 전쟁 이후 사회','https://contents.history.go.kr/eh_kk/teach/tong/III/25.htm','전쟁 피해·이산가족·전후 재건 관련 1~4단계 서술'));save('regular_post_war.json',d)
if __name__=='__main__':modern();rule2();postwar();print('Expanded three modern-history pilot MUDs.')
