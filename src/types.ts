// 금액은 모두 만원 단위, 날짜는 'YYYY-MM-DD' 문자열

export type BudgetStyle = 'minimal' | 'smart' | 'standard' | 'luxury'
export type VenueStyle = 'hall' | 'hotel' | 'outdoor' | 'small' | 'undecided'
export type PrepStyle = 'planner' | 'romance' | 'diy'
export type SdmMode = 'total' | 'planner' | 'diy' | 'undecided'
export type Priority = 'parking' | 'food' | 'transit' | 'hall' | 'photo' | 'cost'

export type Profile = {
  weddingDate: string | null
  guests: number
  budgetStyle: BudgetStyle
  venueStyle: VenueStyle
  prepStyle: PrepStyle
  sdmMode: SdmMode
  region: string
  priorities: Priority[]
  groomName: string
  brideName: string
}

export type Payer = 'us' | 'groom' | 'bride' | 'groomParents' | 'brideParents' | 'gift' | 'other'

export type Payment = {
  id: string
  label: string
  amount: number
  due: string | null
  paid: string | null
  payer: Payer
}

export type BudgetCat = 'venue' | 'sdm' | 'snap' | 'hanbok' | 'rings' | 'gifts' | 'honeymoon' | 'invite' | 'beauty' | 'etc'

export type Item = {
  id: string
  cat: BudgetCat
  name: string
  vendor: string
  budget: number
  payments: Payment[]
  rating: number
  memo: string
  tip: string
}

export type Support = { id: string; from: Payer; amount: number; memo: string }

// 크롤러가 모은 업체(public/data/vendors.json)
export type VendorCat = 'hall' | 'hotel' | 'small' | 'studio' | 'dress' | 'makeup' | 'planner' | 'hanbok' | 'jewelry'

export type Vendor = {
  id: string
  name: string
  cat: VendorCat
  regions: string[]
  address: string
  lat: number
  lng: number
  rating: number
  ratingCount: number
  reviewCount: number
  parking: boolean
  tel: string
  homepage: string
}

export type Review = { posts: number; pos: number; neg: number; ad: number; top: { t: string; u: string }[]; at: string }

export type News = { title: string; source: string; url: string; date: string }

export type SourceMeta = { ok: boolean; count?: number; at?: string; error?: string; tried?: string }
export type Meta = Partial<Record<'vendors' | 'blog' | 'news', SourceMeta>>

// 동선에 담은 곳. 크롤링한 업체가 아니면 좌표가 없을 수 있다.
export type Pick = {
  id: string
  name: string
  cat: VendorCat | 'custom'
  lat: number | null
  lng: number | null
  stay: number // 분
  day: number // 몇째 날 투어인지
  memo: string
}

export type Saved = {
  v: 1
  profile: Profile
  checks: Record<string, string> // 할 일 id → 완료한 날
  items: Item[]
  supports: Support[]
  picks: Pick[]
  notes: string // 동생·친척에게 남기는 말
}
