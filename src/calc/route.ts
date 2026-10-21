// 스드메 발품 동선: 담은 업체를 어떤 순서로 돌면 이동이 가장 짧은지 추정한다.
// 실제 도로 경로는 카카오맵 길찾기 링크로 넘긴다.

export type Stop = { id: string; name: string; lat: number | null; lng: number | null; stay: number }

export const ROAD_FACTOR = 1.35 // 직선거리 → 도로 거리 보정
export const SPEED_KMH = 20 // 도심 평균 이동 속도(차·대중교통 섞어서 대략)
export const BUFFER_MIN = 10 // 구간마다 주차·도보 여유

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const roadKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => haversine(a, b) * ROAD_FACTOR
export const travelMin = (km: number) => Math.round((km / SPEED_KMH) * 60 + BUFFER_MIN)

type P = { lat: number; lng: number }
const pathLen = (pts: P[], order: number[]) => order.slice(1).reduce((n, j, k) => n + roadKm(pts[order[k]], pts[j]), 0)

function permutations(n: number): number[][] {
  if (n === 0) return [[]]
  const out: number[][] = []
  const rec = (cur: number[], rest: number[]) => {
    if (!rest.length) out.push(cur)
    for (let i = 0; i < rest.length; i++) rec([...cur, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)])
  }
  rec([], [...Array(n).keys()])
  return out
}

function nearest(pts: P[], start: number) {
  const order = [start]
  const left = new Set(pts.keys())
  left.delete(start)
  while (left.size) {
    const last = pts[order.at(-1)!]
    let best = -1
    for (const i of left) if (best < 0 || roadKm(last, pts[i]) < roadKm(last, pts[best])) best = i
    order.push(best)
    left.delete(best)
  }
  return order
}

// 끝이 열린 경로(돌아오지 않음)의 2-opt: 구간을 뒤집어 짧아지면 바꾼다
function twoOpt(pts: P[], order: number[], fixedStart: boolean) {
  let best = [...order]
  let improved = true
  while (improved) {
    improved = false
    for (let i = fixedStart ? 1 : 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const next = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)]
        if (pathLen(pts, next) + 1e-9 < pathLen(pts, best)) {
          best = next
          improved = true
        }
      }
    }
  }
  return best
}

// 좌표가 있는 곳의 순서를 정한다. startId가 있으면 그곳에서 출발한다.
export function bestOrder(stops: Stop[], startId?: string): Stop[] {
  const geo = stops.filter((s): s is Stop & P => s.lat !== null && s.lng !== null)
  const rest = stops.filter((s) => s.lat === null || s.lng === null)
  if (geo.length <= 2) {
    const s = geo.findIndex((g) => g.id === startId)
    return [...(s > 0 ? [geo[1], geo[0]] : geo), ...rest]
  }
  const start = geo.findIndex((g) => g.id === startId)
  let order: number[]
  if (geo.length <= 8) {
    const cands = permutations(geo.length).filter((o) => start < 0 || o[0] === start)
    order = cands.reduce((a, b) => (pathLen(geo, b) < pathLen(geo, a) ? b : a))
  } else {
    const starts = start >= 0 ? [start] : [...geo.keys()]
    order = starts.map((s) => twoOpt(geo, nearest(geo, s), start >= 0)).reduce((a, b) => (pathLen(geo, b) < pathLen(geo, a) ? b : a))
  }
  return [...order.map((i) => geo[i]), ...rest]
}

export type Leg = { stop: Stop; arrive: number; leave: number; km: number | null; move: number | null }

// 출발 시각(자정부터 분)부터 머무는 시간과 이동 시간을 더해 시각표를 만든다
export function schedule(order: Stop[], startMin: number): Leg[] {
  let t = startMin
  return order.map((stop, i) => {
    const prev = order[i - 1]
    let km: number | null = null
    let move: number | null = null
    if (prev && prev.lat !== null && prev.lng !== null && stop.lat !== null && stop.lng !== null) {
      km = roadKm(prev as P, stop as P)
      move = travelMin(km)
      t += move
    } else if (prev) {
      move = null
      t += 30 // 좌표를 모르면 30분으로 잡는다
    }
    const arrive = t
    t += stop.stay
    return { stop, arrive, leave: t, km, move }
  })
}

export const clock = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// 카카오맵 길찾기(출발→도착)
export function kakaoDirections(a: Stop, b: Stop) {
  const pt = (s: Stop) => `${encodeURIComponent(s.name.replace(/,/g, ' '))},${s.lat},${s.lng}`
  return `https://map.kakao.com/link/from/${pt(a)}/to/${pt(b)}`
}

export const kakaoPlace = (id: string) => `https://place.map.kakao.com/${id}`
