import { STORAGE_KEYS } from '../../constants'
import { getStorageService, StorageType } from '../storage'

export type Role = 'valorador' | 'coordinador'

export interface AuthUser {
  username: string
  role: Role
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
}

interface StoredUser {
  username: string
  passwordHash: string
  role: Role
}

// Compatibility type for migration
interface StoredUserAny {
  username: string
  role: Role
  password?: string
  passwordHash?: string
}

/**
 * Generate SHA-256 hash from input string
 */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Auth Service for handling authentication operations
 */
export class AuthService {
  private storageService = getStorageService('localStorage')

  /**
   * Read users from storage with backward compatibility
   */
  private readUsers(): StoredUserAny[] {
    try {
      const users = this.storageService.get<StoredUserAny[]>(STORAGE_KEYS.USERS)
      return users ?? []
    } catch {
      return []
    }
  }

  /**
   * Write users to storage
   */
  private writeUsers(users: StoredUser[]): void {
    this.storageService.set(STORAGE_KEYS.USERS, users)
  }

  /**
   * Read persisted auth state
   */
  readPersistedAuth(): AuthState | null {
    try {
      // Try localStorage first
      let auth = this.storageService.get<AuthState>(STORAGE_KEYS.AUTH)
      
      // Fallback to sessionStorage
      if (!auth) {
        const sessionStorage = getStorageService('sessionStorage')
        auth = sessionStorage.get<AuthState>(STORAGE_KEYS.AUTH)
      }
      
      return auth
    } catch {
      return null
    }
  }

  /**
   * Persist auth state to storage
   */
  persistAuth(state: AuthState | null, remember: boolean): void {
    const storageType: StorageType = remember ? 'localStorage' : 'sessionStorage'
    const service = getStorageService(storageType)
    
    if (state) {
      service.set(STORAGE_KEYS.AUTH, state)
    } else {
      // Clear from both storages on logout
      this.storageService.remove(STORAGE_KEYS.AUTH)
      getStorageService('sessionStorage').remove(STORAGE_KEYS.AUTH)
    }
  }

  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string, remember: boolean): Promise<AuthUser | null> {
    const users = this.readUsers()
    let user = users.find(u => u.username === username)
    
    if (!user) return null

    let isValidPassword = false
    
    // Handle password migration from plain text to hash
    if (user.passwordHash) {
      const hash = await sha256Hex(password)
      isValidPassword = user.passwordHash === hash
    } else if (user.password) {
      // Migrate old plain text password
      isValidPassword = user.password === password
      if (isValidPassword) {
        await this.migrateUserPassword(username, password)
      }
    }

    if (isValidPassword) {
      const authUser: AuthUser = { username: user.username, role: user.role }
      const authState: AuthState = { user: authUser, token: 'demo-token' }
      this.persistAuth(authState, remember)
      return authUser
    }

    return null
  }

  /**
   * Register new user
   */
  async register(username: string, password: string, role: Role, remember: boolean): Promise<AuthUser | null> {
    const users = this.readUsers()
    
    if (users.find(u => u.username === username)) {
      throw new Error('Usuario ya existe')
    }

    const passwordHash = await sha256Hex(password)
    const newUser: StoredUser = { username, passwordHash, role }
    
    const validUsers = users.filter(u => u.passwordHash || u.password).map(u => ({
      username: u.username,
      role: u.role,
      passwordHash: u.passwordHash || u.password!
    })) as StoredUser[]
    
    this.writeUsers([...validUsers, newUser])
    
    const authUser: AuthUser = { username, role }
    const authState: AuthState = { user: authUser, token: 'demo-token' }
    this.persistAuth(authState, remember)
    
    return authUser
  }

  /**
   * Migrate user password from plain text to hash
   */
  private async migrateUserPassword(username: string, password: string): Promise<void> {
    const users = this.readUsers()
    const userIndex = users.findIndex(u => u.username === username)
    
    if (userIndex === -1) return

    const passwordHash = await sha256Hex(password)
    const updatedUsers = users.map((u, i) => 
      i === userIndex 
        ? { username: u.username, role: u.role, passwordHash }
        : u
    ).filter(u => u.passwordHash) as StoredUser[]
    
    this.writeUsers(updatedUsers)
  }

  /**
   * Change user password
   */
  async changePassword(targetUsername: string, newPassword: string): Promise<boolean> {
    const users = this.readUsers()
    const userIndex = users.findIndex(u => u.username === targetUsername)
    
    if (userIndex === -1) return false

    const passwordHash = await sha256Hex(newPassword)
    const updatedUsers = [...users]
    updatedUsers[userIndex] = { 
      ...updatedUsers[userIndex], 
      passwordHash 
    } as StoredUser
    
    this.writeUsers(updatedUsers.filter(u => u.passwordHash) as StoredUser[])
    return true
  }

  /**
   * List all users
   */
  listUsers(): Array<{ username: string; role: Role }> {
    return this.readUsers().map(u => ({ username: u.username, role: u.role }))
  }

  /**
   * Set user role
   */
  async setUserRole(targetUsername: string, role: Role): Promise<boolean> {
    const users = this.readUsers()
    const userIndex = users.findIndex(u => u.username === targetUsername)
    
    if (userIndex === -1) return false

    const updatedUsers = [...users]
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], role }
    
    this.writeUsers(updatedUsers.filter(u => u.passwordHash) as StoredUser[])
    return true
  }

  /**
   * Remove user
   */
  async removeUser(targetUsername: string): Promise<boolean> {
    const users = this.readUsers()
    const filteredUsers = users.filter(u => u.username !== targetUsername)
    
    if (filteredUsers.length === users.length) return false

    this.writeUsers(filteredUsers.filter(u => u.passwordHash) as StoredUser[])
    return true
  }

  /**
   * Create user (admin function)
   */
  async adminCreateUser(username: string, password: string, role: Role): Promise<boolean> {
    const users = this.readUsers()
    
    if (users.find(u => u.username === username)) return false

    const passwordHash = await sha256Hex(password)
    const newUser: StoredUser = { username, passwordHash, role }
    
    const validUsers = users.filter(u => u.passwordHash).map(u => ({
      username: u.username,
      role: u.role,
      passwordHash: u.passwordHash!
    })) as StoredUser[]
    
    this.writeUsers([...validUsers, newUser])
    return true
  }

  /**
   * Initialize default users if none exist
   */
  async initializeDefaultUsers(): Promise<void> {
    const users = this.readUsers()
    
    if (users.length === 0) {
      // Create default admin user
      await this.register('admin', 'admin123', 'coordinador', false)
      
      // Create default valorador user  
      await this.register('valorador', 'valorador123', 'valorador', false)
      
      console.log('✅ Usuarios por defecto creados:')
      console.log('👤 admin / admin123 (coordinador)')
      console.log('👤 valorador / valorador123 (valorador)')
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.persistAuth(null, false)
  }
}

// Export singleton instance
export const authService = new AuthService()