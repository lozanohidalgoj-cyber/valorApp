import React from 'react'
import { parseCSV } from '../../utils/csv'
import { readWorkbookFromArrayBuffer, extractRawSheet } from '../../modules/analisisExpediente'

const ExportIcon: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
    <path d="M12 3v10" stroke="#0000D0" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8.5 7.5L12 4l3.5 3.5" stroke="#0000D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="13" width="16" height="7" rx="2" stroke="#FF3184" strokeWidth="2" fill="rgba(255, 49, 132, 0.1)" />
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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      gap: '2rem',
      background: 'linear-gradient(135deg, #0000D0 0%, #2929E5 50%, #5252FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efectos decorativos */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(255,49,132,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '900px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <ExportIcon size={80} />
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', margin: '0 0 1rem', fontWeight: 800, color: '#0000D0', letterSpacing: '-0.01em' }}>
          Exportar Saldo ATR
        </h1>
        <p style={{ color: '#2929E5', marginBottom: '2rem', fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: 1.6, fontWeight: 500 }}>
          Selecciona tu archivo <strong style={{ color: '#0000D0' }}>ATR.CSV</strong> para incorporarlo a la aplicación.
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              padding: '1.25rem 2.5rem',
              minWidth: 280,
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
          >Exportar ATR.CSV</button>
        </div>

        <a 
          href="#/analisis-expediente"
          style={{
            display: 'inline-block',
            background: 'transparent',
            color: '#0000D0',
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '1rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0, 0, 208, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ← Volver al análisis
        </a>

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
            marginTop: '1.5rem',
            background: 'rgba(0, 200, 83, 0.1)',
            border: '2px solid rgba(0, 200, 83, 0.3)',
            borderRadius: 12,
            padding: '1rem 1.5rem',
            color: '#00A043',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <span>ATR.CSV cargado: <strong>{info.filas} filas</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportSaldoATR
