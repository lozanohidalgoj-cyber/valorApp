import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboard } from '../useDashboard'
import type { ATRRegistro } from '../../../types/atr'

// Base registros de prueba
const baseRegistros: ATRRegistro[] = [
  { id: '1', clienteId: '12345', fechaISO: '2024-01-01', gestion: 'averia', valorTipo: 'real', kWh: 100 },
  { id: '2', clienteId: '67890', fechaISO: '2024-01-02', gestion: 'fraude', valorTipo: 'estimado', kWh: 200, fraudeTipo: 'tipo1' },
]

// Mock de useATRData alineado con la implementación actual (sin selección / saldo)
const mockUseATRData = {
  registros: baseRegistros,
  allRegistros: baseRegistros,
  isLoading: false,
  error: null,
  stats: { total: baseRegistros.length, filtered: baseRegistros.length, totalKWh: 300, filteredKWh: 300, averageKWh: 150 },
  addRegistro: vi.fn(),
  removeRegistro: vi.fn(),
  clearAllRegistros: vi.fn(),
  generateId: vi.fn(() => 'new-id'),
}

vi.mock('../../../hooks/business', () => ({
  useATRData: () => mockUseATRData,
}))

// Mock de useFilters actualizado (usa filters + debouncedSearchQuery)
const filtersState = {
  filters: { searchQuery: '', gestionFilter: '', valorTipoFilter: '' },
  debouncedSearchQuery: '',
  updateFilter: vi.fn(),
  clearFilters: vi.fn(),
}

vi.mock('../../../hooks/ui', () => ({
  useFilters: () => filtersState,
}))

describe('useDashboard (refactor)', () => {
  beforeEach(() => {
    // Reset mocks y estado
    mockUseATRData.registros = baseRegistros
    mockUseATRData.allRegistros = baseRegistros
    mockUseATRData.stats = { total: baseRegistros.length, filtered: baseRegistros.length, totalKWh: 300, filteredKWh: 300, averageKWh: 150 }
    filtersState.filters.searchQuery = ''
    filtersState.filters.gestionFilter = ''
    filtersState.filters.valorTipoFilter = ''
    filtersState.debouncedSearchQuery = ''
  })

  it('retorna registros y estadísticas básicas', () => {
    const { result } = renderHook(() => useDashboard())
    expect(result.current.registros).toEqual(baseRegistros)
    expect(result.current.stats.total).toBe(2)
    expect(result.current.filteredStats.count).toBe(2)
    expect(result.current.filteredStats.totalKWh).toBe(300)
  })

  it('filtra por búsqueda (searchQuery)', () => {
    filtersState.filters.searchQuery = '12345'
    filtersState.debouncedSearchQuery = '12345'
    const { result } = renderHook(() => useDashboard())
    expect(result.current.registros).toHaveLength(1)
    expect(result.current.registros[0].clienteId).toBe('12345')
  })

  it('filtra por tipo de gestión', () => {
    filtersState.filters.gestionFilter = 'fraude'
    const { result } = renderHook(() => useDashboard())
    expect(result.current.registros).toHaveLength(1)
    expect(result.current.registros[0].gestion).toBe('fraude')
  })

  it('filtra por tipo de valor', () => {
    filtersState.filters.valorTipoFilter = 'estimado'
    const { result } = renderHook(() => useDashboard())
    expect(result.current.registros).toHaveLength(1)
    expect(result.current.registros[0].valorTipo).toBe('estimado')
  })

  it('estadísticas filtradas cambian al aplicar filtros', () => {
    filtersState.filters.gestionFilter = 'fraude'
    const { result } = renderHook(() => useDashboard())
    expect(result.current.filteredStats.count).toBe(1)
    expect(result.current.filteredStats.totalKWh).toBe(200)
  })

  it('maneja el caso de registros vacíos', () => {
    mockUseATRData.registros = []
    mockUseATRData.allRegistros = []
    mockUseATRData.stats = { total: 0, filtered: 0, totalKWh: 0, filteredKWh: 0, averageKWh: 0 }
    const { result } = renderHook(() => useDashboard())
    expect(result.current.registros).toHaveLength(0)
    expect(result.current.filteredStats.count).toBe(0)
    expect(result.current.filteredStats.totalKWh).toBe(0)
  })
})