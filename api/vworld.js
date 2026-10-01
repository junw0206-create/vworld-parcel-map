// Vercel 서버리스: VWorld 검색·데이터·토지특성 API 프록시
// (VWorld 데이터 API는 브라우저 직접 호출 시 CORS로 막힘 → 서버에서 대신 호출, 키는 환경변수 VWORLD_KEY)
const ALLOWED = new Set(['req/search', 'req/data', 'ned/data/getLandCharacteristics']);
module.exports = async (req, res) => {
  const q = { ...(req.query || {}) };
  const path = q._p; delete q._p; delete q.key; delete q.domain;
  if (!ALLOWED.has(path)) { res.statusCode = 400; return res.json({ error: 'path not allowed' }); }
  const key = process.env.VWORLD_KEY;
  if (!key) { res.statusCode = 500; return res.json({ error: 'VWORLD_KEY 환경변수 없음' }); }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const p = new URLSearchParams({ ...q, key, domain: process.env.VWORLD_DOMAIN || host /* VWorld 키 등록 URL과 같아야 함 */ });
  try {
    const r = await fetch(`https://api.vworld.kr/${path}?${p}`, { headers: { Referer: `https://${host}/` } });
    const txt = await r.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.statusCode = r.status;
    return res.end(txt);
  } catch (e) { res.statusCode = 502; return res.json({ error: String(e) }); }
};
