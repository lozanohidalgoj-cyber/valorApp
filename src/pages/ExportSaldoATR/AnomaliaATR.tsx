import React from 'react'

interface ParsedCSV { headers: string[]; rows: Record<string,string>[] }

// Reutilizamos la clave usada por la importación existente
const useAtrCsv = (): ParsedCSV | null => {
  try {
    const s = localStorage.getItem('valorApp.analisis.atrCsv')
    if (!s) return null
    return JSON.parse(s)
  } catch { return null }
}

// Intentamos detectar columnas de fecha y de consumo numérico
function detectDateHeader(headers: string[]): string | null {
  const candidates = headers.filter(h => /fecha.*desde|inicio|desde/i.test(h) || /fecha/i.test(h))
  return candidates[0] || null
}
function detectValueHeader(headers: string[]): string | null {
  // Priorizamos columnas que incluyan kWh o consumo
  const kw = headers.find(h => /kwh|consumo|energ/i.test(h))
  if (kw) return kw
  // fallback: primera columna numérica encontrada más adelante dentro del dataset
  return null
}

function parseSpanishLikeNumber(raw: string): number | null {
  if (!raw) return null
  const s = raw.replace(/\./g,'').replace(/,/g,'.')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function parseDateLoose(v: any): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v
  if (typeof v === 'number' && isFinite(v)) {
    if (v > 59) { // posible serial Excel
      const epoch = Date.UTC(1899,11,30)
      return new Date(epoch + Math.round(v * 86400000))
    }
  }
  if (typeof v === 'string') {
    const s = v.trim()
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
    if (m) {
      const dd = Number(m[1]); const mm = Number(m[2]) - 1; const yyyy = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
      const d = new Date(yyyy, mm, dd)
      if (!isNaN(d.getTime())) return d
    }
    const d2 = new Date(s)
    if (!isNaN(d2.getTime())) return d2
  }
  return null
}

// Genera matriz: filas = meses (1..12), columnas = años encontrados
function buildMatrix(rows: Record<string,string>[], dateHeader: string, valueHeader: string | null, headers: string[]) {
  const matrix: Record<number, Record<number,{ sum: number; count: number }>> = {}
  const yearsSet = new Set<number>()
  rows.forEach(r => {
    const d = parseDateLoose(r[dateHeader])
    if (!d) return
    const year = d.getFullYear()
    const month = d.getMonth() // 0..11
    yearsSet.add(year)
    if (!matrix[month]) matrix[month] = {}
    if (!matrix[month][year]) matrix[month][year] = { sum: 0, count: 0 }
    // Intentamos encontrar un valor numérico
    let value: number | null = null
    if (valueHeader) value = parseSpanishLikeNumber(r[valueHeader])
    else {
      // fallback: buscar el primer campo numérico
      for (const h of headers) {
        const v = parseSpanishLikeNumber(r[h])
        if (v !== null) { value = v; break }
      }
    }
    if (value !== null) {
      matrix[month][year].sum += value
      matrix[month][year].count += 1
    }
  })
  const years = Array.from(yearsSet).sort((a,b)=>a-b)
  return { matrix, years }
}

function computeMinMax(matrix: Record<number, Record<number,{ sum: number; count: number }>>, years: number[]) {
  let min = Infinity; let max = -Infinity
  for (let m=0;m<12;m++) {
    const row = matrix[m]
    if (!row) continue
    for (const y of years) {
      const cell = row[y]
      if (!cell) continue
      const val = cell.sum // ahora trabajamos con TOTAL, no promedio
      if (val < min) min = val
      if (val > max) max = val
    }
  }
  if (min === Infinity) min = 0
  if (max === -Infinity) max = 0
  return { min, max }
}

