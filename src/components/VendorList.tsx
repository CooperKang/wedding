import { useMemo, useState } from 'react'
import { signal, tone, useCrawled } from '../data/crawled'
import { REGIONS, regionLabel } from '../data/regions'
import { kakaoPlace } from '../calc/route'
import { CAT_LABEL } from '../data/vendorCats'
import { BOOKING_LEADS } from '../data/venues'
import type { Review, Vendor, VendorCat } from '../types'
import { Chip, Field, inputCls } from './ui'

type Sort = 'signal' | 'reviews' | 'rating'

export default function VendorList({ cats, region, onPick, picked = [], parkingFilter, defaultCat = 'all' }: { cats: VendorCat[]; region: string; onPick?: (v: Vendor) => void; picked?: string[]; parkingFilter?: boolean; defaultCat?: VendorCat | 'all' }) {
  const data = useCrawled()
  const [reg, setReg] = useState(region)
  const [cat, setCat] = useState<VendorCat | 'all'>(defaultCat)
  const [sort, setSort] = useState<Sort>('signal')
  const [parking, setParking] = useState(false)
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(12)

  const list = useMemo(() => {
    if (!data) return []
    const r = data.reviews
    const key = (v: Vendor) => (sort === 'signal' ? signal(v, r[v.id]) : sort === 'reviews' ? v.reviewCount : v.rating * Math.min(1, v.ratingCount / 10))
    return data.vendors
      .filter((v) => cats.includes(v.cat) && (cat === 'all' || v.cat === cat) && v.regions.includes(reg) && (!parking || v.parking) && (!q || v.name.includes(q.trim())))
      .sort((a, b) => key(b) - key(a))
  }, [data, cats, cat, reg, sort, parking, q])

  if (!data) return <p className="text-[14px] text-muted">업체 목록을 불러오는 중…</p>
  if (!data.vendors.length) return <p className="text-[14px] text-muted">아직 수집된 업체 목록이 없어요. 다음 주간 수집 후에 보여요.</p>

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr]">
        <Field label="지역" htmlFor="v-reg">
          <select id="v-reg" className={inputCls} value={reg} onChange={(e) => (setReg(e.target.value), setLimit(12))}>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {regionLabel(r.id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="정렬" htmlFor="v-sort">
          <select id="v-sort" className={inputCls} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="signal">후기 신호 좋은 순</option>
            <option value="reviews">리뷰 많은 순</option>
            <option value="rating">별점 높은 순</option>
          </select>
        </Field>
        <Field label="이름 검색" htmlFor="v-q">
          <input id="v-q" className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="업체 이름" />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {cats.length > 1 &&
          (['all', ...cats] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => (setCat(c), setLimit(12))}
              className="min-h-9 rounded-full border border-rule bg-white px-3 text-[13px] font-semibold text-muted aria-pressed:border-rose aria-pressed:bg-rose aria-pressed:text-white"
            >
              {c === 'all' ? '전체' : CAT_LABEL[c]}
            </button>
          ))}
        {parkingFilter && (
          <label className="ml-auto flex items-center gap-2 text-[13px] font-semibold">
            <input type="checkbox" className="size-4 accent-rose" checked={parking} onChange={(e) => setParking(e.target.checked)} />
            주차 가능만
          </label>
        )}
      </div>

      <p className="text-[13px] text-muted">
        {regionLabel(reg)} {list.length}곳 · 카카오맵 검색 결과와 블로그 후기 제목·미리보기를 모은 참고 신호예요
        {data.meta.vendors?.at && ` (${data.meta.vendors.at} 수집)`}. 가격은 업체에 직접 확인하세요.
      </p>

      <ul className="grid gap-3 md:grid-cols-2">
        {list.slice(0, limit).map((v) => (
          <VendorCard key={v.id} v={v} r={data.reviews[v.id]} onPick={onPick} picked={picked.includes(v.id)} />
        ))}
      </ul>
      {list.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + 12)} className="w-full rounded-xl border border-rule bg-white py-3 text-[14px] font-semibold text-rose">
          더 보기 ({list.length - limit}곳 남음)
        </button>
      )}
      {!list.length && <p className="rounded-xl border border-dashed border-rule p-6 text-center text-[14px] text-muted">조건에 맞는 업체가 없어요. 지역이나 분류를 바꿔 보세요.</p>}
    </div>
  )
}

