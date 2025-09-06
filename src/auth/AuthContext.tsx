import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthUser = { username: string }

type AuthState = {
  user: AuthUser | null
  token: string | null
}

type AuthContextType = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string, remember: boolean) => Promise<boolean>
  register: (username: string, password: string, remember: boolean) => Promise<boolean>
  logout: () => void
}

const AUTH_KEY = 'valorApp.auth'
const USERS_KEY = 'valorApp.users'

type StoredUser = { username: string; password: string }

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

function readPersistedAuth(): AuthState | null {
  try {
    const rawLocal = localStorage.getItem(AUTH_KEY)
    if (rawLocal) return JSON.parse(rawLocal) as AuthState
  } catch {}
  try {
    const rawSession = sessionStorage.getItem(AUTH_KEY)
    if (rawSession) return JSON.parse(rawSession) as AuthState
  } catch {}
  return null
}

function persistAuth(state: AuthState | null, remember: boolean) {
  try {
    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_KEY)
    if (state) {
      const raw = JSON.stringify(state)
      if (remember) localStorage.setItem(AUTH_KEY, raw)
      else sessionStorage.setItem(AUTH_KEY, raw)
    }
  } catch {}
}

const AuthCtx = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => readPersistedAuth())

  useEffect(() => {
    // Si cambian pestañas, podríamos sincronizar, pero para simplicidad omitimos storage events
  }, [])

  const ctx = useMemo<AuthContextType>(() => ({
    user: state?.user ?? null,
    isAuthenticated: !!state?.token,
    async login(username: string, password: string, remember: boolean) {
      if (!username || !password) return false
      const users = readUsers()
      const found = users.find(u => u.username.toLowerCase() === username.toLowerCase())
      if (found) {
        if (found.password !== password) return false
      }
      // Si no existe usuario registrado, permitimos login demo (modo demo)
      const token = 'demo-token'
      const next: AuthState = { user: { username }, token }
      setState(next)
      persistAuth(next, remember)
      return true
    },
    async register(username: string, password: string, remember: boolean) {
      if (!username || !password) return false
      const users = readUsers()
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase())
      if (exists) return false
      const nextUsers = [...users, { username, password }]
      writeUsers(nextUsers)
      // Auto-login tras registro
      const token = 'demo-token'
      const next: AuthState = { user: { username }, token }
      setState(next)
      persistAuth(next, remember)
      return true
    },
    logout() {
      setState(null)
      persistAuth(null, false)
    },
  }), [state])

  return <AuthCtx.Provider value={ctx}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
