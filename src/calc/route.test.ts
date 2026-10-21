import { describe, expect, it } from 'vitest'
import { bestOrder, clock, haversine, kakaoDirections, schedule, type Stop } from './route'

const s = (id: string, lat: number | null, lng: number | null, stay = 60): Stop => ({ id, name: id, lat, lng, stay })

// 위도 0.01도 ≈ 1.1km. 일직선 위의 네 곳을 뒤섞어 넣는다.
const line = [s('c', 37.52, 127.0), s('a', 37.5, 127.0), s('d', 37.53, 127.0), s('b', 37.51, 127.0)]

describe('동선 순서', () => {
  it('일직선이면 끝에서 끝으로 간다', () => {
    const ids = bestOrder(line).map((x) => x.id)
    expect([ids.join(''), [...ids].reverse().join('')]).toContain('abcd')
  })

  it('출발지를 정하면 거기서 시작한다', () => {
    expect(bestOrder(line, 'd').map((x) => x.id)).toEqual(['d', 'c', 'b', 'a'])
  })

  it('좌표 없는 곳은 맨 뒤로 보낸다', () => {
    const ids = bestOrder([s('x', null, null), ...line]).map((x) => x.id)
    expect(ids.at(-1)).toBe('x')
  })

  it('9곳 이상이면 근사 해법으로도 일직선을 찾는다', () => {
    const many = [5, 1, 8, 3, 0, 9, 2, 7, 4, 6].map((k) => s(String(k), 37.5 + k * 0.01, 127.0))
    const ids = bestOrder(many).map((x) => x.id)
    const asc = [...Array(10).keys()].join('')
    expect([ids.join(''), [...ids].reverse().join('')]).toContain(asc)
  })

  it('두 곳 이하도 처리한다', () => {
    expect(bestOrder([s('a', 37.5, 127), s('b', 37.6, 127)], 'b').map((x) => x.id)).toEqual(['b', 'a'])
  })
})

describe('시각표', () => {
  it('머무는 시간과 이동 시간을 더한다', () => {
    const legs = schedule([s('a', 37.5, 127.0, 60), s('b', 37.51, 127.0, 60)], 600)
    expect(legs[0]).toMatchObject({ arrive: 600, leave: 660, km: null })
    expect(legs[1].km).toBeGreaterThan(1.4)
    expect(legs[1].arrive).toBe(660 + legs[1].move!)
    expect(clock(legs[0].arrive)).toBe('10:00')
  })

  it('직선거리', () => {
    expect(haversine({ lat: 37.5, lng: 127 }, { lat: 37.6, lng: 127 })).toBeCloseTo(11.1, 0)
  })

  it('카카오맵 길찾기 주소', () => {
    expect(kakaoDirections(s('A,홀', 37.5, 127), s('B', 37.6, 127))).toBe('https://map.kakao.com/link/from/A%20%ED%99%80,37.5,127/to/B,37.6,127')
  })
})
