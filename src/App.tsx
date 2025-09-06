import { useEffect, useState } from 'react'
import './App.css'
import Lista from './pages/Lista'
import Nuevo from './pages/Nuevo'
import Login from './pages/Login'
import Registro from './pages/Registro'
import CambiarPassword from './pages/CambiarPassword'
import GestionUsuarios from './pages/GestionUsuarios'
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

const baseNavigation = [
  { id: 'lista', hash: '#/', label: 'Lista de Registros', icon: '📋' },
  { id: 'nuevo', hash: '#/nuevo', label: 'Nuevo Registro', icon: '➕' },
]
const coordinatorNav = { id: 'cambiarPass', hash: '#/coordinador/cambiar-password', label: 'Cambiar contraseña', icon: '🔐' }
const coordinatorNavUsers = { id: 'gestionUsuarios', hash: '#/coordinador/usuarios', label: 'Gestión de usuarios', icon: '👥' }

function getPageTitle(route: string) {
  switch (route) {
    case '#/': return 'Lista de Registros'
    case '#/nuevo': return 'Nuevo Registro'
  case '#/coordinador/cambiar-password': return 'Cambiar contraseña'
    default: return 'ValorApp'
  }
}

export default function App() {
  const route = useHashRoute()
  const { isAuthenticated, user, logout } = useAuth()
  const navigation = user?.role === 'coordinador' ? [...baseNavigation, coordinatorNav, coordinatorNavUsers] : baseNavigation

  if (!isAuthenticated && route !== '#/login' && route !== '#/registro') {
    window.location.hash = '#/login'
    return null
  }

  if (route === '#/login') return <Login />
  if (route === '#/registro') return <Registro />
  if (route === '#/coordinador/cambiar-password' && user?.role !== 'coordinador') {
    window.location.hash = '#/'
    return null
  }
  if (route === '#/coordinador/cambiar-password') return <CambiarPassword />
  if (route === '#/coordinador/usuarios' && user?.role !== 'coordinador') {
    window.location.hash = '#/'
    return null
  }
  if (route === '#/coordinador/usuarios') return <GestionUsuarios />

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
                {user?.role && <span className={`role-badge ${user.role}`}>{user.role}</span>}
              </div>
              {user?.role === 'coordinador' && (
                <a href="#/coordinador/usuarios" className="btn btn-secondary btn-sm">Gestión usuarios</a>
              )}
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="content">
          {route === '#/' && <Lista />}
          {route === '#/nuevo' && <Nuevo />}
          {route === '#/coordinador/cambiar-password' && <CambiarPassword />}
          {route === '#/coordinador/usuarios' && <GestionUsuarios />}
        </main>
      </div>
    </div>
  )
}
