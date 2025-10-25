// src/components/ui/ActaFacturaAlertModal/ActaFacturaAlertModal.tsx
import React from 'react'
import styles from './ActaFacturaAlertModal.module.css'

interface ActaFacturaAlertModalProps {
  show: boolean
  message: string
  type: 'warning' | 'error' | 'info'
  onClose: () => void
}

export const ActaFacturaAlertModal: React.FC<ActaFacturaAlertModalProps> = ({
  show,
  message,
  type,
  onClose
}) => {
  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📋'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(239, 68, 68, 0.1)'
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)'
      case 'info':
        return 'rgba(59, 130, 246, 0.1)'
      default:
        return 'rgba(100, 116, 139, 0.1)'
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(239, 68, 68, 0.3)'
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)'
      case 'info':
        return 'rgba(59, 130, 246, 0.3)'
      default:
        return 'rgba(100, 116, 139, 0.3)'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'error':
        return '#dc2626'
      case 'warning':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      default:
        return '#0000D0'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return '#dc2626'
      case 'warning':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      default:
        return '#0000D0'
    }
  }

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        style={{
          background: getBackgroundColor(),
          border: `2px solid ${getBorderColor()}`,
          boxShadow: `0 20px 50px -10px ${getTitleColor()}40`
        }}
      >
        {/* Icono y título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>{getIcon()}</span>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 800,
                color: getTitleColor(),
                fontFamily: "'Lato', sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              Validación de Facturación ATR
            </h2>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.875rem',
                color: '#64748b',
                fontFamily: "'Open Sans', sans-serif"
              }}
            >
              Verifique los datos antes de continuar
            </p>
          </div>
        </div>

        {/* Mensaje */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: `1px solid ${getBorderColor()}`,
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            whiteSpace: 'pre-wrap',
            fontSize: '1rem',
            color: '#1a1a1a',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.6',
            fontWeight: 500
          }}
        >
          {message}
        </div>

        {/* Botón de acción */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: getButtonColor(),
              color: '#FFFFFF',
              border: 'none',
              padding: '0.875rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 10px 20px -5px ${getButtonColor()}40`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ✓ Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
