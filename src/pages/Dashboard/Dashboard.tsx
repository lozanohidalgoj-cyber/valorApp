import React, { useState } from 'react'
import { Card, CardHeader } from '../../components/ui'
import { FilterBar } from './FilterBar'
import { StatsSummary } from './StatsSummary'
import { ATRTable } from './ATRTable'
import { useDashboard } from './useDashboard'
import styles from './Dashboard.module.css'

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



  const [showAveriaSubs, setShowAveriaSubs] = useState(false)

  // Empty state - no registros at all
  if (!stats.total) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
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
          background: 'radial-gradient(circle, rgba(255,49,132,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          margin: '0 0 1rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 10
        }}>
          ValorApp
        </h1>
        <p style={{
          fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
          margin: '0 0 3.5rem',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.95)',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: 1.5,
          position: 'relative',
          zIndex: 10
        }}>
          ¿Qué tipo de gestión desea realizar?
        </p>
        {!showAveriaSubs && (
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 10
          }}>
            <button
              type="button"
              onClick={() => { window.location.hash = '/nuevo?gestion=fraude' }}
              style={{
                background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '1.75rem 4rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                borderRadius: '16px',
                boxShadow: '0 12px 32px -8px rgba(255, 49, 132, 0.7)',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '240px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(255, 49, 132, 0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(255, 49, 132, 0.7)';
              }}
            >FRAUDE</button>
            <button
              type="button"
              onClick={() => setShowAveriaSubs(true)}
              style={{
                background: 'linear-gradient(135deg, #FF3184 0%, #FF1493 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '1.75rem 4rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                borderRadius: '16px',
                boxShadow: '0 12px 32px -8px rgba(255, 49, 132, 0.7)',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '240px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(255, 49, 132, 0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(255, 49, 132, 0.7)';
              }}
            >AVERÍA</button>
          </div>
        )}
        {showAveriaSubs && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            background: 'rgba(255, 255, 255, 0.98)',
            padding: '3rem 2.5rem',
            borderRadius: '24px',
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
            border: 'none',
            maxWidth: '900px',
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(20px)'
          }}>
            <h2 style={{
              margin: '0 0 0.5rem',
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: '#0000D0',
              textAlign: 'center'
            }}>Seleccione el subtipo de Avería</h2>
            <p style={{
              margin: '0 0 1.5rem',
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              color: '#2929E5',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: 650,
              lineHeight: 1.6,
              opacity: 0.9
            }}>Elija una de las opciones para continuar con el proceso de valoración de la avería.</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              <button type="button" onClick={() => { window.location.hash = '#/wart' }} style={{
                background: '#0000D0',
                color: '#FFFFFF',
                border: 'none',
                padding: '1.25rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.5)',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '200px',
                flex: '1 1 200px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0000B8';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(0, 0, 208, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000D0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 208, 0.5)';
              }}
              >WART</button>
              <button type="button" onClick={() => { window.location.hash = '#/nuevo?gestion=averia&tipo=montaje' }} style={{
                background: '#0000D0',
                color: '#FFFFFF',
                border: 'none',
                padding: '1.25rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.5)',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '200px',
                flex: '1 1 200px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0000B8';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(0, 0, 208, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000D0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 208, 0.5)';
              }}
              >ERROR DE MONTAJE</button>
              <button type="button" onClick={() => { window.location.hash = '#/nuevo?gestion=averia&tipo=averia' }} style={{
                background: '#0000D0',
                color: '#FFFFFF',
                border: 'none',
                padding: '1.25rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 10px 25px -8px rgba(0, 0, 208, 0.5)',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '200px',
                flex: '1 1 200px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0000B8';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(0, 0, 208, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0000D0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -8px rgba(0, 0, 208, 0.5)';
              }}
              >ERROR DE AVERIA</button>
            </div>
            <button type="button" onClick={() => setShowAveriaSubs(false)} style={{
              background: 'transparent',
              color: '#0000D0',
              border: 'none',
              fontSize: '1rem',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s',
              marginTop: '0.5rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 0, 208, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
            >← Volver</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
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