import { useEffect, useMemo, useState } from 'react'
import { TABLE_COLUMNS } from '../config/columnMap'
import { fmtInt, fmtPct, fmtUsd } from '../lib/format'

const fmt = {
  int: fmtInt,
  usd: fmtUsd,
  pct: (v) => fmtPct(v),
}

export default function DataTable({ rows, onReset }) {
  const [sort, setSort] = useState({ key: null, dir: 1 })
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const k = sort.key
    return [...rows].sort((a, b) => {
      const x = a[k]
      const y = b[k]
      if (x == null && y == null) return 0
      if (x == null) return 1 // 빈 값은 항상 뒤로
      if (y == null) return -1
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ko')
      return c * sort.dir
    })
  }, [rows, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => setPage(0), [rows, pageSize])
  const cur = Math.min(page, pages - 1)
  const slice = sorted.slice(cur * pageSize, cur * pageSize + pageSize)

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }))

  return (
    <div className="card panel">
      <span className="corner-square" />
      <div className="panel-head">
        <h2>원본 데이터</h2>
        <div className="panel-tools">
          <span className="muted">총 {rows.length.toLocaleString('ko-KR')}건</span>
          <label className="muted">
            페이지당{' '}
            <select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}행
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          조건에 맞는 데이터가 없습니다.
          <button className="btn btn-outline" onClick={onReset}>
            필터 초기화
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {TABLE_COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={['int', 'usd', 'pct'].includes(c.type) ? 'num' : ''}
                      aria-sort={sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                    >
                      <button className="th-btn" onClick={() => toggleSort(c.key)}>
                        {c.key}
                        <span className="sort-ind">{sort.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((r, i) => (
                  <tr key={r['거래번호'] ?? i}>
                    {TABLE_COLUMNS.map((c) => {
                      const v = r[c.key]
                      const isNum = ['int', 'usd', 'pct'].includes(c.type)
                      let content = v == null || v === '' ? '–' : isNum ? fmt[c.type](v) : v
                      if (c.type === 'badge' && v) content = <span className="badge">{v}</span>
                      return (
                        <td key={c.key} className={isNum ? 'num' : ''}>
                          {content}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <button className="btn btn-outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>
              이전
            </button>
            <span>
              {cur + 1} / {pages}
            </span>
            <button className="btn btn-outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>
              다음
            </button>
          </div>
        </>
      )}
    </div>
  )
}
