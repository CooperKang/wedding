import { describe, expect, it } from 'vitest'
import { decodeShare, encodeShare } from './share'
import { EMPTY } from '../store'
import type { Saved } from '../types'
import { REGIONS } from '../data/regions'
import { REGIONS as CRAWL_REGIONS } from '../../crawler/config.mjs'

const saved: Saved = {
  ...EMPTY,
  profile: { ...EMPTY.profile, weddingDate: '2027-05-15', groomName: '민수', brideName: '지은' },
  checks: { greet: '2026-10-01' },
  items: [
    {
      id: 'v',
      cat: 'venue',
      name: '예식장',
      vendor: '어느 홀',
      budget: 1500,
      payments: [{ id: 'a', label: '계약금', amount: 100, due: '2026-09-01', paid: '2026-09-01', payer: 'groomParents' }],
      rating: 4,
      memo: '',
      tip: '주차가 넉넉해요',
    },
  ],
  supports: [{ id: 's', from: 'brideParents', amount: 1000, memo: '' }],
  notes: '동생아 박람회는 기준 정하고 가',
}

describe('공유 링크', () => {
  it('압축했다 풀면 그대로다', async () => {
    const code = await encodeShare(saved, false)
    expect(code).toMatch(/^1[\w-]+$/)
    const back = await decodeShare(code)
    expect(back).toEqual({ ...saved, hideMoney: false })
  })

  it('금액을 숨기면 금액·결제·메모·지원금이 링크에서 빠지고 팁은 남는다', async () => {
    const code = await encodeShare({ ...saved, items: [{ ...saved.items[0], memo: '식대 8.8만원' }] }, true)
    const back = await decodeShare(code)
    expect(back.hideMoney).toBe(true)
    expect(back.items[0].budget).toBe(0)
    expect(back.items[0].payments).toEqual([])
    expect(back.items[0].memo).toBe('')
    expect(back.picks).toEqual([])
    expect(back.items[0].tip).toBe('주차가 넉넉해요')
    expect(back.supports).toEqual([])
  })

  it('망가진 링크는 오류를 낸다', async () => {
    await expect(decodeShare('2abc')).rejects.toThrow()
    await expect(decodeShare('1!!!')).rejects.toThrow()
  })
})

describe('지역 목록', () => {
  it('사이트와 크롤러가 같은 지역 id를 쓴다', () => {
    expect(REGIONS.map((r) => r.id)).toEqual(CRAWL_REGIONS.map((r: { id: string }) => r.id))
  })
})
