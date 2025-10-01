import { useState, useEffect, useCallback } from 'react'
import { getStorageService, StorageType } from '../../services/storage'

export function useStorage<T>(
  key: string,
  defaultValue: T,
  storageType: StorageType = 'localStorage'
) {
  const storageService = getStorageService(storageType)
  
  const [value, setValue] = useState<T>(() => {
    const storedValue = storageService.get<T>(key)
    return storedValue !== null ? storedValue : defaultValue
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(currentValue => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(currentValue)
        : newValue
        
      storageService.set(key, valueToStore)
      return valueToStore
    })
  }, [key, storageService])

  const removeValue = useCallback(() => {
    storageService.remove(key)
    setValue(defaultValue)
  }, [key, defaultValue, storageService])

  return {
    value,
    setValue: setStoredValue,
    removeValue,
  }
}