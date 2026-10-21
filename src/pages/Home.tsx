import { useStore, setProfile, toggleCheck } from '../store'
import { BUDGET_STYLES, PREP_STYLES, PRIORITIES, SDM_MODES_OPT, VENUE_STYLES } from '../data/options'
import { REGIONS, regionLabel } from '../data/regions'
import { tasksFor } from '../data/timeline'
import { POLICIES } from '../data/policy'
import { PRESETS, presetFor, presetTotal } from '../data/budget'
import { dLabel, daysBetween, nextTasks, paceOf, phaseAt, today } from '../calc/timeline'
import { headline, prepOrder, rankVenues } from '../calc/advice'
import { href, type Route } from '../router'
import { man } from '../format'
import { ChoiceCards, Field, Chip, MultiChips, NumberField, Note, Panel, TextField, Wrap, inputCls } from '../components/ui'

const PACE_TEXT = {
  relaxed: '여유 있어요. 순서대로 하나씩 하면 돼요.',
  normal: '적당해요. 예식장부터 서두르세요.',
  tight: '빠듯해요. 예식장과 스드메를 동시에 진행하세요.',
  rush: '아주 촉박해요. 패키지로 한 번에 정하고, 포기할 것을 먼저 정하세요.',
}

export default function Home() {
  const { profile: p, checks } = useStore()
  const now = today()
  const days = p.weddingDate ? daysBetween(now, p.weddingDate) : null
  const phase = days !== null ? phaseAt(days) : null
  const tasks = tasksFor(p)
  const next = nextTasks(tasks, checks, days)
  const venues = rankVenues(p).slice(0, 2)
  const preset = presetFor(p.budgetStyle, p.region)
  const presetInfo = PRESETS.find((x) => x.id === p.budgetStyle)!
  const done = tasks.filter((t) => checks[t.id]).length
  const taxDeadline = POLICIES.find((x) => x.id === 'marriage-tax')!.deadline!
  const taxDays = daysBetween(now, taxDeadline)

  return (
    <>
      <Wrap className="pt-8 md:pt-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.18em] text-gold">예비 신혼부부를 위한 결혼 준비 플래너</p>
            <h1 className="mt-2 font-card text-[34px] leading-[1.2] font-bold md:text-[46px]">
              언제 무엇을 하면
              <br />
              여유로울까요?
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">
              우리 커플 성향을 몇 가지 고르면 준비 순서, 시기별 할 일, 예식장 고르는 기준, 스드메 동선, 양가 예산 장부까지 맞춰 드려요. 박람회부터 무작정 가기 전에 먼저 살펴보세요.
            </p>
          </div>
          <Invitation groom={p.groomName} bride={p.brideName} date={p.weddingDate} days={days} phaseTitle={phase?.title} progress={tasks.length ? done / tasks.length : 0} />
        </div>
      </Wrap>

      <Wrap className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="우리 커플 진단">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="예비 신랑 이름(선택)" value={p.groomName} onChange={(v) => setProfile({ groomName: v })} placeholder="예랑" />
            <TextField label="예비 신부 이름(선택)" value={p.brideName} onChange={(v) => setProfile({ brideName: v })} placeholder="예신" />
            <TextField
              label="예식일(정했다면)"
              type="date"
              value={p.weddingDate ?? ''}
              onChange={(v) => setProfile({ weddingDate: v || null })}
              hint={days === null ? '아직이면 비워 두세요. 날짜를 넣으면 타임라인이 실제 날짜로 바뀌어요.' : undefined}
            />
            <NumberField label="예상 하객 수(양가 합)" value={p.guests} onChange={(v) => setProfile({ guests: v })} suffix="명" />
            <Field label="예식 지역" htmlFor="region">
              <select id="region" className={inputCls} value={p.region} onChange={(e) => setProfile({ region: e.target.value })}>
                {[...new Set(REGIONS.map((r) => r.group))].map((g) => (
                  <optgroup key={g} label={g}>
                    {REGIONS.filter((r) => r.group === g).map((r) => (
                      <option key={r.id} value={r.id}>
                        {regionLabel(r.id)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>
          <ChoiceCards label="예산은 어떻게 생각하세요?" value={p.budgetStyle} options={BUDGET_STYLES} onChange={(v) => setProfile({ budgetStyle: v })} />
          <ChoiceCards label="준비하는 스타일은?" value={p.prepStyle} options={PREP_STYLES} onChange={(v) => setProfile({ prepStyle: v })} />
          <ChoiceCards label="원하는 예식 형태" value={p.venueStyle} options={VENUE_STYLES} onChange={(v) => setProfile({ venueStyle: v })} />
          <ChoiceCards label="스드메(스튜디오·드레스·메이크업)는?" value={p.sdmMode} options={SDM_MODES_OPT} onChange={(v) => setProfile({ sdmMode: v })} />
          <MultiChips label="예식장에서 특히 중요한 것" value={p.priorities} options={PRIORITIES} onChange={(v) => setProfile({ priorities: v })} hint="고른 항목은 예식장 투어 체크리스트 맨 위로 올라가요." />
        </Panel>

        <div className="space-y-6">
          <section className="rounded-2xl bg-rose p-5 text-white md:p-6">
            <p className="text-[13px] font-semibold text-white/75">우리 커플에게 한마디</p>
            <p className="mt-2 font-card text-[20px] leading-snug font-bold">{headline(p, days)}</p>
            {days !== null && days >= 0 && <p className="mt-3 text-[14px] text-white/85">남은 시간: {PACE_TEXT[paceOf(days)]}</p>}
          </section>

          {taxDays >= 0 && taxDays <= 120 && (
            <Note tone="alert" title={`결혼 세액공제는 ${taxDeadline.slice(0, 4)}년 12월 31일 혼인신고분까지 확정돼 있어요 (${taxDays}일 남음)`}>
              부부 최대 100만원. 예식이 내년이어도 혼인신고를 먼저 하면 받을 수 있어요. 대출·청약 조건과 함께 따져 보세요.{' '}
              <a className="font-semibold underline underline-offset-4" href={href('policy')}>
                지원 정책 보기
              </a>
            </Note>
          )}

          <Panel title="지금 할 일" aside={<a className="text-[13px] font-semibold text-rose" href={href('timeline')}>전체 타임라인 →</a>}>
            <ul className="space-y-2">
              {next.map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-xl border border-rule bg-white p-3.5">
                  <input type="checkbox" className="mt-1 size-5 accent-rose" checked={!!checks[t.id]} onChange={() => toggleCheck(t.id, now)} aria-label={`${t.title} 완료`} />
                  <div>
                    <p className="text-[15px] font-bold">{t.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{t.detail}</p>
                  </div>
                </li>
              ))}
              {!next.length && <p className="text-[14px] text-muted">지금 단계의 할 일을 모두 마쳤어요.</p>}
            </ul>
          </Panel>

          <Panel title="우리에게 맞는 준비 순서">
            <ol className="space-y-3">
              {prepOrder(p).map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-soft font-card text-[14px] font-bold text-[#6f5223]">{i + 1}</span>
                  <div>
                    <p className="text-[15px] font-bold">
                      {s.to ? (
                        <a href={href(s.to as Route)} className="underline-offset-4 hover:underline">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </Wrap>

      <Wrap className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="어울리는 예식장 유형" aside={<a className="text-[13px] font-semibold text-rose" href={href('venue')}>예식장 고르기 →</a>}>
          {venues.map((v, i) => (
            <div key={v.type.id} className="rounded-xl border border-rule bg-white p-4">
              <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold">
                {i === 0 && <Chip tone="rose">가장 잘 맞아요</Chip>}
                {v.type.name}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{v.type.fits}</p>
              {v.reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {v.reasons.map((r) => (
                    <Chip key={r} tone="gold">
                      {r}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Panel>

        <Panel title={`${presetInfo.label} 예산이면 대략`} aside={<a className="text-[13px] font-semibold text-rose" href={href('budget')}>예산 장부 →</a>}>
          <p className="num font-card text-[34px] font-bold text-rose">{man(presetTotal(preset))}</p>
          <p className="text-[13px] leading-relaxed text-muted">
            {presetInfo.desc}. {regionLabel(p.region)} 시세 반영, 신혼집·혼수 제외. 소비자원 참가격(2026년 8월)과 듀오 2026 보고서를 바탕으로 한 대략값이에요.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px]">
            <span className="text-muted">예식장</span>
            <span className="num text-right font-semibold">{man(preset.venue)}</span>
            <span className="text-muted">스드메</span>
            <span className="num text-right font-semibold">{man(preset.sdm)}</span>
            <span className="text-muted">신혼여행</span>
            <span className="num text-right font-semibold">{man(preset.honeymoon)}</span>
            <span className="text-muted">예물·예단</span>
            <span className="num text-right font-semibold">{man(preset.rings + preset.gifts)}</span>
          </div>
        </Panel>
      </Wrap>

      <Wrap className="mt-6">
        <Note tone="rose" title="박람회는 무작정 가지 마세요">
          기준 없이 가면 &ldquo;오늘만 이 가격&rdquo;에 계약금부터 걸기 쉬워요. 예산 상한, 하객 수, 원하는 날짜·지역을 정하고, 후보 업체 부스만 들러 같은 조건으로 견적을 받아 오세요.{' '}
          <a className="font-semibold underline underline-offset-4" href={href('venue') + '#fair'}>
            박람회 사용법
          </a>
        </Note>
      </Wrap>
    </>
  )
}

function Invitation({ groom, bride, date, days, phaseTitle, progress }: { groom: string; bride: string; date: string | null; days: number | null; phaseTitle?: string; progress: number }) {
  const d = date ? new Date(`${date}T00:00:00`) : null
  return (
    <div className="foil relative mx-auto w-full max-w-sm rounded-[18px] bg-sheet px-8 py-10 text-center shadow-[0_18px_40px_-24px_rgb(100_33_47/0.45)]">
      <p className="text-[12px] font-semibold tracking-[0.3em] text-gold">WEDDING INVITATION</p>
      <p className="mt-5 font-card text-[26px] font-bold">
        {groom || '예랑'} <span className="text-rose">&amp;</span> {bride || '예신'}
      </p>
      <div className="mx-auto my-5 h-px w-16 bg-gold/60" />
      {d ? (
        <>
          <p className="font-card text-[17px]">
            {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일 {'일월화수목금토'[d.getDay()]}요일
          </p>
          <p className="num mt-3 font-card text-[44px] leading-none font-bold text-rose">{dLabel(days!)}</p>
          {phaseTitle && <p className="mt-3 text-[14px] text-muted">지금은 &lsquo;{phaseTitle}&rsquo; 단계</p>}
        </>
      ) : (
        <p className="text-[15px] leading-relaxed text-muted">
          예식일을 정하면
          <br />
          여기에 D-day가 나와요
        </p>
      )}
      <div className="mt-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-rule">
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="num mt-1.5 text-[12px] text-muted">준비 {Math.round(progress * 100)}%</p>
      </div>
    </div>
  )
}
