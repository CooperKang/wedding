import { TOUR_CHECKS, VENUE_TYPES, type VenueType } from '../data/venues'
import type { Profile } from '../types'

export type Step = { title: string; detail: string; to?: string }

// 준비 스타일별로 무엇부터 할지
export function prepOrder(p: Profile): Step[] {
  const common: Step = { title: '상견례와 예산 합의', detail: '양가 인사, 총예산, 양가 지원 범위, 하객 규모를 먼저 맞춰요.', to: 'timeline' }
  if (p.prepStyle === 'planner')
    return [
      common,
      { title: '플래너 2~3곳 비교 상담', detail: '박람회보다 같은 조건으로 플래너 몇 곳을 상담받아 패키지 포함 항목과 추가금을 표로 비교하세요.', to: 'sdm' },
      { title: '예식장 투어(플래너 동행 가능)', detail: '플래너가 추천한 홀도 투어 체크리스트로 직접 확인하세요. 주차와 식사는 하객이 가장 많이 기억해요.', to: 'venue' },
      { title: '스드메 패키지 확정', detail: '추가금 목록을 들고 가서 무엇이 포함인지 문서로 받으세요.', to: 'sdm' },
    ]
  if (p.prepStyle === 'romance')
    return [
      common,
      { title: '예식장 먼저', detail: '로망은 홀 분위기에서 시작돼요. 원하는 무드의 홀을 먼저 투어하고 날짜를 잡으세요.', to: 'venue' },
      { title: '원하는 스튜디오·드레스 무드 확정', detail: '저장해 둔 사진으로 스튜디오와 드레스샵을 먼저 고르세요. 그다음 플래너에게 그 업체만 맡겨도 돼요.', to: 'sdm' },
      { title: '필요한 부분만 플래너에게', detail: '일정 조율이 버거우면 스드메만 플래너를 쓰는 방법도 있어요.', to: 'sdm' },
    ]
  return [
    common,
    { title: '예식장 직접 투어', detail: '후보를 지역 목록에서 추리고, 실제 예식이 있는 주말에 직접 보세요.', to: 'venue' },
    { title: '스드메 업체별 발품', detail: '목록에서 후기 신호가 좋은 곳을 담고, 동선 도구로 하루 일정을 짜세요.', to: 'sdm' },
    { title: '계약은 비교하고 하루 뒤에', detail: '같은 조건 견적을 2~3곳 받아 나란히 놓고 결정하세요.', to: 'budget' },
  ]
}

export type VenuePick = { type: VenueType; score: number; reasons: string[] }

// 하객 수, 원하는 스타일, 예산 성향, 우선순위로 예식장 유형을 줄 세운다
export function rankVenues(p: Profile): VenuePick[] {
  return VENUE_TYPES.map((type) => {
    let score = 0
    const reasons: string[] = []
    const add = (n: number, reason?: string) => {
      score += n
      if (reason) reasons.push(reason)
    }
    const [lo, hi] = type.guests
    if (p.guests >= lo && p.guests <= hi) {
      score += 2
      reasons.push(`하객 ${p.guests}명에 알맞은 규모`)
    } else score -= p.guests > hi ? 2 : 1
    if (p.venueStyle === type.id) {
      score += 3
      reasons.push('원하는 스타일')
    }
    if (type.id === 'hotel') {
      if (p.budgetStyle === 'luxury') add(2, '호화 예산에 맞음')
      if (p.budgetStyle === 'minimal' || p.budgetStyle === 'smart') score -= 2
      if (p.priorities.includes('food')) add(1, '식사 품질이 높음')
    }
    if (type.id === 'hall') {
      if (p.priorities.includes('parking')) add(1, '주차·식당이 한 건물')
      if (p.budgetStyle !== 'luxury') score += 1
    }
    // 종교 예식은 신앙이 있을 때만 의미가 있어서 기본 점수를 낮춘다
    if (type.id === 'religious') score -= 2
    if (type.id === 'small' || type.id === 'religious') {
      if (p.budgetStyle === 'minimal') add(2, '적은 비용으로 형식을 갖춤')
    }
    if (type.id === 'outdoor' && p.priorities.includes('photo')) add(2, '사진이 예쁨')
    if (type.id === 'outdoor' && p.priorities.includes('parking')) score -= 1
    return { type, score, reasons }
  }).sort((a, b) => b.score - a.score)
}

// 우선순위에 걸린 체크 항목을 앞으로
export function orderedChecks(p: Profile) {
  return [...TOUR_CHECKS].sort((a, b) => Number(!!b.tag && p.priorities.includes(b.tag)) - Number(!!a.tag && p.priorities.includes(a.tag)))
}

// 준비 스타일과 남은 시간에 맞는 한 줄 조언
export function headline(p: Profile, daysLeft: number | null) {
  if (daysLeft !== null && daysLeft < 100)
    return '시간이 빠듯해요. 예식장·스드메를 한 번에 해결할 수 있는 플래너 패키지나 토탈 스튜디오가 현실적이에요.'
  if (p.prepStyle === 'planner') return '박람회부터 가기보다 플래너 2~3곳을 같은 조건으로 비교하는 게 시간과 돈을 아껴요.'
  if (p.prepStyle === 'romance') return '로망이 있다면 예식장부터 직접 보세요. 홀이 정해지면 어울리는 드레스와 촬영 무드가 따라와요.'
  return '발품을 판다면 기준표와 동선이 무기예요. 같은 조건으로 견적을 받아 나란히 비교하세요.'
}
