import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const ok = await login(username.trim(), password, remember)
    setLoading(false)
    if (ok) {
      window.location.hash = '#/'
    } else {
      setError('Credenciales no válidas')
    }
  }

  return (
    <div className="login-container">
      <div className="login-brand-top-right">Ayesa</div>
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">ValorApp</h1>
          <p className="login-subtitle">Valoracion</p>
        </div>
        
        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              autoFocus 
              required 
              placeholder="Ingrese su usuario"
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Ingrese su contraseña"
            />
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remember" 
              checked={remember} 
              onChange={e => setRemember(e.target.checked)} 
            />
            <label htmlFor="remember">Recordar credenciales</label>
          </div>
          
          {error && (
            <div className="text-error text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Ingresando…' : 'Iniciar Sesión'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="#/registro" className="text-sm">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
    </div>
  )
}
