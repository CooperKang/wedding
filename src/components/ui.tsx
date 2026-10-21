import { useId, useState, type ReactNode } from 'react'
import { formatInput, man, parseInput } from '../format'

export function PageHead({ kicker, title, lead, children }: { kicker?: string; title: string; lead: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:pt-12">
      {kicker && <p className="text-[13px] font-semibold tracking-[0.18em] text-gold">{kicker}</p>}
      <h1 className="mt-1 font-card text-[30px] leading-tight font-bold md:text-[40px]">{title}</h1>
      <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">{lead}</p>
      {children}
    </div>
  )
}

export function Wrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</div>
}

export function Panel({ title, children, aside, id }: { title?: ReactNode; children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-2xl border border-rule bg-sheet p-5 md:p-6">
      {title && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="font-card text-[19px] font-bold">{title}</h2>
          {aside}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[14px] font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  )
}

export const inputCls =
  'h-11 w-full rounded-xl border border-rule bg-white px-3.5 text-[15px] outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 placeholder:text-muted/60'

export function TextField({ label, value, onChange, placeholder, hint, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: ReactNode; type?: string }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input id={id} type={type} className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

// 입력 중인 글자를 그대로 들고 있다가 숫자로 바꿔 올려 보낸다.
// type="number"는 쉼표를 못 쓰고 '012999'처럼 앞자리 0이 남아서 글자 입력칸을 쓴다.
function toText(v: number) {
  return v ? formatInput(String(v), false) : ''
}

export function NumberInput({ value, onChange, suffix, label, id, compact }: { value: number; onChange: (v: number) => void; suffix: string; label?: string; id?: string; compact?: boolean }) {
  const [text, setText] = useState(() => toText(value))
  const [last, setLast] = useState(value)
  // 다른 곳(프리셋, 초기화)에서 값이 바뀌면 입력칸도 맞춘다
  if (value !== last) {
    setLast(value)
    if (parseInput(text) !== value) setText(toText(value))
  }

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target
    const raw = el.value
    const caret = el.selectionStart ?? raw.length
    const next = formatInput(raw, false)
    // 쉼표가 늘거나 줄어도 커서가 같은 숫자 뒤에 머물게 한다
    const keep = formatInput(raw.slice(0, caret), false).replace(/,/g, '').length
    setText(next)
    const v = parseInput(next)
    setLast(v)
    onChange(v)
    requestAnimationFrame(() => {
      let pos = 0
      for (let seen = 0; pos < next.length && seen < keep; pos++) if (next[pos] !== ',') seen++
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div
      className={`flex items-center rounded-xl border border-rule bg-white px-3 focus-within:border-rose focus-within:ring-2 focus-within:ring-rose/20 ${compact ? 'h-10' : 'h-12'}`}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        aria-label={label}
        className={`num w-full min-w-0 bg-transparent font-semibold outline-none placeholder:text-muted/50 ${compact ? 'text-[15px]' : 'text-[17px]'}`}
        value={text}
        onChange={change}
        onBlur={() => setText(toText(value))}
      />
      <span className="ml-1.5 shrink-0 text-[13px] text-muted">{suffix}</span>
    </div>
  )
}

export function NumberField({ label, value, onChange, suffix, hint }: { label: string; value: number; onChange: (v: number) => void; suffix: string; hint?: ReactNode }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <NumberInput id={id} value={value} onChange={onChange} suffix={suffix} />
    </Field>
  )
}

export function MoneyField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: ReactNode }) {
  return (
    <NumberField
      label={label}
      value={value}
      onChange={onChange}
      suffix="만원"
      hint={
        value || hint ? (
          <>
            {value ? <span className="num font-semibold text-rose">{man(value)}</span> : null}
            {value && hint ? ' · ' : null}
            {hint}
          </>
        ) : undefined
      }
    />
  )
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string
  value: T
  options: { id: T; label: string; sub?: string }[]
  onChange: (v: T) => void
  hint?: ReactNode
}) {
  return (
    <fieldset>
      <legend className="text-[14px] font-semibold">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className="min-h-10 rounded-full border border-rule bg-white px-3.5 text-[14px] font-semibold text-muted transition hover:border-rose/60 hover:text-ink aria-pressed:border-rose aria-pressed:bg-rose aria-pressed:text-white"
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-[13px] leading-snug text-muted">{hint}</p>}
    </fieldset>
  )
}

