import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../../../test/test-utils'
import { Input } from './Input'
import userEvent from '@testing-library/user-event'

describe('Input', () => {
  it('renders correctly with label', () => {
    renderWithProviders(<Input label="Email" />)
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('displays error message', () => {
    renderWithProviders(
      <Input label="Email" error="Email is required" />
    )
    
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('error')
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('displays helper text when no error', () => {
    renderWithProviders(
      <Input label="Email" helperText="Enter your email address" />
    )
    
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('prioritizes error over helper text', () => {
    renderWithProviders(
      <Input 
        label="Email" 
        error="Email is required" 
        helperText="Enter your email address"
      />
    )
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument()
  })

  it('handles input changes', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    renderWithProviders(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Email')
    await user.type(input, 'test@example.com')
    
    expect(handleChange).toHaveBeenCalledTimes(17) // One call per character
  })

  it('applies placeholder correctly', () => {
    renderWithProviders(
      <Input label="Email" placeholder="Enter your email" />
    )
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('forwards input props correctly', () => {
    renderWithProviders(
      <Input 
        label="Password" 
        type="password" 
        required 
        data-testid="password-input"
      />
    )
    
    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('required')
  })

  it('applies custom className', () => {
    renderWithProviders(
      <Input label="Email" className="custom-input" />
    )
    
    expect(screen.getByLabelText('Email')).toHaveClass('custom-input')
  })
})