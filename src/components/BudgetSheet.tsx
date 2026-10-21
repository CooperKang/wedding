import { Fragment, useState } from 'react'
import { setItems, uid } from '../store'
import { BUDGET_CATS, catLabel } from '../data/budget'
import { PAYERS, paidOf, spent, toCsv } from '../calc/budget'
import { man } from '../format'
import { Button, NumberInput, inputCls } from './ui'
import type { BudgetCat, Item, Payer, Payment } from '../types'

// 예산 장부를 스프레드시트처럼 한 표에서 고친다. 결제 한 건이 한 줄이고, 항목 칸은 그 결제 줄들을 묶는다.
const newItem = (cat: BudgetCat, budget = 0): Item => ({ id: uid(), cat, name: catLabel(cat), vendor: '', budget, payments: [], rating: 0, memo: '', tip: '' })
const LABELS = ['계약금', '중도금', '잔금', '추가금', '현장 결제']

const updateItem = (id: string, patch: Partial<Item>) => setItems((its) => its.map((i) => (i.id === id ? { ...i, ...patch } : i)))
const updatePay = (item: Item, pid: string, patch: Partial<Payment>) => updateItem(item.id, { payments: item.payments.map((p) => (p.id === pid ? { ...p, ...patch } : p)) })
const addPay = (item: Item, label: string) => updateItem(item.id, { payments: [...item.payments, { id: uid(), label, amount: 0, due: null, paid: null, payer: 'us' }] })

const cellCls = 'h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-[14px] outline-none hover:border-rule focus:border-rose focus:bg-white focus:ring-2 focus:ring-rose/20 placeholder:text-muted/50'
const th = 'border-b border-rule px-2 py-2 text-left text-[12px] font-semibold whitespace-nowrap text-muted'
const td = 'border-b border-rule/60 px-1 py-0.5 align-middle'
// 가로로 밀어도 항목 이름은 왼쪽에 붙어 있게
const sticky = 'sticky left-0 z-[1] bg-white'

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

