// crawler/config.mjs의 REGIONS와 같은 id를 쓴다(테스트로 확인)
export const REGIONS: { id: string; label: string; group: string }[] = [
  { id: 'gangnam', label: '강남구', group: '서울' },
  { id: 'seocho', label: '서초구', group: '서울' },
  { id: 'songpa', label: '송파구', group: '서울' },
  { id: 'gangdong', label: '강동구', group: '서울' },
  { id: 'yeongdeungpo', label: '영등포구', group: '서울' },
  { id: 'mapo', label: '마포구', group: '서울' },
  { id: 'jongno', label: '종로·중구', group: '서울' },
  { id: 'yongsan', label: '용산구', group: '서울' },
  { id: 'gwangjin', label: '광진·성동구', group: '서울' },
  { id: 'gangseo', label: '강서구', group: '서울' },
  { id: 'guro', label: '구로구', group: '서울' },
  { id: 'nowon', label: '노원구', group: '서울' },
  { id: 'suwon', label: '수원', group: '경기·인천' },
  { id: 'seongnam', label: '성남·분당', group: '경기·인천' },
  { id: 'goyang', label: '고양·일산', group: '경기·인천' },
  { id: 'yongin', label: '용인', group: '경기·인천' },
  { id: 'bucheon', label: '부천', group: '경기·인천' },
  { id: 'anyang', label: '안양', group: '경기·인천' },
  { id: 'incheon', label: '인천', group: '경기·인천' },
  { id: 'daejeon', label: '대전', group: '충청' },
  { id: 'cheongju', label: '청주', group: '충청' },
  { id: 'cheonan', label: '천안', group: '충청' },
  { id: 'daegu', label: '대구', group: '경상' },
  { id: 'busan', label: '부산', group: '경상' },
  { id: 'ulsan', label: '울산', group: '경상' },
  { id: 'changwon', label: '창원', group: '경상' },
  { id: 'gwangju', label: '광주', group: '전라·제주' },
  { id: 'jeonju', label: '전주', group: '전라·제주' },
  { id: 'jeju', label: '제주', group: '전라·제주' },
]

export function regionLabel(id: string) {
  const r = REGIONS.find((x) => x.id === id)
  return r ? (r.group === '서울' ? `서울 ${r.label}` : r.label) : id
}
