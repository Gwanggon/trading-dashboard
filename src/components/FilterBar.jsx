import { useEffect, useState } from 'react'
import { COLS } from '../config/columnMap'
import { activeFilterCount, uniqueValues } from '../lib/filters'

function Chips({ label, options, value, onChange }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  return (
    <div className="chip-group">
      <span className="chip-label">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          className={'pill' + (value.includes(o) ? ' pill-active' : '')}
          aria-pressed={value.includes(o)}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function FilterBar({ rows, filters, setFilters, shown, total }) {
  const [text, setText] = useState(filters.query)

  // 300ms 디바운스
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.query === text ? f : { ...f, query: text })), 300)
    return () => clearTimeout(t)
  }, [text, setFilters])

  // 외부 초기화 반영
  useEffect(() => {
    if (filters.query === '') setText('')
  }, [filters.query])

  const count = activeFilterCount(filters)
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <section className="filterbar">
      <div className="container">
        <div className="filter-top">
          <input
            className="input"
            type="search"
            placeholder="거래번호, 고객사, 제품군, 도착지, 담당지점, 비고 검색"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="검색"
          />
          <div className="filter-count">
            <strong>{shown.toLocaleString('ko-KR')}</strong>건 / 전체 {total.toLocaleString('ko-KR')}건
            {count > 0 && <span className="badge-count">필터 {count}</span>}
          </div>
          <button
            className="btn btn-outline"
            disabled={count === 0}
            onClick={() => {
              setText('')
              setFilters({ query: '', segments: [], quarters: [], dealTypes: [] })
            }}
          >
            필터 초기화
          </button>
        </div>
        <div className="filter-chips">
          <Chips label="사업부문" options={uniqueValues(rows, COLS.segment)} value={filters.segments} onChange={set('segments')} />
          <Chips label="분기" options={['Q1', 'Q2', 'Q3', 'Q4']} value={filters.quarters} onChange={set('quarters')} />
          <Chips label="거래유형" options={uniqueValues(rows, COLS.dealType)} value={filters.dealTypes} onChange={set('dealTypes')} />
        </div>
      </div>
    </section>
  )
}
