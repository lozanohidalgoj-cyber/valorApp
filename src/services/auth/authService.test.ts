import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from './authService'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock crypto.subtle
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
})

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
  })

  describe('login', () => {
    it('returns null for non-existent user', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const result = await authService.login('nonexistent', 'password', true)
      expect(result).toBeNull()
    })

    it('returns null for incorrect password', async () => {
      const users = [{
        username: 'testuser',
        passwordHash: 'correcthash',
        role: 'valorador'
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = await authService.login('testuser', 'wrongpassword', true)
      expect(result).toBeNull()
    })

    it('returns user for correct credentials', async () => {
      // Mock hash function to return predictable result
      const mockHash = new Uint8Array([1, 2, 3, 4])
      vi.mocked(crypto.subtle.digest).mockResolvedValue(mockHash.buffer)
      
      const users = [{
        username: 'testuser',
        passwordHash: '01020304', // hex representation
        role: 'valorador'
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = await authService.login('testuser', 'password', true)
      expect(result).toEqual({
        username: 'testuser',
        role: 'valorador'
      })
    })

    it('migrates plain text password to hash', async () => {
      const users = [{
        username: 'testuser',
        password: 'password123', // old plain text
        role: 'valorador'
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = await authService.login('testuser', 'password123', true)
      expect(result).toEqual({
        username: 'testuser',
        role: 'valorador'
      })
      
      // Should have called setItem to save migrated user
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('creates new user successfully', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const result = await authService.register('newuser', 'password', 'valorador', true)
      expect(result).toEqual({
        username: 'newuser',
        role: 'valorador'
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('throws error for existing username', async () => {
      const users = [{
        username: 'existinguser',
        passwordHash: 'somehash',
        role: 'valorador'
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      await expect(
        authService.register('existinguser', 'password', 'valorador', true)
      ).rejects.toThrow('Usuario ya existe')
    })
  })

  describe('changePassword', () => {
    it('changes password for existing user', async () => {
      const users = [{
        username: 'testuser',
        passwordHash: 'oldhash',
        role: 'valorador'
      }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = await authService.changePassword('testuser', 'newpassword')
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('returns false for non-existent user', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const result = await authService.changePassword('nonexistent', 'newpassword')
      expect(result).toBe(false)
    })
  })

  describe('listUsers', () => {
    it('returns list of users without passwords', () => {
      const users = [
        { username: 'user1', passwordHash: 'hash1', role: 'valorador' },
        { username: 'user2', passwordHash: 'hash2', role: 'coordinador' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = authService.listUsers()
      expect(result).toEqual([
        { username: 'user1', role: 'valorador' },
        { username: 'user2', role: 'coordinador' }
      ])
    })
  })

  describe('removeUser', () => {
    it('removes existing user', async () => {
      const users = [
        { username: 'user1', passwordHash: 'hash1', role: 'valorador' },
        { username: 'user2', passwordHash: 'hash2', role: 'coordinador' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(users))
      
      const result = await authService.removeUser('user1')
      expect(result).toBe(true)
      
      // Should save updated users list
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('returns false for non-existent user', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      
      const result = await authService.removeUser('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('readPersistedAuth', () => {
    it('reads from localStorage first', () => {
      const authData = { user: { username: 'test', role: 'valorador' }, token: 'token' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))
      
      const result = authService.readPersistedAuth()
      expect(result).toEqual(authData)
    })

    it('returns null for invalid data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const result = authService.readPersistedAuth()
      expect(result).toBeNull()
    })
  })
})