export default function BudgetSheet({ items, now }: { items: Item[]; now: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [addCat, setAddCat] = useState<BudgetCat>('venue')
  const sorted = BUDGET_CATS.flatMap((c) => items.filter((i) => i.cat === c.id))
  const budget = items.reduce((n, i) => n + i.budget, 0)
  const total = items.reduce((n, i) => n + spent(i), 0)
  const paid = items.reduce((n, i) => n + paidOf(i), 0)

  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto rounded-xl border border-rule bg-white">
        <table className="w-full min-w-[960px] border-collapse text-[14px]">
          <thead className="bg-paper">
            <tr>
              <th className={`${th} ${sticky} bg-paper`}>항목</th>
              <th className={th}>업체</th>
              <th className={`${th} text-right`}>예산</th>
              <th className={th}>구분</th>
              <th className={`${th} text-right`}>금액</th>
              <th className={th}>낼 날</th>
              <th className={th}>낸 사람</th>
              <th className={th}>냈나요</th>
              <th className={th}>
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!sorted.length && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-[14px] text-muted">
                  아직 항목이 없어요. 위에서 예산 프리셋으로 채우거나 아래에서 항목을 추가하세요.
                </td>
              </tr>
            )}
            {sorted.map((it) => {
              const sum = spent(it)
              const over = it.budget > 0 && sum > it.budget
              const rows = it.payments.length + 1
              const isOpen = !!open[it.id]
              return (
                <Fragment key={it.id}>
                  {it.payments.map((p, i) => (
                    <tr key={p.id} className={i === 0 ? 'border-t-2 border-rule' : ''}>
                      {i === 0 && <ItemCells item={it} rows={rows} over={over} sum={sum} />}
                      <PayCells item={it} p={p} now={now} />
                    </tr>
                  ))}
                  <tr className={`bg-paper/50 ${it.payments.length ? '' : 'border-t-2 border-rule'}`}>
                    {!it.payments.length && <ItemCells item={it} rows={rows} over={over} sum={sum} />}
                    <td className={`${td} px-2 text-[12px] font-semibold text-muted`}>소계</td>
                    <td className={`${td} num px-2 text-right font-bold ${over ? 'text-alert' : ''}`}>{man(sum)}</td>
                    <td className={td} colSpan={3}>
                      <div className="flex flex-wrap gap-1 py-1">
                        {LABELS.slice(0, 3).map((l) => (
                          <button key={l} type="button" onClick={() => addPay(it, l)} className="rounded-md border border-rule bg-white px-2 py-1 text-[12px] font-semibold text-rose hover:border-rose">
                            + {l}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className={td}>
                      <button type="button" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [it.id]: !isOpen })} className="px-2 py-1 text-[12px] font-semibold whitespace-nowrap text-muted hover:text-ink">
                        {isOpen ? '메모 닫기' : `메모·팁${it.memo || it.tip || it.rating ? ' ●' : ''}`}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-paper/50">
                      <td colSpan={9} className="border-b border-rule/60 p-3">
                        <ItemNotes item={it} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
          {sorted.length > 0 && (
            <tfoot className="bg-paper font-bold">
              <tr className="border-t-2 border-ink/20">
                <td className={`${td} ${sticky} bg-paper px-2 py-2.5`}>합계</td>
                <td className={td} />
                <td className={`${td} num px-2 text-right`}>{man(budget)}</td>
                <td className={td} />
                <td className={`${td} num px-2 text-right ${budget > 0 && total > budget ? 'text-alert' : ''}`}>{man(total)}</td>
                <td className={`${td} px-2 text-[13px] font-semibold`} colSpan={4}>
                  <span className="text-sage">낸 돈 {man(paid)}</span>
                  <span className="mx-2 text-rule">|</span>
                  <span className="text-rose">낼 돈 {man(total - paid)}</span>
                  {budget > 0 && (
                    <>
                      <span className="mx-2 text-rule">|</span>
                      <span className={total > budget ? 'text-alert' : 'text-muted'}>{total > budget ? `예산 초과 ${man(total - budget)}` : `예산 남음 ${man(budget - total)}`}</span>
                    </>
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="text-[12px] text-muted lg:hidden">표가 화면보다 넓으면 옆으로 밀어 보세요. 항목 이름은 왼쪽에 붙어 있어요.</p>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="추가할 항목 분류" className={inputCls.replace('w-full', 'w-44')} value={addCat} onChange={(e) => setAddCat(e.target.value as BudgetCat)}>
          {BUDGET_CATS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <Button onClick={() => setItems((its) => [...its, newItem(addCat)])}>+ 항목 추가</Button>
        {items.length > 0 && (
          <Button tone="ghost" className="sm:ml-auto" onClick={() => download(`결혼예산장부_${now}.csv`, toCsv(sorted))}>
            엑셀·구글 시트로 내보내기(CSV)
          </Button>
        )}
      </div>
      <datalist id="pay-labels">
        {LABELS.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
    </div>
  )
}

function ItemCells({ item, rows, over, sum }: { item: Item; rows: number; over: boolean; sum: number }) {
  return (
    <>
      <td rowSpan={rows} className={`${td} ${sticky} w-40 border-r border-rule/60 align-top`}>
        <span className="block px-2 pt-1.5 text-[11px] font-semibold text-gold">{catLabel(item.cat)}</span>
        <input aria-label="항목 이름" className={`${cellCls} font-bold`} value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} />
      </td>
      <td rowSpan={rows} className={`${td} w-40 align-top`}>
        <input aria-label={`${item.name} 업체`} className={`${cellCls} mt-5`} value={item.vendor} placeholder="업체 이름" onChange={(e) => updateItem(item.id, { vendor: e.target.value })} />
      </td>
      <td rowSpan={rows} className={`${td} w-36 border-r border-rule/60 align-top`}>
        <div className="mt-5">
          <NumberInput cell value={item.budget} suffix="만" label={`${item.name} 예산`} onChange={(v) => updateItem(item.id, { budget: v })} />
        </div>
        {item.budget > 0 && sum > 0 && <span className={`num block px-2 pb-1 text-right text-[11px] ${over ? 'font-semibold text-alert' : 'text-muted'}`}>{over ? `${man(sum - item.budget)} 초과` : `${man(item.budget - sum)} 남음`}</span>}
      </td>
    </>
  )
}

function PayCells({ item, p, now }: { item: Item; p: Payment; now: string }) {
  return (
    <>
      <td className={`${td} w-28`}>
        <input list="pay-labels" aria-label="결제 구분" className={cellCls} value={p.label} onChange={(e) => updatePay(item, p.id, { label: e.target.value })} />
      </td>
      <td className={`${td} w-32`}>
        <NumberInput cell value={p.amount} suffix="만" label={`${item.name} ${p.label} 금액`} onChange={(v) => updatePay(item, p.id, { amount: v })} />
      </td>
      <td className={`${td} w-36`}>
        <input type="date" aria-label={`${p.label} 낼 날`} className={`${cellCls} num text-[13px]`} value={p.due ?? ''} onChange={(e) => updatePay(item, p.id, { due: e.target.value || null })} />
      </td>
      <td className={`${td} w-40`}>
        <select aria-label={`${p.label} 낸 사람`} className={`${cellCls} text-[13px]`} value={p.payer} onChange={(e) => updatePay(item, p.id, { payer: e.target.value as Payer })}>
          {PAYERS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
      </td>
      <td className={`${td} w-32`}>
        <label className="flex items-center gap-2 px-2 text-[13px] whitespace-nowrap">
          <input type="checkbox" className="size-4 accent-rose" checked={!!p.paid} onChange={(e) => updatePay(item, p.id, { paid: e.target.checked ? now : null })} />
          {p.paid ? <span className="num text-sage">{p.paid.slice(5).replace('-', '.')} 냄</span> : <span className="text-muted">아직</span>}
        </label>
      </td>
      <td className={`${td} w-24`}>
        <button type="button" className="px-2 text-[12px] text-muted hover:text-alert" onClick={() => updateItem(item.id, { payments: item.payments.filter((x) => x.id !== p.id) })}>
          결제 삭제
        </button>
      </td>
    </>
  )
}

function ItemNotes({ item }: { item: Item }) {
  return (
    <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr_auto] md:items-start">
      <fieldset>
        <legend className="text-[13px] font-semibold">만족도</legend>
        <div className="mt-1 flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n}점`} aria-pressed={item.rating >= n} onClick={() => updateItem(item.id, { rating: item.rating === n ? 0 : n })} className="px-0.5 text-[22px] leading-none text-rule aria-pressed:text-gold">
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
      <button
        type="button"
        className="self-end text-[13px] text-muted hover:text-alert"
        onClick={() => {
          if (confirm(`'${item.name || catLabel(item.cat)}' 항목을 지울까요?`)) setItems((its) => its.filter((i) => i.id !== item.id))
        }}
      >
        항목 삭제
      </button>
    </div>
  )
}
