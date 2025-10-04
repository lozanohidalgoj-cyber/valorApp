import React from 'react'
import { parseCSV } from '../../utils/csv'
import { readWorkbookFromArrayBuffer, extractRawSheet } from '../../modules/analisisExpediente'

const ExportIcon: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
    <path d="M12 3v10" stroke="#0d3d75" strokeWidth="2" strokeLinecap="round" />
    <path d="M8.5 7.5L12 4l3.5 3.5" stroke="#0d3d75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="13" width="16" height="7" rx="2" stroke="#3a78c9" strokeWidth="2" fill="#e9f1ff" />
  </svg>
)

const ExportSaldoATR: React.FC = () => {
  const [info, setInfo] = React.useState<{ filas: number } | null>(() => {
    try {
      const s = localStorage.getItem('valorApp.analisis.atrCsv')
      if (!s) return null
      const p = JSON.parse(s)
      return { filas: Array.isArray(p?.rows) ? p.rows.length : 0 }
    } catch { return null }
  })
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      gap: '1.25rem',
      background: 'linear-gradient(180deg,#f5f9ff 0%, #ffffff 60%)'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 900 }}>
        <ExportIcon />
        <h1 style={{ fontSize: '2.4rem', margin: '0.5rem 0 0.25rem', fontWeight: 800, color: '#0d3d75' }}>
          Exportar Saldo ATR
        </h1>
        <p style={{ color: '#234e88', marginBottom: '1rem', fontSize: '1.05rem' }}>
          Selecciona tu archivo <strong>ATR.CSV</strong> para incorporarlo a la aplicación.
        </p>

  <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn btn-primary"
            style={{
              borderRadius: 14,
              background: 'linear-gradient(135deg,#0d3d75 0%,#1b58a9 50%,#3a78c9 100%)',
              border: '2px solid #5da0f0',
              color: '#fff',
              fontSize: '1.1rem',
              padding: '0.95rem 1.5rem',
              minWidth: 280
            }}
          >Exportar ATR.CSV a la aplicación</button>

          <a href="#/analisis-expediente" className="btn btn-secondary" style={{ borderRadius: 14 }}>
            Volver al análisis
          </a>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.xlsx,.xlsm"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            try {
              const name = (f.name || '').toLowerCase()
              // Detectar por firma mágica primero
              const head = await f.slice(0, 8).arrayBuffer()
              const u8 = new Uint8Array(head)
              const isZip = u8[0] === 0x50 && u8[1] === 0x4b // 'PK' zip (.xlsx/.xlsm)
              const isOle = u8[0] === 0xd0 && u8[1] === 0xcf && u8[2] === 0x11 && u8[3] === 0xe0 // .xls antiguo
              const looksExcel = isZip || isOle || name.endsWith('.xlsx') || name.endsWith('.xlsm') || name.endsWith('.xls') || /excel/i.test(f.type)
              const looksCsv = name.endsWith('.csv') || /csv/i.test(f.type)

              if (!looksExcel && looksCsv) {
                const text = await f.text()
                const parsed = parseCSV(text)
                localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify(parsed))
                setInfo({ filas: parsed.rows.length })
              } else {
                const buf = await f.arrayBuffer()
                const wb = readWorkbookFromArrayBuffer(buf)
                const rs = extractRawSheet(wb)
                // Guardar en el mismo formato que usa la vista previa
                localStorage.setItem('valorApp.analisis.atrCsv', JSON.stringify({ headers: rs.headers, rows: rs.rows }))
                setInfo({ filas: rs.rows.length })
              }
              // Ir a la vista previa tras exportar
              window.location.hash = '#/ver-saldo-atr'
            } catch (err) {
              console.error('Error leyendo archivo ATR (CSV/Excel)', err)
            } finally {
              e.currentTarget.value = ''
            }
          }}
        />

        {info && (
          <div style={{
            marginTop: '1rem',
            background: '#ffffff',
            border: '1px solid #e6edf7',
            borderRadius: 16,
            padding: '0.85rem 1rem',
            color: '#0d3d75',
            fontWeight: 700
          }}>
            ATR.CSV cargado: {info.filas} filas
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportSaldoATR
