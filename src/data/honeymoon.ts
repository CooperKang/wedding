import type { HoneyCat } from '../types'

// 신혼여행지. 금액은 모두 두 사람 합계, 만원 단위, 2026년 기준 대략값(추정)이다.
// 시기·환율·숙소 등급에 따라 크게 달라지니 견적 비교의 출발점으로만 쓴다.
// months: 1~12월 날씨로 본 추천도. 2 좋음, 1 무난(덥거나 비가 잦음), 0 피하는 게 좋음(우기·태풍·허리케인)
export type Dest = {
  id: string
  name: string
  area: string
  style: string
  flight: string // 비행 시간
  trip: string // 흔한 일정
  nights: number // 계산에 쓰는 기본 숙박 수
  months: number[]
  monthNote: string
  cost: { flight: number; stay: number; food: number; tour: number; transport: number; transfer: number; insurance: number; etc: number }
  good: string[]
  watch: string[]
}

export const DESTS: Dest[] = [
  {
    id: 'bali',
    name: '발리',
    area: '인도네시아',
    style: '풀빌라 휴양 + 관광',
    flight: '직항 약 7시간',
    trip: '4박 6일 · 5박 7일',
    nights: 5,
    months: [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    monthNote: '4~10월 건기가 좋아요. 12~2월은 우기라 오후 소나기가 잦아요.',
    cost: { flight: 140, stay: 45, food: 15, tour: 10, transport: 5, transfer: 0, insurance: 6, etc: 15 },
    good: ['같은 예산이면 풀빌라 등급을 가장 높일 수 있어요', '우붓 관광, 스파, 비치클럽까지 하루하루 색이 달라요'],
    watch: ['도착비자(VOA)와 관광세를 따로 내요', '지역 간 이동이 막혀서 숙소를 2곳 이내로 나누는 게 편해요'],
  },
  {
    id: 'maldives',
    name: '몰디브',
    area: '인도양',
    style: '리조트 휴양',
    flight: '경유 10~13시간',
    trip: '4박 6일 (리조트 2곳이면 5박 7일)',
    nights: 4,
    months: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2],
    monthNote: '12~4월 건기가 가장 맑아요. 5~11월은 비가 잦지만 리조트 요금이 내려가요.',
    cost: { flight: 220, stay: 130, food: 35, tour: 10, transport: 0, transfer: 120, insurance: 10, etc: 10 },
    good: ['리조트 안에서 모든 게 끝나서 가장 푹 쉴 수 있어요', '허니문 특전(업그레이드, 디너, 케이크)이 많아요'],
    watch: ['수상비행기·스피드보트 이동비가 크고, 수상비행기는 해가 지면 안 떠요', '식사 플랜(조식·하프보드·올인클루시브)에 따라 총액이 크게 달라요'],
  },
  {
    id: 'hawaii',
    name: '하와이',
    area: '미국',
    style: '휴양 + 액티비티 + 쇼핑',
    flight: '직항 8~9시간',
    trip: '6박 8일 (오아후 + 이웃섬)',
    nights: 6,
    months: [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1],
    monthNote: '일 년 내내 무난해요. 4~10월이 비가 적고, 겨울엔 파도가 높아져요.',
    cost: { flight: 230, stay: 55, food: 30, tour: 20, transport: 10, transfer: 0, insurance: 10, etc: 15 },
    good: ['직항이 많고 렌터카로 자유롭게 다니기 좋아요', '쇼핑, 스노클링, 드라이브까지 할 게 많아요'],
    watch: ['미국 전자여행허가(ESTA)가 필요해요', '식비·팁·리조트피가 비싸서 현지 경비가 생각보다 커요'],
  },
  {
    id: 'cancun',
    name: '칸쿤',
    area: '멕시코',
    style: '올인클루시브 휴양',
    flight: '미국 경유 18~20시간',
    trip: '5박 7일 (미국 도시 연계 시 7박 9일)',
    nights: 5,
    months: [2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 1, 2],
    monthNote: '12~4월이 가장 좋아요. 6~11월은 허리케인 철이고 9~10월이 가장 위험해요.',
    cost: { flight: 330, stay: 110, food: 3, tour: 20, transport: 3, transfer: 10, insurance: 12, etc: 15 },
    good: ['올인클루시브라 식사·음료 걱정 없이 쉬어요', '뉴욕·LA 같은 미국 도시와 묶기 좋아요'],
    watch: ['미국 경유라 ESTA가 필요하고 비행이 길어요', '여름~가을 허리케인 예보를 꼭 확인하세요'],
  },
  {
    id: 'europe',
    name: '유럽',
    area: '이탈리아·스위스·프랑스·스페인',
    style: '도시 관광',
    flight: '직항 12~14시간',
    trip: '9박 11일 · 10박 12일',
    nights: 9,
    months: [1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1],
    monthNote: '5~6월, 9~10월이 걷기 좋아요. 7~8월은 덥고 붐벼요. 스위스 산악은 6~9월이 좋아요.',
    cost: { flight: 320, stay: 30, food: 25, tour: 10, transport: 15, transfer: 0, insurance: 12, etc: 10 },
    good: ['평생 기억에 남는 도시를 두 사람 속도로 걸어요', '이탈리아 + 스위스처럼 두 나라를 묶는 일정이 인기예요'],
    watch: ['일정이 길어 휴가를 많이 써야 해요', '도시 간 이동이 많아 체력 소모가 커요. 짐은 가볍게'],
  },
  {
    id: 'phuket',
    name: '푸껫·코사무이',
    area: '태국',
    style: '풀빌라 휴양',
    flight: '직항 6~7시간(푸껫)',
    trip: '4박 6일',
    nights: 4,
    months: [2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2],
    monthNote: '푸껫은 11~4월 건기가 좋고 5~10월은 우기예요. 코사무이는 반대로 10~12월에 비가 많아요.',
    cost: { flight: 100, stay: 35, food: 12, tour: 10, transport: 4, transfer: 0, insurance: 6, etc: 5 },
    good: ['비행이 짧고 물가가 합리적이에요', '풀빌라 선택지가 많아요'],
    watch: ['우기엔 바다가 거칠어 섬 투어가 취소되기도 해요', '같은 태국이라도 섬마다 우기가 달라요'],
  },
  {
    id: 'vietnam',
    name: '다낭·나트랑',
    area: '베트남',
    style: '가성비 휴양',
    flight: '직항 4~5시간',
    trip: '3박 5일 · 4박 6일',
    nights: 4,
    months: [1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1],
    monthNote: '2~8월이 좋아요. 9~12월은 비와 태풍이 잦아요.',
    cost: { flight: 70, stay: 25, food: 8, tour: 8, transport: 3, transfer: 0, insurance: 5, etc: 5 },
    good: ['가장 적은 예산으로 리조트 허니문을 할 수 있어요', '휴가가 짧아도 다녀오기 좋아요'],
    watch: ['한국인 여행객이 많아 신혼 분위기는 덜할 수 있어요'],
  },
  {
    id: 'guam',
    name: '괌·사이판',
    area: '미국령',
    style: '가까운 휴양',
    flight: '직항 4시간 안팎',
    trip: '3박 5일 · 4박 5일',
    nights: 4,
    months: [2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2],
    monthNote: '12~6월 건기가 좋아요. 8~10월은 태풍 철이에요.',
    cost: { flight: 90, stay: 35, food: 18, tour: 10, transport: 8, transfer: 0, insurance: 5, etc: 5 },
    good: ['비행이 짧고 바다가 맑아요', '렌터카로 다니기 쉬워요'],
    watch: ['미국령이라 입국 서류를 미리 확인하세요', '물가는 미국 수준이에요'],
  },
  {
    id: 'mauritius',
    name: '모리셔스',
    area: '아프리카 인도양',
    style: '리조트 휴양',
    flight: '경유 15~18시간',
    trip: '6박 8일 (두바이 연계가 많아요)',
    nights: 6,
    months: [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1],
    monthNote: '5~12월이 좋아요. 1~3월은 사이클론 철이에요.',
    cost: { flight: 320, stay: 100, food: 25, tour: 12, transport: 5, transfer: 0, insurance: 12, etc: 10 },
    good: ['한국인이 적어 조용하고, 몰디브보다 할 거리가 많아요'],
    watch: ['비행이 길어 경유지 하루 쉬기를 넣는 커플이 많아요'],
  },
  {
    id: 'tahiti',
    name: '타히티·보라보라',
    area: '남태평양',
    style: '최고급 리조트 휴양',
    flight: '경유 20시간 이상',
    trip: '6박 8일',
    nights: 6,
    months: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1],
    monthNote: '5~10월 건기가 좋아요.',
    cost: { flight: 450, stay: 160, food: 40, tour: 15, transport: 3, transfer: 20, insurance: 12, etc: 10 },
    good: ['수상 방갈로의 원조, 평생 한 번의 여행'],
    watch: ['항공과 리조트 모두 가장 비싸요', '이동만 이틀 가까이 걸려요'],
  },
  {
    id: 'okinawa',
    name: '오키나와·일본',
    area: '일본',
    style: '짧은 휴양 · 료칸',
    flight: '직항 2~2.5시간',
    trip: '3박 4일',
    nights: 3,
    months: [1, 1, 2, 2, 1, 0, 1, 1, 0, 2, 2, 1],
    monthNote: '오키나와는 3~4월, 10~11월이 좋아요. 6월은 장마, 8~9월은 태풍이 잦아요.',
    cost: { flight: 50, stay: 25, food: 12, tour: 6, transport: 6, transfer: 0, insurance: 4, etc: 3 },
    good: ['휴가가 짧거나 예식 직후 가볍게 다녀오기 좋아요', '나중에 장거리 여행을 따로 가는 커플도 많아요'],
    watch: ['신혼 특전은 적은 편이에요'],
  },
]

