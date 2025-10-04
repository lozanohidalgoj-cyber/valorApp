import { useEffect, useState } from 'react'
import './App.css'
import { Valoracion } from './pages/Dashboard'
import { Login } from './pages/Login/Login'
import Registro from './pages/Registro'
import CambiarPassword from './pages/CambiarPassword'
import GestionUsuarios from './pages/GestionUsuarios'
import { useAuth } from './auth/AuthContextNew'
import { WelcomeScreen } from './pages/Welcome/WelcomeScreen'
import Wart from './pages/Wart/Wart'
import AnalisisExpediente from './pages/AnalisisExpediente/AnalisisExpediente'
import ExportSaldoATR from './pages/ExportSaldoATR/ExportSaldoATR'
import ATRPreview from './pages/ExportSaldoATR/ATRPreview'

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
  { id: 'dashboard', hash: '#/', label: 'Valoración', icon: '📊' }
]
const coordinatorNav = { id: 'cambiarPass', hash: '#/coordinador/cambiar-password', label: 'Cambiar contraseña', icon: '🔐' }
const coordinatorNavUsers = { id: 'gestionUsuarios', hash: '#/coordinador/usuarios', label: 'Gestión de usuarios', icon: '👥' }

function getPageTitle(route: string) {
  switch (route) {
    case '#/': return 'Valoración'
    case '#/coordinador/cambiar-password': return 'Cambiar contraseña'
    case '#/coordinador/usuarios': return 'Gestión de Usuarios'
    case '#/wart': return 'WART'
    case '#/analisis-expediente': return 'Análisis de Expediente'
    case '#/export-saldo-atr': return 'Exportar Saldo ATR'
    case '#/ver-saldo-atr': return 'Vista previa ATR'
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
    } catch { 
      return true 
    }
  })
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem('valorApp.welcome.seen')
      return seen !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try { 
      localStorage.setItem('valorApp.sidebarOpen', sidebarOpen ? '1' : '0') 
    } catch {
      // Ignore localStorage errors
    }
  }, [sidebarOpen])

  const dismissWelcome = () => {
    try { localStorage.setItem('valorApp.welcome.seen', '1') } catch {}
    setShowWelcome(false)
  }

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
  if (route === '#/wart') return <Wart />
  if (route === '#/analisis-expediente') return <AnalisisExpediente />
  if (route === '#/export-saldo-atr') return <ExportSaldoATR />
  if (route === '#/ver-saldo-atr') return <ATRPreview />

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
              <img src="/assets/importar-atr-icon.png" alt="Importar ATR" style={{ width: '24px', height: '24px' }} />
              {route !== '#/' && (
                <h2 className="header-title" style={{ margin: 0 }}>{getPageTitle(route)}</h2>
              )}
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

        <main className={`content ${showWelcome && route === '#/' ? 'welcome-active' : ''}`}>
          {route === '#/' && (
            showWelcome ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <WelcomeScreen 
                  onSelectGestion={(tipo) => { 
                    console.log('Gestión seleccionada:', tipo)
                    if (tipo === 'fraude') {
                      // Si es fraude cerramos de inmediato
                      dismissWelcome()
                    }
                  }}
                  onSelectSubtipoAveria={(sub) => {
                    console.log('Subtipo avería seleccionado:', sub)
                    dismissWelcome()
                  }}
                />
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <button className="btn btn-primary" onClick={dismissWelcome}>
                    Continuar ➜
                  </button>
                </div>
              </div>
            ) : (
              <Valoracion />
            )
          )}
          {route === '#/coordinador/cambiar-password' && <CambiarPassword />}
          {route === '#/coordinador/usuarios' && <GestionUsuarios />}
        </main>
      </div>
    </div>
  )
}
