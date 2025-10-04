import React from 'react'
import { AnalisisTable, useAnalisisExpediente, readWorkbookFromArrayBuffer, extractRawSheet } from '../../modules/analisisExpediente'

const AnalisisExpediente: React.FC = () => {
  const { items, error, metrics, setFromWorkbook } = useAnalisisExpediente()
  const [raw, setRaw] = React.useState<{ headers: string[], rows: Record<string, any>[] } | null>(null)
  const [tipoContador, setTipoContador] = React.useState<string | null>(() => {
    try { return localStorage.getItem('valorApp.analisis.tipoContador') } catch { return null }
  })

  // Carga automática desde un Excel embebido en /public si existe
  React.useEffect(() => {
    let aborted = false
    const tryLoadEmbedded = async () => {
      try {
        // Ruta: public/analisis-expedientes.xlsm (recomendado renombrar sin espacios ni acentos)
        const res = await fetch('/analisis-expedientes.xlsm')
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        if (aborted) return
        const wb = readWorkbookFromArrayBuffer(buf)
        const rs = extractRawSheet(wb)
        setRaw({ headers: rs.headers, rows: rs.rows })
        setFromWorkbook(wb)
      } catch {
        // Silencioso si no está el archivo
      }
    }
    tryLoadEmbedded()
    return () => { aborted = true }
  }, [setFromWorkbook])

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      padding: '2rem 1rem 3rem',
      background: '#f5f9ff'
    }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.6rem', margin: '0 0 .75rem', fontWeight: 800, letterSpacing: '.3px', color: '#0d3d75' }}>
          Análisis de Expediente
        </h1>
        

        {/* Selector de tipo de contador */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e6edf7',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '.9rem'
        }}>
          <div style={{ color: '#0d3d75', fontWeight: 800, fontSize: '1.15rem' }}>
            Antes de empezar la valoración cuéntame: el contador es
          </div>
          <div style={{ display: 'flex', gap: '.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setTipoContador('Tipo V')
                try { localStorage.setItem('valorApp.analisis.tipoContador', 'Tipo V') } catch {}
              }}
              className="btn btn-primary"
              style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg,#FF1493 0%,#ff3fab 40%,#ff66c0 100%)',
                border: '2px solid #ff8ccd',
                color: '#fff',
                fontSize: '1.05rem',
                padding: '0.9rem 1.4rem',
                minWidth: 220
              }}
            >Contador Tipo V</button>
            <button
              type="button"
              onClick={() => {
                setTipoContador('Tipo IV')
                try { localStorage.setItem('valorApp.analisis.tipoContador', 'Tipo IV') } catch {}
              }}
              className="btn btn-secondary"
              style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg,#00a846 0%,#00c55a 45%,#00e46c 100%)',
                border: '2px solid #4ce894',
                color: '#fff',
                fontSize: '1.05rem',
                padding: '0.9rem 1.4rem',
                minWidth: 220
              }}
            >Contador Tipo IV</button>
          </div>
          {tipoContador && (
            <div style={{ fontSize: '1rem', color: '#1f3b63' }}>
              Seleccionado: <strong>{tipoContador}</strong>
            </div>
          )}
        </div>

        {/* Mensaje de búsqueda eliminado a petición: no mostrar aviso mientras se carga el Excel */}

        {!!items.length && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <Kpi label="Filas" value={String(metrics.count)} />
            <Kpi label="Pinzas OK" value={`${metrics.pinzasOkPct}%`} />
            <Kpi label="Dif > 0.5" value={`${metrics.diferenciaOkPct}%`} />
          </div>
        )}

  {error && <div style={{ color: '#c1121f', fontWeight: 700 }}>{error}</div>}

        {!!raw && raw.rows.length > 0 && (
          <div style={{ marginTop: '1rem', background: '#fff', border: '1px solid #e6edf7', borderRadius: 16, padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#0d3d75', marginBottom: '.5rem' }}>Vista cruda (tal cual Excel)</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {raw.headers.map(h => (
                      <th key={h} style={{ padding: '.5rem .6rem', borderBottom: '1px solid #e6edf7', color: '#203a5c', background: '#f1f5fb', textAlign: 'left' }}>{h || '\u00A0'}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raw.rows.map((r, i) => (
                    <tr key={i}>
                      {raw.headers.map((h, j) => (
                        <td key={j} style={{ padding: '.5rem .6rem', borderTop: '1px solid #e6edf7', color: '#223a5c' }}>
                          {String(r[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AnalisisTable items={items} />

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.9rem', justifyContent: 'center' }}>
          <a href="#/" className="btn btn-primary" style={{ borderRadius: 12, fontSize: '1.05rem', padding: '0.85rem 1.3rem', minWidth: 160 }}>Volver</a>
        </div>
      </div>
    </div>
  )
}

const Kpi: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e6edf7',
    borderRadius: 16,
    padding: '0.85rem 1rem'
  }}>
    <div style={{ fontSize: '.9rem', color: '#35507a' }}>{label}</div>
    <div style={{ fontSize: '1.4rem', color: '#0d3d75', fontWeight: 800 }}>{value}</div>
  </div>
)

export default AnalisisExpediente
