export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valida que un string no esté vacío
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const trimmed = value.trim()
  return {
    isValid: trimmed.length > 0,
    errors: trimmed.length === 0 ? [`${fieldName} es requerido`] : [],
  }
}

/**
 * Valida email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return {
    isValid: emailRegex.test(email),
    errors: emailRegex.test(email) ? [] : ['Email no válido'],
  }
}

/**
 * Valida longitud mínima
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  return {
    isValid: value.length >= minLength,
    errors: value.length >= minLength ? [] : [`${fieldName} debe tener al menos ${minLength} caracteres`],
  }
}

/**
 * Valida que un número sea positivo
 */
export const validatePositiveNumber = (value: number, fieldName: string): ValidationResult => {
  return {
    isValid: value > 0,
    errors: value > 0 ? [] : [`${fieldName} debe ser mayor a 0`],
  }
}

/**
 * Combina múltiples validaciones
 */
export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors)
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}