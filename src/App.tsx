/**
 * 📊 ValorApp_v2 - Aplicación Principal
 *
 * Punto de entrada de la aplicación. Configura el proveedor de contexto global
 * y define las rutas principales de navegación con lazy loading.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import './App.css';

// Lazy loading de páginas para optimizar el bundle inicial
const Home = lazy(() => import('./pages/Home/Home').then((m) => ({ default: m.Home })));
const Averia = lazy(() => import('./pages/Averia/Averia').then((m) => ({ default: m.Averia })));
const Wart = lazy(() => import('./pages/Wart/Wart').then((m) => ({ default: m.Wart })));
const ExpedienteTipoV = lazy(() =>
  import('./pages/ExpedienteTipoV/ExpedienteTipoV').then((m) => ({ default: m.ExpedienteTipoV }))
);
const SaldoATR = lazy(() =>
  import('./pages/SaldoATR/SaldoATR').then((m) => ({ default: m.SaldoATR }))
);

/**
 * Componente de carga mientras se cargan las páginas
 */
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: 'var(--color-primary)',
    }}
  >
    Cargando...
  </div>
);

/**
 * Componente raíz de la aplicación
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/averia" element={<Averia />} />
            <Route path="/wart" element={<Wart />} />
            <Route path="/expediente-tipo-v" element={<ExpedienteTipoV />} />
            <Route path="/saldo-atr" element={<SaldoATR />} />
          </Routes>
        </Suspense>
      </Router>
    </AppProvider>
  );
}

export default App;
