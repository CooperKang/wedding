import type { BudgetCat, BudgetStyle } from '../types'

export const BUDGET_CATS: { id: BudgetCat; label: string; hint: string }[] = [
  { id: 'venue', label: '예식장', hint: '대관료 + 식대 × 보증인원 + 꽃장식·연출' },
  { id: 'sdm', label: '스드메', hint: '스튜디오·드레스·메이크업 + 추가금' },
  { id: 'snap', label: '본식 촬영·영상', hint: '본식 스냅, 원판, 영상' },
  { id: 'hanbok', label: '한복·예복', hint: '혼주·신랑신부 한복, 신랑 예복' },
  { id: 'rings', label: '예물', hint: '반지, 시계 등' },
  { id: 'gifts', label: '예단·이바지', hint: '양가 합의에 따라 생략 가능' },
  { id: 'honeymoon', label: '신혼여행', hint: '항공, 숙소, 경비' },
  { id: 'invite', label: '청첩장·답례', hint: '종이·모바일 청첩장, 답례품, 청첩장 모임' },
  { id: 'beauty', label: '관리·준비', hint: '피부, 헤어, 혼주 메이크업' },
  { id: 'etc', label: '그 밖', hint: '사회·축가 사례, 헬퍼비, 교통, 예비비' },
]

export const catLabel = (c: BudgetCat) => BUDGET_CATS.find((x) => x.id === c)?.label ?? c

// 출처
// [참가격] 한국소비자원 참가격 결혼서비스 통계, 2026년 8월 계약 기준(전국 중간값)
//   예식장 총액 1,550 / 스드메 패키지 298 / 본식 촬영 75.5 + 원판 50 / 한복 대여 27.5 / 생화장식 256
// [듀오] 듀오 2026 결혼비용 보고서(2026.3 발표, 평균): 예물 588 / 예단 1,030 / 이바지 155 / 신혼여행 763 / 웨딩패키지(스드메) 471
// 출처가 없는 칸(청첩장, 관리, 호텔·프리미엄 금액)은 위 수치로 가늠한 추정치다.
export const PRICE_SOURCES = [
  { name: '한국소비자원 참가격 결혼서비스 가격 정보', url: 'https://www.price.go.kr/tprice/portal/wedding/areaStatistic.do', note: '2026년 8월 계약 기준, 지역별 중간값·평균' },
  { name: '듀오 2026 결혼비용 보고서', url: 'https://magazine.hankyung.com/money/article/202603064251c', note: '2026년 3월 발표, 최근 2년 내 결혼한 1,000명 설문 평균' },
]

export type Preset = { id: BudgetStyle; label: string; desc: string; values: Record<BudgetCat, number>; estimated: BudgetCat[] }

export const PRESETS: Preset[] = [
  {
    id: 'minimal',
    label: '최소',
    desc: '공공 예식장·스몰웨딩, 드메 패키지, 모바일 청첩장, 가까운 신혼여행',
    values: { venue: 500, sdm: 170, snap: 40, hanbok: 30, rings: 100, gifts: 0, honeymoon: 300, invite: 15, beauty: 30, etc: 60 },
    estimated: ['venue', 'snap', 'rings', 'honeymoon', 'invite', 'beauty', 'etc'],
  },
  {
    id: 'smart',
    label: '실속',
    desc: '비수기·일요일 웨딩홀, 스드메 패키지, 예단 간소화, 중거리 신혼여행',
    values: { venue: 1200, sdm: 260, snap: 75, hanbok: 30, rings: 300, gifts: 150, honeymoon: 600, invite: 30, beauty: 60, etc: 150 },
    estimated: ['venue', 'sdm', 'rings', 'gifts', 'honeymoon', 'invite', 'beauty', 'etc'],
  },
  {
    id: 'standard',
    label: '표준',
    desc: '전국 중간값 수준의 웨딩홀과 스드메, 평균적인 예물·예단·신혼여행',
    values: { venue: 1550, sdm: 300, snap: 125, hanbok: 30, rings: 590, gifts: 1185, honeymoon: 763, invite: 40, beauty: 100, etc: 250 },
    estimated: ['invite', 'beauty', 'etc'],
  },
  {
    id: 'luxury',
    label: '호화',
    desc: '호텔 웨딩(생화장식 포함), 프리미엄 드레스·촬영, 장거리 신혼여행',
    values: { venue: 4400, sdm: 600, snap: 250, hanbok: 150, rings: 1200, gifts: 1500, honeymoon: 1500, invite: 60, beauty: 200, etc: 500 },
    estimated: ['venue', 'sdm', 'snap', 'hanbok', 'rings', 'gifts', 'honeymoon', 'invite', 'beauty', 'etc'],
  },
]

