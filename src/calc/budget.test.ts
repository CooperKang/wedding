import { describe, expect, it } from 'vitest'
import { applyPreset, summarize, upcoming } from './budget'
import type { BudgetCat, Item } from '../types'

const item = (over: Partial<Item>): Item => ({ id: 'x', cat: 'venue', name: '', vendor: '', budget: 0, payments: [], rating: 0, memo: '', tip: '', ...over })

const venue = item({
  id: 'v',
  name: '예식장',
  budget: 1500,
  payments: [
    { id: 'a', label: '계약금', amount: 100, due: '2026-09-01', paid: '2026-09-01', payer: 'us' },
    { id: 'b', label: '잔금', amount: 1300, due: '2027-05-15', paid: null, payer: 'groomParents' },
  ],
})
const sdm = item({
  id: 's',
  cat: 'sdm',
  name: '스드메',
  budget: 400,
  payments: [
    { id: 'c', label: '계약금', amount: 50, due: '2026-11-01', paid: null, payer: 'bride' },
    { id: 'd', label: '잔금', amount: 300, due: null, paid: null, payer: 'brideParents' },
  ],
})

describe('예산 집계', () => {
  const s = summarize([venue, sdm], [
    { id: '1', from: 'groomParents', amount: 2000, memo: '' },
    { id: '2', from: 'brideParents', amount: 1000, memo: '' },
  ])

  it('총예산, 실제, 낸 돈, 남은 돈', () => {
    expect(s).toMatchObject({ budget: 1900, spent: 1750, paid: 100, unpaid: 1650, support: 3000 })
  })

  it('분류별 합계', () => {
    expect(s.byCat).toEqual([
      { cat: 'venue', budget: 1500, spent: 1400, count: 1 },
      { cat: 'sdm', budget: 400, spent: 350, count: 1 },
    ])
  })

  it('낸 사람별 합계와 지원금', () => {
    const gp = s.byPayer.find((p) => p.payer === 'groomParents')!
    expect(gp).toEqual({ payer: 'groomParents', spent: 1300, paid: 0, support: 2000 })
    expect(s.byPayer.map((p) => p.payer)).toEqual(['us', 'bride', 'groomParents', 'brideParents'])
  })
})

describe('다가오는 지급', () => {
  it('안 낸 결제만 날짜순, 날짜 없는 것은 맨 뒤', () => {
    const u = upcoming([venue, sdm], '2026-12-01')
    expect(u.map((p) => p.id)).toEqual(['c', 'b', 'd'])
    expect(u[0].overdue).toBe(true)
    expect(u[1].overdue).toBe(false)
  })
})

describe('프리셋', () => {
  const make = (cat: BudgetCat, budget: number) => item({ id: cat, cat, budget })

  it('예산이 빈 항목만 채우고 없는 분류는 만든다', () => {
    const next = applyPreset([venue, item({ id: 'h', cat: 'honeymoon' })], { venue: 999, honeymoon: 500, invite: 30 }, make)
    expect(next.find((i) => i.id === 'v')!.budget).toBe(1500)
    expect(next.find((i) => i.id === 'h')!.budget).toBe(500)
    expect(next.find((i) => i.cat === 'invite')!.budget).toBe(30)
    expect(next).toHaveLength(3)
  })
})
