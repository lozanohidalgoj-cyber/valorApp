import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Role = 'valorador' | 'coordinador'
type AuthUser = { username: string; role: Role }

type AuthState = {
  user: AuthUser | null
  token: string | null
}

type AuthContextType = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string, remember: boolean) => Promise<boolean>
  register: (username: string, password: string, role: Role, remember: boolean) => Promise<boolean>
  changePassword: (targetUsername: string, newPassword: string) => Promise<boolean>
  listUsers: () => Array<{ username: string; role: Role }>
  setUserRole: (targetUsername: string, role: Role) => Promise<boolean>
  removeUser: (targetUsername: string) => Promise<boolean>
  adminCreateUser: (username: string, password: string, role: Role) => Promise<boolean>
  logout: () => void
}

const AUTH_KEY = 'valorApp.auth'
const USERS_KEY = 'valorApp.users'

type StoredUser = { username: string; password: string; role: Role }
// Back-compat: permitir leer usuarios antiguos con 'password' en texto plano;
// el sistema ahora usa 'passwordHash' y migra al iniciar sesión o al cambiar.
type StoredUserAny = { username: string; role: Role; password?: string; passwordHash?: string }

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function readUsers(): StoredUserAny[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Partial<StoredUserAny>>
    // Compat: usuarios antiguos sin rol -> asignar 'valorador'
    return parsed.map(u => ({
      username: String(u.username || ''),
      password: u.password ? String(u.password) : undefined,
      passwordHash: u.passwordHash ? String(u.passwordHash) : undefined,
      role: (u.role as Role) || 'valorador',
    }))
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
        // Verificar hash si existe; si no, verificar texto plano y migrar a hash.
        if (found.passwordHash) {
          const inputHash = await sha256Hex(password)
          if (found.passwordHash !== inputHash) return false
        } else if (found.password) {
          if (found.password !== password) return false
          // Migrar a hash
          const newHash = await sha256Hex(password)
          const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase())
          if (idx !== -1) {
            users[idx] = { username: found.username, role: found.role, passwordHash: newHash }
            writeUsers(users as any)
          }
        } else {
          // Usuario sin credenciales válidas
          return false
        }
        const token = 'demo-token'
        const next: AuthState = { user: { username: found.username, role: found.role }, token }
        setState(next)
        persistAuth(next, remember)
        return true
      }
      // Si no existe usuario registrado, permitimos login demo (modo demo) como 'valorador'
      const token = 'demo-token'
      const next: AuthState = { user: { username, role: 'valorador' }, token }
      setState(next)
      persistAuth(next, remember)
      return true
    },
    async register(username: string, password: string, role: Role, remember: boolean) {
      if (!username || !password) return false
      const users = readUsers()
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase())
      if (exists) return false
      const passwordHash = await sha256Hex(password)
      const nextUsers = [...users, { username, passwordHash, role }]
      writeUsers(nextUsers as any)
      // Auto-login tras registro
      const token = 'demo-token'
      const next: AuthState = { user: { username, role }, token }
      setState(next)
      persistAuth(next, remember)
      return true
    },
    async changePassword(targetUsername: string, newPassword: string) {
      const current = state?.user
      if (!current) return false
      if (current.role !== 'coordinador') return false
      const users = readUsers()
      const idx = users.findIndex(u => u.username.toLowerCase() === targetUsername.toLowerCase())
      if (idx === -1) return false
      const passwordHash = await sha256Hex(newPassword)
      users[idx] = { username: users[idx].username, role: users[idx].role, passwordHash }
      writeUsers(users as any)
      return true
    },
    listUsers() {
      return readUsers().map(u => ({ username: u.username, role: u.role }))
    },
    async setUserRole(targetUsername: string, role: Role) {
      const current = state?.user
      if (!current) return false
      if (current.role !== 'coordinador') return false
      const users = readUsers()
      const idx = users.findIndex(u => u.username.toLowerCase() === targetUsername.toLowerCase())
      if (idx === -1) return false
      const currentUser = users[idx]
      users[idx] = { username: currentUser.username, role, passwordHash: currentUser.passwordHash }
      writeUsers(users as any)
      // Si cambia el propio rol, reflejar en estado
      if (current.username.toLowerCase() === targetUsername.toLowerCase()) {
        const next: AuthState = { user: { username: current.username, role }, token: state!.token }
        setState(next)
        // Mantener persistencia en el mismo store (remember desconocido aquí): leer dónde está persistido
        const persisted = readPersistedAuth()
        persistAuth(next, !!persisted && !!localStorage.getItem('valorApp.auth'))
      }
      return true
    },
    async removeUser(targetUsername: string) {
      const current = state?.user
      if (!current) return false
      if (current.role !== 'coordinador') return false
      if (current.username.toLowerCase() === targetUsername.toLowerCase()) {
        // Por seguridad, impedir eliminarse a sí mismo
        return false
      }
      const users = readUsers()
      const filtered = users.filter(u => u.username.toLowerCase() !== targetUsername.toLowerCase())
      if (filtered.length === users.length) return false
      writeUsers(filtered as any)
      return true
    },
    async adminCreateUser(username: string, password: string, role: Role) {
      const current = state?.user
      if (!current) return false
      if (current.role !== 'coordinador') return false
      if (!username || !password) return false
      const users = readUsers()
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase())
      if (exists) return false
      const passwordHash = await sha256Hex(password)
      users.push({ username, passwordHash, role })
      writeUsers(users as any)
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
