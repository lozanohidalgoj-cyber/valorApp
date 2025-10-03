import React, { useState, useEffect } from 'react'
import { Card, CardHeader } from '../../components/ui'
import { FilterBar } from './FilterBar'
import { StatsSummary } from './StatsSummary'
import { ATRTable } from './ATRTable'
import { useDashboard } from './useDashboard'
import styles from './Dashboard.module.css'
import { WelcomeScreen } from '../Welcome/WelcomeScreen'

export const Valoracion: React.FC = () => {
  const {
    registros,
    stats,
    filteredStats,
    filters,
    updateFilter,
    clearFilters,
    clearAllRegistros,
  } = useDashboard()

  // Intro screen (pantalla inicial Valoración)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return localStorage.getItem('valorApp.valoracion.introSeen') !== '1'
    } catch {
      return true
    }
  })

  const dismissIntro = () => {
    try { localStorage.setItem('valorApp.valoracion.introSeen', '1') } catch {}
    setShowIntro(false)
  }

  // Derivar KPIs básicos
  const kpi = React.useMemo(() => {
    const total = stats.total
    const totalKWh = stats.totalKWh
    // Derivar conteos por tipo
    let fraude = 0
    let averia = 0
    registros.forEach(r => (r.gestion === 'fraude' ? fraude++ : averia++))
    const reales = registros.filter(r => r.valorTipo === 'real').length
    const estimados = registros.filter(r => r.valorTipo === 'estimado').length
    return {
      total,
      totalKWh,
      fraude,
      averia,
      reales,
      estimados,
    }
  }, [stats, registros])

  const [showAveriaSubs, setShowAveriaSubs] = useState(false)

  // Empty state - no registros at all
  if (!stats.total) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
        padding: '2rem 1.5rem',
        background: '#0000FF'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          margin: '0 0 1.5rem',
          fontWeight: 800,
          letterSpacing: '1px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          Bienvenido a ValorApp
        </h1>
        <p style={{
          fontSize: '1.75rem',
          margin: '0 0 3rem',
          fontWeight: 500,
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          ¿Qué gestión desea realizar?
        </p>
        {!showAveriaSubs && (
          <div style={{
            display: 'flex',
            gap: '2.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={() => console.log('fraude')}
              style={{
                background: 'linear-gradient(135deg,#FF1493 0%,#ff3fab 40%,#ff66c0 100%)',
                color: '#FFFFFF',
                border: '2px solid #ff8ccd',
                padding: '1.4rem 3.6rem',
                fontSize: '1.6rem',
                fontWeight: 800,
                borderRadius: '22px',
                boxShadow: '0 18px 40px -14px rgba(255,20,147,0.6), 0 0 0 2px rgba(255,255,255,0.15) inset',
                cursor: 'pointer',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                transition: 'transform .25s ease, box-shadow .25s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}
            >FRAUDE</button>
            <button
              type="button"
              onClick={() => setShowAveriaSubs(true)}
              style={{
                background: 'linear-gradient(135deg,#00a846 0%,#00c55a 45%,#00e46c 100%)',
                color: '#FFFFFF',
                border: '2px solid #4ce894',
                padding: '1.4rem 3.6rem',
                fontSize: '1.6rem',
                fontWeight: 800,
                borderRadius: '22px',
                boxShadow: '0 18px 40px -14px rgba(0,168,70,0.55), 0 0 0 2px rgba(255,255,255,0.15) inset',
                cursor: 'pointer',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                transition: 'transform .25s ease, box-shadow .25s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}
            >AVERÍA</button>
          </div>
        )}
        {showAveriaSubs && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.75rem',
            background: '#FFFFFF',
            padding: '2.5rem 2rem 2.8rem',
            borderRadius: '32px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.18), 0 2px 8px -2px rgba(0,0,0,0.08)',
            border: '2px solid #e4ecf7',
            maxWidth: '980px'
          }}>
            <h2 style={{
              margin: '0 0 0.5rem',
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '.5px',
              color: '#0044aa',
              textAlign: 'center'
            }}>Seleccione el subtipo de Avería</h2>
            <p style={{
              margin: '0 0 1.5rem',
              fontSize: '1.05rem',
              color: '#1f3b63',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.45
            }}>Elija una de las opciones para continuar con el proceso de valoración de la avería.</p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" onClick={() => { window.location.hash = '#/wart' }} style={{
                background: 'linear-gradient(140deg,#FF1493 0%,#ff40ac 45%,#ff7dc8 100%)',
                color: '#FFFFFF',
                border: '2px solid #ff9dd6',
                padding: '1.25rem 2.6rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                borderRadius: '18px',
                boxShadow: '0 16px 34px -14px rgba(255,20,147,0.55)',
                cursor: 'pointer',
                letterSpacing: '.7px',
                transition: 'transform .25s ease, box-shadow .25s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}
              >WART</button>
              <button type="button" onClick={() => console.log('averia:ERROR_MONTAJE')} style={{
                background: 'linear-gradient(140deg,#FF1493 0%,#ff40ac 45%,#ff7dc8 100%)',
                color: '#FFFFFF',
                border: '2px solid #ff9dd6',
                padding: '1.25rem 2.6rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                borderRadius: '18px',
                boxShadow: '0 16px 34px -14px rgba(255,20,147,0.55)',
                cursor: 'pointer',
                letterSpacing: '.7px',
                transition: 'transform .25s ease, box-shadow .25s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}
              >ERROR DE MONTAJE</button>
              <button type="button" onClick={() => console.log('averia:ERROR_AVERIA')} style={{
                background: 'linear-gradient(140deg,#FF1493 0%,#ff40ac 45%,#ff7dc8 100%)',
                color: '#FFFFFF',
                border: '2px solid #ff9dd6',
                padding: '1.25rem 2.6rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                borderRadius: '18px',
                boxShadow: '0 16px 34px -14px rgba(255,20,147,0.55)',
                cursor: 'pointer',
                letterSpacing: '.7px',
                transition: 'transform .25s ease, box-shadow .25s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}
              >ERROR DE AVERIA</button>
            </div>
            <button type="button" onClick={() => setShowAveriaSubs(false)} style={{
              background: 'transparent',
              color: '#0044aa',
              border: 'none',
              fontSize: '.95rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600
            }}>Volver</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {showIntro && (
        <div className={styles.introWrapper} style={{ textAlign: 'center' }}>
          <button
            className={`btn btn-sm btn-secondary ${styles.introDismiss}`}
            onClick={dismissIntro}
            style={{ position: 'absolute', top: 12, right: 12 }}
          >
            Cerrar ✕
          </button>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem', color: '#0d1b2a', fontWeight: 800 }}>
            Bienvenido a <span style={{ color: '#0057ff' }}>Valorrap</span>
          </h1>
          <p style={{ fontSize: '1.25rem', margin: '0 0 2rem', color: '#213547', fontWeight: 500 }}>
            ¿Qué tipo de gestión desea realizar hoy?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => console.log('fraude')}
              style={{
                background: '#d00000',
                color: '#fff',
                border: 'none',
                padding: '1.25rem 3rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                borderRadius: '14px',
                boxShadow: '0 8px 24px -6px rgba(208,0,0,0.45)',
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              FRAUDE
            </button>
            <button
              type="button"
              onClick={() => console.log('averia')}
              style={{
                background: '#008000',
                color: '#fff',
                border: 'none',
                padding: '1.25rem 3rem',
                fontSize: '1.5rem',
                fontWeight: 700,
                borderRadius: '14px',
                boxShadow: '0 8px 24px -6px rgba(0,128,0,0.45)',
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              AVERIA
            </button>
          </div>
          <div style={{ maxWidth: 920, margin: '0 auto 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Registros</span>
              <span className={styles.kpiValue}>{kpi.total}</span>
              <span className={styles.kpiDelta}>{kpi.fraude} fraude / {kpi.averia} avería</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Energía total (kWh)</span>
              <span className={styles.kpiValue}>{kpi.totalKWh.toFixed(2)}</span>
              <span className={styles.kpiDelta}>{kpi.reales} reales / {kpi.estimados} estimados</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>% Fraude</span>
              <span className={styles.kpiValue}>{kpi.total ? ((kpi.fraude / kpi.total) * 100).toFixed(1) + '%' : '0%'}</span>
              <span className={styles.kpiDelta}>Sobre total</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>% Reales</span>
              <span className={styles.kpiValue}>{kpi.total ? ((kpi.reales / kpi.total) * 100).toFixed(1) + '%' : '0%'}</span>
              <span className={styles.kpiDelta}>Con respecto al total</span>
            </div>
          </div>
          <div className={styles.introHelp}>
            Seleccione un tipo de gestión para continuar o cierre esta vista. (Se recordará su elección).
          </div>
        </div>
      )}
      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        onClearAll={clearAllRegistros}
        hasActiveFilters={false}
      />

      {/* Main content */}
      <Card>
        <CardHeader>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Registros ATR</h3>
              <StatsSummary
                totalCount={stats.total}
                filteredCount={filteredStats.count}
                totalKWh={stats.totalKWh}
                filteredKWh={filteredStats.totalKWh}
              />
            </div>
            
            {/* Acciones adicionales futuras aquí */}
          </div>
        </CardHeader>
  {/* Panel auxiliar eliminado */}

        <ATRTable registros={registros} />
      </Card>
    </div>
  )
}