import { PHASES, tasksFor } from '../data/timeline'
import { BUDGET_CATS, catLabel } from '../data/budget'
import { BUDGET_STYLES, PREP_STYLES, SDM_MODES_OPT, VENUE_STYLES } from '../data/options'
import { regionLabel } from '../data/regions'
import { payerLabel, spent, summarize } from '../calc/budget'
import { man } from '../format'
import type { Saved } from '../types'

// 동생·친척에게 넘겨주는 '우리 결혼 준비 기록집'. 공유 보기와 인쇄에 같이 쓴다.
export default function Record({ data, hideMoney }: { data: Saved; hideMoney?: boolean }) {
  const { profile: p, checks, items, supports, notes } = data
  const s = summarize(items, supports)
  const tasks = tasksFor(p)
  const done = tasks.filter((t) => checks[t.id]).sort((a, b) => checks[a.id].localeCompare(checks[b.id]))
  const label = <T extends { id: string; label: string }>(list: T[], id: string) => list.find((x) => x.id === id)?.label ?? id
  const names = `${p.groomName || '예랑'} & ${p.brideName || '예신'}`

  return (
    <div className="space-y-6">
      <header className="foil rounded-2xl bg-sheet px-6 py-8 text-center">
        <p className="text-[12px] font-semibold tracking-[0.3em] text-gold">OUR WEDDING NOTE</p>
        <h1 className="mt-3 font-card text-[30px] font-bold">{names}의 결혼 준비 기록</h1>
        {p.weddingDate && <p className="mt-2 font-card text-[16px] text-muted">{p.weddingDate} 예식</p>}
        <p className="mt-4 text-[14px] text-muted">
          {regionLabel(p.region)} · 하객 약 {p.guests}명 · {label(BUDGET_STYLES, p.budgetStyle)} · {p.venueStyle === 'undecided' ? '예식 형태 미정' : label(VENUE_STYLES, p.venueStyle)} · 준비 스타일 &lsquo;{label(PREP_STYLES, p.prepStyle)}&rsquo; · 스드메 {p.sdmMode === 'undecided' ? '미정' : label(SDM_MODES_OPT, p.sdmMode)}
        </p>
      </header>

      {notes.trim() && (
        <section className="rounded-2xl border border-gold/50 bg-gold-soft/40 p-6">
          <h2 className="font-card text-[19px] font-bold">먼저 해 본 사람이 남기는 말</h2>
          <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">{notes}</p>
        </section>
      )}

      {!hideMoney && s.spent > 0 && (
        <section className="rounded-2xl border border-rule bg-sheet p-6">
          <h2 className="font-card text-[19px] font-bold">얼마 들었나</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[13px] text-muted">총예산</p>
              <p className="num text-[20px] font-bold">{man(s.budget)}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted">실제 지출</p>
              <p className="num text-[20px] font-bold text-rose">{man(s.spent)}</p>
            </div>
            {s.support > 0 && (
              <div>
                <p className="text-[13px] text-muted">양가 지원</p>
                <p className="num text-[20px] font-bold">{man(s.support)}</p>
              </div>
            )}
          </div>
          <table className="mt-4 w-full text-[14px]">
            <tbody>
              {s.byCat.map((c) => (
                <tr key={c.cat} className="border-b border-rule/60">
                  <td className="py-1.5">{catLabel(c.cat)}</td>
                  <td className="num py-1.5 text-right text-muted">예산 {man(c.budget)}</td>
                  <td className="num py-1.5 text-right font-semibold">{man(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {s.byPayer.length > 0 && (
            <p className="mt-3 text-[13px] text-muted">
              부담: {s.byPayer.filter((b) => b.spent > 0).map((b) => `${payerLabel(b.payer)} ${man(b.spent)}`).join(' · ')}
            </p>
          )}
        </section>
      )}

      {items.some((i) => i.vendor || i.tip || (i.memo && !hideMoney)) && (
        <section className="rounded-2xl border border-rule bg-sheet p-6">
          <h2 className="font-card text-[19px] font-bold">업체와 후기</h2>
          <ul className="mt-3 divide-y divide-rule">
            {BUDGET_CATS.flatMap((c) => items.filter((i) => i.cat === c.id && (i.vendor || i.tip || (i.memo && !hideMoney)))).map((i) => (
              <li key={i.id} className="py-3">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[12px] font-semibold text-gold">{catLabel(i.cat)}</span>
                  <span className="text-[16px] font-bold">{i.vendor || i.name}</span>
                  {i.rating > 0 && <span className="text-[14px] text-gold">{'★'.repeat(i.rating)}</span>}
                  {!hideMoney && spent(i) > 0 && <span className="num ml-auto text-[14px] text-muted">{man(spent(i))}</span>}
                </p>
                {i.tip && <p className="mt-1 text-[14px] leading-relaxed">{i.tip}</p>}
                {i.memo && !hideMoney && <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-muted">{i.memo}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section className="rounded-2xl border border-rule bg-sheet p-6">
          <h2 className="font-card text-[19px] font-bold">언제 무엇을 했나</h2>
          <p className="mt-1 text-[13px] text-muted">
            {tasks.length}개 중 {done.length}개 완료
          </p>
          <ol className="mt-3 space-y-1.5">
            {done.map((t) => (
              <li key={t.id} className="flex gap-3 text-[14px]">
                <span className="num w-24 shrink-0 text-muted">{checks[t.id]}</span>
                <span>
                  {t.title} <span className="text-[12px] text-muted">({PHASES.find((ph) => ph.id === t.phase)!.label} 권장)</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
