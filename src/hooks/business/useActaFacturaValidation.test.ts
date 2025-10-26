// src/hooks/business/useActaFacturaValidation.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useActaFacturaValidation } from './useActaFacturaValidation'

describe('useActaFacturaValidation', () => {
  const mockData = [
    {
      year: 2025,
      month: 9,
      fecha: new Date('2025-09-15'),
      consumo: 100
    },
    {
      year: 2025,
      month: 10,
      fecha: new Date('2025-10-15'),
      consumo: 120
    }
  ]

  describe('Caso 1: Sin facturas registradas', () => {
    it('debe mostrar alerta roja cuando no hay datos', () => {
      const { result } = renderHook(() => useActaFacturaValidation('2025-10-25', []))

      expect(result.current.show).toBe(true)
      expect(result.current.type).toBe('error')
      expect(result.current.message).toContain('SIN FACTURAS REGISTRADAS')
    })
  })

  describe('Caso 2: Sin facturas en el período del acta', () => {
    it('debe mostrar alerta roja cuando no hay facturas en el período', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-11-25', mockData)
      )

      expect(result.current.show).toBe(true)
      expect(result.current.type).toBe('error')
      expect(result.current.message).toContain('SIN FACTURAS EN EL PERÍODO')
    })

    it('debe calcular días de diferencia correctamente', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-11-25', mockData)
      )

      expect(result.current.diasDiferencia).toBeGreaterThan(0)
    })
  })

  describe('Caso 3: Factura >30 días antes del acta', () => {
    it('debe mostrar alerta naranja cuando factura es antigua', () => {
      const oldData = [
        {
          year: 2025,
          month: 7,
          fecha: new Date('2025-07-15'),
          consumo: 100
        }
      ]

      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-10-25', oldData)
      )

      expect(result.current.show).toBe(true)
      expect(result.current.type).toBe('warning')
      expect(result.current.message).toContain('FACTURACIÓN VENCIDA')
      expect(result.current.diasDiferencia).toBeGreaterThan(30)
    })
  })

  describe('Caso 4: Factura dentro de 30 días', () => {
    it('no debe mostrar alerta cuando factura está actualizada', () => {
      const recentData = [
        {
          year: 2025,
          month: 10,
          fecha: new Date('2025-10-20'),
          consumo: 150
        }
      ]

      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-10-25', recentData)
      )

      expect(result.current.show).toBe(false)
    })
  })

  describe('Validación de entrada', () => {
    it('debe retornar estado inactivo con fechaActa vacía', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('', mockData)
      )

      expect(result.current.show).toBe(false)
    })

    it('debe retornar estado inactivo con fecha inválida', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('invalid-date', mockData)
      )

      expect(result.current.show).toBe(false)
    })

    it('debe retornar estado inactivo sin datos ATR', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-10-25', [])
      )

      expect(result.current.show).toBe(true) // Sin datos = alerta
    })
  })

  describe('Mensajes y propiedades', () => {
    it('debe incluir información de fechas en el mensaje', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-11-25', mockData)
      )

      expect(result.current.message).toContain('25/11/2025') // Fecha acta
      expect(result.current.message).toContain('15/10/2025') // Última factura
    })

    it('debe retornar fechaActa correctamente', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-10-25', mockData)
      )

      expect(result.current.fechaActa).toBe('2025-10-25')
    })

    it('debe retornar fechaUltimaFactura formateada', () => {
      const { result } = renderHook(() => 
        useActaFacturaValidation('2025-10-25', mockData)
      )

      expect(result.current.fechaUltimaFactura).toBe('15/10/2025')
    })
  })

  describe('Optimización con useMemo', () => {
    it('no debe recalcular si los datos no cambian', () => {
      const { result, rerender } = renderHook(
        ({ fecha, data }) => useActaFacturaValidation(fecha, data),
        {
          initialProps: {
            fecha: '2025-10-25',
            data: mockData
          }
        }
      )

      const firstResult = result.current
      rerender({ fecha: '2025-10-25', data: mockData })
      const secondResult = result.current

      // Ambos deben tener el mismo contenido
      expect(firstResult.show).toBe(secondResult.show)
      expect(firstResult.message).toBe(secondResult.message)
    })
  })
})
