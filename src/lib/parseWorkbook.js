import * as XLSX from 'xlsx'
import { COLS, REQUIRED, NUMERIC } from '../config/columnMap'

const norm = (v) => String(v ?? '').replace(/\s+/g, '').trim()

function toNumber(v) {
  if (v == null || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const n = Number(String(v).replace(/[,$%\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

const pad = (n) => String(n).padStart(2, '0')

// 문자열 / 엑셀 시리얼 / Date → YYYY-MM-DD
function toDateStr(v) {
  if (v == null || v === '') return null
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    return d ? `${d.y}-${pad(d.m)}-${pad(d.d)}` : null
  }
  const m = String(v).trim().match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
  return m ? `${m[1]}-${pad(m[2])}-${pad(m[3])}` : null
}

export async function parseFile(file) {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('xlsx 파일만 업로드할 수 있습니다.')
  let wb
  try {
    wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  } catch {
    throw new Error('파일을 읽을 수 없습니다. 손상된 파일이 아닌지 확인해 주세요.')
  }
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) throw new Error('데이터가 없습니다.')
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true })

  // 헤더 행 탐지: 상단 20행 중 알려진 컬럼명이 가장 많이 일치하는 행
  const known = new Set(Object.values(COLS).map(norm))
  let headerIdx = -1
  let best = 0
  grid.slice(0, 20).forEach((row, i) => {
    const hits = row.filter((c) => known.has(norm(c))).length
    if (hits > best) {
      best = hits
      headerIdx = i
    }
  })
  if (headerIdx < 0 || best < 3) throw new Error('헤더 행을 찾을 수 없습니다. 거래 내역 형식의 파일인지 확인해 주세요.')

  const headers = grid[headerIdx].map((h) => (h == null ? null : String(h).trim()))
  const missing = REQUIRED.filter((c) => !headers.map(norm).includes(norm(c)))
  if (missing.length) throw new Error(`필수 컬럼이 없습니다: ${missing.join(', ')}`)

  const rows = []
  for (const raw of grid.slice(headerIdx + 1)) {
    if (!raw || raw.every((c) => c == null || c === '')) continue
    const r = {}
    headers.forEach((h, i) => {
      if (h) r[h] = raw[i] ?? null
    })
    // 합계/요약 행 제외: 거래번호가 TR- 패턴이 아니면 제외
    if (!/^TR-/i.test(String(r[COLS.id] ?? '').trim())) continue

    NUMERIC.forEach((c) => (r[c] = toNumber(r[c])))
    if (r[COLS.amount] == null && r[COLS.volume] != null && r[COLS.price] != null) {
      r[COLS.amount] = r[COLS.volume] * r[COLS.price]
    }
    r[COLS.date] = toDateStr(r[COLS.date])
    const month = r[COLS.date] ? Number(r[COLS.date].slice(5, 7)) : null
    r['분기'] = month ? `Q${Math.ceil(month / 3)}` : null
    r['영업이익(USD)'] =
      r[COLS.amount] != null && r[COLS.margin] != null ? (r[COLS.amount] * r[COLS.margin]) / 100 : null
    rows.push(r)
  }
  if (!rows.length) throw new Error('데이터가 없습니다.')
  return { rows, sheetName: wb.SheetNames[0], fileName: file.name }
}
