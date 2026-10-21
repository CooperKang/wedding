import type { BudgetStyle, PrepStyle, Priority, SdmMode, VenueStyle } from '../types'

export const BUDGET_STYLES: { id: BudgetStyle; label: string; sub: string }[] = [
  { id: 'minimal', label: '형식만 갖추는 저예산', sub: '꼭 필요한 것만. 가족 중심, 패키지·공공시설 적극 활용' },
  { id: 'smart', label: '저예산이지만 하고 싶은 건', sub: '전체는 아끼되 중요한 한두 가지(사진, 식사 등)엔 쓰기' },
  { id: 'standard', label: '남들 하는 만큼 무난하게', sub: '일반 웨딩홀, 스드메 패키지, 해외 신혼여행' },
  { id: 'luxury', label: '호텔·프리미엄으로', sub: '하객 대접과 분위기를 최우선, 예산 여유 있음' },
]

export const VENUE_STYLES: { id: VenueStyle; label: string; sub: string }[] = [
  { id: 'hall', label: '일반 웨딩홀', sub: '무난하고 하객 동선이 편한 곳' },
  { id: 'hotel', label: '호텔', sub: '럭셔리, 식사·서비스 중시' },
  { id: 'outdoor', label: '야외·하우스', sub: '자연광, 한 팀만 쓰는 공간' },
  { id: 'small', label: '스몰웨딩', sub: '가족·가까운 지인만' },
  { id: 'undecided', label: '아직 모르겠어요', sub: '하객 수와 우선순위로 추천받기' },
]

export const PREP_STYLES: { id: PrepStyle; label: string; sub: string }[] = [
  { id: 'planner', label: '맡기고 싶어요', sub: '로망은 별로 없어요. 믿을 만한 플래너가 정해 주는 대로' },
  { id: 'romance', label: '로망이 있어요', sub: 'SNS로 저장해 둔 홀·드레스·사진 무드가 있어요' },
  { id: 'diy', label: '직접 다 볼래요', sub: '발품 팔아 하나하나 비교하고 고르는 게 좋아요' },
]

export const SDM_MODES_OPT: { id: SdmMode; label: string; sub: string }[] = [
  { id: 'total', label: '토탈 스튜디오', sub: '한 곳에서 촬영·드레스·메이크업' },
  { id: 'planner', label: '플래너 패키지', sub: '플래너가 묶어서 추천' },
  { id: 'diy', label: '업체별 발품', sub: '스튜디오, 드레스, 메이크업 따로' },
  { id: 'undecided', label: '아직 모르겠어요', sub: '스드메 탭에서 비교해 볼게요' },
]

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: 'parking', label: '주차' },
  { id: 'food', label: '식사' },
  { id: 'transit', label: '대중교통' },
  { id: 'hall', label: '홀 분위기' },
  { id: 'photo', label: '사진' },
  { id: 'cost', label: '비용' },
]
