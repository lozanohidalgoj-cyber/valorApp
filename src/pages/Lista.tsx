import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { ATR_SALDO_EXPECTED_HEADERS, mapToATRSaldoRow } from '../types/atr'

export default function Lista() {
  const { registros, remove, clear, add, saldoATR, setSaldoATR } = useStore()
  const [q, setQ] = useState('')
  const [gestion, setGestion] = useState<string>('')
  const [valorTipo, setValorTipo] = useState<string>('')
  const [importError, setImportError] = useState<string | null>(null)
  const [showSaldo, setShowSaldo] = useState<boolean>(false)
  const [saldoSelection, setSaldoSelection] = useState<Set<number>>(new Set())
  const [saldoQ, setSaldoQ] = useState('')
  const [saldoFuente, setSaldoFuente] = useState<'all' | 'real' | 'no-real'>('all')
  const [saldoMinKwh, setSaldoMinKwh] = useState<string>('')
  const [saldoMaxKwh, setSaldoMaxKwh] = useState<string>('')
  const [saldoSort, setSaldoSort] = useState<'fecha-desc' | 'fecha-asc' | 'kwh-desc' | 'kwh-asc'>('fecha-desc')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function triggerImport() {
    fileInputRef.current?.click()
  }

  // Si venimos desde el botón de la barra lateral, abrir el diálogo automáticamente
  useEffect(() => {
    try {
      const flag = localStorage.getItem('valorApp.triggerImportATR')
      if (flag === '1') {
        localStorage.removeItem('valorApp.triggerImportATR')
        setTimeout(() => triggerImport(), 100)
      }
    } catch {}
    const onEvt = () => triggerImport()
    window.addEventListener('valorApp:triggerImportATR' as any, onEvt as any)
    // Exponer apertura directa para mantener el gesto de usuario desde el menú
    ;(window as any).valorApp_openFile = () => triggerImport()
    return () => {
      window.removeEventListener('valorApp:triggerImportATR' as any, onEvt as any)
      try { delete (window as any).valorApp_openFile } catch {}
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const lines = text.split(/\r?\n/).filter(l => l.trim().length)
        if (!lines.length) throw new Error('Archivo vacío')
        const headerRaw = lines[0]
        const headerCols = headerRaw.split(';').map(h => h.replace(/^"|"$/g, '').trim())
        const expected = ATR_SALDO_EXPECTED_HEADERS
        const mismatch = expected.some((h, idx) => headerCols[idx] !== h)
        if (mismatch || headerCols.length !== expected.length) {
          throw new Error('Formato de cabecera inválido. Se esperaba: ' + expected.join('; '))
        }
        const rowsParsed = [] as ReturnType<typeof mapToATRSaldoRow>[]
        for (let i = 1; i < lines.length; i++) {
          const raw = lines[i]
          if (!raw.trim()) continue
            const cols = raw.split(';').map(c => c.replace(/^"|"$/g, '').trim())
          const mapped = mapToATRSaldoRow(cols)
          if (!mapped) {
            throw new Error(`Fila ${i + 1} inválida (columnas o números mal formateados).`)
          }
          rowsParsed.push(mapped)
        }
  setSaldoATR(rowsParsed as any)
  setShowSaldo(true)
  setSaldoSelection(new Set())
  // Llevar al usuario a la pantalla de revisión completa del saldo
  window.location.hash = '#/saldo-atr'
      } catch (err: any) {
        setImportError(err.message || 'Error importando archivo')
      } finally {
        // Reset para permitir reimportar el mismo archivo
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      setImportError('No se pudo leer el archivo')
    }
    reader.readAsText(file, 'utf-8')
  }

  function toggleRowSelection(idx: number) {
    setSaldoSelection(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function selectAllSaldo() {
    if (saldoSelection.size === saldoATR.length) {
      setSaldoSelection(new Set())
    } else {
      setSaldoSelection(new Set(saldoATR.map((_, i) => i)))
    }
  }

  function ddmmyyyyToISO(s: string): string {
    const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!m) return new Date().toISOString().slice(0, 10)
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${mm}-${dd}`
  }

  function ddmmyyyyToDate(s: string): Date {
    const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!m) return new Date(0)
    const [, dd, mm, yyyy] = m
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  }

  function generateId() {
    if (crypto?.randomUUID) return crypto.randomUUID()
    return 'id-' + Math.random().toString(36).slice(2, 10)
  }

  function createRegistrosFromSaldo() {
    if (!saldoSelection.size) return
    let count = 0
    saldoSelection.forEach(idx => {
      const row = saldoATR[idx] as any
      if (!row) return
      const fechaISO = ddmmyyyyToISO(row.fechaHasta || row.fechaDesde)
      const kWh = row.consumoTotalActivaKWh
      if (!Number.isFinite(kWh)) return
      // Heurística: fuenteAgregada === 'Real' => valorTipo real
      const valorTipo = row.fuenteAgregada?.toLowerCase() === 'real' ? 'real' : 'estimado'
      // gestión por defecto 'averia' (CSV no aporta contexto de fraude)
      const registro = {
        id: generateId(),
        clienteId: row.cups,
        fechaISO,
        gestion: 'averia' as const,
        valorTipo: valorTipo as 'real' | 'estimado',
        kWh: kWh,
        notas: `Factura ${row.codigoFactura} (${row.tipoFactura}) Potencia ${row.potenciaKW}kW`
      }
  add(registro)
      count++
    })
    // Limpiar selección tras generar
    setSaldoSelection(new Set())
    // Feedback mínimo en UI reutilizando importError como mensaje informativo temporal
    setImportError(`${count} registro(s) creados desde saldo ATR.`)
    setTimeout(() => {
      setImportError(null)
    }, 3000)
  }

  const saldoView = useMemo(() => {
    const q = saldoQ.trim().toLowerCase()
    const min = saldoMinKwh ? parseFloat(saldoMinKwh) : -Infinity
    const max = saldoMaxKwh ? parseFloat(saldoMaxKwh) : Infinity
    const withIdx = saldoATR.map((row, idx) => ({ row, idx }))
    let filtered = withIdx.filter(({ row }) => {
      if (q) {
        const haystack = `${row.cups} ${row.contratoATR} ${row.codigoFactura} ${row.tipoFactura}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (saldoFuente === 'real' && row.fuenteAgregada.toLowerCase() !== 'real') return false
      if (saldoFuente === 'no-real' && row.fuenteAgregada.toLowerCase() === 'real') return false
      const kwh = row.consumoTotalActivaKWh
      if (kwh < min || kwh > max) return false
      return true
    })
    filtered.sort((a, b) => {
      if (saldoSort === 'kwh-desc') return b.row.consumoTotalActivaKWh - a.row.consumoTotalActivaKWh
      if (saldoSort === 'kwh-asc') return a.row.consumoTotalActivaKWh - b.row.consumoTotalActivaKWh
      const da = ddmmyyyyToDate(a.row.fechaHasta || a.row.fechaDesde)
      const db = ddmmyyyyToDate(b.row.fechaHasta || b.row.fechaDesde)
      const cmp = da.getTime() - db.getTime()
      return saldoSort === 'fecha-asc' ? cmp : -cmp
    })
    return { rows: filtered, total: saldoATR.length }
  }, [saldoATR, saldoQ, saldoFuente, saldoMinKwh, saldoMaxKwh, saldoSort])

  const rows = useMemo(() => {
    return registros.filter(r => {
      if (gestion && r.gestion !== gestion) return false
      if (valorTipo && r.valorTipo !== valorTipo) return false
      if (q) {
        const s = `${r.clienteId} ${r.fraudeTipo ?? ''} ${r.notas ?? ''}`.toLowerCase()
        if (!s.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [registros, q, gestion, valorTipo])

  const totalKWh = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.kWh, 0)
  }, [rows])

  function renderSaldoPanel() {
    if (!saldoATR.length) return null
    return (
      <div className="card" style={{ margin: '0.75rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Saldo ATR importado:</strong> {saldoATR.length} filas · visibles {saldoView.rows.length}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm" onClick={() => setShowSaldo(s => !s)}>
              {showSaldo ? 'Ocultar' : 'Mostrar'}
            </button>
            <button className="btn btn-sm" disabled={!saldoSelection.size} onClick={createRegistrosFromSaldo}>
              ➕ Crear registros ({saldoSelection.size})
            </button>
            <button className="btn btn-sm" onClick={selectAllSaldo}>
              {saldoView.rows.every(r => saldoSelection.has(r.idx)) ? 'Deseleccionar' : 'Seleccionar'} visibles
            </button>
          </div>
        </div>
        {showSaldo && (
          <div className="filters" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
              <div className="form-group">
                <label>Buscar</label>
                <input placeholder="CUPS, contrato, factura..." value={saldoQ} onChange={e => setSaldoQ(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Fuente</label>
                <select value={saldoFuente} onChange={e => setSaldoFuente(e.target.value as any)}>
                  <option value="all">Todas</option>
                  <option value="real">Real</option>
                  <option value="no-real">No real</option>
                </select>
              </div>
              <div className="form-group">
                <label>kWh mín</label>
                <input type="number" step="0.001" value={saldoMinKwh} onChange={e => setSaldoMinKwh(e.target.value)} />
              </div>
              <div className="form-group">
                <label>kWh máx</label>
                <input type="number" step="0.001" value={saldoMaxKwh} onChange={e => setSaldoMaxKwh(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Orden</label>
                <select value={saldoSort} onChange={e => setSaldoSort(e.target.value as any)}>
                  <option value="fecha-desc">Fecha (reciente primero)</option>
                  <option value="fecha-asc">Fecha (antiguo primero)</option>
                  <option value="kwh-desc">kWh (mayor primero)</option>
                  <option value="kwh-asc">kWh (menor primero)</option>
                </select>
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button className="btn btn-sm" onClick={() => { setSaldoQ(''); setSaldoFuente('all'); setSaldoMinKwh(''); setSaldoMaxKwh(''); setSaldoSort('fecha-desc'); }}>Reset</button>
              </div>
            </div>
          </div>
        )}
        {showSaldo && (
          <div className="table-container" style={{ maxHeight: '300px', overflow: 'auto' }}>
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
                {saldoView.rows.map(({ row: r, idx: i }) => (
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
        )}
      </div>
    )
  }

  if (!registros.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No hay registros aún</h3>
          <p>Comience creando un nuevo registro ATR para valorar el consumo energético.</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <button type="button" className="btn btn-success btn-lg" onClick={triggerImport}>
              📥 Importar saldo ATR
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          {importError && (
            <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
              ⚠️ {importError}
            </div>
          )}
        </div>
        {renderSaldoPanel()}
      </div>
    )
  }

  return (
    <div>
      <div className="filters">
        <h3 className="filters-title">Filtros</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Buscar</label>
            <input 
              placeholder="Cliente, tipo fraude, notas..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label>Tipo de Gestión</label>
            <select value={gestion} onChange={e => setGestion(e.target.value)}>
              <option value="">Todas</option>
              <option value="averia">Avería</option>
              <option value="fraude">Fraude</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Tipo de Valor</label>
            <select value={valorTipo} onChange={e => setValorTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="estimado">Estimado</option>
              <option value="real">Real</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn btn-secondary" onClick={clear}>
              🗑️ Limpiar Todo
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ margin: 0 }}>Registros ATR</h3>
              <p style={{ margin: '0.25rem 0 0 0' }} className="text-sm opacity-70">
                {rows.length} registro{rows.length !== 1 ? 's' : ''} • Total: {totalKWh.toFixed(2)} kWh
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href="#/nuevo" className="btn btn-primary">
                ➕ Nuevo Registro
              </a>
              <button type="button" className="btn btn-secondary" onClick={triggerImport}>
                📥 Importar saldo ATR
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {importError && (
          <div className="alert alert-error" style={{ margin: '0.75rem' }}>
            ⚠️ {importError}
          </div>
        )}

  {renderSaldoPanel()}

        {!rows.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h4>No se encontraron registros</h4>
            <p>Intente ajustar los filtros o crear un nuevo registro.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Gestión</th>
                  <th>Tipo Fraude</th>
                  <th>Tipo Valor</th>
                  <th>kWh</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.fechaISO).toLocaleDateString('es-ES')}</td>
                    <td style={{ fontWeight: 500 }}>{r.clienteId}</td>
                    <td>
                      <span className={r.gestion === 'fraude' ? 'text-error' : 'text-success'}>
                        {r.gestion === 'fraude' ? '⚠️ Fraude' : '🔧 Avería'}
                      </span>
                    </td>
                    <td>{r.fraudeTipo ?? '-'}</td>
                    <td>
                      <span className={r.valorTipo === 'real' ? 'text-success' : ''}>
                        {r.valorTipo === 'real' ? '✓ Real' : '~ Estimado'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.kWh.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => remove(r.id)}
                        title="Eliminar registro"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
