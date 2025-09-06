import { useMemo, useState } from 'react'
import { useStore } from '../state/store'

export default function Lista() {
  const { registros, remove, clear } = useStore()
  const [q, setQ] = useState('')
  const [gestion, setGestion] = useState<string>('')
  const [valorTipo, setValorTipo] = useState<string>('')

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

  if (!registros.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No hay registros aún</h3>
          <p>Comience creando un nuevo registro ATR para valorar el consumo energético.</p>
          <a href="#/nuevo" className="btn btn-primary">
            ➕ Crear Primer Registro
          </a>
        </div>
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
            <a href="#/nuevo" className="btn btn-primary">
              ➕ Nuevo Registro
            </a>
          </div>
        </div>

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
