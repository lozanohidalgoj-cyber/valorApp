import { useMemo } from 'react'
import { useStore } from '../../state/StoreContextNew'
import { ATRRegistro } from '../../types/atr'
import { useDebounce } from '../ui'

interface UseATRDataOptions {
  searchQuery?: string
  gestionFilter?: string
  valorTipoFilter?: string
  debounceMs?: number
}

export function useATRData(options: UseATRDataOptions = {}) {
  const {
    searchQuery = '',
    gestionFilter = '',
    valorTipoFilter = '',
    debounceMs = 300,
  } = options

  const store = useStore()
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)

  // Filtered registros based on search and filters
  const filteredRegistros = useMemo(() => {
    if (!debouncedSearchQuery && !gestionFilter && !valorTipoFilter) {
      return store.registros
    }

    return store.searchRegistros(
      debouncedSearchQuery,
      gestionFilter || undefined,
      valorTipoFilter || undefined
    )
  }, [store, debouncedSearchQuery, gestionFilter, valorTipoFilter])

  // Statistics
  const stats = useMemo(() => ({
    total: store.registros.length,
    filtered: filteredRegistros.length,
    totalKWh: store.getTotalKWh(),
    filteredKWh: filteredRegistros.reduce((sum, r) => sum + r.kWh, 0),
    averageKWh: filteredRegistros.length > 0 
      ? filteredRegistros.reduce((sum, r) => sum + r.kWh, 0) / filteredRegistros.length 
      : 0,
  }), [store, filteredRegistros])

  // Grouping functions
  const groupByGestion = useMemo(() => {
    const groups = { averia: 0, fraude: 0 }
    filteredRegistros.forEach(r => {
      groups[r.gestion]++
    })
    return groups
  }, [filteredRegistros])

  const groupByValorTipo = useMemo(() => {
    const groups = { real: 0, estimado: 0 }
    filteredRegistros.forEach(r => {
      groups[r.valorTipo]++
    })
    return groups
  }, [filteredRegistros])

  // Actions with enhanced error handling
  const addRegistro = (registro: Omit<ATRRegistro, 'id'>): boolean => {
    try {
      const newRegistro: ATRRegistro = {
        ...registro,
        id: store.generateId(),
      }
      
      const validationErrors = store.validateRegistro(newRegistro)
      if (validationErrors.length > 0) {
        return false
      }
      
      store.add(newRegistro)
      return true
    } catch {
      return false
    }
  }

  const removeRegistro = (id: string): boolean => {
    try {
      store.remove(id)
      return true
    } catch {
      return false
    }
  }

  const clearAllRegistros = (): boolean => {
    try {
      store.clear()
      return true
    } catch {
      return false
    }
  }

  return {
    // Data
    registros: filteredRegistros,
    allRegistros: store.registros,
    saldoATR: store.saldoATR,
    
    // State
    isLoading: store.isLoading,
    error: store.error,
    
    // Statistics
    stats,
    groupByGestion,
    groupByValorTipo,
    
    // Actions
    addRegistro,
    removeRegistro,
    clearAllRegistros,
    setSaldoATR: store.setSaldoATR,
    validateRegistro: store.validateRegistro,
    generateId: store.generateId,
  }
}