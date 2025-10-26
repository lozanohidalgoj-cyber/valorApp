// src/hooks/business/useAlertMemory.ts
import { useCallback, useEffect, useState } from 'react'

interface DismissedAlert {
  id: string
  timestamp: number
  dataHash: string
}

interface UseAlertMemoryReturn {
  isDismissed: (alertId: string, dataHash: string) => boolean
  dismiss: (alertId: string, dataHash: string) => void
  undismiss: (alertId: string) => void
  clearAll: () => void
  getDismissedAlerts: () => DismissedAlert[]
}

const STORAGE_KEY = 'valorApp.alerts.dismissed'
const DISMISSAL_TIMEOUT_MS = 24 * 60 * 60 * 1000 // 24 horas

/**
 * Custom hook para gestionar memoria de alertas rechazadas
 * Evita mostrar la misma alerta múltiples veces en 24 horas
 *
 * @returns {UseAlertMemoryReturn} Funciones para gestionar alertas rechazadas
 *
 * @example
 * const { isDismissed, dismiss } = useAlertMemory()
 *
 * if (!isDismissed('acta-validation', currentDataHash)) {
 *   showAlert()
 *   dismiss('acta-validation', currentDataHash)
 * }
 */
export const useAlertMemory = (): UseAlertMemoryReturn => {
  const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Error al cargar alertas rechazadas:', error)
      return []
    }
  })

  // Limpiar alertas expiradas al montar
  useEffect(() => {
    const now = Date.now()
    const active = dismissedAlerts.filter(a => now - a.timestamp < DISMISSAL_TIMEOUT_MS)

    if (active.length !== dismissedAlerts.length) {
      setDismissedAlerts(active)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
        console.log('🧹 Alertas expiradas limpiadas')
      } catch (error) {
        console.error('❌ Error al limpiar alertas expiradas:', error)
      }
    }
  }, [dismissedAlerts])

  const isDismissed = useCallback(
    (alertId: string, dataHash: string) => {
      const now = Date.now()
      const alert = dismissedAlerts.find(a => a.id === alertId && a.dataHash === dataHash)

      if (!alert) {
        return false
      }

      // Verificar si ha expirado
      if (now - alert.timestamp > DISMISSAL_TIMEOUT_MS) {
        return false
      }

      return true
    },
    [dismissedAlerts]
  )

  const dismiss = useCallback(
    (alertId: string, dataHash: string) => {
      const newAlert: DismissedAlert = {
        id: alertId,
        timestamp: Date.now(),
        dataHash
      }

      const updated = [
        ...dismissedAlerts.filter(a => !(a.id === alertId && a.dataHash === dataHash)),
        newAlert
      ]

      setDismissedAlerts(updated)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        console.log(`✅ Alerta rechazada: ${alertId}`)
      } catch (error) {
        console.error('❌ Error al guardar alerta rechazada:', error)
      }
    },
    [dismissedAlerts]
  )

  const undismiss = useCallback((alertId: string) => {
    const updated = dismissedAlerts.filter(a => a.id !== alertId)
    setDismissedAlerts(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      console.log(`🔄 Rechazo de alerta revertido: ${alertId}`)
    } catch (error) {
      console.error('❌ Error al revertir rechazo de alerta:', error)
    }
  }, [dismissedAlerts])

  const clearAll = useCallback(() => {
    setDismissedAlerts([])

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('🗑️ Todas las alertas rechazadas limpiadas')
    } catch (error) {
      console.error('❌ Error al limpiar alertas rechazadas:', error)
    }
  }, [])

  const getDismissedAlerts = useCallback(() => {
    const now = Date.now()
    return dismissedAlerts.filter(a => now - a.timestamp < DISMISSAL_TIMEOUT_MS)
  }, [dismissedAlerts])

  return {
    isDismissed,
    dismiss,
    undismiss,
    clearAll,
    getDismissedAlerts
  }
}

/**
 * Utilidad para generar hash de datos para comparación
 * @param data Datos a hashear
 * @returns Hash simple de los datos
 */
export const generateDataHash = (data: unknown): string => {
  const json = JSON.stringify(data)
  let hash = 0

  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convertir a 32-bit integer
  }

  return Math.abs(hash).toString(36)
}
