// src/pages/Wart/WartWithValidation.tsx
/**
 * Componente mejorado del módulo WART con validación de facturas integrada
 * Muestra alertas de validación al ingresar la fecha del acta
 */
import React, { useCallback, useEffect } from 'react'
import { useWARTModule } from '../../hooks/business/useWARTModule'
import { useActaFacturaValidationWithMemory } from '../../hooks/business/useActaFacturaValidationWithMemory'
import { ActaFacturaAlertModal } from '../../components/ui/ActaFacturaAlertModal'

interface WartWithValidationProps {
  onValidationStatusChange?: (hasAlert: boolean) => void
}

const useAtrCsv = () => {
  try {
    const s = localStorage.getItem('valorApp.analisis.atrCsv')
    if (!s) return null
    return JSON.parse(s)
  } catch {
    return null
  }
}

/**
 * Componente wrapper para el módulo WART con validación integrada
 * Lee datos ATR desde localStorage y ejecuta validación
 *
 * @param props Propiedades del componente
 * @returns Componente renderizado
 */
export const WartWithValidation: React.FC<WartWithValidationProps> = ({ onValidationStatusChange }) => {
  const { state, setFechaActa, setCambioTitular, setObservaciones } = useWARTModule()
  const atrData = useAtrCsv()
  const [showAlert, setShowAlert] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState('')
  const [alertType, setAlertType] = React.useState<'warning' | 'error' | 'info'>('info')

  // Construir monthly data desde ATR CSV
  const monthlyDataForValidation = React.useMemo(() => {
    if (!atrData?.rows || atrData.rows.length === 0) return []

    // Parsear datos ATR simples
    return atrData.rows
      .map((row: Record<string, string>, idx: number) => {
        try {
          // Buscar columnas de fecha y consumo
          const fechaCol = Object.keys(row).find(k => 
            k.toLowerCase().includes('fecha') || k.toLowerCase().includes('periodo')
          )
          const consumoCol = Object.keys(row).find(k => 
            k.toLowerCase().includes('consumo') || k.toLowerCase().includes('kwh')
          )

          if (!fechaCol) return null

          const fechaStr = row[fechaCol] || ''
          const consumoStr = row[consumoCol] || '0'
          const fecha = new Date(fechaStr)

          if (isNaN(fecha.getTime())) return null

          return {
            fecha,
            consumo: parseFloat(consumoStr) || 0,
            year: fecha.getFullYear(),
            month: fecha.getMonth() + 1
          }
        } catch (error) {
          console.warn(`⚠️ Error parseando fila ${idx}:`, error)
          return null
        }
      })
      .filter((item): item is typeof item & {} => item !== null)
  }, [atrData])

  // Ejecutar validación
  const validation = useActaFacturaValidationWithMemory(state.fechaActa, monthlyDataForValidation)

  // Actualizar estado de alerta
  useEffect(() => {
    if (validation.show) {
      setShowAlert(true)
      setAlertMessage(validation.message)
      setAlertType(validation.type)
      onValidationStatusChange?.(true)
      console.log('🚨 Alerta de validación Acta/Factura:', { type: validation.type })
    } else {
      setShowAlert(false)
      onValidationStatusChange?.(false)
    }
  }, [validation, onValidationStatusChange])

  const handleFechaActaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaActa(e.target.value)
  }, [setFechaActa])

  const handleCambioTitularChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCambioTitular(e.target.checked, e.target.dataset.fecha)
  }, [setCambioTitular])

  const handleObservacionesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(e.target.value)
  }, [setObservaciones])

  const handleDismissAlert = useCallback(() => {
    validation.onDismiss()
    setShowAlert(false)
  }, [validation])

  return (
    <div style={{ padding: '2rem' }}>
      {/* Modal de validación */}
      <ActaFacturaAlertModal
        show={showAlert}
        message={alertMessage}
        type={alertType}
        onClose={handleDismissAlert}
      />

      {/* Formulario WART */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#0000D0', fontSize: '1.5rem' }}>
          Módulo WART - Validación ATR
        </h2>

        {/* Campo Fecha del Acta */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 700,
            color: '#1a1a1a'
          }}>
            📅 Fecha del Acta*
          </label>
          <input
            type="date"
            value={state.fechaActa}
            onChange={handleFechaActaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: "'Open Sans', sans-serif"
            }}
          />
          {state.fechaActa && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Fecha seleccionada: {new Date(state.fechaActa).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>

        {/* Campo Cambio de Titular */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={state.cambioTitular.tuvo}
              onChange={handleCambioTitularChange}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontWeight: 700, color: '#1a1a1a' }}>
              👤 Hubo cambio de titular
            </span>
          </label>
          {state.cambioTitular.tuvo && (
            <div style={{ marginTop: '0.75rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                Fecha del cambio:
              </label>
              <input
                type="date"
                value={state.cambioTitular.fecha}
                onChange={e => setCambioTitular(true, e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          )}
        </div>

        {/* Campo Observaciones */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 700,
            color: '#1a1a1a'
          }}>
            📝 Observaciones
          </label>
          <textarea
            value={state.observaciones}
            onChange={handleObservacionesChange}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: "'Open Sans', sans-serif",
              resize: 'vertical'
            }}
            placeholder="Ingrese observaciones sobre el acta o facturación..."
          />
        </div>

        {/* Indicador de estado de validación */}
        {state.fechaActa && monthlyDataForValidation.length > 0 && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            background: validation.show ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${validation.show ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: validation.show ? '#dc2626' : '#059669',
            fontSize: '0.875rem'
          }}>
            {validation.show ? (
              <>
                <strong>⚠️ Alerta de validación:</strong> {validation.type === 'error' ? 'Error detectado' : 'Advertencia'}
              </>
            ) : (
              <>
                <strong>✅ Validación OK:</strong> Facturas dentro del rango válido
              </>
            )}
          </div>
        )}

        {/* Info de ATR */}
        {monthlyDataForValidation.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f1f5f9',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <strong>📊 Datos ATR cargados:</strong> {monthlyDataForValidation.length} períodos
          </div>
        )}
      </div>
    </div>
  )
}
