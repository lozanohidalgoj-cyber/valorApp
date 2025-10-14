import React, { useState } from 'react'

export const Wart: React.FC = () => {
  const [checks, setChecks] = useState({ c1: false, c2: false })

  const toggle = (key: 'c1'|'c2') => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allOk = checks.c1 && checks.c2

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
        maxWidth: '900px', 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 2.75rem)', 
          margin: '0 0 0.75rem', 
          fontWeight: 800, 
          letterSpacing: '-0.01em', 
          color: '#0000D0' 
        }}>
          Módulo WART
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
          margin: '0 0 2.5rem', 
          lineHeight: 1.6, 
          color: '#2929E5', 
          fontWeight: 500 
        }}>
          Antes de continuar recuerde revisar:
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: '0 0 2.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem' 
        }}>
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            background: 'rgba(0, 0, 208, 0.03)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'flex-start', 
              fontSize: '1rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%'
            }}>
              <input
                type="checkbox"
                checked={checks.c1}
                onChange={() => toggle('c1')}
                style={{ 
                  width: 24, 
                  height: 24, 
                  accentColor: '#0000D0', 
                  marginTop: 2,
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
            padding: '1.25rem',
            borderRadius: '12px',
            border: '2px solid rgba(0, 0, 208, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'flex-start', 
              fontSize: '1rem', 
              lineHeight: 1.6, 
              color: '#1a1a1a', 
              fontWeight: 500,
              width: '100%'
            }}>
              <input
                type="checkbox"
                checked={checks.c2}
                onChange={() => toggle('c2')}
                style={{ 
                  width: 24, 
                  height: 24, 
                  accentColor: '#0000D0', 
                  marginTop: 2,
                  cursor: 'pointer'
                }}
              />
              <span>
                <strong style={{ color: '#0000D0', fontWeight: 700 }}>2.</strong> La resta de la <strong style={{ color: '#0000D0' }}>carga real en acometida</strong> y la <strong style={{ color: '#0000D0' }}>carga real en contador</strong> es mayor a 0,5.
              </span>
            </label>
          </li>
        </ul>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          paddingTop: '1rem'
        }}>
          <a
            href="#/"
            style={{
              background: 'transparent',
              color: '#0000D0',
              padding: '1rem 1.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
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
            disabled={!allOk}
            onClick={() => { window.location.hash = '#/analisis-expediente' }}
            style={{
              background: allOk 
                ? 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)' 
                : 'rgba(0, 0, 208, 0.15)',
              color: allOk ? '#FFFFFF' : 'rgba(0, 0, 208, 0.4)',
              border: 'none',
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '12px',
              cursor: allOk ? 'pointer' : 'not-allowed',
              boxShadow: allOk ? '0 10px 25px -8px rgba(255, 49, 132, 0.6)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: allOk ? 1 : 0.6
            }}
            onMouseEnter={e => { 
              if (allOk) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(255, 49, 132, 0.8)';
              }
            }}
            onMouseLeave={e => { 
              if (allOk) {
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
