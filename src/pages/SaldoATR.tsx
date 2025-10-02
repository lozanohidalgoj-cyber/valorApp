import { useState, useRef } from 'react'
import { useSaldoATR } from '../hooks/business/useSaldoATR'

export default function SaldoATR() {
  const {
    saldoRows,
    filtered,
    selection,
    importMessage,
    fileInputRef,
    triggerImport,
    handleFileChange,
    toggleRow,
  } = useSaldoATR()

  const [message, setMessage] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)

  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const colWidthsRef = useRef<Map<number, number>>(new Map())

  const headerCups = (() => {
    if (selection.size === 1) {
      const idx = Array.from(selection)[0]
      return saldoRows[idx]?.cups ?? null
    }
    const unique = new Set<string>()
    for (const r of saldoRows) {
      if (r?.cups) unique.add(r.cups)
      if (unique.size > 2) break
    }
    if (unique.size === 1) return Array.from(unique)[0]
    if (hoverRow != null) return saldoRows[hoverRow]?.cups ?? null
    return unique.size > 1 ? 'Varios CUPS' : null
  })()

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
    const idxs = Array.from(selection)
    if (!idxs.length) return
    const header = ['CUPS','Contrato','Desde','Hasta','kWh','Fuente','Estado medida','Factura','Tipo factura','Estado factura','Nº serie','F. envío','Pot(kW)','Autofactura']
    const lines = [header.join('\t')]
    idxs.forEach(i => {
      const r = saldoRows[i]
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Saldo ATR</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={triggerImport}>📥 Importar CSV</button>
          <a href="#/" className="btn btn-secondary btn-sm">Volver</a>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {importMessage && (
        <div className="alert" style={{ marginBottom: '0.75rem' }}>
          {importMessage}
        </div>
      )}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {headerCups && (
            <h3 style={{ margin: 0, fontFamily: 'monospace' }}>{headerCups}</h3>
          )}
          <p style={{ margin: headerCups ? '0.25rem 0 0 0' : 0 }} className="text-sm opacity-70">
            {filtered.rows.length} filas visibles de {filtered.total}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!saldoRows.length && (
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Importa un CSV para comenzar</span>
          )}
          <button className="btn btn-sm" disabled={!selection.size} onClick={copySelectionToClipboard}>
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

      {filtered.rows.length > 0 && (
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
              {filtered.rows.map(({ row: r, idx: i }) => (
                <tr
                  key={i}
                  className={hoverRow === i ? 'row-highlight' : ''}
                  onMouseEnter={() => { setHoverRow(i); }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selection.has(i)}
                      onChange={() => toggleRow(i)}
                    />
                  </td>
                  {['cups','contratoATR','fechaDesde','fechaHasta','consumoTotalActivaKWh','fuenteAgregada','estadoMedida','codigoFactura','tipoFactura','estadoFactura','numeroSerieContador','fechaEnvioAFacturar','potenciaKW','autoFactura'].map((field, colIdx) => {
                    const value = (r as any)[field]
                    const absoluteCol = colIdx + 1
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
      )}
    </div>
  )
}
