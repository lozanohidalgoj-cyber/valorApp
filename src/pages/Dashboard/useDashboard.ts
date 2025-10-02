import { useMemo } from 'react'
import { useATRData } from '../../hooks/business'
import { useFilters } from '../../hooks/ui'

// Eliminadas dependencias de Saldo ATR

export function useDashboard() {
  const { 
    registros,
    addRegistro,
    clearAllRegistros,
    generateId,
    stats 
  } = useATRData()

  const { filters, updateFilter, clearFilters, debouncedSearchQuery } = useFilters()

  // Eliminada lógica de saldoATR

  // Filter registros based on current filters
  const filteredRegistros = useMemo(() => {
    return registros.filter(registro => {
      if (filters.gestionFilter && registro.gestion !== filters.gestionFilter) {
        return false
      }
      if (filters.valorTipoFilter && registro.valorTipo !== filters.valorTipoFilter) {
        return false
      }
      if (debouncedSearchQuery) {
        const searchText = `${registro.clienteId} ${registro.fraudeTipo ?? ''} ${registro.notas ?? ''}`.toLowerCase()
        if (!searchText.includes(debouncedSearchQuery.toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [registros, filters, debouncedSearchQuery])

  // Calculate totals for filtered registros
  const filteredStats = useMemo(() => {
    const totalKWh = filteredRegistros.reduce((sum, r) => sum + r.kWh, 0)
    return {
      count: filteredRegistros.length,
      totalKWh
    }
  }, [filteredRegistros])

  return {
    // Data
    registros: filteredRegistros,
    allRegistros: registros,
    // Stats
    stats,
    filteredStats,
    
    // Filters
    filters,
    updateFilter,
    clearFilters,
    
    // Actions (saldo removido)
    clearAllRegistros,
  }
}