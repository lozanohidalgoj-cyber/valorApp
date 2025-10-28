import React from 'react'

interface ParsedCSV {
  headers: string[]
  rows: Record<string, any>[]
}

type DateChoice = { header: string; kind: 'hasta' | 'desde' | 'periodo' | 'factura' }

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

// Utilidades
const normalizeLabel = (v: string) => (v || '').toString().toLowerCase().trim()
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
    if (v > 59) {
      const epoch = Date.UTC(1899, 11, 30) // Excel serial
      return new Date(epoch + Math.round(v * 86400000))
    }
  }
  if (typeof v === 'string') {
    const s = v.trim()
    // dd/mm/yyyy
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
    if (m) {
      const dd = Number(m[1]); const mm = Number(m[2]) - 1; const yyyy = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
      const d = new Date(yyyy, mm, dd)
      if (!isNaN(d.getTime())) return d
    }
    // ISO o similar
    const d2 = new Date(s)
    if (!isNaN(d2.getTime())) return d2
  }
  return null
}

const parsePeriodoStart = (raw: string): Date | null => {
  const s = (raw || '').toString().trim()
  // mm/yyyy
  let m = s.match(/^(\d{1,2})\/(\d{4})$/)
  if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1)
  // yyyy-mm o yyyy/mm
  m = s.match(/^(\d{4})[-\/]?(\d{1,2})$/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, 1)
  // yyyymm
  m = s.match(/^(\d{4})(\d{2})$/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, 1)
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
  const hasta = headers.find(isFechaHasta)
  if (hasta) return { header: hasta, kind: 'hasta' }
  const desde = headers.find(isFechaDesde)
  if (desde) return { header: desde, kind: 'desde' }
  const periodo = headers.find(isPeriodo)
  if (periodo) return { header: periodo, kind: 'periodo' }
  const factura = headers.find(isFechaFactura)
  if (factura) return { header: factura, kind: 'factura' }
  return null
}

// Serie mensual
type Monthly = { key: string; year: number; month: number; fecha: Date; consumo: number }

