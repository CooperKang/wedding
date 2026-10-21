# 우리 결혼 준비 — 설계 문서

- 날짜: 2026-10-21
- repo: `CooperKang/wedding` → https://cooperkang.github.io/wedding/
- 허브: cooperkang.github.io `SERVICES`에 추가

## 1. 목적

예비 신혼부부가 "무엇을, 언제, 얼마로, 어떤 순서로" 준비할지 스스로 판단할 수 있게 돕는다.
웨딩 업계는 가격이 공개되지 않고 플래너·예식장 연계 업체 위주로 흘러가기 쉬워서 비교가 어렵다.
이 서비스는 가격을 지어내지 않는다. 대신 다음을 준다.

1. 우리 커플 성향에 맞춘 준비 순서와 경험 기반 팁
2. 시기별 타임라인(최소 시작 시점, 가장 바쁜 구간)
3. 홀 고르기 기준과 박람회 사용법
4. 스드메 방식 비교, 발품 시 업체 목록·후기 신호·방문 동선
5. 신혼부부 지원 정책 정리 + 최근 뉴스
6. 예산 장부(예산/실지출/계약금·잔금/낸 사람/양가 지원금)
7. 기록을 동생·친척에게 넘겨줄 공유 링크와 인쇄용 기록집

성공 기준: 처음 결혼 준비하는 커플이 진단 몇 문항에 답하고 나면 "지금 당장 할 일 3가지"와 "언제까지 무엇을" 이 보이고, 장부에 실제 계약을 기록해 양가 부담과 남은 잔금을 한눈에 볼 수 있다.

## 2. 사용자가 정한 것

- 크롤링: API 키 없이 공개 페이지를 GitHub Actions에서 수집
- 저장: 서버 없음. 브라우저 저장 + JSON 파일 + 읽기 전용 공유 링크
- 구조: 진단 → 맞춤 플래너(방식 A)

## 3. 기술 구성

기존 허브 서비스와 같다. Vite + React 19 + TypeScript + Tailwind 4 + vitest + oxlint, 해시 라우터, `base: '/wedding/'`,
GitHub Actions Pages 배포(`deploy.yml`) + 주간 크롤 워크플로(`crawl.yml`).

```
crawler/            Node 24 스크립트(의존성 없음, 내장 fetch)
  sources/kakao.mjs     카카오맵 검색 JSON → 업체
  sources/blog.mjs      네이버 블로그 검색 HTML → 후기 신호
  sources/news.mjs      구글 뉴스 RSS → 정책 뉴스
  parse.mjs             순수 파서(테스트 대상)
  run.mjs               실행/병합/실패 처리
public/data/        vendors.json, reviews.json, news.json, meta.json
src/
  data/             정적 콘텐츠(타임라인, 홀 팁, 스드메 팁, 예산 프리셋, 정책)
  calc/             순수 로직(타임라인 날짜, 예산 집계, 동선, 공유 인코딩, 추천)
  components/       UI 부품
  pages/            화면
  store.ts          localStorage 상태
```

## 4. 화면

| 경로 | 화면 | 핵심 |
|---|---|---|
| `#/` | 시작·진단 | 예식일, 하객 수, 예산 성향, 준비 스타일, 스드메 방식, 지역, 중요 항목 → 커플 프로필. 맞춤 준비 순서, 지금 할 일 3가지, D-day |
| `#/timeline` | 타임라인 | 단계별 체크리스트, 최소 시작 시점, 가장 바쁜 구간 강조, 실제 날짜 계산, 성향별 항목 가감 |
| `#/venue` | 예식장 | 유형 비교, 성향별 추천 유형, 투어 체크리스트, 계약서 확인 항목, 박람회 사용법, 지역 업체 목록(크롤링) |
| `#/sdm` | 스드메 | 토탈/플래너/발품 비교, 추가금 체크리스트, 업체 목록·후기 신호, 담기 → 방문 동선 |
| `#/more` | 신혼여행·예물 등 | 신혼여행, 예물·예단, 한복, 청첩장, 본식 스냅, 답례품, 혼인신고 팁 |
| `#/policy` | 정책·지원 | 정책 카드(요건·혜택·확인 링크, 기준일), 최근 뉴스(크롤링) |
| `#/budget` | 예산 장부 | 프리셋, 항목·결제·낸 사람, 양가 지원금, 요약, 다가오는 지급 |
| `#/share` | 기록·공유 | 공유 링크(금액 포함/숨김), JSON 내보내기·가져오기, 인쇄용 기록집 |
| `#/view/<data>` | 공유 보기 | 읽기 전용 기록집 + "내 장부로 가져오기" |

## 5. 커플 프로필과 맞춤 규칙

```ts
type Profile = {
  weddingDate: string | null      // YYYY-MM-DD
  guests: number                  // 예상 하객 수(양가 합)
  budgetStyle: 'minimal' | 'smart' | 'standard' | 'luxury'
  venueStyle: 'hall' | 'hotel' | 'outdoor' | 'small' | 'undecided'
  prepStyle: 'planner' | 'romance' | 'diy'
  sdmMode: 'total' | 'planner' | 'diy' | 'undecided'
  region: string                  // 크롤 지역 id
  priorities: ('parking' | 'food' | 'transit' | 'hall' | 'photo' | 'cost')[]
}
```

- `prepStyle`이 준비 순서를 정한다.
  - planner: 플래너 2~3곳 비교 상담 → 예식장 → 스드메 패키지
  - romance: 예식장 투어 먼저 → 원하는 스튜디오·드레스 무드 확정 → 필요하면 플래너는 스드메만
  - diy: 예식장 직접 투어 → 스드메 업체별 발품 → 동선 도구
