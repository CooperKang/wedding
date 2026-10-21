import { useState } from 'react'
import { setItems, setSupports, uid, useStore } from '../store'
import { BUDGET_CATS, PRESETS, PRICE_SOURCES, areaOf, catLabel, presetFor, presetTotal } from '../data/budget'
import { PAYERS, applyPreset, payerLabel, spent, summarize, upcoming } from '../calc/budget'
import { today } from '../calc/timeline'
import { regionLabel } from '../data/regions'
import { man } from '../format'
import { Button, Chip, NumberInput, Note, PageHead, Panel, Stat, Wrap, inputCls } from '../components/ui'
import type { BudgetCat, BudgetStyle, Item, Payer, Payment } from '../types'

const newItem = (cat: BudgetCat, budget = 0): Item => ({ id: uid(), cat, name: catLabel(cat), vendor: '', budget, payments: [], rating: 0, memo: '', tip: '' })
const LABELS = ['계약금', '중도금', '잔금', '추가금', '현장 결제']

const updateItem = (id: string, patch: Partial<Item>) => setItems((its) => its.map((i) => (i.id === id ? { ...i, ...patch } : i)))
const updatePay = (item: Item, pid: string, patch: Partial<Payment>) => updateItem(item.id, { payments: item.payments.map((p) => (p.id === pid ? { ...p, ...patch } : p)) })

