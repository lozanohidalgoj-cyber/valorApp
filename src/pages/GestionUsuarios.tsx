import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContextNew'
import { Role } from '../services/auth'

export default function GestionUsuarios() {
  const { user, listUsers, setUserRole, removeUser, adminCreateUser, changePassword } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newRole, setNewRole] = useState<Role>('valorador')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const isCoordinator = useMemo(() => user?.role === 'coordinador', [user])
  const users = useMemo(() => listUsers(), [listUsers, refreshKey])

  if (!isCoordinator) {
    return (
      <div className="card">
        <h3>Acceso restringido</h3>
        <p>Esta sección es solo para usuarios con rol Coordinador.</p>
      </div>
    )
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    const ok = await adminCreateUser(newUser.trim(), newPass, newRole)
    if (ok) {
      setMsg('Usuario creado')
      setNewUser('')
      setNewPass('')
      setNewRole('valorador')
      setRefreshKey(k => k + 1)
    } else {
      setErr('No se pudo crear (usuario existente o datos inválidos)')
    }
  }

  async function onSetRole(username: string, role: Role) {
    setErr(null)
    const ok = await setUserRole(username, role)
    if (!ok) setErr('No se pudo cambiar el rol')
    else setRefreshKey(k => k + 1)
  }

  async function onRemove(username: string) {
    setErr(null)
    const ok = await removeUser(username)
    if (!ok) setErr('No se pudo eliminar (no existe o estás intentando eliminarte a ti mismo)')
    else setRefreshKey(k => k + 1)
  }

  async function onResetPassword(username: string) {
    setErr(null)
    const np = prompt(`Nueva contraseña para ${username}`)
    if (!np) return
    const ok = await changePassword(username, np)
    if (!ok) setErr('No se pudo actualizar la contraseña')
  }

  return (
    <div className="card">
      <h3>👥 Gestión de usuarios</h3>
      <p className="text-muted">Crea, elimina y modifica roles de usuarios.</p>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h4>Crear usuario</h4>
        <form onSubmit={onCreate} className="form-grid">
          <div className="form-group">
            <label>Usuario</label>
            <input value={newUser} onChange={e => setNewUser(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
              <option value="valorador">Valorador</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>
          <div>
            <button className="btn btn-primary">Crear</button>
          </div>
        </form>
      </div>

      {err && <div className="text-error text-sm" style={{ marginTop: '0.5rem' }}>{err}</div>}
      {msg && <div className="text-success text-sm" style={{ marginTop: '0.5rem' }}>{msg}</div>}

      <div className="table-container" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>No hay usuarios</td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.username}>
                <td>{u.username}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => onSetRole(u.username, e.target.value as Role)}
                    disabled={u.username.toLowerCase() === user?.username.toLowerCase()}
                  >
                    <option value="valorador">Valorador</option>
                    <option value="coordinador">Coordinador</option>
                  </select>
                </td>
                <td>
                  <div className="flex gap-4">
                    <button className="btn btn-secondary btn-sm" onClick={() => onResetPassword(u.username)}>Reset pass</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onRemove(u.username)} disabled={u.username.toLowerCase() === user?.username.toLowerCase()}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Volver
        </button>
      </div>
    </div>
  )
}
