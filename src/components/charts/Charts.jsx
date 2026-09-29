import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { theme } from '../../config/theme'
import { REGION_LABEL, ENTITY_LABEL } from '../../config/columnMap'
import { fmtInt, fmtPct, fmtUsd, fmtUsdCompact } from '../../lib/format'

const axisTick = { fill: theme.mute, fontSize: 12 }

function Panel({ title, sub, wide, empty, children }) {
  return (
    <div className={'card panel' + (wide ? ' chart-wide' : '')}>
      <span className="corner-square" />
      <h2>{title}</h2>
      <div className="muted panel-sub">{sub}</div>
      {empty ? <div className="empty">표시할 데이터 없음</div> : children}
    </div>
  )
}

function TooltipBox({ title, lines }) {
  return (
    <div className="tip">
      <strong>{title}</strong>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  )
}

const barFill = (d) => (d.isOther ? theme.ash : d.value < 0 ? theme.error : theme.primary)

function HBar({ data, tip }) {
  const height = Math.max(240, data.length * 32 + 40)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid stroke={theme.hairline} strokeOpacity={0.5} horizontal={false} />
        <XAxis type="number" tick={axisTick} tickFormatter={fmtUsdCompact} stroke={theme.hairline} />
        <YAxis type="category" dataKey="name" width={96} tick={axisTick} stroke={theme.hairline} interval={0} />
        <ReferenceLine x={0} stroke={theme.mute} />
        <Tooltip
          cursor={{ fill: '#f7f7f7' }}
          content={({ active, payload }) => (active && payload?.length ? tip(payload[0].payload) : null)}
        />
        <Bar dataKey="value" radius={0} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.name} fill={barFill(d)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RegionChart({ data }) {
  return (
    <Panel title="지역별 매출" sub={`${REGION_LABEL} 기준 · 상위 10 + 기타`} empty={!data.length}>
      <HBar
        data={data}
        tip={(d) => (
          <TooltipBox
            title={d.name}
            lines={[`매출 ${fmtUsd(d.value)}`, `비중 ${fmtPct(d.share)}`, `거래 ${fmtInt(d.count)}건`]}
          />
        )}
      />
    </Panel>
  )
}

export function EntityChart({ data }) {
  return (
    <Panel title="법인별 영업이익" sub={`${ENTITY_LABEL} 기준 · 상위 10 + 기타`} empty={!data.length}>
      <HBar
        data={data}
        tip={(d) => (
          <TooltipBox
            title={d.name}
            lines={[`영업이익 ${fmtUsd(d.value)}`, `평균 이익률 ${fmtPct(d.margin)}`, `거래 ${fmtInt(d.count)}건`]}
          />
        )}
      />
    </Panel>
  )
}

export function QuarterChart({ data, wide }) {
  const empty = data.every((d) => d.count === 0)
  return (
    <Panel title="분기별 매출 추이" sub="달력 분기 (1~3월 = Q1)" wide={wide} empty={empty}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 8, right: 24, top: 8, bottom: 4 }}>
          <CartesianGrid stroke={theme.hairline} strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="name" tick={axisTick} stroke={theme.hairline} />
          <YAxis tick={axisTick} tickFormatter={fmtUsdCompact} stroke={theme.hairline} width={70} />
          <Tooltip
            cursor={{ fill: '#f7f7f7' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <TooltipBox
                  title={d.name}
                  lines={[
                    `매출 ${fmtUsd(d.value)}`,
                    `거래 ${fmtInt(d.count)}건`,
                    `전분기 대비 ${d.growth == null ? '–' : (d.growth >= 0 ? '+' : '') + fmtPct(d.growth)}`,
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="value" fill={theme.primary} radius={0} isAnimationActive={false} maxBarSize={96} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}
