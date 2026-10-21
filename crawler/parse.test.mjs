import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CATEGORIES, REGIONS } from './config.mjs'
import { coreName, mergeNews, mergeVendors, parseBlog, parseDaumBlog, parseKakao, parseNews, pickBlogTargets, summarizeBlog } from './parse.mjs'

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
const hall = CATEGORIES.find((c) => c.id === 'hall')
const dress = CATEGORIES.find((c) => c.id === 'dress')
const gangnam = REGIONS.find((r) => r.id === 'gangnam')

describe('카카오맵 검색', () => {
  const json = JSON.parse(fixture('kakao.json'))

  it('업체 이름, 좌표, 리뷰 수, 주차를 읽는다', () => {
    const vs = parseKakao(json, hall, gangnam)
    expect(vs.length).toBe(4)
    const sr = vs.find((v) => v.name === '상록아트홀')
    expect(sr).toMatchObject({ cat: 'hall', regions: ['gangnam'], parking: true, reviewCount: 1176, rating: 3.5 })
    expect(sr.lat).toBeCloseTo(37.5039, 3)
    expect(sr.lng).toBeCloseTo(127.0428, 3)
  })

  it('이름에 호텔이 들어간 예식장은 호텔로 분류한다', () => {
    const vs = parseKakao(json, hall, gangnam)
    expect(vs.find((v) => v.name.includes('엘리에나호텔')).cat).toBe('hotel')
  })

  it('분류가 맞지 않으면 뺀다', () => {
    expect(parseKakao(json, dress, gangnam)).toEqual([])
    expect(parseKakao({}, hall, gangnam)).toEqual([])
  })

  it('같은 업체는 지역을 합친다', () => {
    const a = parseKakao(json, hall, gangnam)
    const b = parseKakao(json, hall, { id: 'seocho' })
    const merged = mergeVendors([a, b])
    expect(merged.length).toBe(4)
    expect(merged[0].regions).toEqual(['gangnam', 'seocho'])
  })
})

describe('네이버 블로그 검색', () => {
  const posts = parseBlog(fixture('blog.html'))

  it('글마다 제목, 미리보기, 주소를 읽는다', () => {
    expect(posts.length).toBeGreaterThanOrEqual(3)
    expect(posts[0].url).toMatch(/^https:\/\/blog\.naver\.com\/[\w-]+\/\d+$/)
    expect(posts[0].title).toContain('상록아트홀')
    expect(posts[0].title).not.toContain('새 창 열림')
    expect(posts[0].snippet.length).toBeGreaterThan(10)
  })

  it('업체 이름이 나온 글만 세고 키워드를 모은다', () => {
    const s = summarizeBlog(posts, '상록아트홀')
    expect(s.posts).toBeGreaterThan(0)
    expect(s.top.length).toBeLessThanOrEqual(3)
    expect(summarizeBlog(posts, '전혀다른업체').posts).toBe(0)
  })

  it('불친절은 긍정으로 세지 않는다', () => {
    const s = summarizeBlog([{ url: 'u', title: 'A홀 후기', snippet: '직원이 불친절 했어요' }], 'A홀')
    expect(s).toMatchObject({ pos: 0, neg: 1 })
  })

  it("'추가금 0원'은 아쉬운 말로 세지 않는다", () => {
    const s = summarizeBlog([{ url: 'u', title: 'A홀 셀렉 후기, 추가금 0원 꿀팁', snippet: '' }], 'A홀')
    expect(s.neg).toBe(0)
  })

  it('협찬 글을 따로 센다', () => {
    const s = summarizeBlog([{ url: 'u', title: 'A홀 후기', snippet: '업체로부터 제공받아 작성' }], 'A홀')
    expect(s.ad).toBe(1)
  })

  it('좋은 점·아쉬운 점을 해시태그로 묶고 글 수를 센다', () => {
    const s = summarizeBlog(
      [
        { url: 'a', title: 'A홀 후기', snippet: '음식이 맛있고 주차장이 넓어서 좋았어요. 맛있다는 말 많이 들음' },
        { url: 'b', title: 'A홀 본식', snippet: '식사 맛있었지만 로비가 너무 혼잡했어요' },
        { url: 'c', title: 'A홀 셀렉 후기, 추가금 0원', snippet: '직원이 불친절' },
      ],
      'A홀',
    )
    expect(s.good).toEqual({ 식사맛집: 2, 주차편해요: 1 })
    expect(s.bad).toEqual({ 혼잡해요: 1, 불친절: 1 })
  })

  it('지점 이름을 떼고 비교한다', () => {
    expect(coreName('노블발렌티 대치점')).toBe('노블발렌티')
    expect(coreName('더채플앳 청담')).toBe('더채플앳청담')
  })
})

describe('다음 블로그 검색', () => {
  const posts = parseDaumBlog(fixture('daum.html'))

  it('카드마다 제목, 주소, 미리보기를 읽는다', () => {
    expect(posts.length).toBe(3)
    expect(posts[0].url).toMatch(/^https:\/\/blog\.naver\.com\//)
    expect(posts[0].title).toContain('상록아트홀')
    expect(posts[0].snippet.length).toBeGreaterThan(10)
  })

  it('강조 표시로 띄어진 업체 이름도 센다', () => {
    expect(summarizeBlog(posts, '상록아트홀').posts).toBe(3)
  })
})

describe('뉴스와 순서', () => {
  it('RSS에서 제목, 언론사, 날짜를 읽는다', () => {
    const news = parseNews(fixture('news.xml'))
    expect(news.length).toBe(3)
    expect(news[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(news[0].source).not.toBe('')
    expect(news[0].title.endsWith(news[0].source)).toBe(false)
  })

  it('같은 제목은 하나만 남기고 최신순으로 둔다', () => {
    const a = { title: '가 나', source: 's', url: 'u1', date: '2026-01-01' }
    const b = { title: '가나', source: 's', url: 'u2', date: '2026-02-01' }
    const c = { title: '다', source: 's', url: 'u3', date: '2026-03-01' }
    expect(mergeNews([[a, c], [b]]).map((n) => n.url)).toEqual(['u3', 'u2'])
  })

  it('후기는 안 본 곳, 오래된 곳부터 확인한다', () => {
    const vs = [
      { id: '1', reviewCount: 10 },
      { id: '2', reviewCount: 99 },
      { id: '3', reviewCount: 50 },
    ]
    const picked = pickBlogTargets(vs, { 2: { at: '2026-10-01' }, 3: { at: '2026-09-01' } }, 2)
    expect(picked.map((v) => v.id)).toEqual(['1', '3'])
  })
})
