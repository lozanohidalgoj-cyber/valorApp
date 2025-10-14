import { describe, it, expect } from 'vitest'
import { renderWithProviders } from './test-utils'
import App from '../App'

// Smoke test básico para verificar entorno de pruebas

describe('Smoke: App render', () => {
  it('renderiza el título ValorApp', () => {
    const { getByText } = renderWithProviders(<App />)
    expect(getByText(/ValorApp/i)).toBeTruthy()
  })
})
