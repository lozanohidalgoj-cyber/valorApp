export type GestionTipo = 'averia' | 'fraude'
export type ValorTipo = 'estimado' | 'real'

// Tipos de fraude (placeholders, ajustables cuando definas ATR)
export type FraudeTipo = 'tipo1' | 'tipo2' | 'tipo3' | 'tipo4'

export const FRAUDE_TIPOS: { value: FraudeTipo; label: string }[] = [
  { value: 'tipo1', label: 'Fraude tipo 1' },
  { value: 'tipo2', label: 'Fraude tipo 2' },
  { value: 'tipo3', label: 'Fraude tipo 3' },
  { value: 'tipo4', label: 'Fraude tipo 4' },
]

export interface ATRRegistro {
  id: string
  clienteId: string
  fechaISO: string // YYYY-MM-DD
  gestion: GestionTipo
  fraudeTipo?: FraudeTipo // solo si gestion === 'fraude'
  valorTipo: ValorTipo
  kWh: number
  notas?: string
}

export interface Valoracion {
  registroId: string
  // Placeholder de cálculo; luego se conecta a reglas ATR
  importe?: number
  observaciones?: string
}
