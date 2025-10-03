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
    <div className="login-container" style={{ background: 'linear-gradient(135deg,#0000FF 0%, #001fb3 55%, #002bff 100%)', color: '#FFFFFF' }}>
      <div className="login-brand-top-right" style={{ fontSize: '2.75rem' }}>Ayesa</div>
      <div className="login-card white-theme" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px) saturate(160%)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
        <div className="login-header" style={{ marginBottom: '2.25rem' }}>
          <h1 className="login-title" style={{ color: '#FFFFFF', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '1px' }}>Crear cuenta</h1>
          <p className="login-subtitle" style={{ color: '#FFFFFF', opacity: 0.85, fontSize: '0.95rem', fontWeight: 500 }}>Regístrese para iniciar sesión en ValorApp</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label style={{ color: '#FFFFFF' }}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Nombre de usuario"
              style={{
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                color: '#000000'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#FFFFFF' }}>Rol</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'valorador' | 'coordinador')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                color: '#000000'
              }}
            >
              <option value="valorador">Valorador</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: '#FFFFFF' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="********"
              style={{
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                color: '#000000'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#FFFFFF' }}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="********"
              style={{
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                color: '#000000'
              }}
            />
          </div>

          <div className="checkbox-group" style={{ color: '#FFFFFF' }}>
            <input 
              type="checkbox" 
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: '#FF1493' }}
            />
            <label htmlFor="remember" style={{ color: '#FFFFFF' }}>Mantener sesión iniciada</label>
          </div>

          {error && <div className="text-error text-sm">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%',
            background: 'linear-gradient(90deg,#FF1493 0%, #ff369f 60%, #ff5ab2 100%)',
            border: 'none', color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 6px 18px -4px rgba(255,20,147,0.55)', textTransform: 'uppercase' }}>
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <a href="#/login" className="text-sm" style={{ color: '#FF1493', fontWeight: 600 }}>¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  )
}
