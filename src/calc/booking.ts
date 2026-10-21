import { BOOKING_LEADS, type BookingLead } from '../data/venues'
import type { Profile } from '../types'
import { parseDate, toISO } from './timeline'

// 봄(4~5월)·가을(9~11월) 주말은 인기 시간대 기준으로 본다
export const isPeak = (date: string) => {
  const d = parseDate(date)
  const m = d.getMonth() + 1
  return [4, 5, 9, 10, 11].includes(m) && (d.getDay() === 0 || d.getDay() === 6)
}

export const leadFor = (p: Profile): BookingLead => BOOKING_LEADS.find((b) => b.id === p.venueStyle) ?? BOOKING_LEADS[0]

export function monthsBefore(date: string, months: number) {
  const d = parseDate(date)
  d.setDate(1)
  d.setMonth(d.getMonth() - months)
  return toISO(d)
}

// 우리 예식일로 본 연락 시작 시점. 이미 지났으면 late.
export function bookingPlan(p: Profile, today: string) {
  const lead = leadFor(p)
  if (!p.weddingDate) return { lead, peak: false, from: null, usualFrom: null, late: false }
  const peak = isPeak(p.weddingDate)
  const from = monthsBefore(p.weddingDate, peak ? lead.popular : lead.usual)
  const usualFrom = monthsBefore(p.weddingDate, lead.usual)
  return { lead, peak, from, usualFrom, late: usualFrom.slice(0, 7) < today.slice(0, 7) }
}

export const ym = (s: string) => `${Number(s.slice(0, 4))}년 ${Number(s.slice(5, 7))}월`
