import { useState } from 'react'
import { useAuth } from '../auth/AuthContextNew'

export default function Registro() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<'valorador' | 'coordinador'>('valorador')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
  const ok = await register(username.trim(), password, role, remember)
    setLoading(false)
    if (ok) {
      window.location.hash = '#/'
    } else {
      setError('El usuario ya existe o los datos no son válidos')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Crear cuenta</h1>
          <p className="login-subtitle">Regístrese para iniciar sesión en ValorApp</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Nombre de usuario"
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select value={role} onChange={e => setRole(e.target.value as 'valorador' | 'coordinador')}>
              <option value="valorador">Valorador</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input 
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            <label htmlFor="remember">Mantener sesión iniciada</label>
          </div>

          {error && <div className="text-error text-sm">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <a href="#/login" className="text-sm">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  )
}
