import React, { useEffect, useMemo, useState } from 'react'

export const Wart: React.FC = () => {
  const [checks, setChecks] = useState({ c1: false, c2: false })
  // Nuevo: cambio de titular (checklist exclusivo) y fecha
  const [cambioTitular, setCambioTitular] = useState<'si' | 'no' | null>(null)
  const [fechaCambio, setFechaCambio] = useState<string>('')
  // Nuevo: análisis de anomalías
  const [showAnalisis, setShowAnalisis] = useState(false)
  const [serie, setSerie] = useState<Array<{ fecha: Date; consumo: number; factura: string }>>([])
  const [anomalyIdx, setAnomalyIdx] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const toggle = (key: 'c1'|'c2') => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allOk = checks.c1 && checks.c2
  const canContinue = useMemo(() => {
    if (!allOk) return false
    if (cambioTitular === 'si') return Boolean(fechaCambio)
    return true
  }, [allOk, cambioTitular, fechaCambio])

  // Cargar estado previo (si existe)
  useEffect(() => {
    try {
      const s = localStorage.getItem('valorApp.wart.cambioTitular')
      if (s) {
        const obj = JSON.parse(s)
        if (obj && typeof obj === 'object') {
          setCambioTitular(obj.tuvoCambioTitular === true ? 'si' : obj.tuvoCambioTitular === false ? 'no' : null)
          setFechaCambio(typeof obj.fecha === 'string' ? obj.fecha : '')
        }
      }
    } catch { /* noop */ }
  }, [])

  // Persistir cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('valorApp.wart.cambioTitular', JSON.stringify({
        tuvoCambioTitular: cambioTitular === 'si',
        fecha: cambioTitular === 'si' ? fechaCambio : ''
      }))
    } catch { /* noop */ }
  }, [cambioTitular, fechaCambio])

  // Utilidades locales para analizar dataset ATR vigente (post-anulación)
  const stripAccents = (s: string) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const normalizeLabel = (s: string) => stripAccents(String(s ?? '')).toLowerCase().trim()
  const isFechaDesdeHeader = (h: string) => {
    const t = normalizeLabel(h)
    return t === 'fecha desde' || (t.includes('fecha') && t.includes('desde'))
  }
  const isPeriodoHeader = (h: string) => normalizeLabel(h).includes('periodo')
  const isFechaFactHeader = (h: string) => {
    const t = normalizeLabel(h)
    return t.includes('fecha') && (t.includes('factur') || t.includes('emision'))
  }
  const isConsumoActivaHeader = (h: string) => {
    const t = normalizeLabel(h)
    return t.includes('consum') && (t.includes('activa') || t.includes('kwh') || t.includes('total'))
  }
  const parseDateLoose = (v: any): Date | null => {
    if (v instanceof Date && !isNaN(v.getTime())) return v
    if (typeof v === 'number' && isFinite(v)) {
      if (v > 1000000000000) return new Date(v)
    }
    if (typeof v === 'string') {
      const s = v.trim()
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/) // dd/MM/yyyy ...
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
  const parsePeriodoStart = (s: string): Date | null => {
    // Intenta extraer la primera fecha de un rango "dd/MM/yyyy - dd/MM/yyyy"
    const m = String(s || '').match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
    return m ? parseDateLoose(m[1]) : parseDateLoose(s)
  }
  const parseNumber = (s: string): number => {
    const t = String(s ?? '').replace(/\./g, '').replace(/,/g, '.')
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
  }

  const handleDetectarAnomalias = () => {
    try {
      const raw = localStorage.getItem('valorApp.analisis.atrCsv')
      if (!raw) { window.alert('No hay saldo ATR cargado.'); return }
      const parsed = JSON.parse(raw) as { headers: string[]; rows: Record<string,string>[] }
      const headers = parsed.headers || []
      const rows = parsed.rows || []
      if (!headers.length || !rows.length) { window.alert('No hay datos para analizar.'); return }

      const fechaHeader = headers.find(h => isFechaDesdeHeader(h)) || headers.find(h => isPeriodoHeader(h)) || headers.find(h => isFechaFactHeader(h))
      const consumoHeader = headers.find(h => isConsumoActivaHeader(h))
      const facturaHeader = headers.find(h => normalizeLabel(h).includes('factura')) || null
      if (!fechaHeader || !consumoHeader) { window.alert('No se encontró columna de fecha o consumo.'); return }

      const items: Array<{ fecha: Date; consumo: number; factura: string }> = []
      for (const r of rows) {
        const fecha = isPeriodoHeader(fechaHeader) ? parsePeriodoStart(String(r[fechaHeader] ?? '')) : parseDateLoose(r[fechaHeader])
        const c = parseNumber(String(r[consumoHeader] ?? ''))
        if (!fecha || !Number.isFinite(c)) continue
        const factura = facturaHeader ? String(r[facturaHeader] ?? '') : ''
        items.push({ fecha, consumo: c, factura })
      }
      // Orden cronológico
      items.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      // Detectar primera anomalía: caída > 40%
      let idx: number | null = null
      for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1].consumo
        const cur = items[i].consumo
        if (prev > 0) {
          const drop = (prev - cur) / prev
          if (drop > 0.4) { idx = i; break }
        }
      }
      setSerie(items)
      setAnomalyIdx(idx)
      setShowAnalisis(true)
      setTooltip(null)
    } catch (e) {
      window.alert('Error al analizar anomalías.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(135deg, #0000D0 0%, #2929E5 50%, #5252FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efectos decorativos de fondo */}
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
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        maxWidth: '1200px', 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        padding: '4rem 3.5rem',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(3rem, 7vw, 4.5rem)', 
          margin: '0 0 1rem', 
          fontWeight: 800, 
          letterSpacing: '-0.01em', 
          color: '#0000D0',
          fontFamily: "'Lato', sans-serif"
        }}>
          Módulo WART
        </h1>
        <p style={{ 
          fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', 
          margin: '0 0 3rem', 
          lineHeight: 1.6, 
          color: '#2929E5', 
          fontWeight: 500,
          fontFamily: "'Open Sans', sans-serif"
        }}>
          Antes de continuar recuerde revisar:
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: '0 0 3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.75rem' 
        }}>
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1.25rem', 
              alignItems: 'flex-start', 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%',
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={checks.c1}
                onChange={() => toggle('c1')}
                style={{ 
                  width: 28, 
                  height: 28, 
                  accentColor: '#0000D0', 
                  marginTop: 4,
                  cursor: 'pointer'
                }}
              />
              <span>
                <strong style={{ color: '#0000D0', fontWeight: 700 }}>1.</strong> Al revisar el pantallazo <strong style={{ color: '#0000D0' }}>Pinzas 73</strong> no tiene diferencia de tiempo o la diferencia es menor a un minuto.
              </span>
            </label>
          </li>
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1.25rem', 
              alignItems: 'flex-start', 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%',
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={checks.c2}
                onChange={() => toggle('c2')}
                style={{ 
                  width: 28, 
                  height: 28, 
                  accentColor: '#0000D0', 
                  marginTop: 4,
                  cursor: 'pointer'
                }}
              />
              <span>
                <strong style={{ color: '#0000D0', fontWeight: 700 }}>2.</strong> La resta de la <strong style={{ color: '#0000D0' }}>carga real en acometida</strong> y la <strong style={{ color: '#0000D0' }}>carga real en contador</strong> es mayor a 0,5.
              </span>
            </label>
          </li>
          {/* Bloque nuevo: ¿Tuvo cambio de titular? */}
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Encabezado con numeración al estilo de los puntos 1 y 2 */}
            <span style={{ 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <strong style={{ color: '#0000D0', fontWeight: 700 }}>3.</strong> ¿Tuvo cambio de titular?
            </span>

            {/* Opciones exclusivas No / Sí */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Open Sans', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={cambioTitular === 'no'}
                  onChange={() => {
                    setCambioTitular(cambioTitular === 'no' ? null : 'no')
                    if (cambioTitular !== 'no') setFechaCambio('')
                  }}
                  style={{ width: 28, height: 28, accentColor: '#0000D0', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1.125rem', color: '#1a1a1a' }}>No</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Open Sans', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={cambioTitular === 'si'}
                  onChange={() => {
                    setCambioTitular(cambioTitular === 'si' ? null : 'si')
                  }}
                  style={{ width: 28, height: 28, accentColor: '#0000D0', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1.125rem', color: '#1a1a1a' }}>Sí</span>
              </label>
            </div>

            {cambioTitular === 'si' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '1.125rem', color: '#1a1a1a', fontFamily: "'Open Sans', sans-serif" }}>Fecha de cambio de titular:</label>
                <input
                  type="date"
                  value={fechaCambio}
                  onChange={e => setFechaCambio(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    border: '2px solid rgba(0, 0, 208, 0.1)',
                    fontSize: '1rem',
                    fontFamily: "'Open Sans', sans-serif"
                  }}
                />
              </div>
            )}
          </li>
        </ul>

        <div style={{ 
          display: 'flex', 
          gap: '1.25rem', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          paddingTop: '1.5rem'
        }}>
          <button
            type="button"
            onClick={handleDetectarAnomalias}
            style={{
              background: 'linear-gradient(135deg, #0000D0 0%, #2929E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '1.1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.35)',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'Lato', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(0, 0, 208, 0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 208, 0.35)'
            }}
          >Detectar anomalías de consumo</button>
          <a
            href="#/"
            style={{
              background: 'transparent',
              color: '#0000D0',
              padding: '1.25rem 2rem',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1.25rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Open Sans', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 208, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >← Volver</a>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => { window.location.hash = '#/analisis-expediente' }}
            style={{
              background: canContinue 
                ? 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)' 
                : 'rgba(0, 0, 208, 0.15)',
              color: canContinue ? '#FFFFFF' : 'rgba(0, 0, 208, 0.4)',
              border: 'none',
              padding: '1.25rem 3rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              borderRadius: '12px',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 10px 25px -8px rgba(255, 49, 132, 0.6)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: canContinue ? 1 : 0.6,
              fontFamily: "'Lato', sans-serif"
            }}
            onMouseEnter={e => { 
              if (canContinue) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(255, 49, 132, 0.8)';
              }
            }}
            onMouseLeave={e => { 
              if (canContinue) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(255, 49, 132, 0.6)';
              }
            }}
          >Seguir →</button>
        </div>
      </div>

      {/* Modal de análisis visual de anomalías */}
      {showAnalisis && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ width: 'min(1100px, 96vw)', background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, rgba(0,0,208,0.06) 0%, rgba(41,41,229,0.04) 100%)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0000D0', fontWeight: 900, fontFamily: "'Lato', sans-serif" }}>Análisis visual de anomalías</h3>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {serie.length >= 2 ? (
                <AnomChart
                  data={serie}
                  anomalyIdx={anomalyIdx}
                  onHover={(info) => setTooltip(info)}
                />
              ) : (
                <div style={{ padding: '1rem', color: '#334155', fontFamily: "'Open Sans', sans-serif" }}>No se detectaron descensos anómalos en el consumo.</div>
              )}
              {/* Tooltip */}
              {tooltip && (
                <div style={{ position: 'absolute', transform: `translate(${tooltip.x}px, ${tooltip.y}px)`, background: '#111827', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, pointerEvents: 'none', boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }}>
                  {tooltip.text}
                </div>
              )}
              {anomalyIdx == null && serie.length >= 2 && (
                <div style={{ marginTop: 12, color: '#334155', fontFamily: "'Open Sans', sans-serif" }}>No se detectaron descensos anómalos en el consumo.</div>
              )}
              {anomalyIdx != null && (
                <div style={{ marginTop: 12, color: '#334155', fontFamily: "'Open Sans', sans-serif" }}>El punto rojo indica el inicio del descenso de la anomalia detectado en el consumo.</div>
              )}
            </div>
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAnalisis(false)} style={{ background: '#0000D0', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wart

// Componente de gráfico simple en SVG
function AnomChart({ data, anomalyIdx, onHover }: { data: Array<{ fecha: Date; consumo: number; factura: string }>; anomalyIdx: number | null; onHover: (info: { x: number; y: number; text: string } | null) => void }) {
  const width = 1000; const height = 320; const m = { l: 48, r: 24, t: 20, b: 40 }
  const innerW = width - m.l - m.r
  const innerH = height - m.t - m.b
  const maxY = Math.max(...data.map(d => d.consumo), 1)
  const minY = 0
  const x = (i: number) => m.l + (data.length <= 1 ? innerW / 2 : (i * innerW) / (data.length - 1))
  const y = (v: number) => m.t + innerH - ((v - minY) / (maxY - minY)) * innerH
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.consumo)}`).join(' ')

  const handleEnter = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    const d = data[i]
    const text = anomalyIdx === i
      ? `Inicio de anomalía detectado — Factura: ${d.factura || i + 1} — Fecha: ${d.fecha.toLocaleDateString('es-ES')}`
      : `Factura: ${d.factura || i + 1} — Fecha: ${d.fecha.toLocaleDateString('es-ES')} — Consumo: ${new Intl.NumberFormat('es-ES').format(d.consumo)}`
    onHover({ x: e.clientX + 12, y: e.clientY - 28, text })
  }
  const handleLeave = () => onHover(null)

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        {/* Ejes simples */}
        <line x1={m.l} y1={m.t} x2={m.l} y2={m.t + innerH} stroke="#94a3b8" strokeWidth={1} />
        <line x1={m.l} y1={m.t + innerH} x2={m.l + innerW} y2={m.t + innerH} stroke="#94a3b8" strokeWidth={1} />
        {/* Path de la serie */}
        <path d={pathD} fill="none" stroke="#0000D0" strokeWidth={2} />
        {/* Puntos */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(d.consumo)}
            r={5}
            fill={anomalyIdx === i ? '#dc2626' : '#1d4ed8'}
            stroke="#fff"
            strokeWidth={1.5}
            onMouseEnter={(e) => handleEnter(i, e)}
            onMouseLeave={handleLeave}
          />
        ))}
      </svg>
    </div>
  )
}
