import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { ATRRegistro } from '../types/atr'
import { atrService } from '../services/atr'

// Action types
type StoreAction =
  | { type: 'INIT_REGISTROS'; payload: ATRRegistro[] }
  | { type: 'ADD_REGISTRO'; payload: ATRRegistro }
  | { type: 'REMOVE_REGISTRO'; payload: string }
  | { type: 'CLEAR_REGISTROS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Enhanced state
interface StoreState {
  registros: ATRRegistro[]
  isLoading: boolean
  error: string | null
}

// Context type
interface StoreContextType extends StoreState {
  add: (registro: ATRRegistro) => void
  remove: (id: string) => void
  clear: () => void
  searchRegistros: (query: string, gestionFilter?: string, valorTipoFilter?: string) => ATRRegistro[]
  getTotalKWh: () => number
  validateRegistro: (registro: Partial<ATRRegistro>) => string[]
  generateId: () => string
}

// Initial state
const initialState: StoreState = {
  registros: [],
  isLoading: false,
  error: null,
}

// Reducer with middleware-like logging
const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.group(`Store Action: ${action.type}`)
    console.log('Previous State:', state)
    console.log('Action:', action)
  }

  let newState: StoreState

  switch (action.type) {
    case 'INIT_REGISTROS':
      newState = {
        ...state,
        registros: action.payload,
        isLoading: false,
        error: null,
      }
      break


    case 'ADD_REGISTRO':
      newState = {
        ...state,
        registros: atrService.addRegistro(action.payload),
        error: null,
      }
      break

    case 'REMOVE_REGISTRO':
      newState = {
        ...state,
        registros: atrService.removeRegistro(action.payload),
        error: null,
      }
      break

    case 'CLEAR_REGISTROS':
      newState = {
        ...state,
        registros: atrService.clearRegistros(),
        error: null,
      }
      break


    case 'SET_LOADING':
      newState = {
        ...state,
        isLoading: action.payload,
      }
      break

    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        isLoading: false,
      }
      break

    default:
      newState = state
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('New State:', newState)
    console.groupEnd()
  }

  return newState
}

// Create context
const StoreContext = createContext<StoreContextType | null>(null)

// Provider component
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState)

  // Initialize data from storage
  useEffect(() => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
  const registros = atrService.loadRegistros()
  dispatch({ type: 'INIT_REGISTROS', payload: registros })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error cargando datos' 
      })
    }
  }, [])

  // Actions
  const add = (registro: ATRRegistro): void => {
    try {
      const validationErrors = atrService.validateRegistro(registro)
      if (validationErrors.length > 0) {
        dispatch({ type: 'SET_ERROR', payload: validationErrors.join(', ') })
        return
      }
      
      dispatch({ type: 'ADD_REGISTRO', payload: registro })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error agregando registro' 
      })
    }
  }

  const remove = (id: string): void => {
    try {
      dispatch({ type: 'REMOVE_REGISTRO', payload: id })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error eliminando registro' 
      })
    }
  }

  const clear = (): void => {
    try {
      dispatch({ type: 'CLEAR_REGISTROS' })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error limpiando registros' 
      })
    }
  }


  // Helper methods (memoized to avoid re-creation)
  const searchRegistros = useMemo(() => 
    (query: string, gestionFilter?: string, valorTipoFilter?: string): ATRRegistro[] => {
      return atrService.searchRegistros(state.registros, query, gestionFilter, valorTipoFilter)
    }, [state.registros]
  )

  const getTotalKWh = useMemo(() => 
    (): number => atrService.calculateTotalKWh(state.registros), 
    [state.registros]
  )

  const validateRegistro = useMemo(() => 
    (registro: Partial<ATRRegistro>): string[] => atrService.validateRegistro(registro),
    []
  )

  const generateId = useMemo(() => 
    (): string => atrService.generateId(),
    []
  )

  // Context value
  const contextValue = useMemo<StoreContextType>(() => ({
    // State
    registros: state.registros,
    
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    add,
    remove,
    clear,
    
    // Helper methods
    searchRegistros,
    getTotalKWh,
    validateRegistro,
    generateId,
  }), [state, searchRegistros, getTotalKWh, validateRegistro, generateId])

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  )
}

// Hook to use store context
export function useStore(): StoreContextType {
  const context = useContext(StoreContext)
  
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider')
  }
  
  return context
}