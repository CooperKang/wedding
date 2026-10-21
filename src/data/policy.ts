// 신혼부부·예비부부 지원 정책. 숫자는 자주 바뀌니 기준일을 함께 보여 주고, 공식 확인처를 붙인다.
// 고칠 때는 POLICY_AS_OF도 함께 바꾼다.
export const POLICY_AS_OF = '2026년 10월 21일'

export type PolicyGroup = 'money' | 'home' | 'venue' | 'health' | 'consumer'

export type PolicyCard = {
  id: string
  group: PolicyGroup
  title: string
  benefit: string
  who: string[]
  tip?: string
  status?: string // 바뀔 수 있는 점
  deadline?: string // 'YYYY-MM-DD' 이날까지 해야 받는다
  links: { label: string; url: string }[]
}

export const POLICY_GROUPS: { id: PolicyGroup; label: string }[] = [
  { id: 'money', label: '세금·현금' },
  { id: 'home', label: '신혼집' },
  { id: 'venue', label: '예식' },
  { id: 'health', label: '건강' },
  { id: 'consumer', label: '소비자 보호' },
]

export const POLICIES: PolicyCard[] = [
  {
    id: 'marriage-tax',
    group: 'money',
    title: '결혼 세액공제',
    benefit: '혼인신고한 해 연말정산·종합소득세에서 1인 50만원, 부부 최대 100만원 세금을 깎아 줘요(생애 1회).',
    who: ['2024년 1월 1일 ~ 2026년 12월 31일에 혼인신고한 사람', '그해 낸 세금(결정세액)이 있어야 공제받을 수 있어요'],
    tip: '예식이 2027년이어도 혼인신고를 2026년 12월 31일까지 하면 받을 수 있어요. 신혼집 대출·청약 조건(소득 합산, 세대 구성)과 함께 따져 보고 신고 시점을 정하세요.',
    status: '정부 2026년 세제개편안(2026.8.3)에는 연장안이 없어요. 국회에 연장 법안이 발의돼 있지만 통과 여부는 확인되지 않았어요.',
    deadline: '2026-12-31',
    links: [{ label: '국가법령정보센터 조세특례제한법 제92조', url: 'https://www.law.go.kr/법령/조세특례제한법' }],
  },
  {
    id: 'gift-deduction',
    group: 'money',
    title: '혼인 증여재산 공제 1억원',
    benefit: '부모·조부모에게 받은 돈은 기본 공제(10년간 5,000만원)와 별도로 최대 1억원까지 증여세 없이 받을 수 있어요.',
    who: ['혼인신고일 전후 각 2년 이내에 받은 증여', '받는 사람 기준이라 두 사람이 각자 자기 부모님께 받으면 각각 적용된다는 해설이 많아요(국세청에서 꼭 확인)'],
    tip: '양가 지원금이 크다면 신고 기한(증여받은 달 말일부터 3개월)을 놓치지 마세요. 예산 장부의 지원금 기록이 근거 자료가 돼요.',
    links: [{ label: '국세청 상속·증여 세금 안내', url: 'https://www.nts.go.kr' }],
  },
  {
    id: 'local-bonus',
    group: 'money',
    title: '지자체 결혼장려금·결혼축하금',
    benefit: '일부 시·군은 결혼한 부부에게 수백만~1,000만원을 나눠 지급해요. 예: 전북 순창·김제·장수, 전남 화순, 충북 영동 최대 1,000만원(분할), 강원 정선 500만원.',
    who: ['대부분 일정 기간 이상 그 지역에 살아야 하고, 나이 제한이 있어요', '혼인신고 후 신청 기한이 있는 곳이 많아요'],
    status: '지자체마다 조건이 다르고 해마다 바뀌어요. 주소지 시·군청이나 복지로에서 확인하세요.',
    links: [
      { label: '복지로에서 지역 지원 찾기', url: 'https://www.bokjiro.go.kr' },
      { label: '정부24 보조금24', url: 'https://www.gov.kr/portal/rcvfvrSvc/main' },
    ],
  },
  {
    id: 'newlywed-buy',
    group: 'home',
    title: '신혼부부 전용 구입자금(디딤돌)',
    benefit: '연 2.55~3.85%, 최대 3.2억원. 전용 85㎡ 이하, 평가액 6억원 이하 주택.',
    who: ['혼인 7년 이내 또는 3개월 안에 결혼할 예정인 생애최초 구입자', '부부 합산 연소득 8,500만원 이하, 순자산 5.11억원 이하, 무주택 세대주'],
    tip: '결혼 예정자도 신청할 수 있어요. 첫 집 계산기에서 대출 한도와 DSR을 같이 계산해 보세요.',
    links: [
      { label: '주택도시기금 신혼부부전용 구입자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp' },
      { label: '첫 집 계산기', url: 'https://cooperkang.github.io/first-home/' },
    ],
  },
  {
    id: 'newlywed-jeonse',
    group: 'home',
    title: '신혼부부 전용 전세자금(버팀목)',
    benefit: '연 1.9~3.3%, 수도권 최대 2.5억원(그 외 1.6억원), 보증금의 80% 이내.',
    who: ['혼인 7년 이내 또는 3개월 안에 결혼할 예정인 무주택 세대주', '부부 합산 연소득 7,500만원 이하, 순자산 3.45억원 이하', '보증금 수도권 4억원, 그 외 3억원 이하, 전용 85㎡ 이하'],
    links: [{ label: '주택도시기금 신혼부부전용 전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020401.jsp' }],
  },
  {
    id: 'newborn',
    group: 'home',
    title: '신생아 특례 구입·전세자금',
    benefit: '구입 연 1.8~4.5% 최대 4억원(주택 9억원 이하), 전세 연 1.3~4.3% 최대 2.4억원.',
    who: ['대출 신청일 기준 2년 안에 아이를 낳은 가구', '부부 합산 연소득 1.3억원 이하(맞벌이 2억원 이하), 순자산 기준 있음'],
    links: [
      { label: '신생아 특례 구입자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030801.jsp' },
      { label: '신생아 특례 전세자금', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021401.jsp' },
    ],
  },
  {
    id: 'youth-dream',
    group: 'home',
    title: '청년 주택드림 디딤돌',
    benefit: '청년 주택드림 청약통장으로 당첨되면 연 2.4~4.15%, 신혼부부는 최대 4억원.',
    who: ['당첨 당시 만 39세 이하, 통장 가입 1년 이상·1,000만원 이상 납입', '신혼부부 합산 연소득 1억원 이하'],
    links: [{ label: '주택도시기금 청년 주택드림 디딤돌', url: 'https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030901.jsp' }],
  },
  {
    id: 'special-supply',
    group: 'home',
    title: '공공분양 신혼부부 특별공급',
    benefit: '공공분양 물량의 일부를 신혼부부에게 따로 공급해요. 신혼희망타운은 연 1.6% 고정금리 전용 모기지도 있어요.',
    who: ['혼인 7년 이내, 예비신혼부부, 6세 이하 자녀가 있는 가구', '무주택, 청약통장 6개월·6회 이상 납입', '소득: 우선공급 도시근로자 월평균소득 100%(맞벌이 120%), 추첨공급 맞벌이 200%까지', '자산: 부동산 2억 1,550만원, 자동차 4,542만원 이하'],
    tip: '예비신혼부부로 신청하면 입주 전까지 혼인 사실을 증명해야 해요. 혼인신고 시점과 청약 일정을 같이 보세요.',
    links: [
      { label: 'LH 청약플러스 신혼부부 특별공급', url: 'https://apply.lh.or.kr/lhapply/cm/cntnts/cntntsView.do?mi=1265&cntntsId=1051' },
      { label: '청약홈', url: 'https://www.applyhome.co.kr' },
    ],
  },
  {
    id: 'seoul-public-venue',
    group: 'venue',
    title: '서울시 공공예식장(더 아름다운 결혼식)',
    benefit: '서울시 공공시설 61곳을 무료 또는 저렴하게 빌려 예식을 올릴 수 있어요. 서울 거주 부부는 비품비를 최대 100만원 지원받아요.',
    who: ['서울에 살거나 서울로 출퇴근·통학하는 예비부부, 또는 부모 중 한 명이 서울 거주', '소득·나이 제한 없음'],
    tip: '서울시 집계로 공공예식장 이용 부부의 총비용은 1,000만원 안팎이에요. 상담센터 1899-2154.',
    links: [{ label: '서울시 공공예식장 안내', url: 'https://news.seoul.go.kr/welfare/archives/552332' }],
  },
  {
    id: 'local-venue',
    group: 'venue',
    title: '그 밖의 지역 공공 예식 공간',
    benefit: '시·군청, 구민회관, 도서관, 공원 등을 예식장으로 빌려주는 지자체가 늘고 있어요.',
    who: ['지자체마다 다름'],
    links: [{ label: '정부24에서 "공공예식장" 검색', url: 'https://www.gov.kr/search?srhQuery=%EA%B3%B5%EA%B3%B5%EC%98%88%EC%8B%9D%EC%9E%A5' }],
  },
  {
    id: 'fertility',
    group: 'health',
    title: '가임력(임신 사전건강관리) 검사 지원',
    benefit: '여성 최대 13만원(난소기능검사·부인과 초음파), 남성 최대 5만원(정액검사)을 지원해요. 나이 구간마다 1회, 최대 3회.',
    who: ['결혼 여부와 상관없이 20~49세 남녀'],
    tip: '검사 받기 전에 e보건소나 보건소에서 먼저 신청해야 해요. 검사부터 받으면 지원받을 수 없어요.',
    links: [{ label: 'e보건소', url: 'https://www.e-health.go.kr' }],
  },
  {
    id: 'price-display',
    group: 'consumer',
    title: '결혼서비스 가격표시제',
    benefit: '예식장과 결혼준비대행업체는 기본·선택 품목 가격과 위약금·환급 기준을 홈페이지나 참가격, 그리고 계약서 표지에 표시해야 해요.',
    who: ['2025년 11월 12일 시행, 2026년 8월부터 공정위 직접 점검(위반 시 과태료 최대 1억원)'],
    tip: '"옵션은 별도"처럼 금액 없이 적혀 있으면 금액을 적어 달라고 하세요. 회원가입해야만 가격을 보여 주는 것도 위반 소지가 있어요.',
    links: [
      { label: '참가격 결혼서비스 가격', url: 'https://www.price.go.kr/tprice/portal/wedding/areaStatistic.do' },
      { label: '정책브리핑 결혼준비대행업 표준약관', url: 'https://m.korea.kr/news/policyNewsView.do?newsId=148941326' },
    ],
  },
  {
    id: 'standard-contract',
    group: 'consumer',
    title: '결혼준비대행업 표준계약서',
    benefit: '원본·수정본 구입비, 드레스 피팅비, 메이크업 얼리스타트비처럼 사실상 필수인 항목은 기본 서비스에 포함해야 하고, 계약서에 없는 추가 비용은 요구할 수 없어요.',
    who: ['2025년 4월 공정위 제정. 플래너·스드메 계약에 적용'],
    tip: '피해를 입었다면 1372 소비자상담센터나 소비자24에 신고하세요. 2025년 결혼서비스 피해구제 신청의 82%가 계약 해지·위약금 문제였어요.',
    links: [
      { label: '소비자24', url: 'https://www.consumer.go.kr' },
      { label: '1372 소비자상담센터', url: 'https://www.ccn.go.kr' },
    ],
  },
]
