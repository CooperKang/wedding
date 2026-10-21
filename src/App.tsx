import { MOBILE_ROUTES, ROUTES, href, useRoute, type Route } from './router'
import { RouteIcon, Rings } from './components/Icon'
import { POLICY_AS_OF } from './data/policy'
import { resetAll } from './store'
import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Venue from './pages/Venue'
import Sdm from './pages/Sdm'
import Honeymoon from './pages/Honeymoon'
import More from './pages/More'
import Policy from './pages/Policy'
import Budget from './pages/Budget'
import Share from './pages/Share'
import View from './pages/View'

const PAGES: Record<Exclude<Route, 'view'>, () => React.JSX.Element> = {
  home: Home,
  timeline: Timeline,
  venue: Venue,
  sdm: Sdm,
  honeymoon: Honeymoon,
  more: More,
  policy: Policy,
  budget: Budget,
  share: Share,
}

export default function App() {
  const { route, arg } = useRoute()
  if (route === 'view') return <View code={arg} />
  const Page = PAGES[route]
  const mobile = ROUTES.filter((r) => MOBILE_ROUTES.includes(r.id))
  return (
    <div className="min-h-dvh pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="no-print sticky top-0 z-30 border-b border-rule/80 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:h-16">
          <a href={href('home')} className="flex shrink-0 items-center gap-2.5" aria-label="우리 결혼 준비 처음 화면">
            <Rings />
            <span className="font-card text-[17px] font-bold">우리 결혼 준비</span>
          </a>
          <nav className="ml-auto hidden lg:block" aria-label="주 메뉴">
            <ul className="flex items-center gap-0.5">
              {ROUTES.slice(1).map((r) => (
                <li key={r.id}>
                  <a
                    href={href(r.id)}
                    aria-current={route === r.id ? 'page' : undefined}
                    className="rounded-full px-3 py-2 text-[14px] font-semibold text-muted transition hover:text-ink aria-[current=page]:bg-rose aria-[current=page]:text-white"
                  >
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <details className="relative ml-auto lg:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center rounded-full border border-rule bg-white px-3.5 text-[13px] font-semibold">전체 메뉴</summary>
            <ul className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-rule bg-sheet py-1 shadow-lg">
              {ROUTES.map((r) => (
                <li key={r.id}>
                  <a href={href(r.id)} aria-current={route === r.id ? 'page' : undefined} className="block px-4 py-2.5 text-[14px] font-semibold aria-[current=page]:text-rose" onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}>
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <a href="https://cooperkang.github.io/" className="hidden text-[13px] font-medium text-muted underline-offset-4 hover:underline sm:inline lg:ml-1">
            서비스 허브
          </a>
        </div>
      </header>

      <main>
        <Page key={route} />
      </main>

      <footer className="no-print mx-auto mt-16 flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-4 pb-10 text-[13px] text-muted">
        <span>
          만든 사람 <a className="underline underline-offset-4" href="https://github.com/CooperKang">JaeHa Kang</a>
        </span>
        <a className="underline underline-offset-4" href="https://github.com/CooperKang/wedding">소스 코드</a>
        <span>정책은 {POLICY_AS_OF} 기준. 업체 정보는 공개 검색 결과를 모은 참고 자료예요.</span>
        <span>입력한 내용은 이 기기 브라우저에만 저장돼요.</span>
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => {
            if (confirm('입력한 내용(프로필, 체크, 장부)을 모두 지울까요? 먼저 기록·공유에서 파일로 저장해 두는 걸 권해요.')) resetAll()
          }}
        >
          전체 초기화
        </button>
      </footer>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-sheet/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="주 메뉴">
        <ul className="grid grid-cols-5">
          {mobile.map((r) => (
            <li key={r.id}>
              <a
                href={href(r.id)}
                aria-current={route === r.id ? 'page' : undefined}
                className="flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted aria-[current=page]:text-rose"
              >
                <RouteIcon id={r.id} className="size-[22px]" />
                {r.short}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
