import { useEffect, useState } from 'react'
import type { Honeymoon, Item, Pick, Profile, Saved, Support } from './types'
import { DEFAULT_GIFTS, DESTS } from './data/honeymoon'

// 두 사람이 입력한 모든 것은 이 기기 브라우저에만 저장된다. 옮길 때는 파일이나 공유 링크를 쓴다.
export const DEFAULT_PROFILE: Profile = {
  weddingDate: null,
  guests: 200,
  budgetStyle: 'smart',
  venueStyle: 'undecided',
  prepStyle: 'planner',
  sdmMode: 'undecided',
  region: 'gangnam',
  priorities: [],
  groomName: '',
  brideName: '',
}

export const DEFAULT_HONEYMOON: Honeymoon = {
  dest: DESTS[0].id,
  nights: DESTS[0].nights,
  costs: {},
  gifts: DEFAULT_GIFTS.map((g, i) => ({ id: `g${i}`, ...g })),
  quotes: [],
}

export const EMPTY: Saved = { v: 1, profile: DEFAULT_PROFILE, checks: {}, items: [], supports: [], picks: [], notes: '', honeymoon: DEFAULT_HONEYMOON }

const KEY = 'wedding:v1'

// 저장본이나 가져온 파일에 빠진 칸이 있어도 기본값으로 채운다
export function normalize(raw: unknown): Saved {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<Saved>
  return {
    v: 1,
    profile: { ...DEFAULT_PROFILE, ...s.profile },
    checks: s.checks && typeof s.checks === 'object' ? s.checks : {},
    items: Array.isArray(s.items) ? s.items : [],
    supports: Array.isArray(s.supports) ? s.supports : [],
    picks: Array.isArray(s.picks) ? s.picks : [],
    notes: typeof s.notes === 'string' ? s.notes : '',
    honeymoon: normalizeHoneymoon(s.honeymoon),
  }
}

function normalizeHoneymoon(raw: unknown): Honeymoon {
  const h = (raw && typeof raw === 'object' ? raw : {}) as Partial<Honeymoon>
  return {
    dest: DESTS.some((d) => d.id === h.dest) ? h.dest! : DEFAULT_HONEYMOON.dest,
    nights: typeof h.nights === 'number' && h.nights > 0 ? h.nights : DEFAULT_HONEYMOON.nights,
    costs: h.costs && typeof h.costs === 'object' ? h.costs : {},
    gifts: Array.isArray(h.gifts) ? h.gifts : DEFAULT_HONEYMOON.gifts,
    quotes: Array.isArray(h.quotes) ? h.quotes : [],
  }
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalize(JSON.parse(raw))
  } catch {
    // 저장소를 못 쓰는 환경(사생활 보호 모드 등)이면 빈 장부로 시작한다
  }
  return EMPTY
}

let state = load()
const listeners = new Set<() => void>()

function commit(next: Saved) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // 저장 실패는 무시한다. 이번 방문 동안은 메모리에 남아 있다.
  }
  listeners.forEach((l) => l())
}

export const getState = () => state

export function setProfile(next: Partial<Profile>) {
  commit({ ...state, profile: { ...state.profile, ...next } })
}

export function toggleCheck(id: string, date: string) {
  const checks = { ...state.checks }
  if (checks[id]) delete checks[id]
  else checks[id] = date
  commit({ ...state, checks })
}

export function setItems(fn: (items: Item[]) => Item[]) {
  commit({ ...state, items: fn(state.items) })
}

export function setSupports(fn: (s: Support[]) => Support[]) {
  commit({ ...state, supports: fn(state.supports) })
}

export function setHoneymoon(fn: (h: Honeymoon) => Honeymoon) {
  commit({ ...state, honeymoon: fn(state.honeymoon) })
}

export function setPicks(fn: (p: Pick[]) => Pick[]) {
  commit({ ...state, picks: fn(state.picks) })
}

export function setNotes(notes: string) {
  commit({ ...state, notes })
}

export function replaceAll(next: Saved) {
  commit(normalize(next))
}

export function resetAll() {
  commit(EMPTY)
}

export function useStore() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return state
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}
