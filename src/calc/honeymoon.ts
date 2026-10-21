import { destOf } from '../data/honeymoon'
import type { HoneyCat, Honeymoon } from '../types'

export const giftTotal = (h: Honeymoon) => h.gifts.reduce((n, g) => n + g.count * g.unit, 0)

// 여행지 추정치. 식비는 숙박 수 + 1일로 센다(도착·출발일 식사).
export function estimate(destId: string, nights: number): Record<Exclude<HoneyCat, 'gifts'>, number> {
  const c = destOf(destId).cost
  return {
    flight: c.flight,
    stay: c.stay * nights,
    food: c.food * (nights + 1),
    tour: c.tour * nights,
    transport: c.transport * nights + c.transfer,
    insurance: c.insurance,
    etc: c.etc,
  }
}

// 항목별 금액: 직접 고친 값이 있으면 그 값, 없으면 추정치. 선물은 선물 목록 합계.
export function honeyCosts(h: Honeymoon): Record<HoneyCat, number> {
  const est = estimate(h.dest, h.nights)
  const pick = (k: Exclude<HoneyCat, 'gifts'>) => h.costs[k] ?? est[k]
  return {
    flight: pick('flight'),
    stay: pick('stay'),
    food: pick('food'),
    tour: pick('tour'),
    transport: pick('transport'),
    gifts: h.costs.gifts ?? giftTotal(h),
    insurance: pick('insurance'),
    etc: pick('etc'),
  }
}

export const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

// 여행지마다 기본 일정으로 본 총액(선물 제외). 여행지 비교 카드에 쓴다.
export const destTotal = (destId: string, nights = destOf(destId).nights) => sum(estimate(destId, nights))

// 견적 비교: 1박당 가격과 빠진 확인 항목 수
export function quoteRows(h: Honeymoon, checks: string[]) {
  const rows = h.quotes.map((q) => ({ ...q, perNight: q.nights ? Math.round(q.price / q.nights) : 0, missing: checks.filter((c) => !q.inc.includes(c)).length }))
  const priced = rows.filter((r) => r.price > 0)
  const cheapest = priced.length > 1 ? priced.reduce((a, b) => (b.perNight < a.perNight ? b : a)).id : null
  return { rows, cheapest }
}

// 예식일이 있으면 출발하는 달(예식 다음 날 기준)
export function departMonth(weddingDate: string | null) {
  if (!weddingDate) return null
  const [y, m, d] = weddingDate.split('-').map(Number)
  return new Date(y, m - 1, d + 1).getMonth() + 1
}
