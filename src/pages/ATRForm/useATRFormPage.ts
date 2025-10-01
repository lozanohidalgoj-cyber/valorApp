import { useCallback } from 'react'
import { useATRForm } from '../../hooks/business'
import { ROUTES } from '../../constants'

export function useATRFormPage() {
  const navigateHome = useCallback(() => {
    window.location.hash = ROUTES.HOME
  }, [])

  const navigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const formHook = useATRForm({
    onSuccess: navigateHome,
    onError: (errors) => {
      console.warn('Form validation errors:', errors)
    }
  })

  return {
    ...formHook,
    navigateHome,
    navigateBack,
  }
}