- 하객 수 + venueStyle + priorities로 홀 유형 추천과 체크 강조(예: parking 선택 시 주차 대수/무료 시간 항목을 맨 위로).
- 예식일까지 남은 개월 수로 "촉박 모드" 안내(6개월 미만이면 합쳐서 할 일, 포기할 것).

## 6. 타임라인

단계: D-12개월 이상, 10, 8, 6, 4, 3, 2, 1개월, D-2주, D-1주, D-day, 이후. 각 항목:

```ts
type Task = { id; phase; title; detail; latest?: number /* 최소 시작 개월 */; when?: (p: Profile) => boolean; tags }
```

- 예식일이 있으면 단계마다 실제 날짜 범위를 계산하고 오늘이 어느 단계인지 표시한다.
- 가장 바쁜 구간(D-3~D-1개월: 청첩장·본식 준비·스드메 잔금·신혼여행 준비가 겹침)은 시각적으로 강조한다.
- 앞으로의 일정이라 시간순(위가 먼 미래가 아니라 지금→예식일 순)으로 둔다.
- 체크 상태는 저장되고 진행률을 보여 준다.

## 7. 크롤러

- 카카오맵 `search.map.kakao.com/mapsearch/map.daum` (Referer 필요). 지역 × 분류 × 1~2페이지, 요청 간 1.2초.
  - 분류: 웨딩홀, 호텔웨딩, 스몰웨딩, 웨딩스튜디오, 웨딩드레스, 웨딩메이크업, 한복, 예물
  - 저장: id, name, cat, region, address, lat, lng, rating, ratingCount, reviewCount, parking, tel, homepage
- 네이버 블로그 검색 `search.naver.com` HTML. 업체명 + "후기"로 검색. 한 실행에 최대 150곳, `checkedAt`이 오래된 업체부터.
  - 저장: postCount(첫 페이지 기준), positive/negative 키워드 개수, 상위 링크 3개(제목+URL). 본문 저장 안 함.
- 구글 뉴스 RSS: 신혼부부 지원, 결혼 세액공제, 신혼부부 대출, 결혼장려금 등. 최근 30건, 제목 기준 중복 제거.
- 실패 처리: 소스별 독립. 0건이면 이전 파일 유지. `meta.json`에 소스별 `{ok, count, at, error}`.
- 예의: 낮은 빈도(주 1회), 공개 검색 결과만, 원문 링크 표시. 구조가 바뀌면 파서 테스트(저장 응답 fixture)로 감지.

## 8. 동선

- 입력: 담은 업체(좌표), 출발지(업체 중 하나 또는 첫 방문지), 시작 시각, 업체별 체류 분.
- 거리: 하버사인 × 1.35(도로 보정), 이동 속도 20km/h(도심 추정) + 구간마다 10분 여유.
- 순서: 8곳 이하 완전 탐색, 그 이상 최근접 + 2-opt.
- 출력: 순서, 도착·출발 시각, 총 이동 추정, 구간별 카카오맵 길찾기 링크(`map.kakao.com/link/from/.../to/...`).
- 좌표 없는 직접 추가 업체는 최적화에서 빼고 끝에 둔다.

## 9. 예산 장부

```ts
type Payer = 'us' | 'groom' | 'bride' | 'groomParents' | 'brideParents' | 'gift' | 'other'
type Payment = { id; label: '계약금' | '중도금' | '잔금' | string; amount; due: string | null; paid: string | null; payer: Payer }
type Item = { id; cat: BudgetCat; name; vendor; budget; payments: Payment[]; rating: 0-5; memo; tip }
type Support = { id; from: Payer; amount; memo }
```

- 금액 단위는 만원.
- 실제 금액 = 결제 합계. 예산 대비 차이, 분류별, 낸 사람별 합계, 지원금 대비 사용, 남은 미지급, 다가오는 지급(시간순).
- 프리셋: 최소/실속/표준/호화 × 분류별 예산 범위. 출처·기준 시점 표기. 프리셋을 고르면 빈 예산칸을 채운다(이미 쓴 칸은 건드리지 않는다).
- 금액 입력은 first-home `NumberField` 방식.

## 10. 저장과 공유

- `localStorage['wedding:v1'] = { profile, checks, items, supports, vendors(담은 업체), notes }`, 버전 마이그레이션.
- JSON 내보내기/가져오기(파일).
- 공유 링크: JSON → `CompressionStream('deflate-raw')` → base64url → `#/view/<data>`. "금액 숨김" 옵션은 금액 필드를 0으로 지우고 플래그를 단다.
- 인쇄용 기록집: 프로필 요약, 타임라인 완료 기록, 업체와 후기·팁, (선택) 금액. 인쇄 CSS.

## 11. 테스트

vitest:
- 타임라인 날짜 계산, 현재 단계, 촉박 모드
- 프로필 → 추천 규칙
- 예산 집계(분류별, 낸 사람별, 미지급, 다가오는 지급)
- 동선: 완전 탐색 최적성, 2-opt가 최근접보다 나쁘지 않음, 좌표 없음 처리
- 공유 인코딩 왕복, 금액 숨김
- 크롤러 파서(fixture)

## 12. 하지 않는 것

- 업체별 가격 수집·표시(공개되지 않음, 지어내지 않음)
- 실시간 동시 편집, 로그인
- 브라우저에서 직접 크롤링(CORS, 차단)
