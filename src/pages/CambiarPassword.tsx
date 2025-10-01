import { useState, useMemo } from 'react'
import { useAuth } from '../auth/AuthContextNew'

export default function CambiarPassword() {
  const { user, changePassword } = useAuth()
  const [targetUser, setTargetUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isCoordinator = useMemo(() => user?.role === 'coordinador', [user])

  if (!isCoordinator) {
    return (
      <div className="card">
        <h3>Acceso restringido</h3>
        <p>Esta sección es solo para usuarios con rol Coordinador.</p>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setErr(null)
    if (!targetUser.trim() || !newPass) {
      setErr('Debe indicar usuario destino y nueva contraseña')
      return
    }
    if (newPass !== confirm) {
      setErr('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const ok = await changePassword(targetUser.trim(), newPass)
    setLoading(false)
    if (ok) {
      setMsg('Contraseña actualizada correctamente')
      setTargetUser('')
      setNewPass('')
      setConfirm('')
    } else {
      setErr('No se pudo actualizar la contraseña (usuario no existe o permisos insuficientes)')
    }
  }

  return (
    <div className="card">
      <h3>🔐 Cambio de contraseña</h3>
      <p className="text-muted">Solo Coordinador puede actualizar contraseñas de usuarios registrados.</p>
      <form onSubmit={onSubmit} className="form-grid">
        <div className="form-group">
          <label>Usuario destino</label>
          <input 
            type="text"
            value={targetUser}
            onChange={e => setTargetUser(e.target.value)}
            placeholder="usuario"
            required
          />
        </div>
        <div className="form-group">
          <label>Nueva contraseña</label>
          <input 
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar contraseña</label>
          <input 
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        {err && <div className="text-error text-sm">{err}</div>}
        {msg && <div className="text-success text-sm">{msg}</div>}
        <div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Volver
        </button>
      </div>
    </div>
  )
}
