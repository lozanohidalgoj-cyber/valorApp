import { useState, useCallback } from 'react'
import { GestionTipo, ValorTipo, FraudeTipo } from '../../types/atr'
import { useATRData } from './useATRData'

export interface ATRFormData {
  clienteId: string
  fechaISO: string
  gestion: GestionTipo
  fraudeTipo?: FraudeTipo
  valorTipo: ValorTipo
  kWh: number
  notas?: string
}

interface UseATRFormOptions {
  initialData?: Partial<ATRFormData>
  onSuccess?: () => void
  onError?: (errors: string[]) => void
}

export function useATRForm(options: UseATRFormOptions = {}) {
  const { initialData = {}, onSuccess, onError } = options
  const { addRegistro, validateRegistro } = useATRData()

  const [formData, setFormData] = useState<ATRFormData>({
    clienteId: '',
    fechaISO: new Date().toISOString().slice(0, 10),
    gestion: 'averia',
    valorTipo: 'estimado',
    kWh: 0,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Update form field
  const updateField = useCallback(<K extends keyof ATRFormData>(
    field: K,
    value: ATRFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const validationErrors = validateRegistro(formData)
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach(error => {
        if (error.includes('cliente')) errorMap.clienteId = error
        else if (error.includes('fecha')) errorMap.fechaISO = error
        else if (error.includes('gestión')) errorMap.gestion = error
        else if (error.includes('fraude')) errorMap.fraudeTipo = error
        else if (error.includes('valor')) errorMap.valorTipo = error
        else if (error.includes('kWh')) errorMap.kWh = error
        else errorMap.general = error
      })
      
      setErrors(errorMap)
      onError?.(validationErrors)
      return false
    }
    
    setErrors({})
    return true
  }, [formData, validateRegistro, onError])

  // Submit form
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      if (!validateForm()) {
        return false
      }

      const success = addRegistro(formData)
      
      if (success) {
        onSuccess?.()
        
        // Reset form on success
        setFormData({
          clienteId: '',
          fechaISO: new Date().toISOString().slice(0, 10),
          gestion: 'averia',
          valorTipo: 'estimado',
          kWh: 0,
        })
        setIsDirty(false)
        return true
      } else {
        setErrors({ general: 'Error al guardar el registro' })
        return false
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, validateForm, addRegistro, onSuccess])

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      clienteId: '',
      fechaISO: new Date().toISOString().slice(0, 10),
      gestion: 'averia',
      valorTipo: 'estimado',
      kWh: 0,
      ...initialData,
    })
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  // Computed properties
  const isValid = Object.keys(errors).length === 0
  const canSubmit = isValid && !isSubmitting && isDirty
  const shouldShowFraudeTipo = formData.gestion === 'fraude'

  return {
    // Form data
    formData,
    
    // State
    errors,
    isSubmitting,
    isDirty,
    isValid,
    canSubmit,
    shouldShowFraudeTipo,
    
    // Actions
    updateField,
    handleSubmit,
    resetForm,
    validateForm,
  }
}