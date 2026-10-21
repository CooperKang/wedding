import { useState } from 'react'
import { useStore } from '../store'
import { BOOKING_ASK, BOOKING_LEADS, CONTRACT_CHECKS, FAIR_TIPS, hallSizeHint } from '../data/venues'
import { bookingPlan, ym } from '../calc/booking'
import { today } from '../calc/timeline'
import { MARKET_FACTS, PRICE_SOURCES } from '../data/budget'
import { orderedChecks, rankVenues } from '../calc/advice'
import { PRIORITIES } from '../data/options'
import VendorList from '../components/VendorList'
import { Bullets, Chip, Note, PageHead, Panel, Stat, Wrap } from '../components/ui'

export default function Venue() {
  const { profile: p } = useStore()
  const ranked = rankVenues(p)
  const checks = orderedChecks(p)
  const groups = [...new Set(checks.map((c) => c.group))]
  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  const prioLabel = (id: string) => PRIORITIES.find((x) => x.id === id)?.label
  const plan = bookingPlan(p, today())

  return (
    <>
      <PageHead kicker="VENUE" title="예식장 고르기" lead="예식장은 결혼 비용의 60% 이상을 차지하고, 날짜가 정해져야 나머지 일정이 움직여요. 우리에게 맞는 유형을 먼저 정하고, 투어 때 같은 질문으로 비교하세요." />

      <Wrap className="space-y-6">
        <Panel title="우리 조건으로 본 예식장 유형">
          <Note tone="plain" title={`하객 ${p.guests}명이면`}>
            {hallSizeHint(p.guests)}
          </Note>
          <div className="grid gap-3 md:grid-cols-2">
            {ranked.map((v, i) => (
              <article key={v.type.id} className={`rounded-xl border bg-white p-4 ${i === 0 ? 'border-rose ring-1 ring-rose' : 'border-rule'}`}>
                <p className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[17px] font-bold">{v.type.name}</span>
                  {i === 0 && <Chip tone="rose">추천</Chip>}
                  {v.reasons.map((r) => (
                    <Chip key={r} tone="gold">
                      {r}
                    </Chip>
                  ))}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{v.type.fits}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[13px] font-bold text-sage">좋은 점</p>
                    <Bullets items={v.type.good} tone="good" />
                  </div>
                  <div>
                    <p className="mb-1 text-[13px] font-bold text-alert">확인할 점</p>
                    <Bullets items={v.type.watch} tone="alert" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="원하는 날짜·시간·홀, 언제부터 연락할까?" id="booking">
          {plan.from && plan.usualFrom ? (
            <Note tone={plan.late ? 'alert' : 'rose'} title={plan.late ? '보편적인 연락 시점이 이미 지났어요. 지금 바로 물어보세요' : `${ym(plan.from)}부터 연락해 보세요`}>
              {plan.lead.name} 기준으로, {plan.peak ? `봄·가을 주말 예식이라 인기 시간대(토요일 점심)를 원하면 ${plan.lead.popular}개월 전인 ${ym(plan.from)}부터 전화해 보는 게 좋아요. ` : ''}
              보편적으로는 {plan.lead.usual}개월 전인 {ym(plan.usualFrom)}부터 준비해요.{' '}
              {plan.late ? '취소로 빈 자리나 일요일·저녁 타임은 지금도 남아 있는 경우가 많아요.' : '하지만 홀마다 예약을 여는 날이 달라서, 마음에 둔 곳이 있다면 먼저 그 예식장에 물어봐야 해요.'}
            </Note>
          ) : (
            <Note tone="plain" title="처음 화면에서 예식일을 넣으면 우리 날짜로 계산해 드려요">
              보편적으로 웨딩홀은 12개월 전부터 준비하고, 인기 홀은 14개월 전부터 전화해 보는 커플이 많아요.
            </Note>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] sm:text-[14px]">
              <thead>
                <tr className="border-b border-rule text-left text-[12px] text-muted">
                  <th className="py-2 font-semibold">유형</th>
                  <th className="py-2 text-right font-semibold whitespace-nowrap">보편적으로</th>
                  <th className="py-2 pl-3 text-right font-semibold whitespace-nowrap">인기 시간대</th>
                </tr>
              </thead>
              <tbody>
                {BOOKING_LEADS.map((b) => (
                  <tr key={b.id} className={`border-b border-rule/60 align-top ${b.id === plan.lead.id ? 'bg-rose-soft/40' : ''}`}>
                    <td className="py-2 pr-2">
                      <span className="font-semibold">{b.name}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted">{b.note}</span>
                    </td>
                    <td className="num py-2 text-right whitespace-nowrap">{b.usual}개월 전</td>
                    <td className="num py-2 pl-3 text-right font-semibold whitespace-nowrap text-rose">{b.popular}개월+ 전</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="mb-1.5 text-[14px] font-bold">가장 정확한 건 그 예식장에 직접 묻는 거예요</p>
            <Bullets items={BOOKING_ASK} />
            <p className="mt-2 text-[13px] text-muted">인기 시간대는 봄(4~5월)·가을(9~11월) 토요일 점심 기준이에요. 비수기, 일요일, 저녁 예식은 4~6개월 전에도 원하는 홀을 잡는 경우가 많아요. 아래 업체 목록의 전화번호로 바로 물어볼 수 있어요.</p>
          </div>
        </Panel>

        <Panel title="가격은 공개되지 않는다? 이제 참고할 숫자가 있어요" aside={<span className="text-[13px] text-muted">전국 중간값, 2026년 8월 계약 기준</span>}>
          <p className="text-[14px] leading-relaxed">
            2025년부터 한국소비자원 <b>참가격</b>이 예식장·스드메 실제 계약 금액을 지역별로 매달 공개하고, 2025년 11월부터는 업체가 기본·선택 품목 가격과 위약금 기준을 계약서 표지에 적어야 해요(가격표시제). 상담 전에 우리 지역 중간값을 보고 가면 &ldquo;이 가격이 괜찮은지&rdquo; 판단할 기준이 생겨요.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {MARKET_FACTS.map((f) => (
              <Stat key={f.label} label={f.label} value={f.value} sub={f.sub} />
            ))}
          </div>
          <p className="text-[13px] text-muted">
            출처:{' '}
            {PRICE_SOURCES.slice(0, 1).map((s) => (
              <a key={s.url} className="font-semibold text-rose underline underline-offset-4" href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            ))}
            . 참가격 사이트에서 지역을 고르면 생화장식, 본식 촬영, 사회자 같은 선택 품목 가격도 볼 수 있어요.
          </p>
        </Panel>

        <Panel title="투어 체크리스트" aside={p.priorities.length ? <span className="text-[13px] text-muted">{p.priorities.map(prioLabel).join('·')} 항목을 맨 위로 올렸어요</span> : undefined}>
          <p className="text-[14px] leading-relaxed text-muted">투어 때 이 질문을 그대로 물어보고, 답을 예산 장부 메모에 적어 두면 홀끼리 비교하기 쉬워요. 체크는 이 화면에서만 쓰는 임시 표시예요.</p>
          <div className="grid gap-5 md:grid-cols-2">
            {groups.map((g) => (
              <div key={g}>
                <h3 className="mb-2 text-[15px] font-bold">{g}</h3>
                <ul className="space-y-2">
                  {checks
                    .filter((c) => c.group === g)
                    .map((c) => {
                      const hot = c.tag && p.priorities.includes(c.tag)
                      return (
                        <li key={c.id}>
                          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 ${hot ? 'border-gold' : 'border-rule'}`}>
                            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-rose" checked={!!ticked[c.id]} onChange={(e) => setTicked({ ...ticked, [c.id]: e.target.checked })} />
                            <span>
                              <span className="block text-[14px] leading-snug font-semibold">
                                {hot && <span className="mr-1 text-gold">★</span>}
                                {c.q}
                              </span>
                              <span className="mt-0.5 block text-[13px] leading-snug text-muted">{c.why}</span>
                            </span>
                          </label>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="계약서에 꼭 남길 것">
            <Bullets items={CONTRACT_CHECKS} />
            <Note tone="alert" title="계약금 돌려받기가 제일 어려워요">
              결혼서비스 피해구제 신청의 82%가 계약 해지·위약금 분쟁이에요(소비자원, 2025년). &ldquo;프로모션 특약&rdquo;을 이유로 300일 전 해지에도 계약금을 안 돌려준 사례가 있어요. 특약 조항을 꼭 읽어 보세요.
            </Note>
          </Panel>

          <Panel title="박람회, 이렇게 가세요" id="fair">
            <div>
              <p className="mb-1.5 text-[14px] font-bold text-alert">하지 말 것</p>
              <Bullets items={FAIR_TIPS.dont} tone="alert" />
            </div>
            <div>
              <p className="mb-1.5 text-[14px] font-bold text-sage">이렇게 하세요</p>
              <Bullets items={FAIR_TIPS.do} tone="good" />
            </div>
            {p.prepStyle === 'planner' && <Note tone="rose" title="맡기는 스타일이라면">박람회보다 플래너 2~3곳 상담이 더 효율적이에요. 박람회는 플래너가 추천한 업체의 조건을 확인하는 용도로만 쓰세요.</Note>}
          </Panel>
        </div>

        <Panel title="지역 예식장 찾아보기">
          <VendorList cats={['hall', 'hotel', 'small']} region={p.region} parkingFilter />
        </Panel>
      </Wrap>
    </>
  )
}
