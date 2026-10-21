import { useState } from 'react'
import { setPicks, uid, useStore } from '../store'
import { bestOrder, clock, kakaoDirections, kakaoPlace, schedule, type Stop } from '../calc/route'
import { CAT_LABEL } from '../data/vendorCats'
import { Button, Chip, Field, NumberInput, Note, inputCls } from './ui'

export default function RoutePlanner() {
  const { picks } = useStore()
  const days = [...new Set(picks.map((p) => p.day))].sort((a, b) => a - b)
  const [day, setDay] = useState(days[0] ?? 1)
  const [start, setStart] = useState('11:00')
  const [from, setFrom] = useState('')
  const [custom, setCustom] = useState('')
  const today = picks.filter((p) => p.day === day)

  if (!picks.length)
    return (
      <p className="rounded-xl border border-dashed border-rule p-6 text-center text-[14px] leading-relaxed text-muted">
        위 목록에서 가 보고 싶은 업체를 &lsquo;담기&rsquo; 하세요.
        <br />
        담은 곳으로 하루 방문 순서와 시각표를 짜 드려요.
      </p>
    )

  const stops: Stop[] = today.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, stay: p.stay }))
  const order = bestOrder(stops, from || undefined)
  const [h, m] = start.split(':').map(Number)
  const legs = schedule(order, h * 60 + m)
  const totalKm = legs.reduce((n, l) => n + (l.km ?? 0), 0)
  const totalMove = legs.reduce((n, l) => n + (l.move ?? 0), 0)
  const noGeo = today.filter((p) => p.lat === null)
  const maxDay = Math.max(1, ...days)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        {[...new Set([...days, day])].sort((a, b) => a - b).map((d) => (
          <button key={d} type="button" aria-pressed={d === day} onClick={() => setDay(d)} className="min-h-9 rounded-full border border-rule bg-white px-3.5 text-[13px] font-semibold text-muted aria-pressed:border-rose aria-pressed:bg-rose aria-pressed:text-white">
            {d}일차 ({picks.filter((p) => p.day === d).length})
          </button>
        ))}
        <Button tone="plain" onClick={() => setDay(maxDay + 1)}>
          + 날짜 추가
        </Button>
      </div>

      {today.length > 5 && <Note tone="alert" title="하루에 너무 많아요">드레스 투어는 하루 3~4곳이 한계예요. 다른 날로 나눠 보세요(각 업체의 &lsquo;날짜&rsquo;를 바꾸면 돼요).</Note>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="출발 시각" htmlFor="r-start">
          <input id="r-start" type="time" className={inputCls} value={start} onChange={(e) => setStart(e.target.value || '11:00')} />
        </Field>
        <Field label="첫 방문지" htmlFor="r-from">
          <select id="r-from" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">가장 짧은 순서로 자동</option>
            {today
              .filter((p) => p.lat !== null)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!custom.trim()) return
            setPicks((ps) => [...ps, { id: `c-${uid()}`, name: custom.trim(), cat: 'custom', lat: null, lng: null, stay: 40, day, memo: '' }])
            setCustom('')
          }}
        >
          <Field label="목록에 없는 곳 추가" htmlFor="r-custom">
            <input id="r-custom" className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="업체 이름" />
          </Field>
          <Button type="submit" tone="ghost">
            추가
          </Button>
        </form>
      </div>

      {today.length > 0 ? (
        <>
          <div className="rounded-xl bg-rose-soft/60 px-4 py-3 text-[14px]">
            <b>{day}일차 추천 순서</b> · 이동 약 <span className="num font-semibold">{totalKm.toFixed(1)}km</span>, <span className="num font-semibold">{totalMove}분</span>
            {legs.length > 0 && (
              <>
                {' '}
                · 끝나는 시각 <span className="num font-semibold">{clock(legs.at(-1)!.leave)}</span>
              </>
            )}
            <span className="block text-[12px] text-muted">직선거리에 도로 보정을 곱해 추정했어요(평균 시속 20km, 구간마다 10분 여유). 실제 길은 구간별 카카오맵 길찾기로 확인하세요.</span>
          </div>
          <ol className="space-y-2">
            {legs.map((l, i) => {
              const pick = today.find((p) => p.id === l.stop.id)!
              const prev = legs[i - 1]
              return (
                <li key={l.stop.id}>
                  {prev && (
                    <div className="flex items-center gap-2 py-1 pl-4 text-[12px] text-muted">
                      <span className="h-5 w-px bg-rule" aria-hidden />
                      {l.km !== null ? (
                        <>
                          이동 약 {l.km.toFixed(1)}km · {l.move}분{' '}
                          <a className="font-semibold text-rose underline-offset-2 hover:underline" href={kakaoDirections(prev.stop, l.stop)} target="_blank" rel="noreferrer">
                            길찾기
                          </a>
                        </>
                      ) : (
                        '위치 정보가 없어 이동 30분으로 잡았어요'
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rule bg-white p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose font-card text-[14px] font-bold text-white">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[15px] font-bold">
                        {pick.name}
                        <Chip>{pick.cat === 'custom' ? '직접 추가' : CAT_LABEL[pick.cat]}</Chip>
                      </p>
                      <p className="num text-[13px] text-muted">
                        {clock(l.arrive)} ~ {clock(l.leave)}
                        {pick.cat !== 'custom' && (
                          <>
                            {' · '}
                            <a className="text-rose underline-offset-2 hover:underline" href={kakaoPlace(pick.id)} target="_blank" rel="noreferrer">
                              카카오맵
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[88px]">
                        <NumberInput compact value={pick.stay} suffix="분" label={`${pick.name} 머무는 시간`} onChange={(v) => setPicks((ps) => ps.map((x) => (x.id === pick.id ? { ...x, stay: Math.min(v, 600) } : x)))} />
                      </div>
                      <select aria-label={`${pick.name} 날짜`} className="h-10 rounded-xl border border-rule bg-white px-2 text-[13px]" value={pick.day} onChange={(e) => setPicks((ps) => ps.map((x) => (x.id === pick.id ? { ...x, day: Number(e.target.value) } : x)))}>
                        {Array.from({ length: maxDay + 1 }, (_, k) => k + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}일차
                          </option>
                        ))}
                      </select>
                      <button type="button" className="h-10 rounded-xl px-2 text-[13px] text-muted hover:text-alert" onClick={() => setPicks((ps) => ps.filter((x) => x.id !== pick.id))} aria-label={`${pick.name} 빼기`}>
                        빼기
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
          {noGeo.length > 0 && <p className="text-[13px] text-muted">직접 추가한 곳({noGeo.map((p) => p.name).join(', ')})은 위치를 몰라 맨 뒤에 두었어요.</p>}
        </>
      ) : (
        <p className="text-[14px] text-muted">{day}일차에 담은 곳이 없어요. 업체의 날짜를 이 날로 바꾸거나 새로 담으세요.</p>
      )}
    </div>
  )
}
