import { PHASES, type Phase, type Task } from '../data/timeline'

const DAY = 86400000

// 'YYYY-MM-DD'를 현지 자정으로 읽는다(UTC로 읽으면 하루씩 밀린다)
export function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function addDays(s: string, n: number) {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function daysBetween(from: string, to: string) {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / DAY)
}

export function today() {
  return toISO(new Date())
}

// 예식까지 남은 날 → 지금 단계
export function phaseAt(daysLeft: number): Phase {
  if (daysLeft < 0) return PHASES.at(-1)!
  if (daysLeft === 0) return PHASES.find((p) => p.id === 'p9')!
  return PHASES.find((p) => (p.from === null || daysLeft <= p.from) && daysLeft > p.to) ?? PHASES[0]
}

// 단계의 실제 날짜 범위(예식일 기준)
export function phaseDates(p: Phase, wedding: string) {
  return {
    start: p.from === null ? null : addDays(wedding, -p.from),
    end: addDays(wedding, -p.to),
  }
}

// 'D-123', 'D-day', 'D+5'
export function dLabel(daysLeft: number) {
  if (daysLeft === 0) return 'D-day'
  return daysLeft > 0 ? `D-${daysLeft}` : `D+${-daysLeft}`
}

export function monthsLabel(days: number) {
  if (days >= 60) return `${Math.round(days / 30)}개월`
  if (days >= 14) return `${Math.round(days / 7)}주`
  return `${days}일`
}

// 남은 시간에 따라 준비 속도를 다르게 안내한다
export type Pace = 'relaxed' | 'normal' | 'tight' | 'rush'
export function paceOf(daysLeft: number): Pace {
  if (daysLeft >= 300) return 'relaxed'
  if (daysLeft >= 180) return 'normal'
  if (daysLeft >= 100) return 'tight'
  return 'rush'
}

// 이미 지난 단계에서 아직 못 한 중요한 일: 지금 바로 챙겨야 한다
export function overdue(tasks: Task[], checks: Record<string, string>, daysLeft: number) {
  return tasks.filter((t) => {
    if (checks[t.id]) return false
    const ph = PHASES.find((p) => p.id === t.phase)!
    if (t.must !== undefined) return daysLeft <= t.must
    return t.key === true && daysLeft <= ph.to
  })
}

// 지금 할 일: 밀린 일 먼저, 그다음 지금 단계의 중요한 일
export function nextTasks(tasks: Task[], checks: Record<string, string>, daysLeft: number | null, limit = 3) {
  const open = tasks.filter((t) => !checks[t.id])
  if (daysLeft === null) return open.filter((t) => t.key).slice(0, limit)
  const late = overdue(tasks, checks, daysLeft)
  const order = PHASES.map((p) => p.id)
  const cur = order.indexOf(phaseAt(daysLeft).id)
  const now = open.filter((t) => order.indexOf(t.phase) === cur && !late.includes(t)).sort((a, b) => Number(!!b.key) - Number(!!a.key))
  const soon = open.filter((t) => order.indexOf(t.phase) > cur && t.key)
  return [...late, ...now, ...soon].slice(0, limit)
}
