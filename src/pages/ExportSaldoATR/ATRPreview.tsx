import React from 'react'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

const useAtrCsv = (): ParsedCSV | null => {
  try {
    const s = localStorage.getItem('valorApp.analisis.atrCsv')
    if (!s) return null
    return JSON.parse(s)
  } catch {
    return null
  }
}

const ATRPreview: React.FC = () => {
  const data = useAtrCsv()
  const [page, setPage] = React.useState(1)
  const pageSize = 20

  const total = data?.rows?.length || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const current = data?.rows?.slice(start, start + pageSize) || []

  const isContratoHeader = (h: string) => ['Contrato ATR', 'Contrato'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  const isPotenciaHeader = (h: string) => ['Potencia (kW)', 'Potencia', 'Potencia kW'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  const normalizeNumber = (s: string) => {
    // Convierte "2.345,67" o "2,200" a número normalizado para comparar
    const t = (s || '').replace(/\./g, '').replace(/,/g, '.')
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
  }

  if (!data || !data.headers?.length) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '.5rem', color: '#0d3d75' }}>Sin datos de ATR</h1>
          <p style={{ color: '#234e88' }}>Primero exporta un archivo ATR.CSV a la aplicación.</p>
          <a href="#/export-saldo-atr" className="btn btn-primary" style={{ borderRadius: 12, marginTop: '0.75rem' }}>Ir a exportar</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#0d3d75' }}>Vista previa ATR</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#234e88' }}>{total} filas</span>
          <a href="#/export-saldo-atr" className="btn btn-secondary" style={{ borderRadius: 10 }}>Re-exportar</a>
          <a href="#/analisis-expediente" className="btn btn-primary" style={{ borderRadius: 10 }}>Volver</a>
        </div>
      </div>
      <div style={{ color: '#6b7280', fontSize: '.9rem', marginBottom: '.5rem' }}>
        Nota: se resaltan cambios de <strong style={{ color: '#b91c1c' }}>Contrato ATR</strong> y <strong style={{ color: '#b45309' }}>Potencia (kW)</strong> respecto a la fila anterior.
      </div>

      <div style={{ overflow: 'auto', border: '1px solid #c9d6e8', borderRadius: 8, background: '#fff', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, top: 0, zIndex: 3, background: '#eef3fb', borderRight: '1px solid #d7e2f3', color: '#203a5c', padding: '.4rem .5rem' }}></th>
              {data.headers.map(h => (
                <th key={h} style={{ padding: '.4rem .6rem', borderBottom: '1px solid #d7e2f3', borderRight: '1px solid #e6edf7', color: '#203a5c', background: '#eef3fb', textAlign: 'left', position: 'sticky', top: 0, zIndex: 2 }}>{h || '\u00A0'}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.map((r, i) => {
              const globalIndex = start + i
              const prev = globalIndex > 0 ? data.rows[globalIndex - 1] : null
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#fbfdff' }}>
                  <td style={{ position: 'sticky', left: 0, zIndex: 1, background: i % 2 === 0 ? '#f7faff' : '#eef5ff', borderRight: '1px solid #e6edf7', color: '#6b7280', padding: '.4rem .5rem', textAlign: 'right' }}>
                    {globalIndex + 1}
                  </td>
                  {data.headers.map((h, j) => {
                    const val = String(r[h] ?? '')
                    const prevVal = prev ? String(prev[h] ?? '') : ''
                    const contrato = isContratoHeader(h)
                    const potencia = isPotenciaHeader(h)
                    let changed = false
                    if (prev) {
                      if (contrato) {
                        changed = val.trim() !== prevVal.trim()
                      } else if (potencia) {
                        const a = normalizeNumber(val)
                        const b = normalizeNumber(prevVal)
                        changed = Number.isFinite(a) && Number.isFinite(b) ? a !== b : val.trim() !== prevVal.trim()
                      }
                    }
                    const color = changed ? (contrato ? '#b91c1c' : '#b45309') : '#223a5c'
                    const bg = changed ? (contrato ? '#fee2e2' : '#ffedd5') : undefined
                    const fontWeight = changed ? 700 : 400
                    const isNumeric = potencia || /^-?[0-9\.\,]+$/.test(val)
                    const align = isNumeric ? 'right' as const : 'left' as const
                    const display = isNumeric && !isNaN(normalizeNumber(val))
                      ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(normalizeNumber(val))
                      : val
                    return (
                      <td key={j} style={{ padding: '.4rem .6rem', borderTop: '1px solid #eef2f7', borderRight: '1px solid #eef2f7', color, background: bg, fontWeight, textAlign: align }}>
                        {display}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5rem', marginTop: '.75rem' }}>
        <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ borderRadius: 10 }}>Anterior</button>
        <span style={{ color: '#234e88' }}>Página {page} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ borderRadius: 10 }}>Siguiente</button>
      </div>
    </div>
  )
}

export default ATRPreview