function colorScale(val: number, min: number, max: number) {
  if (max === min) return '#f5f5f5'
  const t = (val - min) / (max - min) // 0..1
  // Escala invertida similar a Excel: bajo=rojo, medio=amarillo, alto=verde
  // Interpolamos en dos tramos: rojo (#f87171) -> amarillo (#fde047) -> verde (#4ade80)
  const mid = 0.5
  let r: number, g: number, b: number
  if (t < mid) {
    const tt = t / mid
    // rojo (248,113,113) a amarillo (253,224,71)
    const r1=248,g1=113,b1=113
    const r2=253,g2=224,b2=71
    r = Math.round(r1 + (r2-r1)*tt)
    g = Math.round(g1 + (g2-g1)*tt)
    b = Math.round(b1 + (b2-b1)*tt)
  } else {
    const tt = (t - mid)/(1-mid)
    // amarillo (253,224,71) a verde (74,222,128)
    const r1=253,g1=224,b1=71
    const r2=74,g2=222,b2=128
    r = Math.round(r1 + (r2-r1)*tt)
    g = Math.round(g1 + (g2-g1)*tt)
    b = Math.round(b1 + (b2-b1)*tt)
  }
  return `rgb(${r},${g},${b})`
}

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const AnomaliaATR: React.FC = () => {
  const data = useAtrCsv()

  if (!data || !data.headers.length) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: '#0d3d75', marginTop: 0 }}>Datos ATR no disponibles</h1>
        <p>Importa primero un archivo en la sección de Exportar Saldo ATR.</p>
        <a href="#/export-saldo-atr" className="btn btn-primary" style={{ borderRadius: 10 }}>Ir a importar</a>
      </div>
    )
  }

  const dateHeader = detectDateHeader(data.headers) || data.headers[0]
  const valueHeader = detectValueHeader(data.headers)
  const { matrix, years } = buildMatrix(data.rows, dateHeader, valueHeader, data.headers)
  const { min, max } = computeMinMax(matrix, years)

  // Totales por mes y año
  const monthlyTotals: number[] = []
  for (let m=0;m<12;m++) {
    let sum = 0
    const row = matrix[m]
    if (row) {
      for (const y of years) {
        const cell = row[y]
        if (cell) sum += cell.sum
      }
    }
    monthlyTotals[m] = sum
  }
  const yearlyTotals: Record<number, number> = {}
  for (const y of years) {
    let sum = 0
    for (let m=0;m<12;m++) {
      const row = matrix[m]
      const cell = row ? row[y] : undefined
      if (cell) sum += cell.sum
    }
    yearlyTotals[y] = sum
  }
  const grandTotal = years.reduce((acc,y)=>acc + (yearlyTotals[y]||0),0)

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
  <h1 style={{ fontSize: '2rem', margin: 0, color: '#0d3d75' }}>Promedio de E. Activa por meses y años</h1>
        <a href="#/ver-saldo-atr" className="btn btn-secondary" style={{ borderRadius: 8 }}>Volver</a>
      </div>
      <div style={{ fontSize: '.8rem', color: '#475569', marginBottom: '.75rem' }}>
        Fuente: fecha: <strong>{dateHeader}</strong>{valueHeader ? <>; valor: <strong>{valueHeader}</strong></> : '; valor: primera columna numérica detectada'}.<br />
        Escala de color: rojo (bajo) → amarillo (medio) → verde (alto). Valores: {min.toLocaleString('es-ES')} a {max.toLocaleString('es-ES')} (totales).
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #dbe3ef', borderRadius: 8, background: '#fff' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, top: 0, background: '#e2e2e6', padding: '.4rem .55rem', borderRight: '1px solid #d1d1d6', fontWeight: 600, fontSize: '.75rem', textTransform: 'lowercase' }}>Mes</th>
              {years.map(y => (
                <th key={y} style={{ top:0, background: '#e2e2e6', padding: '.4rem .55rem', borderLeft: '1px solid #dcdce1', fontWeight: 600, fontSize: '.75rem' }}>{y}</th>
              ))}
              <th style={{ top:0, background: '#d0d0d5', padding: '.4rem .55rem', borderLeft: '2px solid #bebec3', fontWeight: 600, fontSize: '.75rem' }}>Total mes</th>
            </tr>
          </thead>
          <tbody>
            {monthNames.map((mName, i) => {
              const row = matrix[i] || {}
              return (
                <tr key={i}>
                  <td style={{ position: 'sticky', left: 0, background: '#f8f8fa', padding: '.4rem .5rem', fontWeight: 500, borderRight: '1px solid #e2e2e7', fontSize: '.75rem', textTransform: 'lowercase' }}>{mName.toLowerCase()}</td>
                  {years.map(y => {
                    const cell = row[y]
                    let valDisplay = 'NA'
                    let val = NaN
                    if (cell && cell.count) {
                      // promedio (como en imagen) -> cell.sum / cell.count
                      val = cell.sum / cell.count
                      valDisplay = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val)
                    }
                    const hasVal = !isNaN(val)
                    const bg = hasVal ? colorScale(val, min, max) : '#fafafa'
                    const contrast = hasVal && (val > (min + (max - min) / 2)) ? '#1e293b' : '#1e293b'
                    return (
                      <td key={y} style={{ textAlign: 'right', padding: '.35rem .5rem', background: bg, color: contrast, fontWeight: 600, fontSize: '.7rem', transition: 'background .2s' }} title={hasVal ? `${valDisplay}` : 'Sin datos'}>
                        {valDisplay}
                      </td>
                    )
                  })}
                  {/* Total mensual */}
                  <td style={{ textAlign: 'right', padding: '.35rem .5rem', background: '#ececef', fontWeight: 600, borderLeft: '2px solid #bebec3', color: '#222', fontSize: '.7rem' }}>
                    {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(monthlyTotals[i] || 0)}
                  </td>
                </tr>
              )
            })}
            {/* Fila final: Total general */}
            <tr>
              <td style={{ position: 'sticky', left: 0, background: '#d5d5da', padding: '.45rem .5rem', fontWeight: 700, borderRight: '1px solid #bcbcc2', fontSize: '.7rem' }}>Total general</td>
              {years.map(y => {
                const val = yearlyTotals[y] || 0
                const valDisplay = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val)
                // Para la fila total usamos misma escala
                const bg = colorScale(val, min, max)
                const contrast = '#1e293b'
                return (
                  <td key={y} style={{ textAlign: 'right', padding: '.4rem .5rem', background: bg, color: contrast, fontWeight: 700, fontSize: '.7rem' }} title={valDisplay}>
                    {valDisplay}
                  </td>
                )
              })}
              <td style={{ textAlign: 'right', padding: '.4rem .5rem', background: '#c2c2c7', fontWeight: 700, borderLeft: '2px solid #b3b3b9', color: '#222', fontSize: '.7rem' }}>
                {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(grandTotal || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AnomaliaATR
