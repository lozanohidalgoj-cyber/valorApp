import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ATRService } from './atrService'
import type { ATRRegistro } from '../../types/atr'

// Mock localStorage service
const mockLocalStorageService = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('../storage', () => ({
  localStorageService: mockLocalStorageService,
}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-1234'),
  },
})

describe('ATRService', () => {
  let atrService: ATRService

  beforeEach(() => {
    vi.clearAllMocks()
    atrService = new ATRService()
  })

  const createMockRegistro = (id: string, overrides?: Partial<ATRRegistro>): ATRRegistro => ({
    id,
    clienteId: '12345',
    fechaISO: '2024-01-01',
    gestion: 'averia',
    valorTipo: 'real',
    kWh: 100,
    ...overrides,
  })

  describe('loadRegistros', () => {
    it('returns registros from storage', () => {
      const mockRegistros = [
        createMockRegistro('1'),
        createMockRegistro('2'),
      ]
      mockLocalStorageService.get.mockReturnValue(mockRegistros)

      const result = atrService.loadRegistros()
      expect(result).toEqual(mockRegistros)
    })

    it('returns empty array when no data', () => {
      mockLocalStorageService.get.mockReturnValue(null)

      const result = atrService.loadRegistros()
      expect(result).toEqual([])
    })

    it('returns empty array on error', () => {
      mockLocalStorageService.get.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = atrService.loadRegistros()
      expect(result).toEqual([])
    })
  })

  describe('saveRegistros', () => {
    it('saves registros to storage', () => {
      const registros = [createMockRegistro('1')]
      
      atrService.saveRegistros(registros)
      
      expect(mockLocalStorageService.set).toHaveBeenCalledWith('valorApp.registros', registros)
    })
  })

  describe('addRegistro', () => {
    it('adds new registro and returns updated list', () => {
      const existingRegistros = [createMockRegistro('1')]
      const newRegistro = createMockRegistro('2')
      mockLocalStorageService.get.mockReturnValue(existingRegistros)

      const result = atrService.addRegistro(newRegistro)

      expect(result).toHaveLength(2)
      expect(result).toContain(newRegistro)
      expect(mockLocalStorageService.set).toHaveBeenCalled()
    })
  })

  describe('removeRegistro', () => {
    it('removes registro by id', () => {
      const registros = [
        createMockRegistro('1'),
        createMockRegistro('2'),
      ]
      mockLocalStorageService.get.mockReturnValue(registros)

      const result = atrService.removeRegistro('1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
      expect(mockLocalStorageService.set).toHaveBeenCalled()
    })
  })

  describe('clearRegistros', () => {
    it('clears all registros', () => {
      const result = atrService.clearRegistros()

      expect(result).toEqual([])
      expect(mockLocalStorageService.set).toHaveBeenCalledWith('valorApp.registros', [])
    })
  })


  describe('generateId', () => {
    it('generates UUID when available', () => {
      const result = atrService.generateId()
      expect(result).toBe('mock-uuid-1234')
    })

    it('falls back to random string when UUID not available', () => {
      const originalRandomUUID = global.crypto.randomUUID
      delete (global.crypto as any).randomUUID
      
      const result = atrService.generateId()
      expect(result).toMatch(/^id-[a-z0-9]+$/)

      // Restore original function
      global.crypto.randomUUID = originalRandomUUID
    })
  })

  describe('validateRegistro', () => {
    it('validates complete registro', () => {
      const validRegistro = createMockRegistro('1')
      
      const errors = atrService.validateRegistro(validRegistro)
      expect(errors).toEqual([])
    })

    it('returns errors for missing fields', () => {
      const invalidRegistro = {}
      
      const errors = atrService.validateRegistro(invalidRegistro)
      expect(errors).toContain('ID del cliente es requerido')
      expect(errors).toContain('Fecha es requerida')
      expect(errors).toContain('Tipo de gestión es requerido')
      expect(errors).toContain('Tipo de valor es requerido')
    })

    it('requires fraudeTipo when gestion is fraude', () => {
      const fraudeRegistro = {
        ...createMockRegistro('1'),
        gestion: 'fraude' as const,
        fraudeTipo: undefined,
      }
      
      const errors = atrService.validateRegistro(fraudeRegistro)
      expect(errors).toContain('Tipo de fraude es requerido cuando la gestión es fraude')
    })

    it('validates kWh is positive number', () => {
      const invalidKWhRegistro = {
        ...createMockRegistro('1'),
        kWh: -50,
      }
      
      const errors = atrService.validateRegistro(invalidKWhRegistro)
      expect(errors).toContain('kWh debe ser un número positivo')
    })
  })

  describe('searchRegistros', () => {
    const mockRegistros = [
      createMockRegistro('1', { clienteId: '12345', gestion: 'averia', valorTipo: 'real' }),
      createMockRegistro('2', { clienteId: '67890', gestion: 'fraude', valorTipo: 'estimado' }),
    ]

    it('searches by text query', () => {
      const result = atrService.searchRegistros(mockRegistros, '123')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters by gestion type', () => {
      const result = atrService.searchRegistros(mockRegistros, '', 'fraude')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('filters by valor tipo', () => {
      const result = atrService.searchRegistros(mockRegistros, '', undefined, 'estimado')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('returns all when no filters applied', () => {
      const result = atrService.searchRegistros(mockRegistros, '')
      expect(result).toEqual(mockRegistros)
    })
  })

  describe('calculateTotalKWh', () => {
    it('calculates total kWh', () => {
      const registros = [
        createMockRegistro('1', { kWh: 100 }),
        createMockRegistro('2', { kWh: 200 }),
        createMockRegistro('3', { kWh: 150 }),
      ]

      const result = atrService.calculateTotalKWh(registros)
      expect(result).toBe(450)
    })

    it('returns 0 for empty array', () => {
      const result = atrService.calculateTotalKWh([])
      expect(result).toBe(0)
    })
  })
})