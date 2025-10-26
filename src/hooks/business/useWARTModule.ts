// src/hooks/business/useWARTModule.ts
import { useCallback, useEffect, useState } from 'react'

interface WARTModuleState {
  fechaActa: string
  cambioTitular: {
    tuvo: boolean
    fecha: string
  }
  observaciones: string
  contrato: string
}

interface UseWARTModuleReturn {
  state: WARTModuleState
  setFechaActa: (fecha: string) => void
  setCambioTitular: (tuvo: boolean, fecha?: string) => void
  setObservaciones: (obs: string) => void
  setContrato: (contrato: string) => void
  reset: () => void
  clear: () => void
}

const STORAGE_KEY_ACTA = 'valorApp.wart.fechaActa'
const STORAGE_KEY_CAMBIO_TITULAR = 'valorApp.wart.cambioTitular'
const STORAGE_KEY_OBSERVACIONES = 'valorApp.wart.observaciones'
const STORAGE_KEY_CONTRATO = 'valorApp.wart.contrato'

const initialState: WARTModuleState = {
  fechaActa: '',
  cambioTitular: {
    tuvo: false,
    fecha: ''
  },
  observaciones: '',
  contrato: ''
}

/**
 * Custom hook para gestionar el estado del módulo WART
 * Incluye persistencia en localStorage y sincronización entre tabs
 *
 * @returns {UseWARTModuleReturn} Estado y funciones del módulo WART
 *
 * @example
 * const { state, setFechaActa, setCambioTitular } = useWARTModule()
 * useEffect(() => {
 *   setFechaActa('2025-10-25')
 * }, [setFechaActa])
 */
export const useWARTModule = (): UseWARTModuleReturn => {
  const [state, setState] = useState<WARTModuleState>(() => {
    // Inicializar desde localStorage
    try {
      const storedFechaActa = localStorage.getItem(STORAGE_KEY_ACTA)
      const storedCambioTitular = localStorage.getItem(STORAGE_KEY_CAMBIO_TITULAR)
      const storedObservaciones = localStorage.getItem(STORAGE_KEY_OBSERVACIONES)
      const storedContrato = localStorage.getItem(STORAGE_KEY_CONTRATO)

      return {
        fechaActa: storedFechaActa ? JSON.parse(storedFechaActa) : '',
        cambioTitular: storedCambioTitular ? JSON.parse(storedCambioTitular) : { tuvo: false, fecha: '' },
        observaciones: storedObservaciones ? JSON.parse(storedObservaciones) : '',
        contrato: storedContrato ? JSON.parse(storedContrato) : ''
      }
    } catch (error) {
      console.error('❌ Error al cargar estado WART desde localStorage:', error)
      return initialState
    }
  })

  // Persistir cambios en localStorage
  const persistState = useCallback((newState: WARTModuleState) => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTA, JSON.stringify(newState.fechaActa))
      localStorage.setItem(STORAGE_KEY_CAMBIO_TITULAR, JSON.stringify(newState.cambioTitular))
      localStorage.setItem(STORAGE_KEY_OBSERVACIONES, JSON.stringify(newState.observaciones))
      localStorage.setItem(STORAGE_KEY_CONTRATO, JSON.stringify(newState.contrato))
      console.log('✅ Estado WART persistido:', newState)
    } catch (error) {
      console.error('❌ Error al persistir estado WART:', error)
    }
  }, [])

  // Listener para cambios en localStorage desde otros tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_ACTA || e.key === STORAGE_KEY_CAMBIO_TITULAR || 
          e.key === STORAGE_KEY_OBSERVACIONES || e.key === STORAGE_KEY_CONTRATO) {
        try {
          const newState: WARTModuleState = {
            fechaActa: e.key === STORAGE_KEY_ACTA && e.newValue ? JSON.parse(e.newValue) : state.fechaActa,
            cambioTitular: e.key === STORAGE_KEY_CAMBIO_TITULAR && e.newValue ? JSON.parse(e.newValue) : state.cambioTitular,
            observaciones: e.key === STORAGE_KEY_OBSERVACIONES && e.newValue ? JSON.parse(e.newValue) : state.observaciones,
            contrato: e.key === STORAGE_KEY_CONTRATO && e.newValue ? JSON.parse(e.newValue) : state.contrato
          }
          setState(newState)
          console.log('🔄 Estado WART sincronizado desde otro tab:', newState)
        } catch (error) {
          console.error('❌ Error al sincronizar estado WART:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [state])

  const setFechaActa = useCallback((fecha: string) => {
    setState(prev => {
      const newState = { ...prev, fechaActa: fecha }
      persistState(newState)
      console.log('📅 Fecha del acta establecida:', fecha)
      return newState
    })
  }, [persistState])

  const setCambioTitular = useCallback((tuvo: boolean, fecha?: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        cambioTitular: {
          tuvo,
          fecha: tuvo && fecha ? fecha : ''
        }
      }
      persistState(newState)
      console.log('👤 Cambio de titular:', newState.cambioTitular)
      return newState
    })
  }, [persistState])

  const setObservaciones = useCallback((obs: string) => {
    setState(prev => {
      const newState = { ...prev, observaciones: obs }
      persistState(newState)
      console.log('📝 Observaciones actualizadas:', obs)
      return newState
    })
  }, [persistState])

  const setContrato = useCallback((contrato: string) => {
    setState(prev => {
      const newState = { ...prev, contrato }
      persistState(newState)
      console.log('🔗 Contrato establecido:', contrato)
      return newState
    })
  }, [persistState])

  const reset = useCallback(() => {
    setState(initialState)
    persistState(initialState)
    console.log('🔄 Estado WART reseteado')
  }, [persistState])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_ACTA)
      localStorage.removeItem(STORAGE_KEY_CAMBIO_TITULAR)
      localStorage.removeItem(STORAGE_KEY_OBSERVACIONES)
      localStorage.removeItem(STORAGE_KEY_CONTRATO)
      setState(initialState)
      console.log('🗑️ Estado WART limpiado')
    } catch (error) {
      console.error('❌ Error al limpiar estado WART:', error)
    }
  }, [])

  return {
    state,
    setFechaActa,
    setCambioTitular,
    setObservaciones,
    setContrato,
    reset,
    clear
  }
}
