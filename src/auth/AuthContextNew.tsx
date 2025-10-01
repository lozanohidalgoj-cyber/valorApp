import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { AuthUser, AuthState, Role, authService } from '../services/auth'

// Action types
type AuthAction =
  | { type: 'INIT'; payload: AuthState | null }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; remember: boolean } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: AuthUser; remember: boolean } }
  | { type: 'REGISTER_ERROR'; payload: string }

// Enhanced state with loading and error
interface AuthContextState extends AuthState {
  isLoading: boolean
  error: string | null
}

// Context type
interface AuthContextType extends AuthContextState {
  // Actions
  login: (username: string, password: string, remember: boolean) => Promise<boolean>
  register: (username: string, password: string, role: Role, remember: boolean) => Promise<boolean>
  logout: () => void
  
  // Admin actions
  changePassword: (targetUsername: string, newPassword: string) => Promise<boolean>
  listUsers: () => Array<{ username: string; role: Role }>
  setUserRole: (targetUsername: string, role: Role) => Promise<boolean>
  removeUser: (targetUsername: string) => Promise<boolean>
  adminCreateUser: (username: string, password: string, role: Role) => Promise<boolean>
  
  // Computed properties
  isAuthenticated: boolean
  isCoordinator: boolean
}

// Initial state
const initialState: AuthContextState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

// Reducer
const authReducer = (state: AuthContextState, action: AuthAction): AuthContextState => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        user: action.payload?.user ?? null,
        token: action.payload?.token ?? null,
        isLoading: false,
        error: null,
      }
      
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
      
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: 'demo-token',
        isLoading: false,
        error: null,
      }
      
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      }
      
    case 'LOGOUT':
      return {
        ...initialState,
      }
      
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from storage and default users
  useEffect(() => {
    const initializeAuth = async () => {
      // Initialize default users if needed
      await authService.initializeDefaultUsers()
      
      // Load persisted auth state
      const persistedAuth = authService.readPersistedAuth()
      dispatch({ type: 'INIT', payload: persistedAuth })
    }
    
    initializeAuth()
  }, [])

  // Actions
  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const user = await authService.login(username, password, remember)
      
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, remember } })
        return true
      } else {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Credenciales no válidas' })
        return false
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: error instanceof Error ? error.message : 'Error de autenticación' 
      })
      return false
    }
  }

  const register = async (
    username: string, 
    password: string, 
    role: Role, 
    remember: boolean
  ): Promise<boolean> => {
    dispatch({ type: 'REGISTER_START' })
    
    try {
      const user = await authService.register(username, password, role, remember)
      
      if (user) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user, remember } })
        return true
      } else {
        dispatch({ type: 'REGISTER_ERROR', payload: 'Error al crear usuario' })
        return false
      }
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al registrar usuario' 
      })
      return false
    }
  }

  const logout = (): void => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  // Admin actions (wrapped with error handling)
  const changePassword = async (targetUsername: string, newPassword: string): Promise<boolean> => {
    try {
      return await authService.changePassword(targetUsername, newPassword)
    } catch {
      return false
    }
  }

  const listUsers = (): Array<{ username: string; role: Role }> => {
    return authService.listUsers()
  }

  const setUserRole = async (targetUsername: string, role: Role): Promise<boolean> => {
    try {
      return await authService.setUserRole(targetUsername, role)
    } catch {
      return false
    }
  }

  const removeUser = async (targetUsername: string): Promise<boolean> => {
    try {
      return await authService.removeUser(targetUsername)
    } catch {
      return false
    }
  }

  const adminCreateUser = async (
    username: string, 
    password: string, 
    role: Role
  ): Promise<boolean> => {
    try {
      return await authService.adminCreateUser(username, password, role)
    } catch {
      return false
    }
  }

  // Context value with computed properties
  const contextValue = useMemo<AuthContextType>(() => ({
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    
    // Computed properties
    isAuthenticated: !!state.token && !!state.user,
    isCoordinator: state.user?.role === 'coordinador',
    
    // Actions
    login,
    register,
    logout,
    changePassword,
    listUsers,
    setUserRole,
    removeUser,
    adminCreateUser,
  }), [state])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  
  return context
}