// 지역별 결혼서비스 총 계약금액 평균(참가격 2026년 8월) ÷ 전국 평균 2,213. 예식장·스드메에만 곱한다.
const AREA_AVG: Record<string, number> = { 강남: 3419, 서울: 3154, 경기: 2010, 인천: 1525, 대전: 1706, 충청: 1687, 대구: 1596, 부산: 1224, 울산: 1661, 경상: 1329, 광주: 1627, 전북: 1807, 제주: 1769 }
const REGION_AREA: Record<string, string> = {
  gangnam: '강남',
  seocho: '강남',
  songpa: '강남',
  gangdong: '서울',
  yeongdeungpo: '서울',
  mapo: '서울',
  jongno: '서울',
  yongsan: '서울',
  gwangjin: '서울',
  gangseo: '서울',
  guro: '서울',
  nowon: '서울',
  suwon: '경기',
  seongnam: '경기',
  goyang: '경기',
  yongin: '경기',
  bucheon: '경기',
  anyang: '경기',
  incheon: '인천',
  daejeon: '대전',
  cheongju: '충청',
  cheonan: '충청',
  daegu: '대구',
  busan: '부산',
  ulsan: '울산',
  changwon: '경상',
  gwangju: '광주',
  jeonju: '전북',
  jeju: '제주',
}

export function areaOf(region: string) {
  return REGION_AREA[region] ?? '전국'
}

export function regionFactor(region: string) {
  const a = AREA_AVG[REGION_AREA[region]]
  return a ? a / 2213 : 1
}

// 지역에 맞춰 다듬은 프리셋 값(10만원 단위 반올림). 호화(호텔)는 지역보다 호텔 등급이 좌우해서 그대로 둔다.
export function presetFor(id: BudgetStyle, region: string): Record<BudgetCat, number> {
  const p = PRESETS.find((x) => x.id === id)!
  if (id === 'luxury' || id === 'minimal') return { ...p.values }
  const f = regionFactor(region)
  const r = (v: number) => Math.round((v * f) / 10) * 10
  return { ...p.values, venue: r(p.values.venue), sdm: r(p.values.sdm) }
}

export const presetTotal = (v: Record<BudgetCat, number>) => Object.values(v).reduce((a, b) => a + b, 0)

// 참가격 기준 알아 두면 좋은 숫자(전국 중간값, 2026년 8월)
export const MARKET_FACTS = [
  { label: '예식장 총액', value: '1,550만원', sub: '강남 2,850 · 서울(강남 외) 2,255 · 부산 905' },
  { label: '1인당 식대', value: '6.0만원', sub: '강남 8.8 · 서울(강남 외) 7.6 · 경기 6.5' },
  { label: '최소 보증인원', value: '200명', sub: '부산 150' },
  { label: '스드메 패키지', value: '298만원', sub: '강남 350 · 드메만 170' },
  { label: '대관료', value: '350만원', sub: '강남 750 · 서울(강남 외) 580' },
  { label: '성수기 vs 비수기', value: '+202만원', sub: '4월이 가장 비싸고 1월이 가장 쌈' },
]
