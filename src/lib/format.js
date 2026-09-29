const nf = new Intl.NumberFormat('ko-KR')

export const fmtInt = (n) => (n == null ? '–' : nf.format(Math.round(n)))
export const fmtUsd = (n) => (n == null ? '–' : '$' + nf.format(Math.round(n)))
export const fmtPct = (n, d = 1) => (n == null ? '–' : n.toFixed(d) + '%')

export function fmtCompact(n) {
  if (n == null) return '–'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K'
  return sign + Math.round(abs)
}
export const fmtUsdCompact = (n) => (n == null ? '–' : (n < 0 ? '-$' : '$') + fmtCompact(Math.abs(n)))
