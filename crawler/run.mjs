// 공개 검색 결과를 모아 public/data/*.json으로 남긴다. GitHub Actions에서 주 1회 돈다.
// 소스마다 따로 실패할 수 있다. 0건이면 지난번 파일을 그대로 두고 meta.json에 상태만 적는다.
// 사용: node crawler/run.mjs [vendors|blog|news ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { BLOG_PER_RUN, CATEGORIES, NEWS_QUERIES, REGIONS } from './config.mjs'
import { mergeNews, mergeVendors, parseBlog, parseDaumBlog, parseKakao, parseNews, pickBlogTargets, summarizeBlog } from './parse.mjs'

const OUT = new URL('../public/data/', import.meta.url)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const today = () => new Date().toISOString().slice(0, 10)

async function get(url, headers = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9', ...headers }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (attempt >= 3) throw e
      await sleep(3000 * attempt)
    }
  }
}

async function readJson(name, fallback) {
  try {
    return JSON.parse(await readFile(new URL(name, OUT), 'utf8'))
  } catch {
    return fallback
  }
}

const writeJson = (name, data) => writeFile(new URL(name, OUT), JSON.stringify(data) + '\n')

async function crawlVendors() {
  const lists = []
  let failed = 0
  for (const region of REGIONS) {
    for (const cat of CATEGORIES) {
      for (let page = 1; page <= cat.pages; page++) {
        const q = encodeURIComponent(`${region.q} ${cat.q}`)
        try {
          const body = await get(`https://search.map.kakao.com/mapsearch/map.daum?q=${q}&msFlag=A&sort=0&page=${page}`, { Referer: 'https://map.kakao.com/' })
          lists.push(parseKakao(JSON.parse(body), cat, region))
        } catch (e) {
          failed++
          console.warn(`kakao ${region.id}/${cat.id}/${page}: ${e.message}`)
        }
        await sleep(1200)
      }
    }
  }
  const vendors = mergeVendors(lists)
  console.log(`vendors: ${vendors.length} (failed requests ${failed})`)
  if (!vendors.length) throw new Error('업체를 하나도 못 가져왔어요')
  await writeJson('vendors.json', vendors)
  return vendors.length
}

// 네이버 블로그 검색을 먼저 쓰고, 막히면(GitHub Actions 서버 IP는 403) 그 실행 동안은 다음 블로그 검색으로 바꾼다
const BLOG_SOURCES = [
  {
    name: 'naver',
    url: (q) => `https://search.naver.com/search.naver?ssc=tab.blog.all&query=${encodeURIComponent(q)}`,
    parse: parseBlog,
    empty: (html) => html.includes('검색결과가 없습니다'),
  },
  {
    name: 'daum',
    url: (q) => `https://search.daum.net/search?w=fusion&col=blog&q=${encodeURIComponent(q)}`,
    parse: parseDaumBlog,
    empty: (html) => html.includes('검색결과가 없습니다') || html.includes('result_none'),
  },
]

async function crawlBlog() {
  const vendors = await readJson('vendors.json', [])
  const reviews = await readJson('reviews.json', {})
  // BLOG_SOURCE=daum, BLOG_LIMIT=5 처럼 시험할 때 바꿀 수 있다
  const targets = pickBlogTargets(vendors, reviews, Number(process.env.BLOG_LIMIT) || BLOG_PER_RUN)
  let src = Math.max(0, BLOG_SOURCES.findIndex((b) => b.name === process.env.BLOG_SOURCE))
  let fails = 0
  let done = 0
  for (const v of targets) {
    const s = BLOG_SOURCES[src]
    try {
      const html = await get(s.url(`${v.name} 후기`))
      const posts = s.parse(html)
      // 결과 0건이 캡차·차단 화면 때문이면 기록하지 않는다
      if (!posts.length && !s.empty(html)) throw new Error('결과를 읽지 못함(차단 가능성)')
      reviews[v.id] = { ...summarizeBlog(posts, v.name), at: today() }
      done++
      fails = 0
    } catch (e) {
      console.warn(`blog(${s.name}) ${v.name}: ${e.message}`)
      if (++fails >= 3) {
        if (src + 1 >= BLOG_SOURCES.length) break // 모든 소스가 막히면 그만둔다
        src++
        fails = 0
        console.warn(`blog: ${BLOG_SOURCES[src].name}로 바꿈`)
      }
    }
    await sleep(2500)
  }
  console.log(`blog: ${done}/${targets.length} (${BLOG_SOURCES[src].name})`)
  if (!done) throw new Error('후기를 하나도 못 가져왔어요')
  // 사라진 업체의 후기는 지운다
  const ids = new Set(vendors.map((v) => v.id))
  for (const id of Object.keys(reviews)) if (!ids.has(id)) delete reviews[id]
  await writeJson('reviews.json', reviews)
  return done
}

async function crawlNews() {
  const lists = []
  for (const q of NEWS_QUERIES) {
    try {
      lists.push(parseNews(await get(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}+when:60d&hl=ko&gl=KR&ceid=KR:ko`)))
    } catch (e) {
      console.warn(`news ${q}: ${e.message}`)
    }
    await sleep(1000)
  }
  const news = mergeNews(lists)
  console.log(`news: ${news.length}`)
  if (!news.length) throw new Error('뉴스를 하나도 못 가져왔어요')
  await writeJson('news.json', news)
  return news.length
}

const SOURCES = { vendors: crawlVendors, blog: crawlBlog, news: crawlNews }

await mkdir(OUT, { recursive: true })
const meta = await readJson('meta.json', {})
const pick = process.argv.slice(2)
for (const [name, run] of Object.entries(SOURCES)) {
  if (pick.length && !pick.includes(name)) continue
  try {
    const count = await run()
    meta[name] = { ok: true, count, at: today() }
  } catch (e) {
    console.error(`${name} 실패: ${e.message}`)
    meta[name] = { ...meta[name], ok: false, error: e.message, tried: today() }
  }
}
await writeJson('meta.json', meta)
