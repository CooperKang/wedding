import { normalize } from '../store'
import type { Saved } from '../types'

// 공유 링크: 장부 JSON을 압축해서 주소 #/view/ 뒤에 붙인다. 서버에 아무것도 올라가지 않는다.
export type Shared = Saved & { hideMoney?: boolean }

function toB64url(bytes: Uint8Array) {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

// 금액을 숨기면 기록집에 보이는 것(업체, 별점, 팁, 일정)만 골라 담는다.
// 화면에서만 가리면 링크 안에는 남으므로 메모·결제·지원금·담은 업체는 아예 넣지 않는다.
export function stripMoney(s: Saved): Shared {
  return {
    v: 1,
    hideMoney: true,
    profile: s.profile,
    checks: s.checks,
    notes: s.notes,
    items: s.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, vendor: i.vendor, rating: i.rating, tip: i.tip, budget: 0, payments: [], memo: '' })),
    supports: [],
    picks: [],
    // 여행지와 박수만 남기고 금액·견적은 뺀다
    honeymoon: { dest: s.honeymoon.dest, nights: s.honeymoon.nights, costs: {}, gifts: [], quotes: [] },
  }
}

export async function encodeShare(s: Saved, hideMoney: boolean) {
  const data: Shared = hideMoney ? stripMoney(s) : s
  const z = await pipe(new TextEncoder().encode(JSON.stringify(data)), new CompressionStream('deflate-raw'))
  return `1${toB64url(z)}`
}

export async function decodeShare(code: string): Promise<Shared> {
  if (!code.startsWith('1')) throw new Error('알 수 없는 공유 링크예요')
  const raw = await pipe(fromB64url(code.slice(1)), new DecompressionStream('deflate-raw'))
  const obj = JSON.parse(new TextDecoder().decode(raw)) as Shared
  return { ...normalize(obj), hideMoney: obj.hideMoney === true }
}

export function shareUrl(code: string) {
  return `${location.origin}${location.pathname}#/view/${code}`
}
