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

  // Empty state - no registros at all
  if (!stats.total) {
    return (
      <Card className={styles.emptyCard}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3 className={styles.emptyTitle}>No hay registros aún</h3>
          <p className={styles.emptyMessage}>
            Aún no existen registros para valorar. Cuando se carguen datos aparecerán aquí.
          </p>
        </div>
      </Card>
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