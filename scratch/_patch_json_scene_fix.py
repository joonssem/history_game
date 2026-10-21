import re
def edit(fn, fx):
    p='data/mud/'+fn; s=open(p,encoding='utf-8').read(); s2=fx(s); assert s2!=s, fn; open(p,'w',encoding='utf-8').write(s2)
def xy(hid, x, y):
    def f(s):
        pat=re.compile(r'("id": "%s",\s*"label": "[^"]*",\s*"x": )[\d.]+(,\s*"y": )[\d.]+' % re.escape(hid))
        assert len(pat.findall(s))==1, (hid, len(pat.findall(s)))
        return pat.sub(lambda m: f'{m.group(1)}{x}{m.group(2)}{y}', s)
    return f
def chain(*fs):
    def f(s):
        for g in fs: s=g(s)
        return s
    return f
def scene_once(old, new, line_hint):
    def f(s):
        lines=s.split('\n'); i=line_hint-1
        assert lines[i].strip()==f'"scene": "{old}",', lines[i]
        lines[i]=lines[i].replace(old,new); return '\n'.join(lines)
    return f
edit('regular_bronze_age.json', scene_once('neolithic-village','bronze-village',221))
edit('regular_gojoseon.json', chain(scene_once('gojoseon-artifacts','gojoseon-bronze-culture',330),
     xy('manchuria',0.297,0.217), xy('north-korea',0.513,0.383), xy('asadal',0.833,0.687)))
edit('regular_three_kingdoms.json', chain(xy('pyeongyang',0.459,0.547), xy('guknae',0.487,0.195), xy('han-river',0.551,0.792)))
edit('regular_korean_war.json', chain(xy('border',0.505,0.355), xy('evacuation',0.518,0.553), xy('busan',0.578,0.737),
     xy('incheon',0.361,0.729), xy('panmunjom',0.37,0.495), xy('line',0.609,0.319)))
edit('regular_myeongnyang.json', chain(xy('japanese-boarding',0.5,0.5), xy('panokseon',0.31,0.72), xy('naval-cannon',0.85,0.56)))
print('ok')
