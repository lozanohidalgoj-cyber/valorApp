import React from 'react'
import { AnalisisTable, useAnalisisExpediente, readWorkbookFromArrayBuffer, extractRawSheet } from '../../modules/analisisExpediente'
import { parseCSV } from '../../utils/csv'

const AnalisisExpediente: React.FC = () => {
  const { items, error, metrics, setFromWorkbook } = useAnalisisExpediente()
  const [raw, setRaw] = React.useState<{ headers: string[], rows: Record<string, any>[] } | null>(null)
  const [tipoContador, setTipoContador] = React.useState<string | null>(() => {
    try { return localStorage.getItem('valorApp.analisis.tipoContador') } catch { return null }
  })
  const [atrInfo, setAtrInfo] = React.useState<{ filas: number } | null>(() => {
    try {
      const s = localStorage.getItem('valorApp.analisis.atrCsv')
      if (!s) return null
      const p = JSON.parse(s)
      return { filas: Array.isArray(p?.rows) ? p.rows.length : 0 }
    } catch { return null }
  })
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem 1rem 3rem',
      background: 'linear-gradient(135deg, #f5f9ff 0%, #e6f0ff 100%)'
    }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', margin: '0 0 1rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#0000D0' }}>
          Análisis de Expediente
        </h1>
        

        {/* Selector de tipo de contador */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: 'none',
          borderRadius: 24,
          padding: '2.5rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 208, 0.15)'
        }}>
          <div style={{ color: '#0000D0', fontWeight: 700, fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)', lineHeight: 1.4 }}>
            Antes de empezar la valoración, indique el tipo de contador:
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setTipoContador('Tipo V')
                try { localStorage.setItem('valorApp.analisis.tipoContador', 'Tipo V') } catch { /* Ignorar error */ }
                window.location.hash = '#/export-saldo-atr'
              }}
              style={{
                borderRadius: 12,
                background: '#0000D0',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '1rem',
                padding: '1.125rem 2.25rem',
                minWidth: 220,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0000B8';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(0, 0, 208, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000D0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 208, 0.5)';
              }}
            >Contador Tipo V</button>
            <button
              type="button"
              onClick={() => {
                setTipoContador('Tipo IV')
                try { localStorage.setItem('valorApp.analisis.tipoContador', 'Tipo IV') } catch { /* Ignorar error */ }
              }}
              style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '1rem',
                padding: '1.125rem 2.25rem',
                minWidth: 220,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 25px -8px rgba(255, 49, 132, 0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #E6006F 0%, #CC005C 100%)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(255, 49, 132, 0.8)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(255, 49, 132, 0.6)';
              }}
            >Contador Tipo IV</button>
          </div>
          {/* Al elegir Tipo V navegamos a la pantalla dedicada de exportación */}
          {tipoContador && (
            <div style={{ 
              fontSize: '1rem', 
              color: '#0000D0',
              background: 'rgba(0, 0, 208, 0.05)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              ✓ Seleccionado: <strong>{tipoContador}</strong>
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
