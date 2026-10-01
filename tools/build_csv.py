# -*- coding: utf-8 -*-
import re, csv, collections
from decode import d, best, M, OV
M.update({2440:'악',1090:'갈',1443:'녹',1386:'납',3071:'클',101:'',2892:'천',2893:'천',1122:'건'})

def full_text(i):
    x=best.get(i); ov=OV.get(x,{}); out=[]
    for sp in sorted((s for s in d[i].get_texttrace() if isinstance(s,dict)),
                     key=lambda s:(round(s['bbox'][1],1),s['bbox'][0])):
        fn=sp.get('font'); t=''
        for c in sp['chars']:
            g=c[1]
            if fn=='NanumGothic':
                v=ov.get(g); v=M.get(g) if v is None else v
                t+= v if v is not None else ''
            elif 17<=g<=26: t+=chr(48+g-17)
            else:
                v=M.get(g); t+= v if v is not None else ''
        out.append(t)
    return ''.join(out)

DFIX={'의문동':'이문동','봉철동':'봉천동','건여동':'거여동','방의동':'방이동','천왕동':'천왕동',
      '륜현동':'논현동','응암동':'응암동','의문동':'이문동'}
SHAPE='정방형|가로장방|세로장방|사다리형|부정형|자루형|삼각형'
ROAD=r'광대한면|광대소각|광대세각|중로한면|중로각지|소로한면|소로각지|세로한면\(가\)|세로한면\(불\)|세로각지\(가\)|세로각지\(불\)|맹지'
pr=re.compile(r'(\d{3,4})([가-힣]{2,4}구)([가-힣]{2,5}동)(\d{1,4}-\d{1,4})(?=급경사|완경사|평지)(급경사|완경사|평지)('+SHAPE+r')?('+ROAD+r')?(소형|중형|대형)?')

# --- physical/현황 table (지형/도로/OSC유형) : glyph-decoded, clean ---
phys=[]
for i in range(280,d.page_count):
    ft=full_text(i)
    if '지형' in ft and '도로접면' in ft:
        for m in pr.finditer(ft):
            phys.append(dict(id=m.group(1),gu=m.group(2),dong=DFIX.get(m.group(3),m.group(3)),jibun=m.group(4),
                            hgt=m.group(5),shape=m.group(6) or '',road=m.group(7) or '',osc=m.group(8) or '',pg=i+1))

# --- building/건축 numbers : from pdftotext -layout (columns spatially separated) ---
# layout row: [id?]  <gu> <dong> <jibun>  <노후>  <총계>  <대지>  <건폐>  <용적>  <주택형태>
HT={'단øüÝ':'단독주택','공동üÝ':'공동주택','다세대':'다세대주택','다¬í':'다가구주택','연¾üÝ':'연립주택'}
LB=re.compile(r'\s(\d{1,4}-\d{1,4})\s+(\d{1,2}\.\d)\s+(\d{1,3})\s+(\d{1,4}\.\d{2})\s+(\d{1,3}\.\d{2})\s+(\d{1,4}\.\d{2})\s+(\S+)\s*$')
laynum={}   # jibun -> record  (first occurrence wins)
for line in open('ALL_layout.txt',encoding='utf-8'):
    m=LB.search(line)
    if m:
        jb=m.group(1)
        laynum.setdefault(jb, dict(age=m.group(2),units=m.group(3),area=m.group(4),bcr=m.group(5),
                                   far=m.group(6),htype=HT.get(m.group(7).strip(),'')))

def wcsv(fn,rows,cols,hdr):
    with open(fn,'w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f); w.writerow(hdr)
        for r in rows: w.writerow([r.get(c,'') for c in cols])

merged=[]
for p in phys:
    n=laynum.get(p['jibun'],{})
    merged.append(dict(p, area=n.get('area',''),bcr=n.get('bcr',''),far=n.get('far',''),
                       htype=n.get('htype',''),age=n.get('age',''),units=n.get('units','')))

wcsv('필지_현황_지형도로.csv', phys,
     ['id','gu','dong','jibun','hgt','shape','road','osc'],
     ['매입임대고유번호','자치구','법정동','지번','지형높이','지형형상','도로접면','OSC공법유형(소/중/대형패널)'])
wcsv('OSC연구_매입임대_필지목록.csv', merged,
     ['id','gu','dong','jibun','area','bcr','far','htype','age','units','hgt','shape','road','osc'],
     ['매입임대고유번호','자치구','법정동','지번','대지면적_m2','건폐율_pct','용적률_pct','주택형태',
      '노후년수','임대세대수','지형높이','지형형상','도로접면','OSC공법유형'])

with_num=sum(1 for m in merged if m['area'])
print('현황행',len(phys),' layout숫자레코드',len(laynum),' 병합_건축속성있음',with_num,'/',len(merged))
ar=[float(m['area']) for m in merged if m['area'] and m['area']!='0.00']
un=[int(m['units']) for m in merged if m['units'].isdigit()]
import statistics
print('area  min/med/max',min(ar),statistics.median(ar),max(ar))
print('units min/med/max',min(un),statistics.median(un),max(un))
print('자치구:',dict(collections.Counter(p['gu'] for p in phys)))
