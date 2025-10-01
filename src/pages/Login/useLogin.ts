import { useState, useCallback } from 'react'
import { useAuth } from '../../auth/AuthContextNew'
import { ROUTES, UI_TEXT } from '../../constants'
import { validateRequired, validateMinLength, combineValidations } from '../../utils/validation'

interface LoginFormData {
  username: string
  password: string
  remember: boolean
}

interface LoginErrors {
  username?: string
  password?: string
  general?: string
}

export function useLogin() {
  const { login, isLoading, error: authError } = useAuth()

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    remember: true,
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form field
  const updateField = useCallback(<K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (field === 'username' && errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }))
    } else if (field === 'password' && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }, [errors])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const usernameValidation = combineValidations(
      validateRequired(formData.username, 'Usuario'),
      validateMinLength(formData.username, 2, 'Usuario')
    )

    const passwordValidation = combineValidations(
      validateRequired(formData.password, 'Contraseña'),
      validateMinLength(formData.password, 3, 'Contraseña')
    )

    const newErrors: LoginErrors = {}

    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.errors[0]
    }

    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    if (isSubmitting || isLoading) return false

    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form first
      if (!validateForm()) {
        return false
      }

      // Attempt login
      const success = await login(
        formData.username.trim(),
        formData.password,
        formData.remember
      )

      if (success) {
        // Redirect to home page
        window.location.hash = ROUTES.HOME
        return true
      } else {
        setErrors({ general: UI_TEXT.LOGIN.INVALID_CREDENTIALS })
        return false
      }
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error de conexión' 
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, isLoading, validateForm, login])

  // Navigate to register
  const goToRegister = useCallback(() => {
    window.location.hash = ROUTES.REGISTER
  }, [])

  // Computed properties
  const canSubmit = formData.username.trim() && formData.password && !isSubmitting && !isLoading
  const hasErrors = Object.keys(errors).length > 0 || !!authError
  const displayError = errors.general || authError

  return {
    // Form data
    formData,
    
    // State
    errors,
    isSubmitting,
    isLoading,
    canSubmit,
    hasErrors,
    displayError,
    
    // Actions
    updateField,
    handleSubmit,
    goToRegister,
    validateForm,
    
    // Convenience setters
    setUsername: (value: string) => updateField('username', value),
    setPassword: (value: string) => updateField('password', value),
    setRemember: (value: boolean) => updateField('remember', value),
  }
}