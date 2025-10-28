import React from 'react'

// Datos leídos de localStorage por ExportSaldoATR
interface ParsedCSV { headers: string[]; rows: Record<string, any>[] }
type DateChoice = { header: string; kind: 'hasta' | 'desde' | 'periodo' | 'factura' }

// Hooks y utilidades base
const useAtrCsv = (): ParsedCSV | null => {
  try {
    const s = localStorage.getItem('valorApp.analisis.atrCsv')
    if (!s) return null
    return JSON.parse(s)
  } catch { return null }
}
const normalizeLabel = (v: any) => (v ?? '').toString().toLowerCase().trim()
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const normalizeNumber = (raw: any): number | null => {
  if (raw == null) return null
  const s = String(raw).replace(/\./g, '').replace(/,/g, '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
const parseDateLoose = (v: any): Date | null => {
  if (v instanceof Date && !isNaN(v.getTime())) return v
  if (typeof v === 'number' && isFinite(v)) {
    if (v > 59) { const epoch = Date.UTC(1899, 11, 30); return new Date(epoch + Math.round(v * 86400000)) }
  }
  if (typeof v === 'string') {
    const s = v.trim()
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
    if (m) { const dd = +m[1], mm = +m[2] - 1, yyyy = +(m[3].length === 2 ? `20${m[3]}` : m[3]); const d = new Date(yyyy, mm, dd); if (!isNaN(d.getTime())) return d }
    const d2 = new Date(s); if (!isNaN(d2.getTime())) return d2
  }
  return null
}
const parsePeriodoStart = (raw: string): Date | null => {
  const s = (raw || '').toString().trim()
  let m = s.match(/^(\d{1,2})\/(\d{4})$/); if (m) return new Date(+m[2], +m[1] - 1, 1)
  m = s.match(/^(\d{4})[-\/]?(\d{1,2})$/); if (m) return new Date(+m[1], +m[2] - 1, 1)
  m = s.match(/^(\d{4})(\d{2})$/); if (m) return new Date(+m[1], +m[2] - 1, 1)
  return null
}

// Heurísticas de cabeceras
const isFechaHasta = (h: string) => /fecha\s*hasta/i.test(h)
const isFechaDesde = (h: string) => /fecha\s*desde/i.test(h)
const isPeriodo = (h: string) => /periodo/i.test(h)
const isFechaFactura = (h: string) => /fecha.*factur/i.test(h)
const isConsumoActivaHeader = (h: string) => /consumo.*activa|kwh|energ/i.test(normalizeLabel(h))
const isFuenteAgregadaHeader = (h: string) => /fuente.*agregad/i.test(normalizeLabel(h))
const isEstadoMedidaHeader = (h: string) => /estado.*medid/i.test(normalizeLabel(h))
const isTipoFacturaHeader = (h: string) => /tipo.*factur|estimad|real/i.test(normalizeLabel(h))

const pickPrimaryDateHeader = (headers: string[]): DateChoice | null => {
  const hasta = headers.find(isFechaHasta); if (hasta) return { header: hasta, kind: 'hasta' }
  const desde = headers.find(isFechaDesde); if (desde) return { header: desde, kind: 'desde' }
  const periodo = headers.find(isPeriodo); if (periodo) return { header: periodo, kind: 'periodo' }
  const factura = headers.find(isFechaFactura); if (factura) return { header: factura, kind: 'factura' }
  return null
}

// Serie mensual agregada
type Monthly = { key: string; year: number; month: number; fecha: Date; consumo: number }
function buildMonthlySeries(rows: Record<string, any>[], headers: string[]) {
  const dateChoice = pickPrimaryDateHeader(headers)
  const consumoHeader = headers.find(isConsumoActivaHeader)
  if (!dateChoice || !consumoHeader) return { series: [] as Monthly[], dateChoice, consumoHeader: consumoHeader || null }

  const points: Monthly[] = []
  for (const r of rows) {
    let d: Date | null = null
    if (dateChoice.kind === 'periodo') d = parsePeriodoStart(String(r[dateChoice.header] ?? ''))
    else d = parseDateLoose(r[dateChoice.header])
    const n = normalizeNumber(r[consumoHeader] ?? '')
    if (!d || n == null || !Number.isFinite(n)) continue
    if (dateChoice.kind === 'desde') { const adj = new Date(d); adj.setMonth(adj.getMonth() - 1); d = adj }
    const year = d.getFullYear(); const month = d.getMonth() + 1
    const key = `${year}-${pad2(month)}`
    const firstDay = new Date(year, month - 1, 1)
    points.push({ key, year, month, fecha: firstDay, consumo: Math.max(0, n) })
  }
  if (points.length === 0) return { series: [] as Monthly[], dateChoice, consumoHeader }

  const agg = new Map<string, Monthly>()
  for (const p of points) { const prev = agg.get(p.key); if (prev) prev.consumo += p.consumo; else agg.set(p.key, { ...p }) }
  const ordered = Array.from(agg.values()).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

  const res: Monthly[] = []
  const start = ordered[0].fecha; const end = ordered[ordered.length - 1].fecha
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    const key = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}`
    const found = agg.get(key)
    res.push(found ? found : { key, year: cur.getFullYear(), month: cur.getMonth() + 1, fecha: new Date(cur), consumo: 0 })
    cur.setMonth(cur.getMonth() + 1)
  }
  return { series: res, dateChoice, consumoHeader }
}

// Matriz por mes (filas 1..12) y años (columnas), totales por celda
type HeatMatrix = Record<number, Record<number, number>> // month(1..12) -> year -> value
function buildMatrixFromSeries(series: Monthly[]) {
  const matrix: HeatMatrix = {}
  const yearsSet = new Set<number>()
  for (const p of series) {
    if (!matrix[p.month]) matrix[p.month] = {}
    matrix[p.month][p.year] = (matrix[p.month][p.year] ?? 0) + p.consumo
    yearsSet.add(p.year)
  }
  const years = Array.from(yearsSet).sort((a, b) => a - b)
  return { matrix, years }
}

// Ajuste estacional (media y desviación por mes del año)
function seasonalStats(matrix: HeatMatrix, years: number[]) {
  const mean: Record<number, number> = {}
  const std: Record<number, number> = {}
  for (let m = 1; m <= 12; m++) {
    const vals: number[] = []
    for (const y of years) { const v = matrix[m]?.[y]; if (typeof v === 'number') vals.push(v) }
    if (vals.length === 0) { mean[m] = 0; std[m] = 0; continue }
    const mu = vals.reduce((s, x) => s + x, 0) / vals.length
    const variance = vals.length > 1 ? vals.reduce((s, x) => s + Math.pow(x - mu, 2), 0) / vals.length : 0
    mean[m] = mu
    std[m] = Math.sqrt(variance)
  }
  return { mean, std }
}

// Color por Z normalizado (-3..+3): rojo -> amarillo -> verde
function colorByZ(z: number) {
  const t = Math.max(0, Math.min(1, (z + 3) / 6)) // map -3..+3 -> 0..1
  const mid = 0.5
  let r: number, g: number, b: number
  if (t < mid) {
    const tt = t / mid
    const r1 = 248, g1 = 113, b1 = 113 // rojo
    const r2 = 253, g2 = 224, b2 = 71  // amarillo
    r = Math.round(r1 + (r2 - r1) * tt)
    g = Math.round(g1 + (g2 - g1) * tt)
    b = Math.round(b1 + (b2 - b1) * tt)
  } else {
    const tt = (t - mid) / (1 - mid)
    const r1 = 253, g1 = 224, b1 = 71  // amarillo
    const r2 = 74, g2 = 222, b2 = 128 // verde
    r = Math.round(r1 + (r2 - r1) * tt)
    g = Math.round(g1 + (g2 - g1) * tt)
    b = Math.round(b1 + (b2 - b1) * tt)
  }
  return `rgb(${r},${g},${b})`
}

// Detección de anomalías (con prioridad de criterios observados y estacionales)
type DetectResult = { index: number; ym: { year: number; month: number }; criterio: string; confianza: number }
function detectAnomaly(series: Monthly[], headers: string[], rows: Record<string, any>[], dateChoice: DateChoice | null): DetectResult | null {
  if (series.length < 3) return null

  // 0) Consumo nulo sostenido (>=2 meses)
  let streak = 0
  for (let i = 0; i < series.length; i++) {
    if (series[i].consumo <= 1) streak++
    else {
      if (streak >= 2) { const idx = i - streak; return { index: idx, ym: { year: series[idx].year, month: series[idx].month }, criterio: `Consumo nulo sostenido (${streak} meses)`, confianza: 0.95 } }
      streak = 0
    }
  }
  if (streak >= 2) { const idx = series.length - streak; return { index: idx, ym: { year: series[idx].year, month: series[idx].month }, criterio: `Consumo nulo sostenido (${streak} meses)`, confianza: 0.95 } }

  // 1) Primer período ESTIMADA tras REALES (Fuente agregada > Estado medida > Tipo factura)
  const estadoHeader = headers.find(isFuenteAgregadaHeader) || headers.find(isEstadoMedidaHeader) || headers.find(isTipoFacturaHeader) || null
  if (estadoHeader && dateChoice) {
    type Entry = { d: Date; y: number; m: number; estado: string }
    const entries: Entry[] = []
    for (const r of rows) {
      const raw = r[dateChoice.header]
      let d = dateChoice.kind === 'periodo' ? parsePeriodoStart(String(raw ?? '')) : parseDateLoose(raw)
      if (!d) continue
      if (dateChoice.kind === 'desde') { const tmp = new Date(d); tmp.setMonth(tmp.getMonth() - 1); d = tmp }
      entries.push({ d, y: d.getFullYear(), m: d.getMonth() + 1, estado: normalizeLabel(r[estadoHeader]) })
    }
    entries.sort((a, b) => a.d.getTime() - b.d.getTime())
    let sawReal = false
    for (const e of entries) {
      const isReal = e.estado.includes('real'); const isEst = e.estado.includes('estimad')
      if (isReal) sawReal = true
      if (sawReal && isEst) {
        const idx = series.findIndex(p => p.year === e.y && p.month === e.m)
        if (idx >= 0) return { index: idx, ym: { year: e.y, month: e.m }, criterio: 'Primer período estimado tras reales', confianza: 0.7 }
      }
    }
  }

  // 2) Caída >40% con persistencia
  for (let i = 1; i < series.length - 1; i++) {
    const prev = series[i - 1].consumo, cur = series[i].consumo, next = series[i + 1].consumo
    if (prev > 0 && cur <= prev * 0.6 && next <= prev * 0.7) return { index: i, ym: { year: series[i].year, month: series[i].month }, criterio: 'Caída >40% con persistencia', confianza: 0.65 }
  }

  // 3) Z-score estacional bajo (<= -1.5)
  const { matrix, years } = buildMatrixFromSeries(series)
  const { mean, std } = seasonalStats(matrix, years)
  for (let i = 0; i < series.length; i++) {
    const m = series[i].month; const y = series[i].year; const val = matrix[m]?.[y] ?? 0
    const mu = mean[m] ?? 0; const s = std[m] ?? 0
    const z = s > 0 ? (val - mu) / s : 0
    if (z <= -1.5) return { index: i, ym: { year: y, month: m }, criterio: 'Desviación estacional significativa (z ≤ -1.5)', confianza: 0.6 }
  }

  return null
}

// Componentes UI utilitarios
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const ATRPreviewHeatmap: React.FC = () => {
  const data = useAtrCsv()
  const [resultado, setResultado] = React.useState<DetectResult | null>(null)
  const [serie, setSerie] = React.useState<Monthly[]>([])
  const [dateChoice, setDateChoice] = React.useState<DateChoice | null>(null)
  const [consumoHeader, setConsumoHeader] = React.useState<string | null>(null)

  const onDetect = React.useCallback(() => {
    if (!data) return
    const built = buildMonthlySeries(data.rows, data.headers)
    setSerie(built.series)
    setDateChoice(built.dateChoice)
    setConsumoHeader(built.consumoHeader)
    if (!built.series.length) { setResultado(null); window.alert('No hay datos válidos para analizar.'); return }
    const det = detectAnomaly(built.series, data.headers, data.rows, built.dateChoice)
    setResultado(det)
  }, [data])

  if (!data || !data.headers?.length) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Sin datos de ATR</h2>
        <p style={{ marginBottom: '1rem' }}>Primero exporta un archivo ATR (CSV/Excel) para previsualizar.</p>
        <a href="#/export-saldo-atr" style={{ color: '#0000D0', fontWeight: 700 }}>Ir a exportación</a>
      </div>
    )
  }

  const fuenteTxt = () => `fecha: ${dateChoice?.kind ?? 'N/D'}; consumo: ${consumoHeader ?? 'N/D'}`

  const { matrix, years } = buildMatrixFromSeries(serie)
  const { mean, std } = seasonalStats(matrix, years)

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Mapa de calor (ajuste estacional)</h1>
        <button onClick={onDetect} style={{ background: '#0000D0', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Detectar anomalías</button>
      </div>

      {/* Panel de resultado */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '.75rem .9rem', background: '#f9fafb' }}>
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>Fuente: {fuenteTxt()}</div>
        {resultado ? (
          <div style={{ color: '#111827' }}>
            <strong>Inicio de anomalía:</strong> {pad2(resultado.ym.month)}/{resultado.ym.year} — {resultado.criterio} (confianza {Math.round(resultado.confianza * 100)}%)
          </div>
        ) : (
          <div style={{ color: '#334155' }}>Sin anomalías detectadas todavía. Pulsa “Detectar anomalías”.</div>
        )}
      </div>

      {/* Heatmap por z-score estacional */}
      {years.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, top: 0, background: '#f1f5f9', padding: '.5rem .65rem', borderRight: '1px solid #e2e8f0', fontWeight: 600, fontSize: '.8rem' }}>Mes</th>
                {years.map(y => (
                  <th key={y} style={{ top: 0, background: '#f1f5f9', padding: '.5rem .65rem', borderLeft: '1px solid #e2e8f0', fontWeight: 600, fontSize: '.8rem' }}>{y}</th>
                ))}
                <th style={{ top: 0, background: '#e2e8f0', padding: '.5rem .65rem', borderLeft: '2px solid #cbd5e1', fontWeight: 600, fontSize: '.8rem' }}>Total mes</th>
              </tr>
            </thead>
            <tbody>
              {monthNames.map((mName, i) => {
                const month = i + 1
                let totalMes = 0
                return (
                  <tr key={month}>
                    <td style={{ position: 'sticky', left: 0, background: '#f8fafc', padding: '.45rem .6rem', fontWeight: 500, borderRight: '1px solid #e2e8f0', fontSize: '.8rem' }}>{mName}</td>
                    {years.map(y => {
                      const val = matrix[month]?.[y];
                      const mu = mean[month] ?? 0; const s = std[month] ?? 0
                      const z = typeof val === 'number' ? (s > 0 ? (val - mu) / s : 0) : NaN
                      if (typeof val === 'number') totalMes += val
                      const bg = Number.isFinite(z) ? colorByZ(z) : '#fafafa'
                      const isAnomalyCell = resultado && resultado.ym.year === y && resultado.ym.month === month
                      return (
                        <td key={y} style={{ textAlign: 'right', padding: '.4rem .6rem', background: bg, color: '#0f172a', fontWeight: 600, fontSize: '.75rem', border: isAnomalyCell ? '2px solid #dc2626' : '1px solid #e2e8f0' }}
                          title={Number.isFinite(z) ? `z=${z.toFixed(2)} — ${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val ?? 0)} kWh` : 'Sin datos'}>
                          {typeof val === 'number' ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) : '—'}
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'right', padding: '.4rem .6rem', background: '#f1f5f9', fontWeight: 700, borderLeft: '2px solid #cbd5e1', color: '#0f172a', fontSize: '.8rem' }}>
                      {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(totalMes)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Serie mensual compacta */}
      {serie.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '.5rem .75rem', background: '#fff' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Serie mensual agregada (kWh)</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {serie.map((p, idx) => (
              <div key={p.key} title={`${pad2(p.month)}/${p.year}`} style={{
                padding: '.25rem .5rem', borderRadius: 6, border: '1px solid #e5e7eb',
                background: resultado && resultado.index === idx ? 'rgba(220,38,38,0.12)' : '#f8fafc', color: '#111827', fontSize: 12
              }}>
                {pad2(p.month)}/{p.year}: {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(p.consumo)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ATRPreviewHeatmap
