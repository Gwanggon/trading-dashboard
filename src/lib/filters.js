import { COLS, SEARCH_COLS } from '../config/columnMap'

export const emptyFilters = { query: '', segments: [], quarters: [], dealTypes: [] }

export function applyFilters(rows, f) {
  const q = f.query.trim().toLowerCase()
  return rows.filter((r) => {
    if (f.segments.length && !f.segments.includes(r[COLS.segment])) return false
    if (f.quarters.length && !f.quarters.includes(r['분기'])) return false
    if (f.dealTypes.length && !f.dealTypes.includes(r[COLS.dealType])) return false
    if (q && !SEARCH_COLS.some((c) => String(r[c] ?? '').toLowerCase().includes(q))) return false
    return true
  })
}

export const activeFilterCount = (f) =>
  (f.query.trim() ? 1 : 0) + (f.segments.length ? 1 : 0) + (f.quarters.length ? 1 : 0) + (f.dealTypes.length ? 1 : 0)

export const uniqueValues = (rows, col) => [...new Set(rows.map((r) => r[col]).filter((v) => v != null))].sort()