export const destOf = (id: string) => DESTS.find((d) => d.id === id) ?? DESTS[0]

// 여행사 집계 상위권. 공공 통계가 아니라 각 여행사 자체 집계다.
export const RANKINGS = [
  { by: '팜투어 2025 신혼여행 트렌드', order: ['발리', '몰디브', '하와이', '칸쿤', '유럽'], note: '최근 3년 같은 5곳이 상위권, 유럽 평균 체류 12일', url: 'https://www.discoverynews.kr/news/articleView.html?idxno=1057775' },
  { by: '허니문리조트 2025년 예약 분석', order: ['몰디브', '하와이', '발리', '유럽', '칸쿤'], note: '실제 상담·예약 데이터 기준', url: 'https://wowtoday.co.kr/View.aspx?No=3899877' },
]

export const HONEY_AVG = { value: 763, by: '듀오 2026 결혼비용 보고서', note: '최근 2년 내 결혼한 1,000명, 전년보다 6.7% 올랐어요' }

export const HONEY_CATS: { id: HoneyCat; label: string; hint: string }[] = [
  { id: 'flight', label: '항공', hint: '두 사람 왕복, 일반석 기준' },
  { id: 'stay', label: '숙소', hint: '1박 요금 × 박수' },
  { id: 'food', label: '식비', hint: '하루 식비 × 일수(리조트 식사 플랜 포함)' },
  { id: 'tour', label: '투어·액티비티', hint: '스파, 스노클링, 일일 투어' },
  { id: 'transport', label: '현지 교통·이동', hint: '렌터카, 기차, 공항 이동, 수상비행기' },
  { id: 'gifts', label: '선물', hint: '양가 부모님, 형제, 친척, 동료' },
  { id: 'insurance', label: '여행자 보험', hint: '두 사람' },
  { id: 'etc', label: '그 밖', hint: '비자·전자여행허가, 관광세, 팁, eSIM, 환전 수수료' },
]