// 설명이 붙은 큰 선택 카드(진단 문항)
export function ChoiceCards<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string; sub: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className="rounded-xl border border-rule bg-white p-3.5 text-left transition hover:border-rose/50 aria-pressed:border-rose aria-pressed:bg-rose-soft/60 aria-pressed:ring-1 aria-pressed:ring-rose"
          >
            <span className="block text-[15px] font-bold">{o.label}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted">{o.sub}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function MultiChips<T extends string>({ label, value, options, onChange, hint }: { label: string; value: T[]; options: { id: T; label: string }[]; onChange: (v: T[]) => void; hint?: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
              className="min-h-10 rounded-full border border-rule bg-white px-3.5 text-[14px] font-semibold text-muted transition hover:border-rose/60 aria-pressed:border-gold aria-pressed:bg-gold-soft aria-pressed:text-ink"
            >
              {on ? '✓ ' : ''}
              {o.label}
            </button>
          )
        })}
      </div>
      {hint && <p className="mt-1.5 text-[13px] leading-snug text-muted">{hint}</p>}
    </fieldset>
  )
}

// 놓치기 쉬운 것(alert), 좋은 것(good), 그냥 알아둘 것(plain)
export function Note({ tone = 'plain', title, children }: { tone?: 'alert' | 'good' | 'plain' | 'rose'; title: ReactNode; children?: ReactNode }) {
  const style = {
    alert: 'border-alert/35 bg-alert-soft/60',
    good: 'border-sage/30 bg-sage-soft/70',
    rose: 'border-rose/30 bg-rose-soft/60',
    plain: 'border-rule bg-white',
  }[tone]
  const dot = { alert: 'bg-alert', good: 'bg-sage', rose: 'bg-rose', plain: 'bg-muted' }[tone]
  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <p className="flex items-start gap-2 text-[15px] leading-snug font-bold">
        <span className={`mt-[7px] size-2 shrink-0 rounded-full ${dot}`} aria-hidden />
        <span>{title}</span>
      </p>
      {children && <div className="mt-1.5 pl-4 text-[14px] leading-relaxed text-ink/80">{children}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'rose' | 'alert' | 'sage' }) {
  const color = tone ? { rose: 'text-rose', alert: 'text-alert', sage: 'text-sage' }[tone] : ''
  return (
    <div>
      <p className="text-[13px] text-muted">{label}</p>
      <p className={`num mt-0.5 text-[20px] font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[12px] text-muted">{sub}</p>}
    </div>
  )
}

export function Chip({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'rose' | 'gold' | 'sage' | 'alert' }) {
  const style = {
    plain: 'bg-paper text-muted',
    rose: 'bg-rose-soft text-rose-deep',
    gold: 'bg-gold-soft text-[#6f5223]',
    sage: 'bg-sage-soft text-sage',
    alert: 'bg-alert-soft text-alert',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap ${style}`}>{children}</span>
}

export function Bullets({ items, tone = 'plain' }: { items: ReactNode[]; tone?: 'plain' | 'good' | 'alert' }) {
  const mark = { plain: 'bg-muted/60', good: 'bg-sage', alert: 'bg-alert' }[tone]
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
          <span className={`mt-[9px] size-1.5 shrink-0 rounded-full ${mark}`} aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function Button({ children, onClick, tone = 'rose', type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; tone?: 'rose' | 'ghost' | 'plain'; type?: 'button' | 'submit'; className?: string }) {
  const style = {
    rose: 'bg-rose text-white hover:bg-rose-deep',
    ghost: 'border border-rule bg-white text-ink hover:border-rose/50',
    plain: 'text-rose underline-offset-4 hover:underline',
  }[tone]
  return (
    <button type={type} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition ${style} ${className}`}>
      {children}
    </button>
  )
}

export function LinkButton({ href, children, tone = 'rose' }: { href: string; children: ReactNode; tone?: 'rose' | 'ghost' }) {
  const style = tone === 'rose' ? 'bg-rose text-white hover:bg-rose-deep' : 'border border-rule bg-white text-ink hover:border-rose/50'
  const ext = href.startsWith('http')
  return (
    <a href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noreferrer' : undefined} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition ${style}`}>
      {children}
    </a>
  )
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-rule transition aria-checked:bg-rose"
      >
        <span className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{hint}</span>}
      </label>
    </div>
  )
}
