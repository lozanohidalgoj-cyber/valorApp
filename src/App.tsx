import { useEffect, useState } from 'react'
import './App.css'
import Lista from './pages/Lista'
import Nuevo from './pages/Nuevo'
import Login from './pages/Login'
import Registro from './pages/Registro'
import CambiarPassword from './pages/CambiarPassword'
import GestionUsuarios from './pages/GestionUsuarios'
import { useAuth } from './auth/AuthContext'
import SaldoATR from './pages/SaldoATR'

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
  case '#/saldo-atr': return 'Saldo ATR'
  case '#/coordinador/cambiar-password': return 'Cambiar contraseña'
    default: return 'ValorApp'
  }
}

export default function App() {
  const route = useHashRoute()
  const { isAuthenticated, user, logout } = useAuth()
  const navigation = user?.role === 'coordinador' ? [...baseNavigation, coordinatorNav, coordinatorNavUsers] : baseNavigation
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('valorApp.sidebarOpen')
      if (saved === '0') return false
      if (saved === '1') return true
      // Por defecto, colapsada en pantallas pequeñas
      return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
    } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('valorApp.sidebarOpen', sidebarOpen ? '1' : '0') } catch {}
  }, [sidebarOpen])

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
  <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`} aria-hidden={!sidebarOpen}>
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
            {user?.role === 'valorador' && (
              <li className="sidebar-nav-item">
                <a href="#/saldo-atr" className={`sidebar-nav-link ${route === '#/saldo-atr' ? 'active' : ''}`}>
                  <span>📊</span>
                  Saldo ATR
                </a>
              </li>
            )}
            {user?.role === 'valorador' && (
              <li className="sidebar-nav-item">
                <a
                  href="#/"
                  className="sidebar-nav-link"
                  onClick={(e) => {
                    if (route === '#/') {
                      e.preventDefault()
                      const open = (window as any).valorApp_openFile
                      if (typeof open === 'function') {
                        open()
                      } else {
                        try { window.dispatchEvent(new CustomEvent('valorApp:triggerImportATR')) } catch {}
                      }
                    } else {
                      try { localStorage.setItem('valorApp.triggerImportATR', '1') } catch {}
                      // Permitimos la navegación a '#/' y Lista abrirá el diálogo al montar
                    }
                  }}
                >
                  <span>📥</span>
                  Importar ATR
                </a>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSidebarOpen(s => !s)}
                aria-label={sidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
                title={sidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
              >
                {sidebarOpen ? '⟨⟨' : '☰'}
              </button>
              <h2 className="header-title" style={{ margin: 0 }}>{getPageTitle(route)}</h2>
            </div>
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
          {route === '#/saldo-atr' && <SaldoATR />}
          {route === '#/coordinador/cambiar-password' && <CambiarPassword />}
          {route === '#/coordinador/usuarios' && <GestionUsuarios />}
        </main>
      </div>
    </div>
  )
}
