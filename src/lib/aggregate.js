import { COLS, REGION_COL, ENTITY_COL } from '../config/columnMap'

const sum = (rows, key) => rows.reduce((s, r) => s + (r[key] ?? 0), 0)

function groupSum(rows, groupKey, valueKey) {
  const m = new Map()
  for (const r of rows) {
    const name = r[groupKey]
    if (name == null) continue
    const g = m.get(name) ?? { name, value: 0, count: 0, amount: 0 }
    g.value += r[valueKey] ?? 0
    g.amount += r[COLS.amount] ?? 0
    g.count += 1
    m.set(name, g)
  }
  return [...m.values()]
}

export function computeKpis(rows) {
  const amount = sum(rows, COLS.amount)
  const withProfit = rows.filter((r) => r['영업이익(USD)'] != null)
  const profit = sum(withProfit, '영업이익(USD)')
  const profitBase = sum(withProfit, COLS.amount)
  const bySeg = groupSum(rows, COLS.segment, COLS.amount).sort((a, b) => b.value - a.value)
  return {
    amount,
    profit,
    weightedMargin: profitBase ? (profit / profitBase) * 100 : null,
    count: rows.length,
    volume: sum(rows, COLS.volume),
    topSegment: bySeg[0] ? { name: bySeg[0].name, share: amount ? (bySeg[0].value / amount) * 100 : 0 } : null,
  }
}

// 상위 N개 + 나머지 '기타'
function topN(list, n) {
  const sorted = [...list].sort((a, b) => b.value - a.value)
  if (sorted.length <= n + 1) return sorted
  const head = sorted.slice(0, n)
  const rest = sorted.slice(n)
  head.push({
    name: `기타 (${rest.length}개)`,
    value: rest.reduce((s, x) => s + x.value, 0),
    amount: rest.reduce((s, x) => s + x.amount, 0),
    count: rest.reduce((s, x) => s + x.count, 0),
    isOther: true,
  })
  return head
}

export function regionData(rows, n = 10) {
  const total = sum(rows, COLS.amount)
  return topN(groupSum(rows, REGION_COL, COLS.amount), n).map((d) => ({
    ...d,
    share: total ? (d.value / total) * 100 : 0,
  }))
}

export function quarterData(rows) {
  let prev = null
  return ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
    const sub = rows.filter((r) => r['분기'] === q)
    const value = sum(sub, COLS.amount)
    const growth = prev ? ((value - prev) / prev) * 100 : null
    prev = value
    return { name: q, value, count: sub.length, growth }
  })
}

export function entityData(rows, n = 10) {
  const list = groupSum(
    rows.filter((r) => r['영업이익(USD)'] != null),
    ENTITY_COL,
    '영업이익(USD)',
  )
  return topN(list, n).map((d) => ({ ...d, margin: d.amount ? (d.value / d.amount) * 100 : null }))
}
