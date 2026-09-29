import { useMemo, useRef, useState } from 'react'
import { parseFile } from './lib/parseWorkbook'
import { applyFilters, emptyFilters } from './lib/filters'
import { computeKpis, regionData, quarterData, entityData } from './lib/aggregate'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import KpiCards from './components/KpiCards'
import DataTable from './components/DataTable'
import { RegionChart, QuarterChart, EntityChart } from './components/charts/Charts'

export default function App() {
  const [data, setData] = useState(null) // { rows, fileName, loadedAt }
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const inputRef = useRef(null)

  const openPicker = () => inputRef.current?.click()

  async function handleFile(file) {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await parseFile(file)
      setData({ ...res, loadedAt: new Date() })
      setFilters(emptyFilters)
    } catch (e) {
      setError(e.message || '파일을 처리하지 못했습니다.') // 기존 화면 유지
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const filtered = useMemo(() => (data ? applyFilters(data.rows, filters) : []), [data, filters])
  const kpis = useMemo(() => computeKpis(filtered), [filtered])
  const regions = useMemo(() => regionData(filtered), [filtered])
  const quarters = useMemo(() => quarterData(filtered), [filtered])
  const entities = useMemo(() => entityData(filtered), [filtered])

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <header className="nav">
        <div className="container nav-inner">
          <span className="brand">
            <span className="corner-square" /> TRADING DASHBOARD
          </span>
          <button className="btn btn-primary" onClick={openPicker}>
            파일 업로드
          </button>
        </div>
      </header>

      <Hero data={data} loading={loading} error={error} onFile={handleFile} onPick={openPicker} />

      {data && (
        <main>
          <FilterBar
            rows={data.rows}
            filters={filters}
            setFilters={setFilters}
            shown={filtered.length}
            total={data.rows.length}
          />
          <div className="container section">
            <KpiCards kpis={kpis} />
          </div>
          <div className="container section">
            <div className="chart-grid">
              <RegionChart data={regions} />
              <EntityChart data={entities} />
              <QuarterChart data={quarters} wide />
            </div>
          </div>
          <div className="container section">
            <DataTable rows={filtered} onReset={() => setFilters(emptyFilters)} />
          </div>
        </main>
      )}

      <footer className="footer">
        <div className="container">데이터는 브라우저에서만 처리되며 서버로 전송되지 않습니다.</div>
      </footer>
    </>
  )
}
