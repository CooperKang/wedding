import { setHoneymoon, setItems, uid, useStore } from '../store'
import { DESTS, HONEY_AVG, HONEY_CATS, HONEY_TIPS, QUOTE_CHECKS, RANKINGS, destOf } from '../data/honeymoon'
import { departMonth, destTotal, estimate, giftTotal, honeyCosts, quoteRows, sum } from '../calc/honeymoon'
import { catLabel } from '../data/budget'
import { man } from '../format'
import { Bullets, Button, Chip, NumberInput, Note, PageHead, Panel, Wrap, inputCls } from '../components/ui'
import type { HoneyCat, Honeymoon as H, Quote } from '../types'

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const CELL = ['bg-alert-soft text-alert', 'bg-gold-soft text-gold', 'bg-sage text-white']
const CELL_LABEL = ['피하기', '무난', '좋음']

const cellCls = 'h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-[14px] outline-none hover:border-rule focus:border-rose focus:bg-white focus:ring-2 focus:ring-rose/20'
const th = 'border-b border-rule px-2 py-2 text-left text-[12px] font-semibold whitespace-nowrap text-muted'
const td = 'border-b border-rule/60 px-1 py-0.5 align-middle'

const update = (patch: Partial<H>) => setHoneymoon((h) => ({ ...h, ...patch }))
// 여행지를 바꾸면 그 여행지의 기본 일정과 추정치로 다시 시작한다(선물·견적은 그대로)
const pickDest = (id: string) => setHoneymoon((h) => ({ ...h, dest: id, nights: destOf(id).nights, costs: {} }))

