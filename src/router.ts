import { useEffect, useState } from 'react'

// GitHub Pages에서 새로고침해도 깨지지 않게 해시 주소(#/timeline)로 화면을 나눈다
export type Route = 'home' | 'timeline' | 'venue' | 'sdm' | 'more' | 'policy' | 'budget' | 'share' | 'view'

export const ROUTES: { id: Exclude<Route, 'view'>; label: string; short: string }[] = [
  { id: 'home', label: '처음', short: '처음' },
  { id: 'timeline', label: '타임라인', short: '일정' },
  { id: 'venue', label: '예식장', short: '예식장' },
  { id: 'sdm', label: '스드메', short: '스드메' },
  { id: 'more', label: '신혼여행·예물', short: '그 밖' },
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

export function href(route: Route) {
  return route === 'home' ? '#/' : `#/${route}`
}

export function useRoute() {
  const [p, setP] = useState<Parsed>(parse)
  useEffect(() => {
    const onHash = () => {
      setP(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return p
}
