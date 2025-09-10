import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../state/store'

export default function SaldoATR() {
  const { saldoATR, add, setSaldoATR } = useStore() as any

  // Si no hay saldo cargado, volver a la lista
  useEffect(() => {
    if (!saldoATR.length) {
      window.location.hash = '#/'
    }
  }, [saldoATR.length])

  const [saldoSelection, setSaldoSelection] = useState<Set<number>>(new Set())
  const [q, setQ] = useState('')
  const [fuente, setFuente] = useState<'all' | 'real' | 'no-real'>('all')
  const [minKwh, setMinKwh] = useState('')
  const [maxKwh, setMaxKwh] = useState('')
  const [sort, setSort] = useState<'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'>('fecha-desc')
  const [message, setMessage] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ idx: number, field: string } | null>(null)
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)
  const colWidthsRef = useRef<Map<number, number>>(new Map())

  function ddmmyyyyToDate(s: string): Date {
    const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!m) return new Date(0)
    const [, dd, mm, yyyy] = m
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  }

  function ddmmyyyyToISO(s: string): string {
    const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!m) return new Date().toISOString().slice(0, 10)
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${mm}-${dd}`
  }

  function generateId() {
    if (crypto?.randomUUID) return crypto.randomUUID()
    return 'id-' + Math.random().toString(36).slice(2, 10)
  }

  const view = useMemo(() => {
    const query = q.trim().toLowerCase()
    const min = minKwh ? parseFloat(minKwh) : -Infinity
    const max = maxKwh ? parseFloat(maxKwh) : Infinity
    const withIdx = saldoATR.map((row, idx) => ({ row, idx }))
    let filtered = withIdx.filter(({ row }) => {
      if (query) {
        const haystack = `${row.cups} ${row.contratoATR} ${row.codigoFactura} ${row.tipoFactura}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (fuente === 'real' && row.fuenteAgregada.toLowerCase() !== 'real') return false
      if (fuente === 'no-real' && row.fuenteAgregada.toLowerCase() === 'real') return false
      const kwh = row.consumoTotalActivaKWh
      if (kwh < min || kwh > max) return false
      return true
    })
    filtered.sort((a, b) => {
      if (sort === 'kwh-desc') return b.row.consumoTotalActivaKWh - a.row.consumoTotalActivaKWh
      if (sort === 'kwh-asc') return a.row.consumoTotalActivaKWh - b.row.consumoTotalActivaKWh
      const da = ddmmyyyyToDate(a.row.fechaHasta || a.row.fechaDesde)
      const db = ddmmyyyyToDate(b.row.fechaHasta || b.row.fechaDesde)
      const cmp = da.getTime() - db.getTime()
      return sort === 'fecha-asc' ? cmp : -cmp
    })
    return { rows: filtered, total: saldoATR.length }
  }, [saldoATR, q, fuente, minKwh, maxKwh, sort])

  const headerCups = useMemo(() => {
    // Si hay exactamente una fila seleccionada, usar ese CUPS
    if (saldoSelection.size === 1) {
      const idx = Array.from(saldoSelection)[0]
      return saldoATR[idx]?.cups ?? null
    }
    // Conjunto de CUPS distintos en los datos visibles completos
    const unique = new Set<string>()
    for (const r of saldoATR) {
      if (r?.cups) unique.add(r.cups)
      if (unique.size > 2) break
    }
    if (unique.size === 1) return Array.from(unique)[0]
    // Si hay hoverRow y múltiples CUPS, mostrar el del hover
    if (hoverRow != null) return saldoATR[hoverRow]?.cups ?? null
    return unique.size > 1 ? 'Varios CUPS' : null
  }, [saldoSelection, hoverRow, saldoATR])

  function toggleRowSelection(idx: number) {
    setSaldoSelection(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }



  // Edición deshabilitada: funciones anuladas
  function startEdit(_idx: number, _field: string) { /* no-op */ }
  function commitEdit(_idx: number, _field: string, _value: string) { /* no-op */ }
  function handleKeyEdit(_e: React.KeyboardEvent<HTMLInputElement>, _idx: number, _field: string) { /* no-op */ }

  // Redimensionar columnas
  function initResize(e: React.MouseEvent, colIndex: number) {
    e.preventDefault()
    const startX = e.clientX
    const th = (e.target as HTMLElement).closest('th') as HTMLTableHeaderCellElement | null
    if (!th) return
    const startWidth = th.offsetWidth
    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX
      const newW = Math.max(40, startWidth + delta)
      colWidthsRef.current.set(colIndex, newW)
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tr')
        rows.forEach(r => {
          const cell = (r.children[colIndex] as HTMLElement | undefined)
          if (cell) cell.style.width = newW + 'px'
        })
      }
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function copySelectionToClipboard() {
    const idxs = Array.from(saldoSelection)
    if (!idxs.length) return
    const header = ['CUPS','Contrato','Desde','Hasta','kWh','Fuente','Estado medida','Factura','Tipo factura','Estado factura','Nº serie','F. envío','Pot(kW)','Autofactura']
    const lines = [header.join('\t')]
    idxs.forEach(i => {
      const r = saldoATR[i]
      if (!r) return
      lines.push([
        r.cups,
        r.contratoATR,
        r.fechaDesde,
        r.fechaHasta,
        r.consumoTotalActivaKWh,
        r.fuenteAgregada,
        r.estadoMedida,
        r.codigoFactura,
        r.tipoFactura,
        r.estadoFactura,
        r.numeroSerieContador,
        r.fechaEnvioAFacturar,
        r.potenciaKW,
        r.autoFactura
      ].join('\t'))
    })
    const text = lines.join('\n')
    navigator.clipboard?.writeText(text).then(() => {
      setMessage('Filas copiadas al portapapeles')
      setTimeout(() => setMessage(null), 2500)
    }).catch(() => {})
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {headerCups && (
            <h3 style={{ margin: 0, fontFamily: 'monospace' }}>{headerCups}</h3>
          )}
          <p style={{ margin: headerCups ? '0.25rem 0 0 0' : 0 }} className="text-sm opacity-70">
            {view.rows.length} filas visibles de {view.total}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="#/" className="btn btn-secondary btn-sm">⟵ Volver</a>
          <button className="btn btn-sm" disabled={!saldoSelection.size} onClick={copySelectionToClipboard}>
            📋 Copiar selección
          </button>
        </div>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: '0.75rem', color: 'var(--color-success)' }}>
          {message}
        </div>
      )}

  {/* Filtros eliminados a petición: se deja el código de estado para posible reactivación futura */}

      <div className="table-container table-sticky table-freeze-first table-excel">
        <table
          ref={tableRef}
          onMouseLeave={() => { setHoverRow(null); setHoverCol(null) }}
        >
          <thead>
            <tr>
              {[ '', 'CUPS','Contrato','Desde','Hasta','kWh','Fuente','Estado medida','Factura','Tipo factura','Estado factura','Nº serie contador','F. envío facturar','Pot(kW)','Autofactura' ].map((h, ci) => (
                <th
                  key={ci}
                  className={`resizable ${hoverCol === ci ? 'col-highlight' : ''}`}
                  onMouseEnter={() => { setHoverCol(ci); setHoverRow(null) }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{h}</span>
                    <span className="col-resizer" onMouseDown={(e) => initResize(e, ci)} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map(({ row: r, idx: i }) => (
              <tr
                key={i}
                className={hoverRow === i ? 'row-highlight' : ''}
                onMouseEnter={() => { setHoverRow(i); }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={saldoSelection.has(i)}
                    onChange={() => toggleRowSelection(i)}
                  />
                </td>
                {['cups','contratoATR','fechaDesde','fechaHasta','consumoTotalActivaKWh','fuenteAgregada','estadoMedida','codigoFactura','tipoFactura','estadoFactura','numeroSerieContador','fechaEnvioAFacturar','potenciaKW','autoFactura'].map((field, colIdx) => {
                  const value = (r as any)[field]
                  const isEditing = editing && editing.idx === i && editing.field === field
                  const absoluteCol = colIdx + 1 // porque la col 0 es checkbox
                  return (
                    <td
                      key={field}
                      className={`${hoverCol === absoluteCol ? 'col-highlight' : ''}`}
                      onMouseEnter={() => { setHoverCol(absoluteCol) }}
                      style={field === 'cups' || field === 'contratoATR' ? { fontSize: '0.7rem' } : (field === 'codigoFactura' || field === 'numeroSerieContador') ? { fontSize: '0.65rem' } : (field === 'fechaEnvioAFacturar' ? { fontSize: '0.75rem' } : {})}
                    >
                      {field === 'consumoTotalActivaKWh' ? (
                        <span style={{ textAlign: 'right', display: 'inline-block', minWidth: '60px' }}>{Number(value).toFixed(3)}</span>
                      ) : (
                        value || ''
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
