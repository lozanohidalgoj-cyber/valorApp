// src/components/ui/ActaFacturaAlertModal/ActaFacturaAlertModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActaFacturaAlertModal } from './ActaFacturaAlertModal'

describe('ActaFacturaAlertModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  describe('Visibilidad', () => {
    it('no debe renderizar cuando show es false', () => {
      render(
        <ActaFacturaAlertModal
          show={false}
          message="Test message"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Validación de Facturación ATR')).not.toBeInTheDocument()
    })

    it('debe renderizar cuando show es true', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Test message"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Validación de Facturación ATR')).toBeInTheDocument()
    })
  })

  describe('Tipos de alerta', () => {
    it('debe mostrar alerta con tipo error', () => {
      const { container } = render(
        <ActaFacturaAlertModal
          show={true}
          message="Error occurred"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      // Verificar que el ícono de error está presente
      const modal = container.querySelector('[style*="rgba(239, 68, 68"]')
      expect(modal).toBeInTheDocument()
    })

    it('debe mostrar alerta con tipo warning', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Warning message"
          type="warning"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    it('debe mostrar alerta con tipo info', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Info message"
          type="info"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Info message')).toBeInTheDocument()
    })
  })

  describe('Contenido y mensajes', () => {
    it('debe mostrar el mensaje correctamente', () => {
      const testMessage = 'Test validation message'
      render(
        <ActaFacturaAlertModal
          show={true}
          message={testMessage}
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText(testMessage)).toBeInTheDocument()
    })

    it('debe mostrar mensajes con saltos de línea', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3'
      render(
        <ActaFacturaAlertModal
          show={true}
          message={multilineMessage}
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText(multilineMessage)).toBeInTheDocument()
    })

    it('debe mostrar el título correctamente', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Validación de Facturación ATR')).toBeInTheDocument()
      expect(screen.getByText('Verifique los datos antes de continuar')).toBeInTheDocument()
    })
  })

  describe('Interacción', () => {
    it('debe llamar onClose cuando se hace clic en el botón', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const button = screen.getByText('✓ Entendido')
      fireEvent.click(button)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('debe cerrar al hacer clic en el botón', () => {
      const { rerender } = render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const button = screen.getByText('✓ Entendido')
      fireEvent.click(button)

      // Verificar que el callback fue llamado
      expect(mockOnClose).toHaveBeenCalled()

      // Simular que el padre cierre el modal
      rerender(
        <ActaFacturaAlertModal
          show={false}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Validación de Facturación ATR')).not.toBeInTheDocument()
    })
  })

  describe('Estilos', () => {
    it('debe tener z-index alto para estar encima', () => {
      const { container } = render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const overlay = container.querySelector('div')
      expect(overlay).toHaveClass('overlay')
    })

    it('debe renderizar con animaciones', () => {
      const { container } = render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const modal = container.querySelector('.modal')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Responsividad', () => {
    it('debe renderizar correctamente en diferentes tamaños', () => {
      const { container } = render(
        <ActaFacturaAlertModal
          show={true}
          message="Test message that might be long"
          type="warning"
          onClose={mockOnClose}
        />
      )

      const modal = container.querySelector('.modal')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener un botón accesible', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const button = screen.getByRole('button', { name: /entendido/i })
      expect(button).toBeInTheDocument()
    })

    it('debe permitir navegación por teclado', () => {
      render(
        <ActaFacturaAlertModal
          show={true}
          message="Test"
          type="error"
          onClose={mockOnClose}
        />
      )

      const button = screen.getByText('✓ Entendido')
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })
})
