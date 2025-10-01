import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogin } from '../useLogin'

// Mock AuthContext
const mockLogin = vi.fn()
const mockAuthContext = {
  login: mockLogin,
  isLoading: false,
  error: null,
}

vi.mock('../../auth/AuthContextNew', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock window location
Object.defineProperty(window, 'location', {
  value: { hash: '' },
  writable: true,
})

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
    window.location.hash = ''
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useLogin())

    expect(result.current.formData).toEqual({
      username: '',
      password: '',
      remember: true,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.errors).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })

  it('updates form fields correctly', () => {
    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.updateField('username', 'testuser')
    })

    expect(result.current.formData.username).toBe('testuser')

    act(() => {
      result.current.updateField('password', 'password123')
    })

    expect(result.current.formData.password).toBe('password123')

    act(() => {
      result.current.updateField('remember', false)
    })

    expect(result.current.formData.remember).toBe(false)
  })

  it('provides convenience setters', () => {
    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.setUsername('testuser')
    })
    expect(result.current.formData.username).toBe('testuser')

    act(() => {
      result.current.setPassword('password123')
    })
    expect(result.current.formData.password).toBe('password123')

    act(() => {
      result.current.setRemember(false)
    })
    expect(result.current.formData.remember).toBe(false)
  })

  it('validates form correctly', () => {
    const { result } = renderHook(() => useLogin())

    // Empty form should be invalid
    act(() => {
      const isValid = result.current.validateForm()
      expect(isValid).toBe(false)
    })

    expect(result.current.errors.username).toBeDefined()
    expect(result.current.errors.password).toBeDefined()

    // Fill form with valid data
    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('validpassword')
    })

    act(() => {
      const isValid = result.current.validateForm()
      expect(isValid).toBe(true)
    })

    expect(result.current.errors).toEqual({})
  })

  it('clears field errors on input', () => {
    const { result } = renderHook(() => useLogin())

    // Trigger validation to set errors
    act(() => {
      result.current.validateForm()
    })

    expect(result.current.errors.username).toBeDefined()

    // Typing should clear error
    act(() => {
      result.current.updateField('username', 'u')
    })

    expect(result.current.errors.username).toBeUndefined()
  })

  it('handles successful login', async () => {
    mockLogin.mockResolvedValue(true)

    const { result } = renderHook(() => useLogin())

    // Set valid form data
    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('password123')
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(true)
    })

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123', true)
    expect(window.location.hash).toBe('#/')
  })

  it('handles failed login', async () => {
    mockLogin.mockResolvedValue(false)

    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('wrongpassword')
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(result.current.errors.general).toBe('Credenciales inválidas')
  })

  it('handles login error', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('password123')
    })

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(result.current.errors.general).toBe('Network error')
  })

  it('prevents submission with invalid form', async () => {
    const { result } = renderHook(() => useLogin())

    await act(async () => {
      const success = await result.current.handleSubmit()
      expect(success).toBe(false)
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('computes canSubmit correctly', () => {
    const { result } = renderHook(() => useLogin())

    // Initially should not be able to submit
    expect(result.current.canSubmit).toBe(false)

    // With valid data should be able to submit
    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('password123')
    })

    expect(result.current.canSubmit).toBe(true)

    // While loading should not be able to submit
    mockAuthContext.isLoading = true
    expect(result.current.canSubmit).toBe(false)
  })

  it('handles go to register', () => {
    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.goToRegister()
    })

    expect(window.location.hash).toBe('#/registro')
  })

  it('displays auth context error', () => {
    mockAuthContext.error = 'Auth context error'

    const { result } = renderHook(() => useLogin())

    expect(result.current.displayError).toBe('Auth context error')
    expect(result.current.hasErrors).toBe(true)
  })
})