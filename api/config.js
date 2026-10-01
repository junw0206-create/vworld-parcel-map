// Vercel 서버리스: 환경변수의 VWorld 키를 브라우저 설정(config.js)으로 내려줌
// data.go.kr 키는 여기서 내보내지 않음 → /api/bld 가 서버에서만 사용
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`window.APP_CONFIG=${JSON.stringify({ VWORLD_KEY: process.env.VWORLD_KEY || '' })};`);
};
