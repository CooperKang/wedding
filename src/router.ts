import { useEffect, useState } from 'react'

// GitHub Pages에서 새로고침해도 깨지지 않게 해시 주소(#/timeline)로 화면을 나눈다
export type Route = 'home' | 'timeline' | 'venue' | 'sdm' | 'honeymoon' | 'more' | 'policy' | 'budget' | 'share' | 'view'

export const ROUTES: { id: Exclude<Route, 'view'>; label: string; short: string }[] = [
  { id: 'home', label: '처음', short: '처음' },
  { id: 'timeline', label: '타임라인', short: '일정' },
  { id: 'venue', label: '예식장', short: '예식장' },
  { id: 'sdm', label: '스드메', short: '스드메' },
  { id: 'honeymoon', label: '신혼여행', short: '여행' },
  { id: 'more', label: '예물·청첩장', short: '그 밖' },
  { id: 'policy', label: '지원 정책', short: '정책' },
  { id: 'budget', label: '예산 장부', short: '장부' },
  { id: 'share', label: '기록·공유', short: '공유' },
]

// 모바일 아래 메뉴는 자주 쓰는 다섯 개만
export const MOBILE_ROUTES: Route[] = ['home', 'timeline', 'venue', 'sdm', 'budget']

type Parsed = { route: Route; arg: string }

function parse(): Parsed {
  const [id, ...rest] = location.hash.replace(/^#\/?/, '').split('/')
  if (id === 'view') return { route: 'view', arg: rest.join('/') }
  return { route: ROUTES.some((r) => r.id === id) ? (id as Route) : 'home', arg: rest.join('/') }
}

// anchor를 주면 그 화면으로 옮긴 뒤 id가 anchor인 곳으로 내려간다(#/venue/fair)
export function href(route: Route, anchor?: string) {
  if (route === 'home') return '#/'
  return anchor ? `#/${route}/${anchor}` : `#/${route}`
}

export function useRoute() {
  const [p, setP] = useState<Parsed>(parse)
  useEffect(() => {
    const onHash = () => setP(parse())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // 화면이 그려진 뒤(자식 effect가 먼저 돈다) 맨 위나 anchor로 옮긴다
  useEffect(() => {
    const el = p.route !== 'view' && p.arg ? document.getElementById(p.arg) : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [p])
  return p
}