function VendorCard({ v, r, onPick, picked }: { v: Vendor; r?: Review; onPick?: (v: Vendor) => void; picked: boolean }) {
  const t = tone(v, r)
  const lead = BOOKING_LEADS.find((b) => b.id === v.cat)
  const blogSearch = `https://search.naver.com/search.naver?ssc=tab.blog.all&query=${encodeURIComponent(`${v.name} 후기`)}`
  return (
    <li className="flex min-w-0 flex-col rounded-xl border border-rule bg-white p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5">
            <span className="text-[16px] font-bold">{v.name}</span>
            <Chip>{CAT_LABEL[v.cat]}</Chip>
            {t === 'good' && <Chip tone="sage">후기 신호 좋음</Chip>}
            {t === 'mixed' && <Chip tone="gold">후기 엇갈림</Chip>}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">{v.address}</p>
        </div>
        {onPick && (
          <button
            type="button"
            onClick={() => onPick(v)}
            aria-pressed={picked}
            className="shrink-0 rounded-full border border-rose px-3 py-1.5 text-[13px] font-semibold text-rose aria-pressed:bg-rose aria-pressed:text-white"
          >
            {picked ? '담김' : '담기'}
          </button>
        )}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        <div className="flex gap-1">
          <dt className="text-muted">별점</dt>
          <dd className="num font-semibold">{v.ratingCount ? `${v.rating.toFixed(1)} (${v.ratingCount})` : '–'}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted">카카오 리뷰</dt>
          <dd className="num font-semibold">{v.reviewCount.toLocaleString('ko-KR')}</dd>
        </div>
        {v.parking && <dd className="font-semibold text-sage">주차 가능</dd>}
      </dl>
      {r && r.posts > 0 && (
        <div className="mt-2 rounded-lg bg-paper px-3 py-2 text-[12px] leading-relaxed">
          <p>
            블로그 후기 {r.posts}건 · <span className="text-sage">좋은 말 {r.pos}</span> · <span className="text-alert">아쉬운 말 {r.neg}</span>
            {r.ad > 0 && <span className="text-muted"> · 협찬 표시 {r.ad}건</span>}
          </p>
          {(Object.keys(r.good ?? {}).length > 0 || Object.keys(r.bad ?? {}).length > 0) && (
            <div className="mt-1.5 flex flex-wrap gap-1" aria-label="후기에서 자주 나온 말">
              {Object.entries(r.good ?? {}).map(([t, n]) => (
                <span key={t} className="rounded-full bg-sage-soft px-2 py-0.5 font-semibold text-sage" title={`좋았다는 글 ${n}건`}>
                  #{t} <span className="num font-normal opacity-80">{n}</span>
                </span>
              ))}
              {Object.entries(r.bad ?? {}).map(([t, n]) => (
                <span key={t} className="rounded-full bg-alert-soft px-2 py-0.5 font-semibold text-alert" title={`아쉬웠다는 글 ${n}건`}>
                  #{t} <span className="num font-normal opacity-80">{n}</span>
                </span>
              ))}
            </div>
          )}
          {r.top[0] && (
            <a href={r.top[0].u} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-muted underline-offset-2 hover:underline">
              “{r.top[0].t}”
            </a>
          )}
        </div>
      )}
      {lead && (
        <p className="mt-2 text-[12px] leading-snug text-muted">
          예약: 보통 <b className="text-ink">{lead.usual}개월 전</b>, 봄·가을 토요일 점심은 <b className="text-rose">{lead.popular}개월+ 전</b>부터 문의. 여는 날은 홀마다 달라서 전화로 먼저 확인하세요.
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-[13px] font-semibold text-rose">
        <a href={kakaoPlace(v.id)} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
          카카오맵
        </a>
        <a href={blogSearch} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
          후기 검색
        </a>
        {v.homepage && (
          <a href={v.homepage} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
            홈페이지
          </a>
        )}
        {v.tel && (
          <a href={`tel:${v.tel}`} className="num underline-offset-4 hover:underline">
            {v.tel}
          </a>
        )}
      </div>
    </li>
  )
}
