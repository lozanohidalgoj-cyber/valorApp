import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '../ui'

interface FilterOptions {
  debounceMs?: number
}

export interface FilterState {
  searchQuery: string
  gestionFilter: string
  valorTipoFilter: string
}

export function useFilters(options: FilterOptions = {}) {
  const { debounceMs = 300 } = options

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    gestionFilter: '',
    valorTipoFilter: '',
  })

  const debouncedSearchQuery = useDebounce(filters.searchQuery, debounceMs)

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      gestionFilter: '',
      valorTipoFilter: '',
    })
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(filters.searchQuery || filters.gestionFilter || filters.valorTipoFilter)
  }, [filters])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.gestionFilter) count++
    if (filters.valorTipoFilter) count++
    return count
  }, [filters])

  return {
    // Current filter values
    filters,
    debouncedSearchQuery,
    
    // State
    hasActiveFilters,
    activeFilterCount,
    
    // Actions
    updateFilter,
    clearFilters,
    
    // Convenience setters
    setSearchQuery: (value: string) => updateFilter('searchQuery', value),
    setGestionFilter: (value: string) => updateFilter('gestionFilter', value),
    setValorTipoFilter: (value: string) => updateFilter('valorTipoFilter', value),
  }
}