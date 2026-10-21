import { useState } from 'react'
import { setPicks, useStore } from '../store'
import { EXTRA_FEES, SDM_MODES, SDM_TIPS } from '../data/sdm'
import VendorList from '../components/VendorList'
import RoutePlanner from '../components/RoutePlanner'
import { stayFor } from '../data/vendorCats'
import { Bullets, Chip, Note, PageHead, Panel, Wrap } from '../components/ui'
import type { Vendor } from '../types'

export default function Sdm() {
  const { profile: p, picks } = useStore()
  const mine = p.sdmMode === 'undecided' ? (p.prepStyle === 'diy' ? 'diy' : p.prepStyle === 'planner' ? 'planner' : null) : p.sdmMode
  const [fees, setFees] = useState<Record<string, boolean>>({})

  const toggle = (v: Vendor) =>
    setPicks((ps) => {
      if (ps.some((x) => x.id === v.id)) return ps.filter((x) => x.id !== v.id)
      const day = ps.length ? Math.max(...ps.map((x) => x.day)) : 1
      return [...ps, { id: v.id, name: v.name, cat: v.cat, lat: v.lat, lng: v.lng, stay: stayFor(v.cat), day, memo: '' }]
    })

  return (
    <>
      <PageHead kicker="STUDIO · DRESS · MAKEUP" title="스드메 고르기" lead="스튜디오·드레스·메이크업을 어떻게 정할지에 따라 준비 방법이 완전히 달라져요. 방식을 먼저 정하고, 발품을 판다면 업체를 담아 하루 동선을 짜 보세요." />

      <Wrap className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {SDM_MODES.map((m) => (
            <article key={m.id} className={`rounded-2xl border bg-sheet p-5 ${mine === m.id ? 'border-rose ring-1 ring-rose' : 'border-rule'}`}>
              <p className="flex items-center gap-2">
                <span className="font-card text-[19px] font-bold">{m.name}</span>
                {mine === m.id && <Chip tone="rose">우리 스타일</Chip>}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{m.fits}</p>
              <div className="mt-3 space-y-3">
                <Bullets items={m.good} tone="good" />
                <Bullets items={m.watch} tone="alert" />
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="기본가에 안 들어가는 돈" aside={<span className="text-[13px] text-muted">상담 때 하나씩 물어보세요</span>}>
            <ul className="space-y-2">
              {EXTRA_FEES.map((f) => (
                <li key={f.name}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-rose" checked={!!fees[f.name]} onChange={(e) => setFees({ ...fees, [f.name]: e.target.checked })} />
                    <span>
                      <span className="block text-[14px] font-semibold">{f.name}</span>
                      <span className="block text-[13px] leading-snug text-muted">{f.note}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <Note tone="good" title="2025년 4월 표준계약서부터 바뀐 점">
              원본·수정본, 드레스 피팅비, 얼리스타트비처럼 사실상 필수인 항목은 기본 서비스에 넣어야 하고, 계약서에 없는 추가금은 요구할 수 없어요. &ldquo;별도&rdquo;라고만 적혀 있으면 금액을 적어 달라고 하세요.
            </Note>
          </Panel>
          <Panel title="경험에서 나온 팁">
            <Bullets items={SDM_TIPS} />
            <Note tone="plain" title="참고 가격(참가격, 2026년 8월 전국 중간값)">
              스드메 패키지 298만원(강남 350만원), 드메 패키지 170만원. 단품은 스튜디오 139만원, 드레스 160만원, 메이크업 81만원. 원본 30만원, 드레스 헬퍼 25만원, 얼리스타트 13.6만원.
            </Note>
          </Panel>
        </div>

        <Panel title="업체 찾고 담기">
          <VendorList cats={['studio', 'dress', 'makeup', 'planner', 'hanbok', 'jewelry']} region={p.region === 'seocho' || p.region === 'songpa' ? 'gangnam' : p.region} onPick={toggle} picked={picks.map((x) => x.id)} defaultCat={p.sdmMode === 'planner' ? 'planner' : 'studio'} />
        </Panel>

        <Panel title="방문 동선 짜기" aside={picks.length ? <span className="text-[13px] text-muted">담은 곳 {picks.length}곳</span> : undefined}>
          <RoutePlanner />
        </Panel>
      </Wrap>
    </>
  )
}
