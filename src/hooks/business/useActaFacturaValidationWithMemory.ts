// src/hooks/business/useActaFacturaValidationWithMemory.ts
import { useMemo } from 'react'
import { useAlertMemory, generateDataHash } from './useAlertMemory'

interface ActaFacturaAlertWithMemory {
  show: boolean
  message: string
  type: 'warning' | 'error' | 'info'
  fechaActa: string
  fechaUltimaFactura: string | null
  diasDiferencia: number | null
  alertId: string
  isDismissed: boolean
  onDismiss: () => void
}

/**
 * Hook que combina validación Acta/Factura con memoria de alertas rechazadas
 * Evita mostrar alertas repetidas si el usuario las rechazó recientemente
 *
 * @param fechaActa Fecha del acta
 * @param atrData Datos mensuales de ATR
 * @returns Validación con información de memoria de alertas
 *
 * @example
 * const validation = useActaFacturaValidationWithMemory(fecha, data)
 * if (validation.show && !validation.isDismissed) {
 *   showAlert()
 * }
 */
export const useActaFacturaValidationWithMemory = (
  fechaActa: string,
  atrData: Array<{ year: number; month: number; fecha: Date; consumo: number; fechaHasta?: string }>
): ActaFacturaAlertWithMemory => {
  const { isDismissed, dismiss } = useAlertMemory()

  // Validación base (sin memoria)
  const baseValidation = useMemo(() => {
    if (!fechaActa || !atrData || atrData.length === 0) {
      return {
        show: false,
        message: '',
        type: 'info' as const,
        fechaActa,
        fechaUltimaFactura: null,
        diasDiferencia: null
      }
    }

    const actaDate = new Date(fechaActa)
    if (isNaN(actaDate.getTime())) {
      return {
        show: false,
        message: '',
        type: 'info' as const,
        fechaActa,
        fechaUltimaFactura: null,
        diasDiferencia: null
      }
    }

    let fechaUltimaFactura: Date | null = null

    for (const registro of atrData) {
      if (registro.fecha > (fechaUltimaFactura || new Date(0))) {
        fechaUltimaFactura = registro.fecha
      }
    }

    const actaYearMonth = `${actaDate.getFullYear()}-${String(actaDate.getMonth() + 1).padStart(2, '0')}`
    const registrosEnPeriodo = atrData.filter(r => {
      const rYearMonth = `${r.year}-${String(r.month).padStart(2, '0')}`
      return rYearMonth === actaYearMonth
    })

    let diasDiferencia: number | null = 0
    let mostrarAlerta = false
    let tipoAlerta: 'warning' | 'error' | 'info' = 'info'
    let mensaje = ''

    if (!fechaUltimaFactura) {
      mostrarAlerta = true
      tipoAlerta = 'error'
      mensaje = `⚠️ SIN FACTURAS REGISTRADAS\n\nNo hay registros de consumo en la base de datos.\nSe requiere al menos un período de facturación para realizar el análisis.`
      diasDiferencia = null
    } else if (registrosEnPeriodo.length === 0) {
      diasDiferencia = calcularDiasDiferencia(fechaUltimaFactura, actaDate)
      mostrarAlerta = true
      tipoAlerta = 'error'
      mensaje = `⚠️ SIN FACTURAS EN EL PERÍODO\n\nFecha del acta: ${formatDate(actaDate)}\nÚltima factura registrada: ${formatDate(fechaUltimaFactura)}\nDías de diferencia: ${Math.abs(diasDiferencia)} días\n\nNo hay registros de consumo para el mes/período del acta.`
    } else if (fechaUltimaFactura) {
      diasDiferencia = calcularDiasDiferencia(fechaUltimaFactura, actaDate)
      if (diasDiferencia > 30) {
        mostrarAlerta = true
        tipoAlerta = 'warning'
        mensaje = `⚠️ FACTURACIÓN VENCIDA\n\nFecha del acta: ${formatDate(actaDate)}\nÚltima factura registrada: ${formatDate(fechaUltimaFactura)}\nDías de diferencia: ${diasDiferencia} días\n\nLa última factura es anterior en más de 30 días al acta.`
      }
    }

    return {
      show: mostrarAlerta,
      message: mensaje,
      type: tipoAlerta,
      fechaActa,
      fechaUltimaFactura: fechaUltimaFactura ? formatDate(fechaUltimaFactura) : null,
      diasDiferencia
    }
  }, [fechaActa, atrData])

  // Generar ID y hash para la alerta
  const alertId = useMemo(() => {
    const type = baseValidation.show ? baseValidation.type : 'none'
    return `acta-validation-${type}`
  }, [baseValidation.show, baseValidation.type])

  const dataHash = useMemo(() => {
    return generateDataHash({
      fechaActa: baseValidation.fechaActa,
      diasDiferencia: baseValidation.diasDiferencia,
      type: baseValidation.type
    })
  }, [baseValidation.fechaActa, baseValidation.diasDiferencia, baseValidation.type])

  // Verificar si la alerta fue rechazada
  const isMemoized = useMemo(() => {
    if (!baseValidation.show) return false
    return isDismissed(alertId, dataHash)
  }, [baseValidation.show, alertId, dataHash, isDismissed])

  return {
    ...baseValidation,
    alertId,
    isDismissed: isMemoized,
    onDismiss: () => dismiss(alertId, dataHash),
    show: baseValidation.show && !isMemoized
  }
}

// Funciones auxiliares
const calcularDiasDiferencia = (fecha1: Date, fecha2: Date): number => {
  const diffTime = Math.abs(fecha2.getTime() - fecha1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}