function buildMonthlySeries(rows: Record<string, any>[], headers: string[]) {
  const dateChoice = pickPrimaryDateHeader(headers)
  const consumoHeader = headers.find(isConsumoActivaHeader)
  if (!dateChoice || !consumoHeader) return { series: [] as Monthly[], headers, dateChoice, consumoHeader: consumoHeader || null }

  const points: Monthly[] = []
  for (const r of rows) {
    let d: Date | null = null
    if (dateChoice.kind === 'periodo') d = parsePeriodoStart(String(r[dateChoice.header] ?? ''))
    else d = parseDateLoose(r[dateChoice.header])
    const n = normalizeNumber(r[consumoHeader] ?? '')
    if (!d || n == null || !Number.isFinite(n)) continue
    if (dateChoice.kind === 'desde') {
      const adj = new Date(d); adj.setMonth(adj.getMonth() - 1); d = adj
    }
    const year = d.getFullYear(); const month = d.getMonth() + 1
    const key = `${year}-${pad2(month)}`
    const firstDay = new Date(year, month - 1, 1)
    points.push({ key, year, month, fecha: firstDay, consumo: Math.max(0, n) })
  }
  if (points.length === 0) return { series: [] as Monthly[], headers, dateChoice, consumoHeader }

  // Agregar por (año,mes)
  const agg = new Map<string, Monthly>()
  for (const p of points) {
    const prev = agg.get(p.key)
    if (prev) prev.consumo += p.consumo
    else agg.set(p.key, { ...p })
  }
  const ordered = Array.from(agg.values()).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

  // Rellenar meses intermedios con 0
  const res: Monthly[] = []
  const start = ordered[0].fecha
  const end = ordered[ordered.length - 1].fecha
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    const key = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}`
    const found = agg.get(key)
    res.push(found ? found : { key, year: cur.getFullYear(), month: cur.getMonth() + 1, fecha: new Date(cur), consumo: 0 })
    cur.setMonth(cur.getMonth() + 1)
  }
  return { series: res, headers, dateChoice, consumoHeader }
}

// Detección de anomalía
type DetectResult = {
  index: number
  ym: { year: number; month: number }
  criterio: string
  confianza: number
}

function detectAnomaly(series: Monthly[], headers: string[], rows: Record<string, any>[], dateChoice: DateChoice | null): DetectResult | null {
  if (series.length < 3) return null

  // Criterio 0: consumo nulo sostenido (>=2 meses seguidos <=1 kWh)
  let streak = 0
  for (let i = 0; i < series.length; i++) {
    if (series[i].consumo <= 1) {
      streak++
    } else {
      if (streak >= 2) {
        const idx = i - streak
        return { index: idx, ym: { year: series[idx].year, month: series[idx].month }, criterio: `Consumo nulo sostenido (${streak} meses)`, confianza: 0.95 }
      }
      streak = 0
    }
  }
  if (streak >= 2) {
    const idx = series.length - streak
    return { index: idx, ym: { year: series[idx].year, month: series[idx].month }, criterio: `Consumo nulo sostenido (${streak} meses)`, confianza: 0.95 }
  }

  // Criterio 1: primer paso a ESTIMADA tras haber REAL (prioridad: Fuente agregada > Estado medida > Tipo factura)
  const estadoHeader = headers.find(isFuenteAgregadaHeader) || headers.find(isEstadoMedidaHeader) || headers.find(isTipoFacturaHeader) || null
  if (estadoHeader && dateChoice) {
    type Entry = { d: Date; year: number; month: number; estado: string }
    const entries: Entry[] = []
    for (const r of rows) {
      const raw = r[dateChoice.header]
      let d = dateChoice.kind === 'periodo' ? parsePeriodoStart(String(raw ?? '')) : parseDateLoose(raw)
      if (!d) continue
      if (dateChoice.kind === 'desde') { const tmp = new Date(d); tmp.setMonth(tmp.getMonth() - 1); d = tmp }
      const estado = normalizeLabel(String(r[estadoHeader] ?? ''))
      entries.push({ d, year: d.getFullYear(), month: d.getMonth() + 1, estado })
    }
    entries.sort((a, b) => a.d.getTime() - b.d.getTime())
    let sawReal = false
    for (const e of entries) {
      const isReal = e.estado.includes('real')
      const isEst = e.estado.includes('estimad')
      if (isReal) sawReal = true
      if (sawReal && isEst) {
        const idx = series.findIndex(p => p.year === e.year && p.month === e.month)
        if (idx >= 0) return { index: idx, ym: { year: e.year, month: e.month }, criterio: 'Primer período estimado tras reales', confianza: 0.7 }
      }
    }
  }

  // Criterio 2: caída >40% vs mes anterior, con persistencia (siguiente también bajo)
  for (let i = 1; i < series.length - 1; i++) {
    const prev = series[i - 1].consumo
    const cur = series[i].consumo
    const next = series[i + 1].consumo
    if (prev > 0 && cur <= prev * 0.6 && next <= prev * 0.7) {
      return { index: i, ym: { year: series[i].year, month: series[i].month }, criterio: 'Caída >40% con persistencia', confianza: 0.65 }
    }
  }

  return null
}

const ATRPreview: React.FC = () => {
  const data = useAtrCsv()
  const [resultado, setResultado] = React.useState<DetectResult | null>(null)
  const [serie, setSerie] = React.useState<Monthly[]>([])
  const [infoFuente, setInfoFuente] = React.useState<{ dateChoice: DateChoice | null; consumoHeader: string | null }>({ dateChoice: null, consumoHeader: null })

  const onDetect = React.useCallback(() => {
    if (!data) return
    const { series, dateChoice, consumoHeader } = buildMonthlySeries(data.rows, data.headers)
    setSerie(series)
    setInfoFuente({ dateChoice, consumoHeader })
    if (!series.length) { setResultado(null); window.alert('No hay datos válidos para analizar.'); return }
    const det = detectAnomaly(series, data.headers, data.rows, dateChoice)
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

  const fuenteTxt = () => {
    const d = infoFuente.dateChoice?.kind
    const c = infoFuente.consumoHeader
    return `fecha: ${d ?? 'N/D'}; consumo: ${c ?? 'N/D'}`
  }

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Vista ATR (simplificada)</h1>
        <button onClick={onDetect} style={{
          background: '#0000D0', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700
        }}>Detectar anomalías</button>
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

      {/* Tabla original */}
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

      {/* Serie mensual (si existe) — mini lista para referencia */}
      {serie.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '.5rem .75rem', background: '#fff' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Serie mensual agregada (total kWh por mes)</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {serie.map((p, idx) => (
              <div key={p.key} title={`${pad2(p.month)}/${p.year}`} style={{
                padding: '.25rem .5rem', borderRadius: 6, border: '1px solid #e5e7eb',
                background: resultado && resultado.index === idx ? 'rgba(220,38,38,0.12)' : '#f8fafc',
                color: '#111827', fontSize: 12
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

export default ATRPreview