export default function Budget() {
  const { profile, items, supports } = useStore()
  const now = today()
  const s = summarize(items, supports)
  const up = upcoming(items, now)
  const [style, setStyle] = useState<BudgetStyle>(profile.budgetStyle)
  const [addCat, setAddCat] = useState<BudgetCat>('venue')
  const preset = presetFor(style, profile.region)
  // 지원금 중 아직 결제에 배정하지 않은 돈(지원해 준 사람 이름으로 잡힌 결제를 뺀다)
  const remainSupport = s.byPayer.reduce((n, p) => n + Math.max(0, p.support - p.spent), 0)

  return (
    <>
      <PageHead kicker="LEDGER" title="결혼 예산 장부" lead="예산을 먼저 정하고, 계약할 때마다 계약금·중도금·잔금과 낸 사람을 적어 두세요. 양가 부모님 지원금이 어디에 쓰였는지, 다음 잔금이 언제 얼마인지 한눈에 보여요. 금액은 만원 단위예요." />

      <Wrap className="space-y-6">
        <Panel title="1. 예산 정하기" aside={<span className="text-[13px] text-muted">{regionLabel(profile.region)}({areaOf(profile.region)}) 시세 반영</span>}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PRESETS.map((p) => {
              const v = presetFor(p.id, profile.region)
              return (
                <button key={p.id} type="button" aria-pressed={style === p.id} onClick={() => setStyle(p.id)} className="rounded-xl border border-rule bg-white p-4 text-left aria-pressed:border-rose aria-pressed:ring-1 aria-pressed:ring-rose">
                  <span className="block text-[14px] font-bold">{p.label}</span>
                  <span className="num mt-1 block font-card text-[24px] font-bold text-rose">{man(presetTotal(v))}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-muted">{p.desc}</span>
                </button>
              )
            })}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] sm:text-[14px]">
              <thead>
                <tr className="border-b border-rule text-left text-[12px] text-muted">
                  <th className="py-2 font-semibold">항목</th>
                  <th className="py-2 text-right font-semibold">{PRESETS.find((p) => p.id === style)!.label} 기준</th>
                  <th className="py-2 pl-3 font-semibold">근거</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_CATS.map((c) => (
                  <tr key={c.id} className="border-b border-rule/60">
                    <td className="py-1.5">
                      {c.label} <span className="hidden text-[12px] text-muted sm:inline">{c.hint}</span>
                    </td>
                    <td className="num py-1.5 text-right font-semibold">{man(preset[c.id])}</td>
                    <td className="py-1.5 pl-3">{PRESETS.find((p) => p.id === style)!.estimated.includes(c.id) ? <Chip>추정</Chip> : <Chip tone="sage">통계</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setItems((its) => applyPreset(its, preset, newItem))
              }}
            >
              이 금액으로 빈 예산 채우기
            </Button>
            <span className="text-[13px] text-muted">이미 예산을 적은 항목은 그대로 둬요.</span>
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            &lsquo;통계&rsquo;는{' '}
            {PRICE_SOURCES.map((x, i) => (
              <span key={x.url}>
                {i > 0 && ', '}
                <a className="underline underline-offset-2" href={x.url} target="_blank" rel="noreferrer">
                  {x.name}
                </a>
                ({x.note})
              </span>
            ))}
            의 수치이고, &lsquo;추정&rsquo;은 그 수치로 가늠한 값이에요. 신혼집·혼수는 빠져 있어요.
          </p>
        </Panel>

        <Panel title="2. 양가 지원금" aside={<span className="num text-[14px] font-bold text-rose">합계 {man(s.support)}</span>}>
          <p className="text-[14px] leading-relaxed text-muted">부모님이 도와주시기로 한 금액을 적어 두세요. 아래 결제마다 &lsquo;낸 사람&rsquo;을 고르면 지원금 중 얼마가 쓰였는지 계산돼요. 혼인 증여재산 공제(최대 1억원) 신고 근거로도 쓸 수 있어요.</p>
          <ul className="space-y-2">
            {supports.map((sp) => (
              <li key={sp.id} className="grid grid-cols-[1fr_1fr] gap-2 sm:grid-cols-[160px_160px_1fr_auto]">
                <select aria-label="지원해 주신 분" className={inputCls} value={sp.from} onChange={(e) => setSupports((ss) => ss.map((x) => (x.id === sp.id ? { ...x, from: e.target.value as Payer } : x)))}>
                  {PAYERS.filter((p) => p.id !== 'us' && p.id !== 'gift').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <NumberInput compact value={sp.amount} suffix="만원" label="지원 금액" onChange={(v) => setSupports((ss) => ss.map((x) => (x.id === sp.id ? { ...x, amount: v } : x)))} />
                <input aria-label="메모" className={`${inputCls} h-10`} placeholder="메모(예: 예식장 잔금용)" value={sp.memo} onChange={(e) => setSupports((ss) => ss.map((x) => (x.id === sp.id ? { ...x, memo: e.target.value } : x)))} />
                <button type="button" className="h-10 px-2 text-[13px] text-muted hover:text-alert" onClick={() => setSupports((ss) => ss.filter((x) => x.id !== sp.id))}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button tone="ghost" onClick={() => setSupports((ss) => [...ss, { id: uid(), from: 'groomParents', amount: 0, memo: '' }])}>
              + 예랑 부모님 지원
            </Button>
            <Button tone="ghost" onClick={() => setSupports((ss) => [...ss, { id: uid(), from: 'brideParents', amount: 0, memo: '' }])}>
              + 예신 부모님 지원
            </Button>
          </div>
        </Panel>

        <Panel title="3. 한눈에 보기">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="총예산" value={man(s.budget)} />
            <Stat label="계약·지출 합계" value={man(s.spent)} tone={s.spent > s.budget && s.budget > 0 ? 'alert' : undefined} sub={s.budget ? `예산의 ${Math.round((s.spent / s.budget) * 100)}%` : undefined} />
            <Stat label="이미 낸 돈" value={man(s.paid)} tone="sage" />
            <Stat label="앞으로 낼 돈" value={man(s.unpaid)} tone="rose" />
          </div>
          {s.byPayer.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] sm:text-[14px]">
                <thead>
                  <tr className="border-b border-rule text-left text-[12px] text-muted">
                    <th className="py-2 font-semibold">누가</th>
                    <th className="py-2 text-right font-semibold">지원 약속</th>
                    <th className="py-2 text-right font-semibold">맡은 금액</th>
                    <th className="py-2 text-right font-semibold">이미 낸 돈</th>
                  </tr>
                </thead>
                <tbody>
                  {s.byPayer.map((b) => (
                    <tr key={b.payer} className="border-b border-rule/60">
                      <td className="py-2 font-semibold">{payerLabel(b.payer)}</td>
                      <td className="num py-2 text-right">{b.support ? man(b.support) : '–'}</td>
                      <td className={`num py-2 text-right font-semibold ${b.support && b.spent > b.support ? 'text-alert' : ''}`}>{man(b.spent)}</td>
                      <td className="num py-2 text-right">{man(b.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.support > 0 && remainSupport >= 0 && <p className="text-[13px] text-muted">부모님 지원금 중 아직 결제에 배정하지 않은 금액: <b className="num text-ink">{man(remainSupport)}</b></p>}
          {s.byCat.length > 0 && (
            <ul className="space-y-2.5">
              {s.byCat.map((c) => {
                const max = Math.max(c.budget, c.spent, 1)
                return (
                  <li key={c.cat}>
                    <div className="flex justify-between text-[13px]">
                      <span className="font-semibold">{catLabel(c.cat)}</span>
                      <span className={`num ${c.spent > c.budget && c.budget > 0 ? 'text-alert' : 'text-muted'}`}>
                        {man(c.spent)} / {man(c.budget)}
                      </span>
                    </div>
                    <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-rule/70">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gold/50" style={{ width: `${(c.budget / max) * 100}%` }} />
                      <div className={`absolute inset-y-0 left-0 rounded-full ${c.spent > c.budget && c.budget > 0 ? 'bg-alert' : 'bg-rose'}`} style={{ width: `${(c.spent / max) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
              <li className="flex gap-4 text-[12px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-gold/50" />
                  예산
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose" />
                  계약·지출
                </span>
              </li>
            </ul>
          )}
        </Panel>

        <Panel title="4. 다가오는 지급" aside={<span className="text-[13px] text-muted">날짜순</span>}>
          {!up.length && <p className="text-[14px] text-muted">아직 내야 할 결제가 없어요. 아래 항목에 계약금·잔금을 추가해 보세요.</p>}
          <ol className="space-y-2">
            {up.map((u) => (
              <li key={u.id} className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 ${u.overdue ? 'border-alert/60' : 'border-rule'}`}>
                <span className={`num w-24 shrink-0 text-[14px] font-bold ${u.overdue ? 'text-alert' : ''}`}>{u.due ?? '날짜 미정'}</span>
                <span className="min-w-0 flex-1 text-[14px]">
                  <b>{u.itemName}</b> {u.label} · {payerLabel(u.payer)}
                  {u.overdue && <span className="ml-1.5 text-[12px] font-semibold text-alert">지났어요</span>}
                </span>
                <span className="num text-[15px] font-bold">{man(u.amount)}</span>
                <Button
                  tone="ghost"
                  onClick={() => {
                    const it = items.find((i) => i.id === u.itemId)!
                    updatePay(it, u.id, { paid: now })
                  }}
                >
                  냈어요
                </Button>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="5. 항목별 기록" aside={<span className="text-[13px] text-muted">{items.length}개 항목</span>}>
          {!items.length && <Note title="아직 항목이 없어요">위에서 예산 프리셋을 채우거나, 아래에서 항목을 추가하세요.</Note>}
          <div className="space-y-3">
            {BUDGET_CATS.flatMap((c) => items.filter((i) => i.cat === c.id)).map((it) => (
              <ItemCard key={it.id} item={it} now={now} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="추가할 항목 분류" className={`${inputCls} w-auto`} value={addCat} onChange={(e) => setAddCat(e.target.value as BudgetCat)}>
              {BUDGET_CATS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button onClick={() => setItems((its) => [...its, newItem(addCat)])}>+ 항목 추가</Button>
          </div>
        </Panel>
      </Wrap>
    </>
  )
}

function ItemCard({ item, now }: { item: Item; now: string }) {
  const [open, setOpen] = useState(item.payments.length === 0 && !item.vendor)
  const total = spent(item)
  const over = item.budget > 0 && total > item.budget
  return (
    <article className="rounded-xl border border-rule bg-white">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 p-4 text-left">
        <Chip tone="gold">{catLabel(item.cat)}</Chip>
        <span className="min-w-0 flex-1 text-[15px] font-bold">
          {item.name || catLabel(item.cat)}
          {item.vendor && <span className="ml-1.5 font-normal text-muted">{item.vendor}</span>}
        </span>
        <span className={`num text-[14px] ${over ? 'font-bold text-alert' : 'text-muted'}`}>
          {man(total)} / {man(item.budget)}
        </span>
        <span className="text-[12px] text-muted">{open ? '접기' : '펼치기'}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-rule p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-[13px] font-semibold">
              항목 이름
              <input className={`${inputCls} mt-1`} value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} />
            </label>
            <label className="block text-[13px] font-semibold">
              업체
              <input className={`${inputCls} mt-1`} value={item.vendor} placeholder="업체 이름" onChange={(e) => updateItem(item.id, { vendor: e.target.value })} />
            </label>
            <div className="text-[13px] font-semibold">
              예산
              <div className="mt-1">
                <NumberInput compact value={item.budget} suffix="만원" label="예산" onChange={(v) => updateItem(item.id, { budget: v })} />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold">결제</p>
            <ul className="space-y-2">
              {item.payments.map((p) => (
                <li key={p.id} className="grid grid-cols-2 gap-2 rounded-lg bg-paper p-2 sm:grid-cols-[120px_130px_150px_150px_1fr_auto] sm:items-center">
                  <input list="pay-labels" aria-label="결제 이름" className={`${inputCls} h-10`} value={p.label} onChange={(e) => updatePay(item, p.id, { label: e.target.value })} />
                  <NumberInput compact value={p.amount} suffix="만원" label="금액" onChange={(v) => updatePay(item, p.id, { amount: v })} />
                  <label className="text-[11px] text-muted">
                    낼 날
                    <input type="date" className={`${inputCls} h-9 text-[13px]`} value={p.due ?? ''} onChange={(e) => updatePay(item, p.id, { due: e.target.value || null })} />
                  </label>
                  <label className="text-[11px] text-muted">
                    낸 사람
                    <select className={`${inputCls} h-9 text-[13px]`} value={p.payer} onChange={(e) => updatePay(item, p.id, { payer: e.target.value as Payer })}>
                      {PAYERS.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-[13px] font-semibold">
                    <input type="checkbox" className="size-5 accent-rose" checked={!!p.paid} onChange={(e) => updatePay(item, p.id, { paid: e.target.checked ? now : null })} />
                    {p.paid ? <span className="num text-sage">{p.paid} 냄</span> : '아직'}
                  </label>
                  <button type="button" className="text-[13px] text-muted hover:text-alert" onClick={() => updateItem(item.id, { payments: item.payments.filter((x) => x.id !== p.id) })}>
                    삭제
                  </button>
                </li>
              ))}
            </ul>
            <datalist id="pay-labels">
              {LABELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap gap-2">
              {LABELS.slice(0, 3).map((l) => (
                <Button key={l} tone="ghost" onClick={() => updateItem(item.id, { payments: [...item.payments, { id: uid(), label: l, amount: 0, due: null, paid: null, payer: 'us' }] })}>
                  + {l}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr]">
            <fieldset>
              <legend className="text-[13px] font-semibold">만족도</legend>
              <div className="mt-1 flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n}점`} aria-pressed={item.rating >= n} onClick={() => updateItem(item.id, { rating: item.rating === n ? 0 : n })} className="px-0.5 text-[24px] leading-none text-rule aria-pressed:text-gold">
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-[13px] font-semibold">
              메모(투어 답변, 계약 조건)
              <textarea className={`${inputCls} mt-1 h-20 py-2`} value={item.memo} onChange={(e) => updateItem(item.id, { memo: e.target.value })} />
            </label>
            <label className="block text-[13px] font-semibold">
              다음 사람에게 남길 팁(기록집에 실려요)
              <textarea className={`${inputCls} mt-1 h-20 py-2`} value={item.tip} placeholder="예: 주차는 넉넉했지만 식당이 붐볐어요" onChange={(e) => updateItem(item.id, { tip: e.target.value })} />
            </label>
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-[13px] text-muted hover:text-alert"
              onClick={() => {
                if (confirm(`'${item.name || catLabel(item.cat)}' 항목을 지울까요?`)) setItems((its) => its.filter((i) => i.id !== item.id))
              }}
            >
              항목 삭제
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
