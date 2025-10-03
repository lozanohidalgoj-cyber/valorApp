import { describe, it, expect } from 'vitest'
import { renderWithProviders } from './test-utils'
import Login from '../pages/Login'

// Smoke test básico para verificar entorno de pruebas

describe('Smoke: Login render', () => {
  it('renderiza el título ValorApp', () => {
    const { getByText } = renderWithProviders(<Login />)
    expect(getByText(/ValorApp/i)).toBeTruthy()
  })
})
