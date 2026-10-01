// Vercel 서버리스: data.go.kr 건축HUB 건축물대장 표제부 프록시 (키는 환경변수 DATA_GO_KR_KEY)
module.exports = async (req, res) => {
  const q = req.query || {};
  const ok = (v, n) => typeof v === 'string' && new RegExp(`^\\d{${n}}$`).test(v);
  if (!ok(q.sigunguCd, 5) || !ok(q.bjdongCd, 5) || !ok(q.platGbCd, 1) || !ok(q.bun, 4) || !ok(q.ji, 4)) {
    res.statusCode = 400; return res.json({ error: 'bad params' });
  }
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) { res.statusCode = 500; return res.json({ error: 'DATA_GO_KR_KEY 환경변수 없음' }); }
  const p = new URLSearchParams({
    serviceKey: key, _type: 'json', numOfRows: '50', pageNo: '1',
    sigunguCd: q.sigunguCd, bjdongCd: q.bjdongCd, platGbCd: q.platGbCd, bun: q.bun, ji: q.ji,
  });
  try {
    const r = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${p}`);
    const txt = await r.text();
    res.setHeader('Cache-Control', 's-maxage=86400');
    try { return res.json(JSON.parse(txt)); }
    catch { res.statusCode = 502; return res.json({ error: txt.slice(0, 300) }); }
  } catch (e) { res.statusCode = 502; return res.json({ error: String(e) }); }
};
