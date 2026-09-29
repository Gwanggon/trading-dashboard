import { fmtCompact, fmtInt, fmtPct, fmtUsd, fmtUsdCompact } from '../lib/format'

function Card({ label, value, title, note }) {
  return (
    <div className="card stat" title={title}>
      <span className="corner-square" />
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

export default function KpiCards({ kpis }) {
  return (
    <div className="kpi-grid">
      <Card label="총 거래액" value={fmtUsdCompact(kpis.amount)} title={fmtUsd(kpis.amount)} />
      <Card label="총 영업이익" value={fmtUsdCompact(kpis.profit)} title={fmtUsd(kpis.profit)} note="총액 × 영업이익률" />
      <Card
        label="영업이익률"
        value={fmtPct(kpis.weightedMargin)}
        note="금액 가중평균 (총 영업이익 ÷ 총 거래액)"
      />
      <Card label="거래 건수" value={`${fmtInt(kpis.count)}건`} />
      <Card label="총 거래량" value={`${fmtCompact(kpis.volume)}톤`} title={`${fmtInt(kpis.volume)}톤`} />
      <Card
        label="최대 거래 사업부문"
        value={kpis.topSegment ? kpis.topSegment.name : '–'}
        note={kpis.topSegment ? `거래액 비중 ${fmtPct(kpis.topSegment.share, 0)}` : undefined}
      />
    </div>
  )
}
