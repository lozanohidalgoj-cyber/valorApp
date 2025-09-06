import { useMemo, useState } from 'react'
import { FRAUDE_TIPOS, type ATRRegistro, type GestionTipo, type ValorTipo } from '../types/atr'
import { useStore } from '../state/store'

function uid() {
  return Math.random().toString(36).slice(2)
}

export default function Nuevo() {
  const { add } = useStore()
  const [gestion, setGestion] = useState<GestionTipo>('averia')
  const [fraudeTipo, setFraudeTipo] = useState<string>('')
  const [valorTipo, setValorTipo] = useState<ValorTipo>('estimado')
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0,10))
  const [clienteId, setClienteId] = useState('')
  const [kWh, setKWh] = useState<number>(0)
  const [notas, setNotas] = useState('')

  const fraudeVisible = gestion === 'fraude'
  const fraudeOptions = useMemo(() => FRAUDE_TIPOS, [])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const reg: ATRRegistro = {
      id: uid(),
      clienteId,
      fechaISO: fecha,
      gestion,
      fraudeTipo: fraudeVisible && fraudeTipo ? (fraudeTipo as any) : undefined,
      valorTipo,
      kWh: Number(kWh),
      notas: notas || undefined,
    }
    add(reg)
    window.location.hash = '#/'
  }

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <div className="card-header">
        <h3>Nuevo Registro ATR</h3>
        <p>Complete la información del registro de valoración energética</p>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Fecha del Registro</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={e => setFecha(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>ID del Cliente</label>
              <input 
                value={clienteId} 
                onChange={e => setClienteId(e.target.value)} 
                required 
                placeholder="Ej: CLI-001234"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Tipo de Gestión</label>
              <select value={gestion} onChange={e => setGestion(e.target.value as GestionTipo)}>
                <option value="averia">🔧 Avería</option>
                <option value="fraude">⚠️ Fraude</option>
              </select>
            </div>

            {fraudeVisible && (
              <div className="form-group">
                <label>Tipo de Fraude</label>
                <select value={fraudeTipo} onChange={e => setFraudeTipo(e.target.value)} required>
                  <option value="">Seleccione el tipo…</option>
                  {fraudeOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Tipo de Valor</label>
              <select value={valorTipo} onChange={e => setValorTipo(e.target.value as ValorTipo)}>
                <option value="estimado">~ Estimado (contador digital)</option>
                <option value="real">✓ Real (verificado)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Consumo (kWh)</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={kWh} 
                onChange={e => setKWh(parseFloat(e.target.value) || 0)} 
                required 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notas y Observaciones</label>
            <textarea 
              value={notas} 
              onChange={e => setNotas(e.target.value)} 
              rows={3}
              placeholder="Información adicional sobre el registro..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <a href="#/" className="btn btn-secondary">
              Cancelar
            </a>
            <button type="submit" className="btn btn-primary">
              💾 Guardar Registro
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
