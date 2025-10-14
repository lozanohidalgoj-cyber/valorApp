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
  const [filteredRows, setFilteredRows] = React.useState<Record<string,string>[]>(() => data?.rows || [])
  const [anuladas, setAnuladas] = React.useState<number>(0)
  const [detalleAnuladas, setDetalleAnuladas] = React.useState<{comp: number; anuladas: number; anuladoras: number}>({ comp: 0, anuladas: 0, anuladoras: 0 })
  const [ordenado, setOrdenado] = React.useState<boolean>(false)
  const total = filteredRows.length

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
  const fechaDesdeHeader = React.useMemo(() => (data?.headers.find(h => isFechaDesdeHeader(h)) || null), [data])
  const fechaHastaHeader = React.useMemo(() => (data?.headers.find(h => isFechaHastaHeader(h)) || null), [data])
  const contractColorMap = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!data || !contractHeader) return map
    let idx = 0
    for (const r of filteredRows) {
      const key = String(r[contractHeader] ?? '').trim()
      if (!map.has(key)) {
        map.set(key, groupPalette[idx % groupPalette.length])
        idx++
      }
    }
    return map
  }, [filteredRows, contractHeader])

  // Duración total por contrato: desde primera "Fecha desde" hasta última "Fecha hasta"
  const plural = (n: number, s: string, p: string) => (n === 1 ? s : p)
  const diffMonthsDays = (start: Date, end: Date) => {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    let anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
    if (anchor > end) {
      months--
      anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
    }
    const days = Math.max(0, Math.floor((end.getTime() - anchor.getTime()) / 86400000))
    const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
    return { months, days, totalDays }
  }

  const contractDurationText = React.useMemo(() => {
    const map = new Map<string, string>()
    if (!data || !contractHeader || !fechaDesdeHeader || !fechaHastaHeader) return map
    const acc = new Map<string, { minDesde: Date | null, maxHasta: Date | null }>()
    for (const r of filteredRows) {
      const key = String(r[contractHeader] ?? '').trim()
      const dDesde = parseDateLoose(r[fechaDesdeHeader])
      const dHasta = parseDateLoose(r[fechaHastaHeader])
      if (!acc.has(key)) acc.set(key, { minDesde: null, maxHasta: null })
      const cur = acc.get(key)!
      if (dDesde && (!cur.minDesde || dDesde < cur.minDesde)) cur.minDesde = dDesde
      if (dHasta && (!cur.maxHasta || dHasta > cur.maxHasta)) cur.maxHasta = dHasta
    }
    for (const [key, { minDesde, maxHasta }] of acc) {
      if (minDesde && maxHasta && maxHasta >= minDesde) {
        const { months, days } = diffMonthsDays(minDesde, maxHasta)
        const years = Math.floor(months / 12)
        const remMonths = months % 12
        const parts: string[] = []
        if (years > 0) parts.push(`${years} ${plural(years, 'año', 'años')}`)
        if (remMonths > 0) parts.push(`${remMonths} ${plural(remMonths, 'mes', 'meses')}`)
        if (days > 0) parts.push(`${days} ${plural(days, 'día', 'días')}`)
        if (parts.length === 0) parts.push('0 días')
        let text: string
        if (parts.length === 1) text = parts[0]
        else if (parts.length === 2) text = parts.join(' y ')
        else text = parts.slice(0, -1).join(', ') + ' y ' + parts[parts.length - 1]
        map.set(key, text)
      } else {
        map.set(key, '')
      }
    }
    return map
  }, [filteredRows, contractHeader, fechaDesdeHeader, fechaHastaHeader])


  // Índice de CUPS para insertar la columna a su derecha
  const cupsIndex = React.useMemo(() => (data ? data.headers.findIndex(h => (h || '').toString().toLowerCase().trim() === 'cups') : -1), [data])

  const handleOrdenar = React.useCallback(() => {
    if (!data || ordenado) return
    const tipoHeader = data.headers.find(h => (h || '').toLowerCase().trim() === 'tipo de factura')
    if (!tipoHeader) return
    const valoresAnular = new Set(['factura complementaria','anulada','anuladora','enviado a facturar'])
    const originales = data.rows
    const restantes: Record<string,string>[] = []
    let count = 0
    let comp = 0, anul = 0, anuladora = 0
    for (const r of originales) {
      const tipo = (r[tipoHeader] || '').toString().toLowerCase().trim()
      if (valoresAnular.has(tipo)) {
        count++
        if (tipo === 'factura complementaria') comp++
        else if (tipo === 'anulada') anul++
        else if (tipo === 'anuladora') anuladora++
        continue
      }
      restantes.push(r)
    }
    setFilteredRows(restantes)
    setAnuladas(count)
    setDetalleAnuladas({ comp, anuladas: anul, anuladoras: anuladora })
    setOrdenado(true)
  }, [data, ordenado])

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
      {anuladas > 0 && (
        <div
          style={{
            background: 'linear-gradient(90deg,#16a34a,#22c55e)',
            border: '2px solid #065f46',
            padding: '.9rem 1.1rem',
            borderRadius: 12,
            marginBottom: '.95rem',
            color: '#ffffff',
            fontSize: '.95rem',
            fontWeight: 600,
            lineHeight: 1.35,
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)'
          }}
        >
          ✅ Se han anulado {anuladas} factura{anuladas === 1 ? '' : 's'} del listado.<br />
          <span style={{ fontSize: '.85rem', fontWeight: 500 }}>
            Detalle: Factura complementaria: {detalleAnuladas.comp} | Anuladas: {detalleAnuladas.anuladas} | Anuladoras: {detalleAnuladas.anuladoras}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#0d3d75' }}>Vista previa ATR</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#234e88' }}>{total} filas</span>
          <button
            type="button"
            onClick={handleOrdenar}
            disabled={ordenado}
            className="btn"
            style={{
              borderRadius: 14,
              opacity: ordenado ? 0.65 : 1,
              padding: '.75rem 1.5rem',
              background: ordenado ? 'linear-gradient(90deg,#a1a1aa,#71717a)' : 'linear-gradient(90deg,#d946ef,#9333ea)',
              border: '2px solid ' + (ordenado ? '#52525b' : '#86198f'),
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '.5px',
              cursor: ordenado ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
              transition: 'all .2s'
            }}
            title={ordenado ? 'Filtro ya aplicado' : 'Anular facturas seleccionadas'}
            onMouseEnter={e => { if (!ordenado) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { if (!ordenado) (e.currentTarget as HTMLButtonElement).style.filter = 'none' }}
          >
            {ordenado ? 'Filtrado aplicado' : 'Ordenar'}
          </button>
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
              {data.headers.map((h, idx) => (
                <React.Fragment key={idx}>
                  <th style={{ padding: '.4rem .6rem', borderBottom: '1px solid #d7e2f3', borderRight: '1px solid #e6edf7', color: '#203a5c', background: '#eef3fb', textAlign: 'left', position: 'sticky', top: 0, zIndex: 2 }}>{h || '\u00A0'}</th>
                  {idx === cupsIndex && (
                    <th style={{ padding: '.4rem .6rem', borderBottom: '1px solid #d7e2f3', borderRight: '1px solid #e6edf7', color: '#203a5c', background: '#eef3fb', textAlign: 'left', position: 'sticky', top: 0, zIndex: 2 }}>
                      Duración total del contrato
                    </th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => {
              const prev = i > 0 ? filteredRows[i - 1] : null
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
                      <React.Fragment key={j}>
                        <td style={{ padding: '.4rem .6rem', borderTop: '1px solid #eef2f7', borderRight: '1px solid #eef2f7', color, background: bg, fontWeight, textAlign: align }}>
                          {display}
                        </td>
                        {j === cupsIndex && (
                          <td style={{ padding: '.4rem .6rem', borderTop: '1px solid #eef2f7', borderRight: '1px solid #eef2f7', color: '#223a5c', background: rowBg || undefined, fontWeight: 600 }}>
                            {contractDurationText.get(contractKey) || ''}
                          </td>
                        )}
                      </React.Fragment>
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
