import { ATRRegistro } from '../../types/atr'
import { STORAGE_KEYS } from '../../constants'
import { localStorageService } from '../storage'

/**
 * Service for managing ATR data operations
 */
export class ATRService {
  private storageService = localStorageService

  /**
   * Load all ATR registros from storage
   */
  loadRegistros(): ATRRegistro[] {
    try {
      const registros = this.storageService.get<ATRRegistro[]>(STORAGE_KEYS.REGISTROS)
      return registros ?? []
    } catch {
      return []
    }
  }

  /**
   * Save registros to storage
   */
  saveRegistros(registros: ATRRegistro[]): void {
    this.storageService.set(STORAGE_KEYS.REGISTROS, registros)
  }

  /**
   * Add new registro
   */
  addRegistro(registro: ATRRegistro): ATRRegistro[] {
    const currentRegistros = this.loadRegistros()
    const newRegistros = [...currentRegistros, registro]
    this.saveRegistros(newRegistros)
    return newRegistros
  }

  /**
   * Remove registro by ID
   */
  removeRegistro(id: string): ATRRegistro[] {
    const currentRegistros = this.loadRegistros()
    const filteredRegistros = currentRegistros.filter(r => r.id !== id)
    this.saveRegistros(filteredRegistros)
    return filteredRegistros
  }

  /**
   * Clear all registros
   */
  clearRegistros(): ATRRegistro[] {
    this.saveRegistros([])
    return []
  }

  /**
   * Generate unique ID for new registro
   */
  generateId(): string {
    if (crypto?.randomUUID) {
      return crypto.randomUUID()
    }
    return `id-${Math.random().toString(36).slice(2, 10)}`
  }

  /**
   * Validate registro data
   */
  validateRegistro(registro: Partial<ATRRegistro>): string[] {
    const errors: string[] = []

    if (!registro.clienteId?.trim()) {
      errors.push('ID del cliente es requerido')
    }

    if (!registro.fechaISO) {
      errors.push('Fecha es requerida')
    }

    if (!registro.gestion) {
      errors.push('Tipo de gestión es requerido')
    }

    if (registro.gestion === 'fraude' && !registro.fraudeTipo) {
      errors.push('Tipo de fraude es requerido cuando la gestión es fraude')
    }

    if (!registro.valorTipo) {
      errors.push('Tipo de valor es requerido')
    }

    if (typeof registro.kWh !== 'number' || registro.kWh < 0) {
      errors.push('kWh debe ser un número positivo')
    }

    return errors
  }

  /**
   * Search and filter registros
   */
  searchRegistros(
    registros: ATRRegistro[],
    query: string,
    gestionFilter?: string,
    valorTipoFilter?: string
  ): ATRRegistro[] {
    return registros.filter(registro => {
      // Text search
      if (query) {
        const searchText = `${registro.clienteId} ${registro.fraudeTipo ?? ''} ${registro.notas ?? ''}`.toLowerCase()
        if (!searchText.includes(query.toLowerCase())) {
          return false
        }
      }

      // Gestion filter
      if (gestionFilter && registro.gestion !== gestionFilter) {
        return false
      }

      // Valor tipo filter
      if (valorTipoFilter && registro.valorTipo !== valorTipoFilter) {
        return false
      }

      return true
    })
  }

  /**
   * Calculate total kWh for registros
   */
  calculateTotalKWh(registros: ATRRegistro[]): number {
    return registros.reduce((sum, registro) => sum + registro.kWh, 0)
  }
}

// Export singleton instance
export const atrService = new ATRService()