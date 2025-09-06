import { useEffect, useState } from 'react'
import './App.css'
import Lista from './pages/Lista'
import Nuevo from './pages/Nuevo'
import Login from './pages/Login'
import Registro from './pages/Registro'
import { useAuth } from './auth/AuthContext'

function useHashRoute() {
  const [route, setRoute] = useState<string>(() => location.hash || '#/')
  useEffect(() => {
    const onHash = () => setRoute(location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

const navigation = [
  { id: 'lista', hash: '#/', label: 'Lista de Registros', icon: '📋' },
  { id: 'nuevo', hash: '#/nuevo', label: 'Nuevo Registro', icon: '➕' },
]

function getPageTitle(route: string) {
  switch (route) {
    case '#/': return 'Lista de Registros'
    case '#/nuevo': return 'Nuevo Registro'
    default: return 'ValorApp'
  }
}

export default function App() {
  const route = useHashRoute()
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated && route !== '#/login' && route !== '#/registro') {
    window.location.hash = '#/login'
    return null
  }

  if (route === '#/login') return <Login />
  if (route === '#/registro') return <Registro />

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">ValorApp</h1>
          <p className="sidebar-subtitle">Valoración Energética</p>
        </div>
        <nav>
          <ul className="sidebar-nav">
            {navigation.map(item => (
              <li key={item.id} className="sidebar-nav-item">
                <a 
                  href={item.hash} 
                  className={`sidebar-nav-link ${route === item.hash ? 'active' : ''}`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h2 className="header-title">{getPageTitle(route)}</h2>
            <div className="user-menu">
              <div className="user-info">
                <span>👤</span>
                <span>{user?.username}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="content">
          {route === '#/' && <Lista />}
          {route === '#/nuevo' && <Nuevo />}
        </main>
      </div>
    </div>
  )
}
