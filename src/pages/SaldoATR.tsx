import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../state/store'

export default function SaldoATR() {
  const { saldoATR, add } = useStore()

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

  function toggleRowSelection(idx: number) {
    setSaldoSelection(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function selectAllVisible() {
    const currentIdx = view.rows.map(r => r.idx)
    const allSelected = currentIdx.every(i => saldoSelection.has(i))
    if (allSelected) {
      const next = new Set(saldoSelection)
      currentIdx.forEach(i => next.delete(i))
      setSaldoSelection(next)
    } else {
      const next = new Set(saldoSelection)
      currentIdx.forEach(i => next.add(i))
      setSaldoSelection(next)
    }
  }

  function createRegistros() {
    if (!saldoSelection.size) return
    let count = 0
    saldoSelection.forEach(idx => {
      const row = saldoATR[idx] as any
      if (!row) return
      const fechaISO = ddmmyyyyToISO(row.fechaHasta || row.fechaDesde)
      const kWh = row.consumoTotalActivaKWh
      if (!Number.isFinite(kWh)) return
      const valorTipo = row.fuenteAgregada?.toLowerCase() === 'real' ? 'real' : 'estimado'
      add({
        id: generateId(),
        clienteId: row.cups,
        fechaISO,
        gestion: 'averia',
        valorTipo,
        kWh,
        notas: `Factura ${row.codigoFactura} (${row.tipoFactura}) Potencia ${row.potenciaKW}kW`
      } as const)
      count++
    })
    setSaldoSelection(new Set())
    setMessage(`${count} registro(s) creados desde saldo ATR.`)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Saldo ATR (pantalla completa)</h3>
          <p style={{ margin: '0.25rem 0 0 0' }} className="text-sm opacity-70">
            {view.rows.length} filas visibles de {view.total}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="#/" className="btn btn-secondary btn-sm">⟵ Volver</a>
          <button className="btn btn-sm" onClick={selectAllVisible}>
            {view.rows.every(r => saldoSelection.has(r.idx)) ? 'Deseleccionar' : 'Seleccionar'} visibles
          </button>
          <button className="btn btn-sm" disabled={!saldoSelection.size} onClick={createRegistros}>
            ➕ Crear registros ({saldoSelection.size})
          </button>
        </div>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: '0.75rem', color: 'var(--color-success)' }}>
          {message}
        </div>
      )}

      <div className="filters">
        <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          <div className="form-group">
            <label>Buscar</label>
            <input placeholder="CUPS, contrato, factura..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fuente</label>
            <select value={fuente} onChange={e => setFuente(e.target.value as any)}>
              <option value="all">Todas</option>
              <option value="real">Real</option>
              <option value="no-real">No real</option>
            </select>
          </div>
          <div className="form-group">
            <label>kWh mín</label>
            <input type="number" step="0.001" value={minKwh} onChange={e => setMinKwh(e.target.value)} />
          </div>
          <div className="form-group">
            <label>kWh máx</label>
            <input type="number" step="0.001" value={maxKwh} onChange={e => setMaxKwh(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <select value={sort} onChange={e => setSort(e.target.value as any)}>
              <option value="fecha-desc">Fecha (reciente primero)</option>
              <option value="fecha-asc">Fecha (antiguo primero)</option>
              <option value="kwh-desc">kWh (mayor primero)</option>
              <option value="kwh-asc">kWh (menor primero)</option>
            </select>
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn btn-sm" onClick={() => { setQ(''); setFuente('all'); setMinKwh(''); setMaxKwh(''); setSort('fecha-desc') }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>CUPS</th>
              <th>Contrato</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>kWh</th>
              <th>Fuente</th>
              <th>Estado medida</th>
              <th>Factura</th>
              <th>Tipo factura</th>
              <th>Estado factura</th>
              <th>Nº serie contador</th>
              <th>F. envío facturar</th>
              <th>Pot(kW)</th>
              <th>Autofactura</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map(({ row: r, idx: i }) => (
              <tr key={i}>
                <td>
                  <input
                    type="checkbox"
                    checked={saldoSelection.has(i)}
                    onChange={() => toggleRowSelection(i)}
                  />
                </td>
                <td style={{ fontSize: '0.7rem' }}>{r.cups}</td>
                <td style={{ fontSize: '0.7rem' }}>{r.contratoATR}</td>
                <td>{r.fechaDesde}</td>
                <td>{r.fechaHasta}</td>
                <td style={{ textAlign: 'right' }}>{r.consumoTotalActivaKWh.toFixed(3)}</td>
                <td>{r.fuenteAgregada}</td>
                <td>{r.estadoMedida}</td>
                <td style={{ fontSize: '0.65rem' }}>{r.codigoFactura}</td>
                <td>{r.tipoFactura}</td>
                <td>{r.estadoFactura}</td>
                <td style={{ fontSize: '0.65rem' }}>{r.numeroSerieContador}</td>
                <td style={{ fontSize: '0.75rem' }}>{r.fechaEnvioAFacturar}</td>
                <td>{r.potenciaKW}</td>
                <td>{r.autoFactura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
