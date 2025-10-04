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
  const total = data?.rows?.length || 0

  const isContratoHeader = (h: string) => ['Contrato ATR', 'Contrato'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  const isPotenciaHeader = (h: string) => ['Potencia (kW)', 'Potencia', 'Potencia kW'].some(x => x.toLowerCase() === (h || '').toLowerCase())
  const stripAccents = (s: string) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const isFechaEnvioHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha de envio a facturar' || (t.includes('fecha') && t.includes('envio') && (t.includes('factur') || t.includes('facturar')))
  }
  const isFechaDesdeHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha desde' || (t.includes('fecha') && t.includes('desde'))
  }
  const isFechaHastaHeader = (h: string) => {
    const t = stripAccents(h).toLowerCase().trim()
    return t === 'fecha hasta' || (t.includes('fecha') && t.includes('hasta'))
  }
  const normalizeNumber = (s: string) => {
    // Convierte "2.345,67" o "2,200" a número normalizado para comparar
    const t = (s || '').replace(/\./g, '').replace(/,/g, '.')
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
  }
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
  const fromExcelSerial = (serial: number): Date => {
    // Excel 1900 date system: serial 1 -> 1899-12-31; tomamos base 1899-12-30 por bug del 1900 leap
    const epoch = Date.UTC(1899, 11, 30)
    return new Date(epoch + Math.round(serial * 86400000))
  }
  const parseDateLoose = (v: any): Date | null => {
    if (v instanceof Date && !isNaN(v.getTime())) return v
    if (typeof v === 'number' && isFinite(v)) {
      // Si parece serial de Excel (rango típico > 20000)
      if (v > 59) return fromExcelSerial(v)
      // Si es timestamp (ms)
      if (v > 1000000000000) return new Date(v)
    }
    if (typeof v === 'string') {
      const s = v.trim()
      // dd/MM/yyyy [HH:mm[:ss]]
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
      if (m) {
        const dd = Number(m[1]); const mm = Number(m[2]) - 1; const yyyy = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
        const HH = Number(m[4] ?? 0); const MM = Number(m[5] ?? 0); const SS = Number(m[6] ?? 0)
        const d = new Date(yyyy, mm, dd, HH, MM, SS)
        if (!isNaN(d.getTime())) return d
      }
      const d2 = new Date(s)
      if (!isNaN(d2.getTime())) return d2
    }
    return null
  }
  const formatDateES = (v: any): string => {
    const d = parseDateLoose(v)
    if (!d) return String(v ?? '')
    const Y = d.getFullYear(); const M = pad2(d.getMonth() + 1); const D = pad2(d.getDate())
    const h = pad2(d.getHours()); const m = pad2(d.getMinutes()); const s = d.getSeconds()
    const time = s ? `${h}:${m}:${pad2(s)}` : `${h}:${m}`
    // Si hora es 00:00 y no hay indicios de tiempo, solo fecha
    if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) return `${D}/${M}/${Y}`
    return `${D}/${M}/${Y} ${time}`
  }

  // Colores por grupo de contrato (pasteles suaves)
  const groupPalette = ['#fefce8', '#eef2ff', '#ecfdf5', '#fdf2f8', '#f0f9ff', '#fff7ed', '#f5f3ff', '#e8f5e9', '#ede7f6', '#fffde7']
  const contractHeader = React.useMemo(() => (data?.headers.find(h => isContratoHeader(h)) || null), [data])
  const contractColorMap = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!data || !contractHeader) return map
    let idx = 0
    for (const r of data.rows) {
      const key = String(r[contractHeader] ?? '').trim()
      if (!map.has(key)) {
        map.set(key, groupPalette[idx % groupPalette.length])
        idx++
      }
    }
    return map
  }, [data, contractHeader])

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
    <div style={{ padding: '1rem', maxWidth: '95vw', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#0d3d75' }}>Vista previa ATR</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#234e88' }}>{total} filas</span>
          <a href="#/export-saldo-atr" className="btn btn-secondary" style={{ borderRadius: 10 }}>Re-exportar</a>
          <a href="#/analisis-expediente" className="btn btn-primary" style={{ borderRadius: 10 }}>Volver</a>
        </div>
      </div>
      <div style={{ color: '#6b7280', fontSize: '.9rem', marginBottom: '.5rem' }}>
        Nota: se resaltan cambios de <strong style={{ color: '#b91c1c' }}>Contrato ATR</strong> y <strong style={{ color: '#b45309' }}>Potencia (kW)</strong> respecto a la fila anterior.
      </div>

      <div style={{ overflowY: 'auto', overflowX: 'auto', border: '1px solid #c9d6e8', borderRadius: 8, background: '#fff', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.03)', maxHeight: 'calc(100vh - 220px)' }}>
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
            {data.rows.map((r, i) => {
              const prev = i > 0 ? data.rows[i - 1] : null
              const contractKey = contractHeader ? String(r[contractHeader] ?? '').trim() : ''
              const rowBg = contractColorMap.get(contractKey)
              return (
                <tr key={i} style={{ background: rowBg || (i % 2 === 0 ? '#ffffff' : '#fbfdff') }}>
                  <td style={{ position: 'sticky', left: 0, zIndex: 1, background: rowBg || (i % 2 === 0 ? '#f7faff' : '#eef5ff'), borderRight: '1px solid #e6edf7', color: '#6b7280', padding: '.4rem .5rem', textAlign: 'right' }}>
                    {i + 1}
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
                    // Prioridad: si potencia changed -> fondo ámbar; si no, usar fondo por grupo de contrato; ya no sobreescribir por cambio de contrato
                    const bg = changed && potencia ? '#ffedd5' : (rowBg || undefined)
                    const fontWeight = changed ? 700 : 400
                    const isFechaEnvio = isFechaEnvioHeader(h)
                    const isFechaDesde = isFechaDesdeHeader(h)
                    const isFechaHasta = isFechaHastaHeader(h)
                    const isDateCol = isFechaEnvio || isFechaDesde || isFechaHasta
                    const isNumeric = !isDateCol && (potencia || /^-?[0-9\.\,]+$/.test(val))
                    const align = isNumeric ? 'right' as const : 'left' as const
                    const display = isDateCol
                      ? formatDateES(r[h])
                      : (isNumeric && !isNaN(normalizeNumber(val))
                        ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(normalizeNumber(val))
                        : val)
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
    </div>
  )
}

export default ATRPreview
