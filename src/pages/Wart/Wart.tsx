import React, { useEffect, useMemo, useState } from 'react'

export const Wart: React.FC = () => {
  const [checks, setChecks] = useState({ c1: false, c2: false })
  // Nuevo: cambio de titular (checklist exclusivo) y fecha
  const [cambioTitular, setCambioTitular] = useState<'si' | 'no' | null>(null)
  const [fechaCambio, setFechaCambio] = useState<string>('')

  const toggle = (key: 'c1'|'c2') => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allOk = checks.c1 && checks.c2
  const canContinue = useMemo(() => {
    if (!allOk) return false
    if (cambioTitular === 'si') return Boolean(fechaCambio)
    return true
  }, [allOk, cambioTitular, fechaCambio])

  // Cargar estado previo (si existe)
  useEffect(() => {
    try {
      const s = localStorage.getItem('valorApp.wart.cambioTitular')
      if (s) {
        const obj = JSON.parse(s)
        if (obj && typeof obj === 'object') {
          setCambioTitular(obj.tuvoCambioTitular === true ? 'si' : obj.tuvoCambioTitular === false ? 'no' : null)
          setFechaCambio(typeof obj.fecha === 'string' ? obj.fecha : '')
        }
      }
    } catch { /* noop */ }
  }, [])

  // Persistir cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('valorApp.wart.cambioTitular', JSON.stringify({
        tuvoCambioTitular: cambioTitular === 'si',
        fecha: cambioTitular === 'si' ? fechaCambio : ''
      }))
    } catch { /* noop */ }
  }, [cambioTitular, fechaCambio])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(135deg, #0000D0 0%, #2929E5 50%, #5252FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efectos decorativos de fondo */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(255,49,132,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        maxWidth: '1200px', 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        padding: '4rem 3.5rem',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(3rem, 7vw, 4.5rem)', 
          margin: '0 0 1rem', 
          fontWeight: 800, 
          letterSpacing: '-0.01em', 
          color: '#0000D0',
          fontFamily: "'Lato', sans-serif"
        }}>
          Módulo WART
        </h1>
        <p style={{ 
          fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', 
          margin: '0 0 3rem', 
          lineHeight: 1.6, 
          color: '#2929E5', 
          fontWeight: 500,
          fontFamily: "'Open Sans', sans-serif"
        }}>
          Antes de continuar recuerde revisar:
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: '0 0 3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.75rem' 
        }}>
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1.25rem', 
              alignItems: 'flex-start', 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%',
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={checks.c1}
                onChange={() => toggle('c1')}
                style={{ 
                  width: 28, 
                  height: 28, 
                  accentColor: '#0000D0', 
                  marginTop: 4,
                  cursor: 'pointer'
                }}
              />
              <span>
                <strong style={{ color: '#0000D0', fontWeight: 700 }}>1.</strong> Al revisar el pantallazo <strong style={{ color: '#0000D0' }}>Pinzas 73</strong> no tiene diferencia de tiempo o la diferencia es menor a un minuto.
              </span>
            </label>
          </li>
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1.25rem', 
              alignItems: 'flex-start', 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%',
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={checks.c2}
                onChange={() => toggle('c2')}
                style={{ 
                  width: 28, 
                  height: 28, 
                  accentColor: '#0000D0', 
                  marginTop: 4,
                  cursor: 'pointer'
                }}
              />
              <span>
                <strong style={{ color: '#0000D0', fontWeight: 700 }}>2.</strong> La resta de la <strong style={{ color: '#0000D0' }}>carga real en acometida</strong> y la <strong style={{ color: '#0000D0' }}>carga real en contador</strong> es mayor a 0,5.
              </span>
            </label>
          </li>
          {/* Bloque nuevo: ¿Tuvo cambio de titular? */}
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.75rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Encabezado con numeración al estilo de los puntos 1 y 2 */}
            <span style={{ 
              fontSize: '1.35rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              fontFamily: "'Open Sans', sans-serif"
            }}>
              <strong style={{ color: '#0000D0', fontWeight: 700 }}>3.</strong> ¿Tuvo cambio de titular?
            </span>

            {/* Opciones exclusivas No / Sí */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Open Sans', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={cambioTitular === 'no'}
                  onChange={() => {
                    setCambioTitular(cambioTitular === 'no' ? null : 'no')
                    if (cambioTitular !== 'no') setFechaCambio('')
                  }}
                  style={{ width: 28, height: 28, accentColor: '#0000D0', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1.125rem', color: '#1a1a1a' }}>No</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Open Sans', sans-serif" }}>
                <input
                  type="checkbox"
                  checked={cambioTitular === 'si'}
                  onChange={() => {
                    setCambioTitular(cambioTitular === 'si' ? null : 'si')
                  }}
                  style={{ width: 28, height: 28, accentColor: '#0000D0', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '1.125rem', color: '#1a1a1a' }}>Sí</span>
              </label>
            </div>

            {cambioTitular === 'si' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '1.125rem', color: '#1a1a1a', fontFamily: "'Open Sans', sans-serif" }}>Fecha de cambio de titular:</label>
                <input
                  type="date"
                  value={fechaCambio}
                  onChange={e => setFechaCambio(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    border: '2px solid rgba(0, 0, 208, 0.1)',
                    fontSize: '1rem',
                    fontFamily: "'Open Sans', sans-serif"
                  }}
                />
              </div>
            )}
          </li>
        </ul>

        <div style={{ 
          display: 'flex', 
          gap: '1.25rem', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          paddingTop: '1.5rem'
        }}>
          <a
            href="#/"
            style={{
              background: 'transparent',
              color: '#0000D0',
              padding: '1.25rem 2rem',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1.25rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Open Sans', sans-serif"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 208, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >← Volver</a>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => { window.location.hash = '#/analisis-expediente' }}
            style={{
              background: canContinue 
                ? 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)' 
                : 'rgba(0, 0, 208, 0.15)',
              color: canContinue ? '#FFFFFF' : 'rgba(0, 0, 208, 0.4)',
              border: 'none',
              padding: '1.25rem 3rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              borderRadius: '12px',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 10px 25px -8px rgba(255, 49, 132, 0.6)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: canContinue ? 1 : 0.6,
              fontFamily: "'Lato', sans-serif"
            }}
            onMouseEnter={e => { 
              if (canContinue) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(255, 49, 132, 0.8)';
              }
            }}
            onMouseLeave={e => { 
              if (canContinue) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(255, 49, 132, 0.6)';
              }
            }}
          >Seguir →</button>
        </div>
      </div>
    </div>
  )
}

export default Wart
