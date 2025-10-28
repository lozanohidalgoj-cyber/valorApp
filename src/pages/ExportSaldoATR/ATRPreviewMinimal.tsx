import React from 'react'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, any>[]
}

// Lee el dataset ATR importado desde localStorage
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

  const onDetect = React.useCallback(() => {
    window.alert('Detección desactivada temporalmente.\n\nEl botón ha sido reiniciado y queda listo para reprogramar desde cero.')
    console.log('🔧 Detectar anomalías: stub activo (sin análisis)')
  }, [])

  if (!data || !data.headers?.length) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Sin datos de ATR</h2>
        <p style={{ marginBottom: '1rem' }}>Primero exporta un archivo ATR (CSV/Excel) para previsualizar.</p>
        <a href="#/export-saldo-atr" style={{ color: '#0000D0', fontWeight: 700 }}>Ir a exportación</a>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Vista ATR (simplificada)</h1>
        <button onClick={onDetect} style={{
          background: '#0000D0', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700
        }}>Detectar anomalías</button>
      </div>

      <div style={{ overflow: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' }}>#</th>
              {data.headers.map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #f2f2f2' }}>{i + 1}</td>
                {data.headers.map((h, j) => (
                  <td key={j} style={{ padding: '0.5rem', borderBottom: '1px solid #f2f2f2', whiteSpace: 'nowrap' }}>{String(r[h] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ATRPreview
