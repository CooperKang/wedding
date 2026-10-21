import { describe, expect, it } from 'vitest'
import { headline, orderedChecks, prepOrder, rankVenues } from './advice'
import { DEFAULT_PROFILE } from '../store'

describe('준비 순서', () => {
  it('로망형은 예식장부터, 플래너형은 플래너 비교부터', () => {
    expect(prepOrder({ ...DEFAULT_PROFILE, prepStyle: 'romance' })[1].title).toContain('예식장')
    expect(prepOrder({ ...DEFAULT_PROFILE, prepStyle: 'planner' })[1].title).toContain('플래너')
    expect(prepOrder({ ...DEFAULT_PROFILE, prepStyle: 'diy' })[2].title).toContain('발품')
  })

  it('촉박하면 패키지를 권한다', () => {
    expect(headline(DEFAULT_PROFILE, 60)).toContain('빠듯')
  })
})

describe('예식장 추천', () => {
  it('하객 40명, 저예산이면 스몰웨딩이 위', () => {
    const r = rankVenues({ ...DEFAULT_PROFILE, guests: 40, budgetStyle: 'minimal' })
    expect(r[0].type.id).toBe('small')
  })

  it('하객 300명, 호화, 식사 중시면 호텔이 위', () => {
    const r = rankVenues({ ...DEFAULT_PROFILE, guests: 300, budgetStyle: 'luxury', priorities: ['food'] })
    expect(r[0].type.id).toBe('hotel')
  })

  it('하객 400명이면 야외는 아래로', () => {
    const r = rankVenues({ ...DEFAULT_PROFILE, guests: 400 })
    expect(r.at(-1)!.type.id).not.toBe('hall')
    expect(r.findIndex((x) => x.type.id === 'outdoor')).toBeGreaterThan(r.findIndex((x) => x.type.id === 'hall'))
  })

  it('주차를 중요하게 보면 주차 체크가 맨 위', () => {
    expect(orderedChecks({ ...DEFAULT_PROFILE, priorities: ['parking'] })[0].tag).toBe('parking')
  })
})
