import { describe, expect, it } from 'vitest'
import { tone } from './crawled'
import type { Vendor } from '../types'

const v = (over: Partial<Vendor>): Vendor => ({ id: '1', name: 'A', cat: 'hall', regions: [], address: '', lat: 37, lng: 127, rating: 0, ratingCount: 0, reviewCount: 500, parking: false, tel: '', homepage: '', ...over })
const blog = (pos: number, neg: number, ad = 0) => ({ posts: 20, pos, neg, ad, top: [], at: '2026-10-21' })

describe('후기 신호', () => {
  it('근거가 없으면 판정하지 않는다(리뷰 수만 많아도)', () => {
    expect(tone(v({}))).toBe('unknown')
  })
  it('별점 높고 블로그도 긍정적이면 좋음', () => {
    expect(tone(v({ rating: 4.4, ratingCount: 40 }), blog(20, 2))).toBe('good')
  })
  it('별점이 낮거나 아쉬운 말이 많으면 엇갈림', () => {
    expect(tone(v({ rating: 3.1, ratingCount: 40 }), blog(20, 2))).toBe('mixed')
    expect(tone(v({}), blog(5, 10))).toBe('mixed')
  })
  it('협찬 글이 절반 넘으면 좋음으로 보지 않는다', () => {
    expect(tone(v({}), blog(20, 1, 15))).toBe('unknown')
  })
})
