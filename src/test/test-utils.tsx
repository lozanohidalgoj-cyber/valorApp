import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '../auth/AuthContextNew'
import { StoreProvider } from '../state/StoreContextNew'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </AuthProvider>
  )
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Mock data for tests
export const mockATRRegistro = {
  id: 'test-1',
  clienteId: 'CLI-001',
  fechaISO: '2024-01-15',
  gestion: 'averia' as const,
  valorTipo: 'real' as const,
  kWh: 150.5,
  notas: 'Test registro'
}

export const mockUser = {
  username: 'testuser',
  role: 'valorador' as const
}

export const mockAuthState = {
  user: mockUser,
  token: 'test-token',
  isLoading: false,
  error: null,
  isAuthenticated: true,
  isCoordinator: false
}