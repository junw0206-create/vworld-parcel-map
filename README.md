# VWorld 필지 + data.go.kr 건축물대장 한 겹

디지털디자인(2) 5주차 과제 — VWorld 지도·연속지적 위에 LH OSC 매입임대 노후필지를 띄우고,
필지 클릭 팝업에 **data.go.kr 건축HUB 건축물대장 표제부의 연면적·층수** 한 줄을 얹었습니다.

## 키 관리 (키 문자열은 저장소에 없음)
| 환경 | VWorld 키 | data.go.kr 키 |
|---|---|---|
| 로컬(Live Server) | `.env` → `node tools/make-config.mjs` → `config.js`(gitignore) | 같음 (브라우저에서 직접 호출) |
| Vercel | 환경변수 `VWORLD_KEY` → `/config.js`(= `/api/config`) | 환경변수 `DATA_GO_KR_KEY` → `/api/bld` 서버 프록시 (브라우저에 노출 안 됨) |

## 로컬 실행
1. `.env.example`을 `.env`로 복사하고 키 입력
2. `node tools/make-config.mjs`
3. VS Code Live Server로 `index.html` 열기
