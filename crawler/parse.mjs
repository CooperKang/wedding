// 응답을 사이트가 쓰는 모양으로 바꾸는 순수 함수들. 네트워크 없이 fixture로 테스트한다.

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

function cateOf(p) {
  return [p.cate_name_depth1, p.cate_name_depth2, p.cate_name_depth3, p.cate_name_depth4, p.last_cate_name].filter(Boolean).join('>')
}

// 카카오맵 검색 응답 → 업체 목록. 분류가 맞지 않는 곳(검색어만 걸린 식당 등)은 뺀다.
export function parseKakao(json, cat, region) {
  const places = Array.isArray(json?.place) ? json.place : []
  return places
    .filter((p) => p.confirmid && p.name && cat.match.some((m) => cateOf(p).includes(m) || (cat.id === 'hotel' && p.name.includes('호텔'))))
    .map((p) => ({
      id: String(p.confirmid),
      name: String(p.name).trim(),
      cat: cat.id === 'hotel' || (cat.id !== 'small' && /호텔/.test(p.name) && cateOf(p).includes('예식장')) ? 'hotel' : cat.id,
      regions: [region.id],
      address: p.new_address || p.address || '',
      lat: Math.round(num(p.lat) * 1e6) / 1e6,
      lng: Math.round(num(p.lon) * 1e6) / 1e6,
      rating: num(p.rating_average),
      ratingCount: num(p.rating_count),
      reviewCount: num(p.reviewCount),
      parking: p.addinfo_parking === 'Y',
      tel: p.tel || '',
      homepage: p.homepage || '',
    }))
    .filter((v) => v.lat && v.lng)
}

// 같은 업체가 여러 지역 검색에 걸리면 지역만 합친다. 호텔로 판정된 적이 있으면 호텔로 둔다.
export function mergeVendors(lists) {
  const byId = new Map()
  for (const v of lists.flat()) {
    const prev = byId.get(v.id)
    if (!prev) {
      byId.set(v.id, { ...v, regions: [...v.regions] })
      continue
    }
    for (const r of v.regions) if (!prev.regions.includes(r)) prev.regions.push(r)
    if (v.cat === 'hotel') prev.cat = 'hotel'
  }
  return [...byId.values()]
}

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const text = (html) =>
  decode(html.replace(/<[^>]+>/g, ''))
    .replace(/새 창 열림/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const POSITIVE = ['친절', '만족', '추천', '깔끔', '맛있', '좋았', '예뻤', '예쁘', '최고', '꼼꼼', '여유']
export const NEGATIVE = ['불친절', '추가금', '추가 비용', '추가비용', '실망', '강매', '비추', '아쉬', '별로', '불만', '환불', '위약금', '좁아', '혼잡']
// '추가금 0원'처럼 부정어가 들어갔지만 좋은 말
export const NOT_NEGATIVE = ['추가금 0원', '추가금0원', '추가금 없', '추가금없', '추가비용 없', '추가 비용 없', '아쉬운 점 없', '아쉬움 없']
export const SPONSORED = ['협찬', '제공받', '원고료', '소정의', '지원받아', '체험단']

const count = (s, words) => words.reduce((n, w) => n + (s.split(w).length - 1), 0)

// 네이버 블로그 검색 결과 HTML → 글 목록(제목, 미리보기, 주소)
export function parseBlog(html) {
  const byUrl = new Map()
  const re = /<a\b[^>]*href="(https:\/\/blog\.naver\.com\/[\w-]+\/\d+)"[^>]*>([\s\S]*?)<\/a>/g
  for (const m of html.matchAll(re)) {
    const t = text(m[2])
    if (!t) continue
    const texts = byUrl.get(m[1]) ?? []
    if (!texts.includes(t)) texts.push(t)
    byUrl.set(m[1], texts)
  }
  return [...byUrl].map(([url, [title = '', snippet = '']]) => ({ url, title, snippet }))
}

// 업체 이름에서 지점·괄호를 떼고 핵심 이름만 남긴다(예: '노블발렌티 대치점' → '노블발렌티')
export function coreName(name) {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/\s+\S*(점|호점|지점|본점)$/, '')
    .replace(/\s+/g, '')
    .trim()
}

// 글 목록 → 후기 신호. 업체 이름이 제목·미리보기에 나온 글만 센다.
export function summarizeBlog(posts, vendorName) {
  const key = coreName(vendorName)
  const rel = posts.filter((p) => (p.title + p.snippet).replace(/\s+/g, '').includes(key))
  const all = rel.map((p) => `${p.title} ${p.snippet}`).join(' ')
  // '불친절' 안의 '친절'처럼 겹치는 말은 긍정에서 뺀다
  const neg = Math.max(0, count(all, NEGATIVE) - count(all, NOT_NEGATIVE))
  const pos = Math.max(0, count(all, POSITIVE) - count(all, ['불친절', '안 좋았', '별로 좋았']))
  return {
    posts: rel.length,
    pos,
    neg,
    ad: rel.filter((p) => count(p.title + p.snippet, SPONSORED) > 0).length,
    top: rel.slice(0, 3).map((p) => ({ t: p.title.slice(0, 80), u: p.url })),
  }
}

// 구글 뉴스 RSS → 기사 목록
export function parseNews(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1])
  const tag = (s, t) => {
    const m = s.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))
    return m ? decode(m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')).trim() : ''
  }
  return items
    .map((s) => {
      const full = tag(s, 'title')
      const source = tag(s, 'source')
      const title = source && full.endsWith(` - ${source}`) ? full.slice(0, -(source.length + 3)) : full
      const d = new Date(tag(s, 'pubDate'))
      return { title, source, url: tag(s, 'link'), date: Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10) }
    })
    .filter((n) => n.title && n.url)
}

// 여러 검색어로 모은 기사에서 제목이 같은 것을 빼고 최신순으로 자른다
export function mergeNews(lists, limit = 30) {
  const seen = new Set()
  return lists
    .flat()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((n) => {
      const k = n.title.replace(/\s+/g, '')
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, limit)
}

// 이번에 후기를 확인할 업체: 한 번도 안 본 곳, 오래전에 본 곳 순. 같으면 리뷰 많은 곳 먼저.
export function pickBlogTargets(vendors, reviews, limit) {
  return [...vendors]
    .sort((a, b) => (reviews[a.id]?.at ?? '').localeCompare(reviews[b.id]?.at ?? '') || b.reviewCount - a.reviewCount)
    .slice(0, limit)
}
