import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useATRForm } from './useATRForm'
import { mockATRRegistro } from '../../test/test-utils'

// Mock the useATRData hook
vi.mock('./useATRData', () => ({
  useATRData: () => ({
    addRegistro: vi.fn().mockReturnValue(true),
    validateRegistro: vi.fn().mockReturnValue([]),
  })
}))

describe('useATRForm', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useATRForm())
    
    expect(result.current.formData).toEqual({
      clienteId: '',
      fechaISO: expect.any(String), // Current date
      gestion: 'averia',
      valorTipo: 'estimado',
      kWh: 0,
    })
    
    expect(result.current.errors).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isDirty).toBe(false)
    expect(result.current.isValid).toBe(true)
  })

  it('updates field correctly', () => {
    const { result } = renderHook(() => useATRForm())
    
    act(() => {
      result.current.updateField('clienteId', 'CLI-001')
    })
    
    expect(result.current.formData.clienteId).toBe('CLI-001')
    expect(result.current.isDirty).toBe(true)
  })

  it('clears field error when updating field', () => {
    const { result } = renderHook(() => useATRForm())
    
    // Set initial error
    act(() => {
      result.current.validateForm()
    })
    
    // Update field should clear error
    act(() => {
      result.current.updateField('clienteId', 'CLI-001')
    })
    
    expect(result.current.errors.clienteId).toBeUndefined()
  })

  it('shows fraud tipo when gestion is fraude', () => {
    const { result } = renderHook(() => useATRForm())
    
    expect(result.current.shouldShowFraudeTipo).toBe(false)
    
    act(() => {
      result.current.updateField('gestion', 'fraude')
    })
    
    expect(result.current.shouldShowFraudeTipo).toBe(true)
  })

  it('validates form correctly', () => {
    const { result } = renderHook(() => useATRForm({
      onError: vi.fn()
    }))
    
    act(() => {
      const isValid = result.current.validateForm()
      expect(isValid).toBe(false) // Should be invalid with empty clienteId
    })
    
    expect(result.current.isValid).toBe(false)
  })

  it('calls onSuccess when form submits successfully', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useATRForm({ onSuccess }))
    
    // Fill valid form data
    act(() => {
      result.current.updateField('clienteId', 'CLI-001')
      result.current.updateField('kWh', 100)
    })
    
    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(true)
    })
    
    expect(onSuccess).toHaveBeenCalled()
  })

  it('resets form correctly', () => {
    const { result } = renderHook(() => useATRForm())
    
    // Make some changes
    act(() => {
      result.current.updateField('clienteId', 'CLI-001')
      result.current.updateField('kWh', 100)
    })
    
    expect(result.current.isDirty).toBe(true)
    
    // Reset form
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.formData.clienteId).toBe('')
    expect(result.current.formData.kWh).toBe(0)
    expect(result.current.isDirty).toBe(false)
    expect(result.current.errors).toEqual({})
  })

  it('prevents submission when already submitting', async () => {
    const { result } = renderHook(() => useATRForm())
    
    // Start first submission
    const promise1 = act(async () => {
      return result.current.handleSubmit()
    })
    
    expect(result.current.isSubmitting).toBe(true)
    
    // Try second submission while first is in progress
    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBeUndefined()
    })
    
    await promise1
  })
})