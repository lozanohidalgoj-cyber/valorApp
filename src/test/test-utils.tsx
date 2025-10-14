import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { StoreProvider } from '../state/StoreContext'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  )
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options })

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