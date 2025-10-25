// src/hooks/business/useActaFacturaValidation.ts
import { useMemo } from 'react'

interface ActaFacturaAlert {
  show: boolean
  message: string
  type: 'warning' | 'error' | 'info'
  fechaActa: string
  fechaUltimaFactura: string | null
  diasDiferencia: number | null
}

export const useActaFacturaValidation = (
  fechaActa: string,
  atrData: Array<{ year: number; month: number; fecha: Date; consumo: number; fechaHasta?: string }>
): ActaFacturaAlert => {
  return useMemo(() => {
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

    // Convertir fechaActa a Date
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

    // Encontrar la última factura registrada (por fecha más reciente)
    let fechaUltimaFactura: Date | null = null

    for (const registro of atrData) {
      if (registro.fecha > (fechaUltimaFactura || new Date(0))) {
        fechaUltimaFactura = registro.fecha
      }
    }

    // Verificar si existen facturas para el período del acta
    const actaYearMonth = `${actaDate.getFullYear()}-${String(actaDate.getMonth() + 1).padStart(2, '0')}`
    const registrosEnPeriodo = atrData.filter(r => {
      const rYearMonth = `${r.year}-${String(r.month).padStart(2, '0')}`
      return rYearMonth === actaYearMonth
    })

    // Calcular diferencia de días
    let diasDiferencia: number | null = 0
    let mostrarAlerta = false
    let tipoAlerta: 'warning' | 'error' | 'info' = 'info'
    let mensaje = ''

    if (!fechaUltimaFactura) {
      // Caso 1: No existen facturas registradas
      mostrarAlerta = true
      tipoAlerta = 'error'
      mensaje = `⚠️ SIN FACTURAS REGISTRADAS\n\nNo hay registros de consumo en la base de datos.\nSe requiere al menos un período de facturación para realizar el análisis.`
      diasDiferencia = null
    } else if (registrosEnPeriodo.length === 0) {
      // Caso 2: No hay facturas para el período específico del acta
      diasDiferencia = calcularDiasDiferencia(fechaUltimaFactura, actaDate)
      mostrarAlerta = true
      tipoAlerta = 'error'
      mensaje = `⚠️ SIN FACTURAS EN EL PERÍODO\n\nFecha del acta: ${formatDate(actaDate)}\nÚltima factura registrada: ${formatDate(fechaUltimaFactura)}\nDías de diferencia: ${Math.abs(diasDiferencia)} días\n\nNo hay registros de consumo para el mes/período del acta.`
    } else if (fechaUltimaFactura) {
      // Caso 3: Verificar si la última factura es anterior en más de 30 días
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
}

// Utilidad: calcular diferencia de días
const calcularDiasDiferencia = (fecha1: Date, fecha2: Date): number => {
  const diffTime = Math.abs(fecha2.getTime() - fecha1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Utilidad: formatear fecha
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}
