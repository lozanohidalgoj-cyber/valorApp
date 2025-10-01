export type StorageType = 'localStorage' | 'sessionStorage'

export interface StorageService {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
}

class BrowserStorageService implements StorageService {
  constructor(private storage: Storage) {}

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Failed to save to ${this.storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, error)
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove from storage:`, error)
    }
  }

  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.warn(`Failed to clear storage:`, error)
    }
  }
}

export const localStorageService = new BrowserStorageService(localStorage)
export const sessionStorageService = new BrowserStorageService(sessionStorage)

export const getStorageService = (type: StorageType): StorageService => {
  return type === 'localStorage' ? localStorageService : sessionStorageService
}