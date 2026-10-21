import type { BudgetCat, Item, Payer, Payment, Support } from '../types'
import { catLabel } from '../data/budget'

export const PAYERS: { id: Payer; label: string }[] = [
  { id: 'us', label: '우리 둘(공동)' },
  { id: 'groom', label: '예랑' },
  { id: 'bride', label: '예신' },
  { id: 'groomParents', label: '예랑 부모님' },
  { id: 'brideParents', label: '예신 부모님' },
  { id: 'gift', label: '축의금' },
  { id: 'other', label: '그 밖' },
]

export const payerLabel = (p: Payer) => PAYERS.find((x) => x.id === p)?.label ?? p

export const spent = (it: Item) => it.payments.reduce((n, p) => n + p.amount, 0)
export const paidOf = (it: Item) => it.payments.reduce((n, p) => n + (p.paid ? p.amount : 0), 0)

export type Summary = {
  budget: number
  spent: number
  paid: number
  unpaid: number
  byCat: { cat: BudgetCat; budget: number; spent: number; count: number }[]
  byPayer: { payer: Payer; spent: number; paid: number; support: number }[]
  support: number
}

export function summarize(items: Item[], supports: Support[]): Summary {
  const cats = [...new Set(items.map((i) => i.cat))]
  const byCat = cats.map((cat) => {
    const its = items.filter((i) => i.cat === cat)
    return { cat, budget: its.reduce((n, i) => n + i.budget, 0), spent: its.reduce((n, i) => n + spent(i), 0), count: its.length }
  })
  const pays = items.flatMap((i) => i.payments)
  const payers = [...new Set([...pays.map((p) => p.payer), ...supports.map((s) => s.from)])]
  const byPayer = PAYERS.filter((p) => payers.includes(p.id)).map(({ id }) => ({
    payer: id,
    spent: pays.filter((p) => p.payer === id).reduce((n, p) => n + p.amount, 0),
    paid: pays.filter((p) => p.payer === id && p.paid).reduce((n, p) => n + p.amount, 0),
    support: supports.filter((s) => s.from === id).reduce((n, s) => n + s.amount, 0),
  }))
  const total = pays.reduce((n, p) => n + p.amount, 0)
  const paid = pays.reduce((n, p) => n + (p.paid ? p.amount : 0), 0)
  return {
    budget: items.reduce((n, i) => n + i.budget, 0),
    spent: total,
    paid,
    unpaid: total - paid,
    byCat,
    byPayer,
    support: supports.reduce((n, s) => n + s.amount, 0),
  }
}

export type Upcoming = Payment & { itemId: string; itemName: string; cat: BudgetCat; overdue: boolean }

// 아직 내지 않은 결제를 날짜순으로. 날짜를 안 정한 것은 맨 뒤에 둔다.
export function upcoming(items: Item[], today: string): Upcoming[] {
  return items
    .flatMap((it) => it.payments.filter((p) => !p.paid).map((p) => ({ ...p, itemId: it.id, itemName: it.name || it.vendor, cat: it.cat, overdue: !!p.due && p.due < today })))
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'))
}

// 예산 프리셋 적용: 이미 예산을 적은 항목은 그대로 두고, 없는 분류는 새로 만든다
export function applyPreset(items: Item[], preset: Partial<Record<BudgetCat, number>>, make: (cat: BudgetCat, budget: number) => Item): Item[] {
  const next = items.map((i) => (i.budget === 0 && preset[i.cat] !== undefined && !items.some((o) => o !== i && o.cat === i.cat && o.budget > 0) ? { ...i, budget: preset[i.cat]! } : i))
  const have = new Set(next.map((i) => i.cat))
  const added = (Object.entries(preset) as [BudgetCat, number][]).filter(([cat]) => !have.has(cat)).map(([cat, b]) => make(cat, b))
  return [...next, ...added]
}

// 스프레드시트(엑셀·구글 시트)로 열 수 있는 CSV. 결제 한 건이 한 줄이고, 결제가 없는 항목도 한 줄 남긴다.
// 엑셀이 한글을 깨뜨리지 않게 앞에 BOM을 붙인다.
export function toCsv(items: Item[]) {
  const cell = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = ['분류', '항목', '업체', '예산(만원)', '구분', '금액(만원)', '낼 날', '낸 사람', '낸 날', '메모']
  const rows = items.flatMap((it) => {
    const base = [catLabel(it.cat), it.name, it.vendor, it.budget]
    if (!it.payments.length) return [[...base, '', '', '', '', '', it.memo]]
    return it.payments.map((p, i) => [...base.map((v) => (i ? '' : v)), p.label, p.amount, p.due ?? '', payerLabel(p.payer), p.paid ?? '', i ? '' : it.memo])
  })
  return '\ufeff' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}
