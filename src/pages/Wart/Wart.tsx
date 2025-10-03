import React, { useState } from 'react'

export const Wart: React.FC = () => {
  const [checks, setChecks] = useState({ c1: false, c2: false })

  const toggle = (key: 'c1'|'c2') => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allOk = checks.c1 && checks.c2

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '3rem 1.25rem 4rem',
      background: '#FFFFFF',
      color: '#007a2f',
      textAlign: 'left'
    }}>
      <div style={{ maxWidth: 880, width: '100%' }}>
        <h1 style={{ fontSize: '2.75rem', margin: '0 0 1rem', fontWeight: 800, letterSpacing: '.5px', color: '#008f37' }}>
          Módulo WART
        </h1>
        <p style={{ fontSize: '1.15rem', margin: '0 0 2rem', lineHeight: 1.5, color: '#006a29', fontWeight: 500 }}>
          Antes de continuar recuerde revisar:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '.9rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', gap: '.9rem', alignItems: 'flex-start', fontSize: '1rem', lineHeight: 1.4, color: '#007a2f', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={checks.c1}
                onChange={() => toggle('c1')}
                style={{ width: 22, height: 22, accentColor: '#00b34a', marginTop: 2 }}
              />
              <span>
                1. Al revisar el pantallazo <strong>Pinzas 73</strong> no tiene diferencia de tiempo o la diferencia es menor a un minuto.
              </span>
            </label>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '.9rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', gap: '.9rem', alignItems: 'flex-start', fontSize: '1rem', lineHeight: 1.4, color: '#007a2f', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={checks.c2}
                onChange={() => toggle('c2')}
                style={{ width: 22, height: 22, accentColor: '#00b34a', marginTop: 2 }}
              />
              <span>
                2. La resta de la <strong>carga real en acometida</strong> y la <strong>carga real en contador</strong> es mayor a 0,5.
              </span>
            </label>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a
            href="#/"
            style={{
              background: 'transparent',
              color: '#008f37',
              padding: '.85rem 1.4rem',
              fontWeight: 600,
              textDecoration: 'underline',
              fontSize: '.95rem'
            }}
          >Volver</a>
          <button
            type="button"
            disabled={!allOk}
            onClick={() => { window.location.hash = '#/analisis-expediente' }}
            style={{
              background: allOk ? 'linear-gradient(135deg,#00a846 0%,#00c55a 45%,#00e46c 100%)' : '#c8e9d5',
              color: allOk ? '#FFFFFF' : '#5c9471',
              border: '2px solid ' + (allOk ? '#4ce894' : '#b6d9c4'),
              padding: '0.95rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '18px',
              cursor: allOk ? 'pointer' : 'not-allowed',
              boxShadow: allOk ? '0 10px 28px -10px rgba(0,168,70,0.45)' : 'none',
              transition: 'background .25s ease, transform .25s ease'
            }}
            onMouseEnter={e => { if (allOk) e.currentTarget.style.transform='translateY(-3px)' }}
            onMouseLeave={e => { if (allOk) e.currentTarget.style.transform='translateY(0)' }}
          >Seguir ➜</button>
        </div>
      </div>
    </div>
  )
}

export default Wart
