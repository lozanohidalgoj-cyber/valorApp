import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../../../test/test-utils'
import { Button } from './Button'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('button', 'variant-primary', 'size-md')
  })

  it('renders different variants correctly', () => {
    const { rerender } = renderWithProviders(<Button variant="secondary">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('variant-secondary')

    rerender(<Button variant="success">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('variant-success')

    rerender(<Button variant="danger">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('variant-danger')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithProviders(<Button size="sm">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('size-sm')

    rerender(<Button size="lg">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('size-lg')
  })

  it('shows loading state', () => {
    renderWithProviders(<Button loading>Submit</Button>)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('respects disabled prop', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    renderWithProviders(<Button onClick={handleClick} disabled>Click me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    renderWithProviders(<Button className="custom-class">Test</Button>)
    
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards button props correctly', () => {
    renderWithProviders(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('submit-btn')
    expect(button).toHaveAttribute('type', 'submit')
  })
})