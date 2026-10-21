import { useStore, toggleCheck } from '../store'
import { PHASES, tasksFor } from '../data/timeline'
import { daysBetween, monthsLabel, overdue, paceOf, phaseAt, phaseDates, today } from '../calc/timeline'
import { href } from '../router'
import { Bullets, Chip, Note, PageHead, Wrap } from '../components/ui'

const md = (s: string) => {
  const [, m, d] = s.split('-').map(Number)
  return `${m}.${d}`
}

const RUSH_TIPS = [
  '예식장: 비수기·일요일·저녁 시간이나 취소로 빈 "잔여 타임"을 물어보세요. 조건이 좋은 경우가 많아요.',
  '스드메: 토탈 스튜디오나 플래너 패키지로 한 번에 정하세요. 촬영을 생략하고 본식 스냅만 하는 커플도 많아요.',
  '청첩장: 모바일 청첩장을 먼저 돌리고, 종이는 어르신 위주로 소량만.',
  '포기 목록을 먼저 정하세요. 예단, 폐백, 앨범, 맞춤 한복은 생략하거나 대여로 바꿔도 돼요.',
]

export default function Timeline() {
  const { profile: p, checks } = useStore()
  const now = today()
  const days = p.weddingDate ? daysBetween(now, p.weddingDate) : null
  const cur = days !== null ? phaseAt(days) : null
  const tasks = tasksFor(p)
  const late = days !== null ? overdue(tasks, checks, days) : []
  const max = Math.max(...PHASES.map((ph) => tasks.filter((t) => t.phase === ph.id).length))
  const pace = days !== null ? paceOf(days) : null

  return (
    <>
      <PageHead
        kicker="TIMELINE"
        title="결혼 준비 타임라인"
        lead={
          p.weddingDate ? (
            <>예식일 {p.weddingDate} 기준으로 단계별 날짜를 계산했어요. 체크한 항목은 이 기기에 저장되고, 기록집에도 남아요.</>
          ) : (
            <>
              예식일을 넣으면 단계마다 실제 날짜가 나와요. <a className="font-semibold text-rose underline underline-offset-4" href={href('home')}>처음 화면에서 예식일 넣기</a>
            </>
          )
        }
      />

      <Wrap>
        <section aria-label="시기별 바쁜 정도" className="rounded-2xl border border-rule bg-sheet p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-card text-[19px] font-bold">언제가 제일 바쁠까?</h2>
            <p className="text-[13px] text-muted">막대 높이 = 그 시기 할 일 수</p>
          </div>
          <div className="mt-5 flex h-36 items-end gap-1.5 sm:gap-2.5">
            {PHASES.map((ph) => {
              const n = tasks.filter((t) => t.phase === ph.id).length
              const isCur = cur?.id === ph.id
              return (
                <a key={ph.id} href={`#/timeline`} onClick={(e) => (e.preventDefault(), document.getElementById(ph.id)?.scrollIntoView({ behavior: 'smooth' }))} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5" aria-label={`${ph.label} ${ph.title}, 할 일 ${n}개`}>
                  <span className="num text-[11px] text-muted">{n}</span>
                  <span
                    className={`w-full rounded-t-md transition group-hover:opacity-80 ${ph.busy === 'peak' ? 'bg-rose' : ph.busy ? 'bg-rose/60' : 'bg-gold/45'} ${isCur ? 'ring-2 ring-ink ring-offset-2 ring-offset-sheet' : ''}`}
                    style={{ height: `${Math.max(8, (n / max) * 100)}px` }}
                  />
                </a>
              )
            })}
          </div>
          <div className="mt-2 flex gap-1.5 sm:gap-2.5">
            {PHASES.map((ph) => (
              <span key={ph.id} className="min-w-0 flex-1 text-center text-[10px] leading-tight break-keep text-muted sm:text-[11px]">
                {ph.label.replace(' 전', '')}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-relaxed">
            <span className="font-bold text-rose">예식 1~2개월 전이 가장 바빠요.</span> 청첩장 모임, 본식 드레스, 식순, 잔금이 한꺼번에 몰려요. 그 전에 끝낼 수 있는 일(신혼여행 예약, 한복, 청첩장 제작)은 앞당겨 두세요.
          </p>
        </section>

        <div className="mt-6">
          <Note tone="plain" title="이 타임라인은 정답이 아니라 가이드예요">
            많은 커플이 거치는 순서를 모아 둔 거라 꼭 이대로 할 필요는 없어요. 웨딩 촬영, 폐백, 예단처럼 우리에게 필요 없는 일은 건너뛰고, 더 하고 싶은 일(브라이덜 샤워, 가족 여행, 직접 만드는 영상 등)은 얼마든지 더해도 돼요. &lsquo;늦어도 몇 개월 전&rsquo; 표시는 인기 업체와 뒤에 이어지는 일까지 생각한 여유 기준이고, 각 항목의 &lsquo;왜 이때까지일까요?&rsquo;를 열면 이유와 최소 시점을 볼 수 있어요.
          </Note>
        </div>

        {pace && (pace === 'tight' || pace === 'rush') && (
          <div className="mt-6">
            <Note tone="alert" title={`예식까지 ${monthsLabel(days!)} 남았어요. 압축해서 준비하세요.`}>
              <Bullets items={RUSH_TIPS} />
            </Note>
          </div>
        )}

        {late.length > 0 && (
          <div className="mt-6">
            <Note tone="alert" title={`시기가 지났는데 아직 못 한 일 ${late.length}개`}>
              {late.map((t) => t.title).join(', ')}. 아래에서 빨간 표시를 확인하세요.
            </Note>
          </div>
        )}

        <ol className="relative mt-8 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-rule md:before:left-[15px]">
          {PHASES.map((ph) => {
            const list = tasks.filter((t) => t.phase === ph.id)
            const dates = p.weddingDate ? phaseDates(ph, p.weddingDate) : null
            const isCur = cur?.id === ph.id
            const past = days !== null && cur && PHASES.indexOf(ph) < PHASES.indexOf(cur)
            const doneN = list.filter((t) => checks[t.id]).length
            return (
              <li key={ph.id} id={ph.id} className="relative scroll-mt-20 pl-9 md:pl-12">
                <span
                  className={`absolute top-5 left-[5px] size-[13px] rounded-full border-2 md:left-[9px] ${isCur ? 'pulse border-rose bg-rose' : past ? 'border-muted/50 bg-muted/40' : 'border-gold bg-sheet'}`}
                  aria-hidden
                />
                <section className={`rounded-2xl border bg-sheet p-5 md:p-6 ${isCur ? 'border-rose shadow-[0_10px_30px_-20px_rgb(142_52_69/0.6)]' : 'border-rule'} ${ph.busy ? 'busy' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-gold">{ph.label}</span>
                    {dates && <span className="num text-[13px] text-muted">{dates.start ? `${md(dates.start)} ~ ${md(dates.end)}` : `~ ${md(dates.end)}`}</span>}
                    {isCur && <Chip tone="rose">지금 여기</Chip>}
                    {ph.busy === 'peak' && <Chip tone="alert">가장 바쁨</Chip>}
                    {ph.busy === 'busy' && <Chip tone="gold">바쁨</Chip>}
                    <span className="num ml-auto text-[12px] text-muted">
                      {doneN}/{list.length}
                    </span>
                  </div>
                  <h2 className="mt-1 font-card text-[21px] font-bold">{ph.title}</h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{ph.lead}</p>
                  <ul className="mt-4 space-y-2">
                    {list.map((t) => {
                      const isLate = late.includes(t)
                      return (
                        <li key={t.id} className={`flex items-start gap-3 rounded-xl border bg-white p-3.5 ${isLate ? 'border-alert/60' : 'border-rule'}`}>
                          <input type="checkbox" className="mt-1 size-5 shrink-0 accent-rose" checked={!!checks[t.id]} onChange={() => toggleCheck(t.id, now)} aria-label={`${t.title} 완료`} id={`t-${t.id}`} />
                          <div className="min-w-0 flex-1">
                            <label htmlFor={`t-${t.id}`} className="block cursor-pointer">
                              <span className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[15px] font-bold ${checks[t.id] ? 'text-muted line-through' : ''}`}>{t.title}</span>
                                {t.key && <Chip tone="rose">핵심</Chip>}
                                {t.must !== undefined && <Chip tone={isLate ? 'alert' : 'plain'}>늦어도 {monthsLabel(t.must)} 전</Chip>}
                                {t.when && <Chip tone="gold">우리 맞춤</Chip>}
                              </span>
                              <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{t.detail}</span>
                              {checks[t.id] && <span className="num mt-1 block text-[12px] text-sage">{checks[t.id]} 완료</span>}
                            </label>
                            {t.why && (
                              <details className="group mt-2 rounded-lg bg-paper px-3 py-2 text-[13px] leading-relaxed">
                                <summary className="cursor-pointer list-none font-semibold text-rose">
                                  <span className="mr-1 inline-block transition group-open:rotate-90">›</span>왜 {monthsLabel(t.must!)} 전까지일까요?
                                </summary>
                                <p className="mt-1.5">{t.why.reason}</p>
                                {t.why.min && (
                                  <p className="mt-1.5 text-muted">
                                    <b className="text-ink">그런 걸 안 한다면</b> {t.why.min}
                                  </p>
                                )}
                              </details>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              </li>
            )
          })}
        </ol>
      </Wrap>
    </>
  )
}
