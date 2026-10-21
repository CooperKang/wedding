import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, dLabel, nextTasks, overdue, paceOf, phaseAt, phaseDates } from './timeline'
import { PHASES, TASKS, tasksFor } from '../data/timeline'
import { DEFAULT_PROFILE } from '../store'

describe('날짜', () => {
  it('날짜 차이와 더하기', () => {
    expect(daysBetween('2026-10-21', '2027-05-15')).toBe(206)
    expect(addDays('2027-05-15', -30)).toBe('2027-04-15')
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28')
  })

  it('D-day 표시', () => {
    expect(dLabel(10)).toBe('D-10')
    expect(dLabel(0)).toBe('D-day')
    expect(dLabel(-3)).toBe('D+3')
  })
})

describe('단계', () => {
  it('남은 날로 지금 단계를 찾는다', () => {
    expect(phaseAt(400).id).toBe('p1')
    expect(phaseAt(300).id).toBe('p2')
    expect(phaseAt(45).id).toBe('p6')
    expect(phaseAt(3).id).toBe('p8')
    expect(phaseAt(0).id).toBe('p9')
    expect(phaseAt(-10).id).toBe('p10')
  })

  it('단계는 빈틈없이 이어진다', () => {
    for (let i = 1; i < PHASES.length; i++) expect(PHASES[i].from).toBe(PHASES[i - 1].to)
  })

  it('단계의 실제 날짜', () => {
    const p6 = PHASES.find((p) => p.id === 'p6')!
    expect(phaseDates(p6, '2027-05-15')).toEqual({ start: '2027-03-16', end: '2027-04-15' })
    expect(phaseDates(PHASES[0], '2027-05-15').start).toBeNull()
  })

  it('준비 속도', () => {
    expect(paceOf(365)).toBe('relaxed')
    expect(paceOf(200)).toBe('normal')
    expect(paceOf(120)).toBe('tight')
    expect(paceOf(60)).toBe('rush')
  })
})

describe('할 일', () => {
  it('모든 할 일은 있는 단계에 속하고 id가 겹치지 않는다', () => {
    const ids = new Set(PHASES.map((p) => p.id))
    expect(TASKS.every((t) => ids.has(t.phase))).toBe(true)
    expect(new Set(TASKS.map((t) => t.id)).size).toBe(TASKS.length)
  })

  it('프로필에 따라 할 일이 달라진다', () => {
    const outdoor = tasksFor({ ...DEFAULT_PROFILE, venueStyle: 'outdoor' }).map((t) => t.id)
    const hall = tasksFor({ ...DEFAULT_PROFILE, venueStyle: 'hall' }).map((t) => t.id)
    expect(outdoor).toContain('outdoor-plan-b')
    expect(hall).not.toContain('outdoor-plan-b')
    expect(tasksFor({ ...DEFAULT_PROFILE, prepStyle: 'romance' }).map((t) => t.id)).toContain('moodboard')
  })

  it('예식 5개월 전인데 예식장을 못 정했으면 밀린 일로 본다', () => {
    const late = overdue(TASKS, {}, 150).map((t) => t.id)
    expect(late).toContain('venue-contract')
    expect(overdue(TASKS, { 'venue-contract': '2026-10-01' }, 150).map((t) => t.id)).not.toContain('venue-contract')
  })

  it('지금 할 일은 밀린 일부터 보여 준다', () => {
    const next = nextTasks(TASKS, {}, 150, 3)
    expect(next).toHaveLength(3)
    expect(next[0].phase).toBe('p1')
  })

  it('예식일이 없으면 중요한 일 순서대로', () => {
    expect(nextTasks(TASKS, {}, null, 2).map((t) => t.id)).toEqual(['greet', 'meeting'])
  })
})
