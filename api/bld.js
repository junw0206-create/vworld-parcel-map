// Vercel 서버리스: data.go.kr 건축HUB 건축물대장 프록시 (키는 환경변수 DATA_GO_KR_KEY)
// op: 표제부 / 층별개요 / 총괄표제부 / 지역지구구역 / 주택가격 / 기본개요
const OPS = new Set(['getBrTitleInfo', 'getBrFlrOulnInfo', 'getBrRecapTitleInfo', 'getBrJijiguInfo', 'getBrHsprcInfo', 'getBrBasisOulnInfo']);
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');   // 로컬 파일(file://)·Live Server에서도 호출 가능
  const q = req.query || {};
  const op = q.op || 'getBrTitleInfo';
  const ok = (v, n) => typeof v === 'string' && new RegExp(`^\\d{${n}}$`).test(v);
  if (!OPS.has(op) || !ok(q.sigunguCd, 5) || !ok(q.bjdongCd, 5) || !ok(q.platGbCd, 1) || !ok(q.bun, 4) || !ok(q.ji, 4)) {
    res.statusCode = 400; return res.json({ error: 'bad params' });
  }
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) { res.statusCode = 500; return res.json({ error: 'DATA_GO_KR_KEY 환경변수 없음' }); }
  const p = new URLSearchParams({
    serviceKey: key, _type: 'json', numOfRows: '100', pageNo: '1',
    sigunguCd: q.sigunguCd, bjdongCd: q.bjdongCd, platGbCd: q.platGbCd, bun: q.bun, ji: q.ji,
  });
  try {
    const r = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/${op}?${p}`);
    const txt = await r.text();
    res.setHeader('Cache-Control', txt.includes('"00"') ? 's-maxage=86400' : 'no-store');
    try { return res.json(JSON.parse(txt)); }
    catch { res.statusCode = 502; return res.json({ error: txt.slice(0, 300) }); }
  } catch (e) { res.statusCode = 502; return res.json({ error: String(e) }); }
};
