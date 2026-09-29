import { useState } from 'react'

export default function Hero({ data, loading, error, onFile, onPick }) {
  const [drag, setDrag] = useState(false)

  const drop = (e) => {
    e.preventDefault()
    setDrag(false)
    onFile(e.dataTransfer.files?.[0])
  }

  const errorBox = error && (
    <div className="error-banner" role="alert">
      {error}
    </div>
  )

  if (data) {
    return (
      <section className="hero hero-compact">
        <div className="container hero-strip">
          <div>
            <div className="hero-file">{data.fileName}</div>
            <div className="hero-meta">
              {data.rows.length.toLocaleString('ko-KR')}행 · 첫 번째 시트 «{data.sheetName}» ·{' '}
              {data.loadedAt.toLocaleTimeString('ko-KR')} 업로드
            </div>
          </div>
          <button className="btn btn-outline-dark" onClick={onPick}>
            다른 파일 업로드
          </button>
        </div>
        {error && <div className="container">{errorBox}</div>}
      </section>
    )
  }

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <h1>글로벌 트레이딩 거래내역 대시보드</h1>
          <p className="hero-sub">엑셀(.xlsx) 파일을 올리면 표, 핵심 지표, 차트로 바로 보여드립니다.</p>
        </div>
        <div
          className={'dropzone' + (drag ? ' is-drag' : '')}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={drop}
        >
          <span className="corner-square" />
          <div className="dz-title">{loading ? '파일을 읽는 중…' : '여기로 파일을 끌어다 놓으세요'}</div>
          <div className="dz-sub">.xlsx 파일 · 브라우저에서만 처리됩니다</div>
          <button className="btn btn-primary" onClick={onPick} disabled={loading}>
            파일 선택
          </button>
        </div>
      </div>
      {error && <div className="container">{errorBox}</div>}
    </section>
  )
}
