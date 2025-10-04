export interface ExpedienteAnalisisFlags {
  pinzasOk: boolean
  diferenciaOk: boolean
}

export interface ExpedienteAnalisis {
  id: string
  clienteId: string
  fechaLecturaISO: string
  pinzas73DiffMin: number
  cargaRealAcometida: number
  cargaRealContador: number
  diferenciaCarga: number
  observaciones?: string
  fuenteFila?: number
  flags: ExpedienteAnalisisFlags
}

export interface AnalisisMetrics {
  count: number
  pinzasOkPct: number
  diferenciaOkPct: number
}

export const ANALISIS_STORAGE_KEY = 'valorApp.analisisExpediente'

export interface RawSheet {
  sheetName: string
  headers: string[]
  rows: Record<string, any>[]
}