export default function Honeymoon() {
  const { profile, honeymoon: h } = useStore()
  const dep = departMonth(profile.weddingDate)
  const dest = destOf(h.dest)
  const costs = honeyCosts(h)
  const total = sum(costs)
  const fits = dep ? DESTS.filter((d) => d.months[dep - 1] === 2) : []

  const toLedger = () =>
    setItems((its) => {
      const at = its.findIndex((i) => i.cat === 'honeymoon')
      if (at === -1) return [...its, { id: uid(), cat: 'honeymoon', name: catLabel('honeymoon'), vendor: dest.name, budget: total, payments: [], rating: 0, memo: '', tip: '' }]
      return its.map((i, k) => (k === at ? { ...i, budget: total, vendor: i.vendor || dest.name } : i))
    })

  return (
    <>
      <PageHead
        kicker="HONEYMOON"
        title="신혼여행"
        lead="어디로 많이 가는지, 언제 가면 좋은지, 며칠이나 가는지 보고, 항공·숙소·식비부터 선물까지 우리 예산을 짜 보세요. 여행사 견적도 같은 기준으로 나란히 비교할 수 있어요. 금액은 두 사람 합계, 만원 단위예요."
      />

      <Wrap className="space-y-6">
        <Panel title="요즘 어디로 많이 갈까?">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            {RANKINGS.map((r) => (
              <div key={r.by} className="rounded-xl border border-rule bg-white p-4">
                <ol className="space-y-1.5">
                  {r.order.map((name, i) => (
                    <li key={name} className="flex items-center gap-2 text-[15px]">
                      <span className={`num grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-bold ${i < 2 ? 'bg-rose text-white' : 'bg-paper text-muted'}`}>{i + 1}</span>
                      <span className="font-semibold">{name}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[12px] leading-snug text-muted">
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                    {r.by}
                  </a>{' '}
                  · {r.note}
                </p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-xl bg-rose-soft/50 p-4 md:w-56">
              <p className="text-[13px] text-muted">신혼여행 평균 비용</p>
              <p className="num font-card text-[28px] font-bold text-rose">{man(HONEY_AVG.value)}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted">
                {HONEY_AVG.by}. {HONEY_AVG.note}
              </p>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-muted">발리·몰디브·하와이·칸쿤·유럽이 몇 년째 &lsquo;빅5&rsquo;예요. 두 집계 모두 여행사 자체 집계라 순서는 조금씩 달라요. 휴가가 짧으면 푸껫·다낭·괌, 평생 한 번을 원하면 모리셔스·타히티도 많이 가요.</p>
        </Panel>

        <Panel title="언제 가면 좋을까? 여행지별 1~12월" aside={dep ? <Chip tone="rose">우리 출발: {dep}월</Chip> : undefined}>
          {dep ? (
            <Note tone="rose" title={`${dep}월 출발이면 날씨가 좋은 곳`}>
              {fits.length ? fits.map((d) => d.name).join(', ') : '날씨가 아주 좋은 곳은 적어요. "무난" 표시된 곳을 보세요.'}
            </Note>
          ) : (
            <p className="text-[13px] text-muted">처음 화면에서 예식일을 넣으면 출발하는 달을 표에서 짚어 드려요.</p>
          )}
          <div className="relative overflow-x-auto rounded-xl border border-rule bg-white">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead className="bg-paper">
                <tr>
                  <th className={`${th} sticky left-0 z-[1] bg-paper`}>여행지</th>
                  {MONTHS.map((m) => (
                    <th key={m} className={`${th} text-center ${m === dep ? 'bg-rose text-white' : ''}`}>
                      {m}월
                    </th>
                  ))}
                  <th className={th}>흔한 일정</th>
                </tr>
              </thead>
              <tbody>
                {DESTS.map((d) => (
                  <tr key={d.id} className={d.id === h.dest ? 'bg-rose-soft/30' : ''}>
                    <td className={`${td} sticky left-0 z-[1] bg-white px-2`}>
                      <button type="button" onClick={() => pickDest(d.id)} className="text-left font-semibold whitespace-nowrap hover:text-rose" title="이 여행지로 예산 짜기">
                        {d.name}
                      </button>
                    </td>
                    {d.months.map((v, i) => (
                      <td key={i} className={`${td} p-0.5 ${i + 1 === dep ? 'bg-rose-soft/60' : ''}`}>
                        <span className={`grid h-7 place-items-center rounded text-[11px] font-semibold ${CELL[v]}`} title={`${d.name} ${i + 1}월: ${CELL_LABEL[v]}`}>
                          {v === 2 ? '●' : v === 1 ? '○' : '×'}
                        </span>
                      </td>
                    ))}
                    <td className={`${td} px-2 text-[12px] whitespace-nowrap text-muted`}>{d.trip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
            {[2, 1, 0].map((v) => (
              <span key={v} className="flex items-center gap-1.5">
                <span className={`grid size-4 place-items-center rounded text-[10px] ${CELL[v]}`}>{v === 2 ? '●' : v === 1 ? '○' : '×'}</span>
                {v === 2 ? '날씨 좋음' : v === 1 ? '무난(덥거나 비가 잦음)' : '피하는 게 좋음(우기·태풍·허리케인)'}
              </span>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            <b className="text-ink">출발이 몰리는 때</b>는 날씨보다 예식 일정이 정해요. 예식이 많은 5월과 10~11월 직후, 여름휴가(7월 말~8월 초), 설·추석 연휴에 항공권이 가장 비싸요. 여행지 이름을 누르면 아래 예산이 그 여행지로 바뀌어요.
          </p>
        </Panel>

        <Panel title="여행지 한눈에 보기" aside={<span className="text-[13px] text-muted">기본 일정 · 두 사람 · 선물 제외 · 추정</span>}>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {DESTS.map((d) => (
              <li key={d.id} className={`flex min-w-0 flex-col rounded-xl border bg-white p-4 ${d.id === h.dest ? 'border-rose ring-1 ring-rose' : 'border-rule'}`}>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[17px] font-bold">{d.name}</span>
                  <span className="text-[12px] text-muted">{d.area}</span>
                </p>
                <p className="mt-0.5 text-[13px] text-muted">{d.style}</p>
                <p className="num mt-2 font-card text-[22px] font-bold text-rose">약 {man(Math.round(destTotal(d.id) / 10) * 10)}</p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
                  <dt className="text-muted">비행</dt>
                  <dd>{d.flight}</dd>
                  <dt className="text-muted">일정</dt>
                  <dd>{d.trip}</dd>
                  <dt className="text-muted">시기</dt>
                  <dd className="leading-snug">{d.monthNote}</dd>
                </dl>
                <div className="mt-2 space-y-1 text-[13px]">
                  <Bullets items={d.good} tone="good" />
                  <Bullets items={d.watch} tone="alert" />
                </div>
                <div className="mt-auto pt-3">
                  <Button tone={d.id === h.dest ? 'rose' : 'ghost'} onClick={() => pickDest(d.id)}>
                    {d.id === h.dest ? '예산 짜는 중' : '이 여행지로 예산 짜기'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-relaxed text-muted">금액은 일반석 항공과 신혼부부가 많이 고르는 숙소 등급으로 가늠한 2026년 대략값이에요. 출발 시기, 환율, 숙소 등급에 따라 절반에서 두 배까지 달라질 수 있으니, 실제 견적을 받아 아래 표에서 비교하세요.</p>
        </Panel>

        <Panel title="우리 신혼여행 예산" aside={<span className="num text-[15px] font-bold text-rose">합계 {man(total)}</span>}>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <label className="block text-[13px] font-semibold">
              여행지
              <select className={`${inputCls} mt-1`} value={h.dest} onChange={(e) => pickDest(e.target.value)}>
                {DESTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.trip})
                  </option>
                ))}
              </select>
            </label>
            <div className="text-[13px] font-semibold">
              숙박
              <div className="mt-1">
                <NumberInput compact value={h.nights} suffix="박" label="숙박 수" onChange={(v) => update({ nights: Math.max(1, Math.min(30, v || 1)) })} />
              </div>
            </div>
          </div>
          <CostTable h={h} costs={costs} />
          <Gifts h={h} />
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4">
            <p className="min-w-0 flex-1 text-[14px] leading-relaxed">
              {dest.name} {h.nights}박 예산 <b className="num text-rose">{man(total)}</b>
              {total > HONEY_AVG.value ? ` · 평균(${man(HONEY_AVG.value)})보다 ${man(total - HONEY_AVG.value)} 많아요` : ` · 평균(${man(HONEY_AVG.value)})보다 ${man(HONEY_AVG.value - total)} 적어요`}
            </p>
            <Button onClick={toLedger}>예산 장부의 신혼여행 예산으로 넣기</Button>
          </div>
        </Panel>

        <Panel title="견적 비교" aside={<span className="text-[13px] text-muted">같은 날짜·같은 숙소 등급으로 받아 비교하세요</span>}>
          <Quotes h={h} />
        </Panel>

        <Panel title="알고 가면 좋은 것">
          <Bullets items={HONEY_TIPS} />
          <p className="text-[13px]">
            <a href="https://www.0404.go.kr" target="_blank" rel="noreferrer" className="font-semibold text-rose underline underline-offset-4">
              외교부 해외안전여행에서 입국 요건 확인하기
            </a>
          </p>
        </Panel>
      </Wrap>
    </>
  )
}

function CostTable({ h, costs }: { h: H; costs: Record<HoneyCat, number> }) {
  const est = estimate(h.dest, h.nights)
  const setCost = (k: HoneyCat, v: number | undefined) =>
    setHoneymoon((x) => {
      const next = { ...x.costs }
      if (v === undefined) delete next[k]
      else next[k] = v
      return { ...x, costs: next }
    })
  return (
    <div className="relative overflow-x-auto rounded-xl border border-rule bg-white">
      <table className="w-full min-w-[560px] border-collapse text-[14px]">
        <thead className="bg-paper">
          <tr>
            <th className={th}>항목</th>
            <th className={`${th} text-right`}>추정</th>
            <th className={`${th} text-right`}>우리 금액</th>
            <th className={th}>
              <span className="sr-only">되돌리기</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {HONEY_CATS.map((c) => {
            const guess = c.id === 'gifts' ? giftTotal(h) : est[c.id as Exclude<HoneyCat, 'gifts'>]
            const edited = h.costs[c.id] !== undefined
            return (
              <tr key={c.id}>
                <td className={`${td} px-2 py-1.5`}>
                  <span className="font-semibold">{c.label}</span>
                  <span className="block text-[12px] leading-snug text-muted">{c.id === 'gifts' ? '아래 선물 목록 합계' : c.hint}</span>
                </td>
                <td className={`${td} num px-2 text-right text-muted`}>{man(guess)}</td>
                <td className={`${td} w-40`}>
                  <NumberInput cell value={costs[c.id]} suffix="만" label={`${c.label} 금액`} onChange={(v) => setCost(c.id, v)} />
                </td>
                <td className={`${td} w-24`}>
                  {edited && (
                    <button type="button" onClick={() => setCost(c.id, undefined)} className="px-2 text-[12px] whitespace-nowrap text-muted hover:text-rose">
                      추정으로
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-paper font-bold">
          <tr>
            <td className={`${td} px-2 py-2.5`}>합계</td>
            <td className={`${td} num px-2 text-right text-muted`}>{man(sum(est) + giftTotal(h))}</td>
            <td className={`${td} num px-3 text-right text-rose`}>{man(sum(costs))}</td>
            <td className={td} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function Gifts({ h }: { h: H }) {
  const setGift = (id: string, patch: Partial<H['gifts'][number]>) => setHoneymoon((x) => ({ ...x, gifts: x.gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)) }))
  return (
    <div>
      <p className="mb-2 flex items-baseline justify-between gap-2 text-[14px] font-bold">
        선물 목록
        <span className="num text-[13px] font-semibold text-muted">합계 {man(giftTotal(h))}</span>
      </p>
      <div className="relative overflow-x-auto rounded-xl border border-rule bg-white">
        <table className="w-full min-w-[480px] border-collapse text-[14px]">
          <thead className="bg-paper">
            <tr>
              <th className={th}>누구에게</th>
              <th className={`${th} text-right`}>몇 명(집)</th>
              <th className={`${th} text-right`}>1인당</th>
              <th className={`${th} text-right`}>소계</th>
              <th className={th}>
                <span className="sr-only">삭제</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {h.gifts.map((g) => (
              <tr key={g.id}>
                <td className={td}>
                  <input aria-label="선물 받을 사람" className={cellCls} value={g.who} onChange={(e) => setGift(g.id, { who: e.target.value })} />
                </td>
                <td className={`${td} w-28`}>
                  <NumberInput cell value={g.count} suffix="명" label={`${g.who} 사람 수`} onChange={(v) => setGift(g.id, { count: v })} />
                </td>
                <td className={`${td} w-28`}>
                  <NumberInput cell value={g.unit} suffix="만" label={`${g.who} 1인당`} onChange={(v) => setGift(g.id, { unit: v })} />
                </td>
                <td className={`${td} num w-24 px-2 text-right font-semibold`}>{man(g.count * g.unit)}</td>
                <td className={`${td} w-14`}>
                  <button type="button" className="px-2 text-[12px] text-muted hover:text-alert" onClick={() => setHoneymoon((x) => ({ ...x, gifts: x.gifts.filter((y) => y.id !== g.id) }))}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button tone="ghost" onClick={() => setHoneymoon((x) => ({ ...x, gifts: [...x.gifts, { id: uid(), who: '', count: 1, unit: 0 }] }))}>
          + 선물 받을 사람
        </Button>
        <span className="text-[12px] text-muted">양가 부모님 선물은 양가가 비슷한 수준인지 미리 맞춰 두면 좋아요. 면세 한도도 확인하세요.</span>
      </div>
    </div>
  )
}

function Quotes({ h }: { h: H }) {
  const { rows, cheapest } = quoteRows(h, QUOTE_CHECKS.map((c) => c.id))
  const setQuote = (id: string, patch: Partial<Quote>) => setHoneymoon((x) => ({ ...x, quotes: x.quotes.map((q) => (q.id === id ? { ...q, ...patch } : q)) }))
  const add = (name: string) => setHoneymoon((x) => ({ ...x, quotes: [...x.quotes, { id: uid(), name, dest: x.dest, nights: x.nights, price: 0, inc: [], memo: '' }] }))
  return (
    <div className="space-y-3">
      <p className="text-[14px] leading-relaxed text-muted">여행사 2~3곳과 직접 예약한 경우를 줄로 넣고, 견적에 들어 있는 것에 체크하세요. 총액이 싸 보여도 빠진 항목(가이드비, 쇼핑 일정, 석식)이 많으면 현지에서 더 내게 돼요. 1박당 가격이 가장 낮은 견적에 표시가 붙어요.</p>
      <div className="relative overflow-x-auto rounded-xl border border-rule bg-white">
        <table className="w-full min-w-[1200px] border-collapse text-[13px]">
          <thead className="bg-paper">
            <tr>
              <th className={`${th} sticky left-0 z-[1] bg-paper`}>견적</th>
              <th className={th}>여행지</th>
              <th className={`${th} text-right`}>박수</th>
              <th className={`${th} text-right`}>총액</th>
              <th className={`${th} text-right`}>1박당</th>
              {QUOTE_CHECKS.map((c) => (
                <th key={c.id} className={`${th} text-center text-[11px] whitespace-normal`}>
                  {c.label}
                </th>
              ))}
              <th className={th}>빠진 것</th>
              <th className={th}>
                <span className="sr-only">삭제</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={QUOTE_CHECKS.length + 7} className="p-6 text-center text-[14px] text-muted">
                  아직 받은 견적이 없어요. 아래 버튼으로 견적을 추가하세요.
                </td>
              </tr>
            )}
            {rows.map((q) => (
              <tr key={q.id} className={q.id === cheapest ? 'bg-sage-soft/50' : ''}>
                <td className={`${td} sticky left-0 z-[1] w-40 bg-white`}>
                  <input aria-label="견적 이름" className={`${cellCls} font-semibold`} value={q.name} placeholder="여행사 이름" onChange={(e) => setQuote(q.id, { name: e.target.value })} />
                  {q.id === cheapest && <span className="block px-2 pb-1 text-[11px] font-semibold text-sage">1박당 가장 저렴</span>}
                </td>
                <td className={`${td} w-32`}>
                  <select aria-label={`${q.name} 여행지`} className={cellCls} value={q.dest} onChange={(e) => setQuote(q.id, { dest: e.target.value })}>
                    {DESTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`${td} w-20`}>
                  <NumberInput cell value={q.nights} suffix="박" label={`${q.name} 박수`} onChange={(v) => setQuote(q.id, { nights: v })} />
                </td>
                <td className={`${td} w-28`}>
                  <NumberInput cell value={q.price} suffix="만" label={`${q.name} 총액`} onChange={(v) => setQuote(q.id, { price: v })} />
                </td>
                <td className={`${td} num w-20 px-2 text-right font-semibold`}>{q.perNight ? man(q.perNight) : '–'}</td>
                {QUOTE_CHECKS.map((c) => (
                  <td key={c.id} className={`${td} text-center`}>
                    <input
                      type="checkbox"
                      className="size-4 accent-rose"
                      aria-label={`${q.name} ${c.label}`}
                      checked={q.inc.includes(c.id)}
                      onChange={(e) => setQuote(q.id, { inc: e.target.checked ? [...q.inc, c.id] : q.inc.filter((x) => x !== c.id) })}
                    />
                  </td>
                ))}
                <td className={`${td} num px-2 text-center ${q.missing > 4 ? 'font-bold text-alert' : 'text-muted'}`}>{q.missing}개</td>
                <td className={`${td} w-14`}>
                  <button type="button" className="px-2 text-[12px] text-muted hover:text-alert" onClick={() => setHoneymoon((x) => ({ ...x, quotes: x.quotes.filter((y) => y.id !== q.id) }))}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => add('')}>+ 여행사 견적</Button>
        <Button tone="ghost" onClick={() => add('직접 예약')}>
          + 직접 예약(자유여행)
        </Button>
      </div>
    </div>
  )
}
