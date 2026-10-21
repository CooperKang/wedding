import type { VendorCat } from '../types'

export const CAT_LABEL: Record<VendorCat, string> = {
  hall: '웨딩홀',
  hotel: '호텔',
  small: '스몰웨딩',
  studio: '스튜디오',
  dress: '드레스',
  makeup: '메이크업',
  planner: '플래너',
  hanbok: '한복',
  jewelry: '예물',
}

// 동선 짤 때 업체마다 머무는 기본 시간(분)
const DEFAULT_STAY: Record<string, number> = { dress: 60, studio: 40, makeup: 30, hanbok: 40, jewelry: 40, planner: 60, custom: 40 }
export const stayFor = (cat: string) => DEFAULT_STAY[cat] ?? 40
