import { describe, expect, it } from 'vitest'
import { bookingPlan, isPeak, monthsBefore } from './booking'
import { DEFAULT_PROFILE } from '../store'

describe('예식장 연락 시점', () => {
  it('봄·가을 주말만 인기 시간대로 본다', () => {
    expect(isPeak('2027-05-15')).toBe(true) // 토요일
    expect(isPeak('2027-05-12')).toBe(false) // 수요일
    expect(isPeak('2027-07-17')).toBe(false) // 여름 토요일
  })

  it('몇 개월 전 그 달 1일을 돌려준다', () => {
    expect(monthsBefore('2027-05-15', 14)).toBe('2026-03-01')
  })

  it('인기 시간대 웨딩홀은 14개월 전, 보편적으로는 12개월 전', () => {
    const plan = bookingPlan({ ...DEFAULT_PROFILE, weddingDate: '2027-05-15', venueStyle: 'hall' }, '2026-04-10')
    expect(plan).toMatchObject({ peak: true, from: '2026-03-01', usualFrom: '2026-05-01', late: false })
    expect(bookingPlan({ ...DEFAULT_PROFILE, weddingDate: '2027-05-15', venueStyle: 'hotel' }, '2026-10-21')).toMatchObject({ from: '2025-11-01', late: true })
  })
})
