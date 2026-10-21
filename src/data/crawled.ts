import { useEffect, useState } from 'react'
import type { Meta, News, Review, Vendor } from '../types'

// 크롤러가 주 1회 갱신하는 public/data/*.json을 한 번만 받아 화면끼리 나눠 쓴다
type Crawled = { vendors: Vendor[]; reviews: Record<string, Review>; news: News[]; meta: Meta }

let cache: Promise<Crawled> | null = null

async function getJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${name}`)
    return res.ok ? ((await res.json()) as T) : fallback
  } catch {
    return fallback
  }
}

function loadAll() {
  cache ??= Promise.all([getJson<Vendor[]>('vendors.json', []), getJson<Record<string, Review>>('reviews.json', {}), getJson<News[]>('news.json', []), getJson<Meta>('meta.json', {})]).then(
    ([vendors, reviews, news, meta]) => ({ vendors, reviews, news, meta }),
  )
  return cache
}

export function useCrawled() {
  const [data, setData] = useState<Crawled | null>(null)
  useEffect(() => {
    let alive = true
    loadAll().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [])
  return data
}

// 후기 신호 점수: 별점·리뷰 수(카카오)와 블로그 키워드를 섞는다. 정렬용 참고 값일 뿐이다.
export function signal(v: Vendor, r?: Review) {
  const kakao = v.ratingCount >= 5 ? (v.rating - 3) * Math.min(1, v.ratingCount / 50) : 0
  const volume = Math.log10(1 + v.reviewCount) / 3
  const blog = r && r.posts ? ((r.pos - r.neg * 1.5) / Math.max(4, r.posts)) * 0.8 - (r.ad / r.posts) * 0.5 : 0
  return kakao + volume + blog
}

// 근거가 충분할 때만 판정한다. 별점 10개 이상 또는 블로그 후기 5건 이상.
export function tone(v: Vendor, r?: Review): 'good' | 'mixed' | 'unknown' {
  const rated = v.ratingCount >= 10
  const blog = r && r.posts >= 5 && r.pos + r.neg >= 4 ? r : null
  if (!rated && !blog) return 'unknown'
  const posShare = blog ? blog.pos / (blog.pos + blog.neg) : null
  const mostlyAds = blog ? blog.ad / blog.posts >= 0.5 : false
  if ((rated && v.rating < 3.5) || (posShare !== null && posShare < 0.6)) return 'mixed'
  if (!mostlyAds && (!rated || v.rating >= 4) && (posShare === null || posShare >= 0.75)) return 'good'
  return 'unknown'
}
