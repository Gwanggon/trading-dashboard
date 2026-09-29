// 요구 용어 ↔ 실제 엑셀 컬럼 매핑. 기준 컬럼을 바꾸려면 여기만 수정한다.
export const COLS = {
  date: '거래일',
  id: '거래번호',
  segment: '사업부문',
  product: '제품군',
  origin: '원산지',
  dest: '도착지',
  customer: '고객사',
  volume: '거래량(톤)',
  price: '단가(USD)',
  amount: '총액(USD)',
  dealType: '거래유형',
  branch: '담당지점',
  payment: '결제조건',
  margin: '영업이익률(%)',
  note: '비고',
}

export const REGION_COL = COLS.dest // 지역 = 도착지
export const ENTITY_COL = COLS.branch // 법인 = 담당지점
export const REGION_LABEL = '도착지'
export const ENTITY_LABEL = '담당지점'

export const REQUIRED = [COLS.date, COLS.id, COLS.amount]
export const NUMERIC = [COLS.volume, COLS.price, COLS.amount, COLS.margin]

// 표에 표시할 컬럼 (파생 컬럼 포함)
export const TABLE_COLUMNS = [
  { key: COLS.date, type: 'text' },
  { key: COLS.id, type: 'text' },
  { key: COLS.segment, type: 'badge' },
  { key: COLS.product, type: 'text' },
  { key: COLS.origin, type: 'text' },
  { key: COLS.dest, type: 'text' },
  { key: COLS.customer, type: 'text' },
  { key: COLS.volume, type: 'int' },
  { key: COLS.price, type: 'usd' },
  { key: COLS.amount, type: 'usd' },
  { key: COLS.dealType, type: 'text' },
  { key: COLS.branch, type: 'text' },
  { key: COLS.payment, type: 'text' },
  { key: COLS.margin, type: 'pct' },
  { key: '분기', type: 'text' },
  { key: '영업이익(USD)', type: 'usd' },
  { key: COLS.note, type: 'text' },
]

// 검색 대상 컬럼
export const SEARCH_COLS = [COLS.id, COLS.customer, COLS.product, COLS.dest, COLS.branch, COLS.note]
