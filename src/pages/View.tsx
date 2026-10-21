import { useEffect, useState } from 'react'
import { decodeShare, type Shared } from '../calc/share'
import { getState, replaceAll } from '../store'
import { href } from '../router'
import Record from '../components/Record'
import { Rings } from '../components/Icon'
import { Button, LinkButton, Note, Wrap } from '../components/ui'

// 공유 링크로 들어온 사람이 보는 읽기 전용 기록집
export default function View({ code }: { code: string }) {
  const [data, setData] = useState<Shared | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    decodeShare(code).then(setData, () => setError(true))
  }, [code])

  const importIt = () => {
    if (!data) return
    const mine = getState()
    const hasMine = mine.items.length > 0 || Object.keys(mine.checks).length > 0
    if (hasMine && !confirm('이 기기에 이미 적어 둔 내용이 있어요. 받은 기록으로 바꿀까요?')) return
    const { hideMoney: _, ...rest } = data
    replaceAll(rest)
    location.hash = href('budget')
  }

  return (
    <div className="min-h-dvh pb-16">
      <header className="no-print border-b border-rule/80 bg-paper/90">
        <Wrap className="flex h-14 items-center gap-2.5">
          <a href={href('home')} className="flex items-center gap-2.5">
            <Rings />
            <span className="font-card text-[17px] font-bold">우리 결혼 준비</span>
          </a>
          <span className="ml-auto text-[13px] text-muted">공유받은 기록</span>
        </Wrap>
      </header>
      <Wrap className="mt-8 max-w-3xl">
        {error && (
          <Note tone="alert" title="링크를 열 수 없어요">
            링크가 잘렸거나 바뀐 것 같아요. 보낸 사람에게 다시 받아 주세요.
          </Note>
        )}
        {!data && !error && <p className="text-[14px] text-muted">기록을 펼치는 중…</p>}
        {data && (
          <>
            <Record data={data} hideMoney={data.hideMoney} />
            <div className="no-print mt-8 flex flex-wrap gap-2">
              <LinkButton href={href('home')}>나도 결혼 준비 시작하기</LinkButton>
              {!data.hideMoney && (
                <Button tone="ghost" onClick={importIt}>
                  이 장부를 내 기기로 가져오기
                </Button>
              )}
              <Button tone="ghost" onClick={() => window.print()}>
                인쇄
              </Button>
            </div>
          </>
        )}
      </Wrap>
    </div>
  )
}
