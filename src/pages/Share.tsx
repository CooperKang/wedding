import { useRef, useState } from 'react'
import { getState, replaceAll, setNotes, useStore } from '../store'
import { encodeShare, shareUrl } from '../calc/share'
import { today } from '../calc/timeline'
import Record from '../components/Record'
import { Button, Note, PageHead, Panel, Toggle, Wrap, inputCls } from '../components/ui'

export default function Share() {
  const state = useStore()
  const [hide, setHide] = useState(false)
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const makeLink = async () => {
    const link = shareUrl(await encodeShare(getState(), hide))
    setUrl(link)
    try {
      await navigator.clipboard.writeText(link)
      setMsg('링크를 복사했어요. 카톡이나 문자로 보내 주세요.')
    } catch {
      setMsg('아래 링크를 길게 눌러 복사하세요.')
    }
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `우리결혼준비-${today()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const upload = async (f: File) => {
    try {
      const data = JSON.parse(await f.text())
      if (!confirm('지금 이 기기에 있는 내용을 파일 내용으로 바꿀까요?')) return
      replaceAll(data)
      setMsg('파일을 불러왔어요.')
    } catch {
      setMsg('이 파일은 읽을 수 없어요. 우리 결혼 준비에서 저장한 JSON 파일인지 확인하세요.')
    }
  }

  return (
    <>
      <PageHead kicker="SHARE" title="기록·공유" lead="집안의 첫 결혼이라면 이 기록이 동생과 친척에게 큰 도움이 돼요. 공유 링크로 보내거나 인쇄해서 남기세요. 예랑·예신끼리는 파일로 주고받으면 같은 장부를 이어서 쓸 수 있어요." />
      <Wrap className="no-print grid gap-6 md:grid-cols-2">
        <Panel title="동생·친척에게 공유 링크 보내기">
          <Toggle label="금액 숨기기" checked={hide} onChange={setHide} hint="예산·결제 금액, 양가 지원금, 메모를 빼고 업체, 팁, 일정만 보여 줘요." />
          <Button onClick={makeLink}>공유 링크 만들기</Button>
          {url && <textarea readOnly className={`${inputCls} h-24 py-2 text-[12px]`} value={url} onFocus={(e) => e.currentTarget.select()} />}
          <p className="text-[13px] leading-relaxed text-muted">링크 안에 기록이 압축돼 들어 있어서 서버에 아무것도 올라가지 않아요. 대신 링크를 받은 사람은 누구나 볼 수 있으니 보낼 곳을 골라 주세요. 기록을 고친 뒤에는 링크를 다시 만들어야 해요.</p>
          <Button tone="ghost" onClick={() => window.print()}>
            인쇄·PDF로 저장
          </Button>
        </Panel>

        <Panel title="파일로 옮기기(예랑 ↔ 예신, 기기 바꿀 때)">
          <p className="text-[14px] leading-relaxed text-muted">입력한 내용은 이 브라우저에만 저장돼요. 다른 폰에서 이어 쓰려면 파일로 저장해서 보내고, 받은 쪽에서 불러오세요. 정기적으로 저장해 두면 안전해요.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download}>파일로 저장</Button>
            <Button tone="ghost" onClick={() => file.current?.click()}>
              파일 불러오기
            </Button>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
          <Note tone="alert" title="동시에 고치면 한쪽 내용이 덮여요">한 사람이 장부 담당을 맡고, 다른 사람은 받아 보기만 하는 방식을 권해요.</Note>
        </Panel>

        <div className="md:col-span-2">
          <Panel title="다음 사람에게 남기는 말">
            <textarea className={`${inputCls} h-32 py-2`} value={state.notes} onChange={(e) => setNotes(e.target.value)} placeholder="예: 박람회는 기준 없이 가지 마. 예식장은 주차부터 봐. 스드메 추가금은 계약서에 다 적어 달라고 해." />
            <p className="text-[13px] text-muted">기록집 맨 위에 실려요. 업체별 후기는 예산 장부의 &lsquo;다음 사람에게 남길 팁&rsquo; 칸에 적으세요.</p>
          </Panel>
        </div>
        {msg && (
          <p role="status" className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl bg-ink px-4 py-3 text-center text-[14px] text-white shadow-lg lg:bottom-8" onClick={() => setMsg('')}>
            {msg}
          </p>
        )}
      </Wrap>

      <Wrap className="mt-10">
        <h2 className="no-print mb-3 font-card text-[19px] font-bold">미리 보기{hide && ' (금액 숨김)'}</h2>
        <Record data={state} hideMoney={hide} />
      </Wrap>
    </>
  )
}
