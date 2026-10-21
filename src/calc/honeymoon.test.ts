import { describe, expect, it } from 'vitest'
import { departMonth, destTotal, estimate, giftTotal, honeyCosts, quoteRows } from './honeymoon'
import { DEFAULT_HONEYMOON } from '../store'
import { DESTS } from '../data/honeymoon'

describe('신혼여행 예산', () => {
  it('박수에 따라 숙소·식비·투어가 늘어난다', () => {
    const a = estimate('bali', 4)
    const b = estimate('bali', 5)
    expect(b.stay - a.stay).toBe(45)
    expect(b.food - a.food).toBe(15)
    expect(b.flight).toBe(a.flight)
  })

  it('직접 고친 금액이 추정치보다 먼저고, 선물은 목록 합계다', () => {
    const h = { ...DEFAULT_HONEYMOON, dest: 'hawaii', nights: 6, costs: { flight: 300 } }
    const c = honeyCosts(h)
    expect(c.flight).toBe(300)
    expect(c.stay).toBe(330)
    expect(c.gifts).toBe(giftTotal(h))
    expect(giftTotal(h)).toBe(2 * 30 + 2 * 10 + 4 * 5 + 3 * 5)
  })

  it('모든 여행지가 12개월 추천도와 양수 총액을 가진다', () => {
    for (const d of DESTS) {
      expect(d.months).toHaveLength(12)
      expect(destTotal(d.id)).toBeGreaterThan(0)
    }
    expect(destTotal('vietnam')).toBeLessThan(destTotal('tahiti'))
  })

  it('견적은 1박당 가격으로 가장 싼 곳을 고르고 빠진 항목을 센다', () => {
    const h = {
      ...DEFAULT_HONEYMOON,
      quotes: [
        { id: 'a', name: 'A여행사', dest: 'bali', nights: 5, price: 700, inc: ['direct'], memo: '' },
        { id: 'b', name: '직접 예약', dest: 'bali', nights: 4, price: 520, inc: [], memo: '' },
      ],
    }
    const { rows, cheapest } = quoteRows(h, ['direct', 'room'])
    expect(rows[0]).toMatchObject({ perNight: 140, missing: 1 })
    expect(rows[1]).toMatchObject({ perNight: 130, missing: 2 })
    expect(cheapest).toBe('b')
  })

  it('출발 달은 예식 다음 날 기준이다', () => {
    expect(departMonth('2027-05-31')).toBe(6)
    expect(departMonth('2027-05-15')).toBe(5)
    expect(departMonth(null)).toBeNull()
  })
})