// 선물: 기본 예시. 사람 수와 단가는 고칠 수 있다.
export const DEFAULT_GIFTS = [
  { who: '양가 부모님', count: 2, unit: 30 },
  { who: '형제·자매', count: 2, unit: 10 },
  { who: '친척 어른', count: 4, unit: 5 },
  { who: '회사 동료·친구(간식)', count: 3, unit: 5 },
]

// 견적을 받을 때 확인할 것. 견적 비교표의 체크 칸이 된다.
export const QUOTE_CHECKS: { id: string; label: string }[] = [
  { id: 'direct', label: '직항' },
  { id: 'room', label: '룸 타입 명시' },
  { id: 'breakfast', label: '조식' },
  { id: 'dinner', label: '석식 포함' },
  { id: 'transfer', label: '공항 픽업·샌딩' },
  { id: 'guide', label: '가이드비·팁 포함' },
  { id: 'noShop', label: '쇼핑 일정 없음' },
  { id: 'noOption', label: '선택관광 강요 없음' },
  { id: 'insurance', label: '여행자 보험' },
  { id: 'perk', label: '허니문 특전' },
  { id: 'cancel', label: '취소 규정 서면' },
]

export const HONEY_TIPS = [
  '예식 성수기(5월, 10~11월)와 여름휴가(7월 말~8월 초), 설·추석 연휴에 출발이 몰려 항공권이 가장 비싸요. 날짜가 정해지면 항공부터 잡으세요.',
  '예식 다음 날 아침 출발은 생각보다 힘들어요. 하루 쉬고 떠나거나 오후 출발을 고려하세요.',
  '여권 영문 이름이 항공권과 똑같은지, 유효기간이 6개월 이상 남았는지 확인하세요.',
  '허니문 전문 여행사 2~3곳과 자유여행 견적을 같은 날짜·같은 숙소 등급으로 받아 아래 견적 비교표에 넣어 보세요.',
  '리조트 허니문 특전은 혼인 6개월~1년 이내 증빙(청첩장, 혼인관계증명서)을 요구하기도 해요.',
  '패키지는 쇼핑 일정과 선택관광이 있는지, 가이드비·팁이 포함인지가 실제 총액을 바꿔요.',
  '입국 요건(비자, 전자여행허가)은 자주 바뀌어요. 출발 전 외교부 해외안전여행에서 확인하세요.',
]
