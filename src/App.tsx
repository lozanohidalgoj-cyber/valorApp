import { useEffect, useState } from 'react'
import './App.css'
import { Valoracion } from './pages/Dashboard'
import Wart from './pages/Wart/Wart'
import AnalisisExpediente from './pages/AnalisisExpediente/AnalisisExpediente'
import ExportSaldoATR from './pages/ExportSaldoATR/ExportSaldoATR'
import ATRPreview from './pages/ExportSaldoATR/ATRPreviewMinimal'

function useHashRoute() {
  const [route, setRoute] = useState<string>(() => location.hash || '#/')
  useEffect(() => {
    const onHash = () => setRoute(location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useHashRoute()

  // Rutas
  if (route === '#/wart') return <Wart />
  if (route === '#/analisis-expediente') return <AnalisisExpediente />
  if (route === '#/export-saldo-atr') return <ExportSaldoATR />
  if (route === '#/ver-saldo-atr') return <ATRPreview />

  // Dashboard por defecto
  return <Valoracion />
}
