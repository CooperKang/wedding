// 크롤러가 훑는 지역과 업체 분류. 사이트(src/data/regions.ts)도 같은 id를 쓴다.

export const REGIONS = [
  { id: 'gangnam', label: '서울 강남구', q: '강남구' },
  { id: 'seocho', label: '서울 서초구', q: '서초구' },
  { id: 'songpa', label: '서울 송파구', q: '송파구' },
  { id: 'gangdong', label: '서울 강동구', q: '강동구' },
  { id: 'yeongdeungpo', label: '서울 영등포구', q: '영등포구' },
  { id: 'mapo', label: '서울 마포구', q: '마포구' },
  { id: 'jongno', label: '서울 종로·중구', q: '종로구' },
  { id: 'yongsan', label: '서울 용산구', q: '용산구' },
  { id: 'gwangjin', label: '서울 광진·성동구', q: '광진구' },
  { id: 'gangseo', label: '서울 강서구', q: '강서구 서울' },
  { id: 'guro', label: '서울 구로구', q: '구로구' },
  { id: 'nowon', label: '서울 노원구', q: '노원구' },
  { id: 'suwon', label: '경기 수원', q: '수원' },
  { id: 'seongnam', label: '경기 성남·분당', q: '성남' },
  { id: 'goyang', label: '경기 고양·일산', q: '고양' },
  { id: 'yongin', label: '경기 용인', q: '용인' },
  { id: 'bucheon', label: '경기 부천', q: '부천' },
  { id: 'anyang', label: '경기 안양', q: '안양' },
  { id: 'incheon', label: '인천', q: '인천' },
  { id: 'daejeon', label: '대전', q: '대전' },
  { id: 'cheongju', label: '청주', q: '청주' },
  { id: 'cheonan', label: '천안', q: '천안' },
  { id: 'daegu', label: '대구', q: '대구' },
  { id: 'busan', label: '부산', q: '부산' },
  { id: 'ulsan', label: '울산', q: '울산' },
  { id: 'changwon', label: '창원', q: '창원' },
  { id: 'gwangju', label: '광주', q: '광주광역시' },
  { id: 'jeonju', label: '전주', q: '전주' },
  { id: 'jeju', label: '제주', q: '제주' },
]

// match: 카카오 분류 문자열(깊이별 분류를 '>'로 이은 것)에 들어 있어야 하는 말
export const CATEGORIES = [
  { id: 'hall', q: '웨딩홀', pages: 2, match: ['예식장'] },
  { id: 'hotel', q: '호텔웨딩', pages: 1, match: ['예식장', '호텔'] },
  { id: 'small', q: '스몰웨딩', pages: 1, match: ['예식장', '웨딩컨설팅', '양식', '레스토랑'] },
  { id: 'studio', q: '웨딩스튜디오', pages: 1, match: ['웨딩스튜디오', '사진'] },
  { id: 'dress', q: '웨딩드레스', pages: 1, match: ['웨딩드레스'] },
  { id: 'makeup', q: '웨딩메이크업', pages: 1, match: ['메이크업', '미용실'] },
  { id: 'planner', q: '웨딩플래너', pages: 1, match: ['웨딩컨설팅'] },
  { id: 'hanbok', q: '한복', pages: 1, match: ['한복'] },
  { id: 'jewelry', q: '웨딩반지', pages: 1, match: ['보석', '귀금속'] },
]

export const NEWS_QUERIES = ['신혼부부 지원', '결혼 세액공제', '신혼부부 대출', '결혼장려금', '예비부부 지원', '결혼서비스 가격']

export const BLOG_PER_RUN = 300
