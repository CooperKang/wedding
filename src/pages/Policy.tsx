import { useState } from 'react'
import { POLICIES, POLICY_AS_OF, POLICY_GROUPS, type PolicyGroup } from '../data/policy'
import { useCrawled } from '../data/crawled'
import { daysBetween, today } from '../calc/timeline'
import { Bullets, Chip, Note, PageHead, Panel, Wrap } from '../components/ui'

export default function Policy() {
  const [group, setGroup] = useState<PolicyGroup | 'all'>('all')
  const data = useCrawled()
  const now = today()
  const list = POLICIES.filter((p) => group === 'all' || p.group === group)

  return (
    <>
      <PageHead kicker="SUPPORT" title="신혼부부 지원 정책" lead={<>세금, 신혼집 대출, 공공 예식장, 건강검진, 소비자 보호까지 예비부부가 받을 수 있는 것을 모았어요. {POLICY_AS_OF} 기준이고, 신청 전에 공식 링크에서 꼭 다시 확인하세요.</>} />
      <Wrap className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: '전체' }, ...POLICY_GROUPS].map((g) => (
              <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className="min-h-10 rounded-full border border-rule bg-white px-3.5 text-[14px] font-semibold text-muted aria-pressed:border-rose aria-pressed:bg-rose aria-pressed:text-white">
                {g.label}
              </button>
            ))}
          </div>
          {list.map((p) => {
            const left = p.deadline ? daysBetween(now, p.deadline) : null
            return (
              <article key={p.id} className="rounded-2xl border border-rule bg-sheet p-5 md:p-6">
                <p className="flex flex-wrap items-center gap-2">
                  <Chip tone="gold">{POLICY_GROUPS.find((g) => g.id === p.group)!.label}</Chip>
                  {left !== null && left >= 0 && <Chip tone="alert">{p.deadline} 까지 · {left}일 남음</Chip>}
                  {left !== null && left < 0 && <Chip>기한 지남(연장 여부 확인)</Chip>}
                </p>
                <h2 className="mt-2 font-card text-[21px] font-bold">{p.title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed">{p.benefit}</p>
                <div className="mt-3">
                  <p className="mb-1 text-[13px] font-bold text-muted">대상·조건</p>
                  <Bullets items={p.who} />
                </div>
                {p.tip && (
                  <div className="mt-3">
                    <Note tone="good" title="이렇게 활용하세요">
                      {p.tip}
                    </Note>
                  </div>
                )}
                {p.status && (
                  <div className="mt-3">
                    <Note tone="alert" title="바뀔 수 있어요">
                      {p.status}
                    </Note>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {p.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-rose underline-offset-4 hover:underline">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="최근 소식" aside={data?.meta.news?.at ? <span className="text-[12px] text-muted">{data.meta.news.at} 수집</span> : undefined}>
            {!data && <p className="text-[14px] text-muted">불러오는 중…</p>}
            {data && !data.news.length && <p className="text-[14px] text-muted">아직 모은 소식이 없어요.</p>}
            <ul className="divide-y divide-rule">
              {data?.news.slice(0, 15).map((n) => (
                <li key={n.url} className="py-2.5">
                  <a href={n.url} target="_blank" rel="noreferrer" className="block text-[14px] leading-snug font-semibold hover:text-rose">
                    {n.title}
                  </a>
                  <p className="num mt-0.5 text-[12px] text-muted">
                    {n.source} · {n.date}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-[12px] leading-relaxed text-muted">구글 뉴스에서 &lsquo;신혼부부 지원&rsquo;, &lsquo;결혼 세액공제&rsquo; 등으로 매주 모아요. 지자체 소식은 우리 지역이 아닐 수 있어요.</p>
          </Panel>
        </aside>
      </Wrap>
    </>
  )
}
