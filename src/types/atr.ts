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

// Estructura de filas del saldo ATR importado desde CSV ejemplos/ATR.csv
export interface ATRSaldoRow {
  cups: string
  contratoATR: string
  fechaDesde: string // dd/mm/yyyy
  fechaHasta: string // dd/mm/yyyy
  consumoTotalActivaKWh: number
  fuenteAgregada: string
  estadoMedida: string
  potenciaKW: number
  codigoFactura: string
  tipoFactura: string
  estadoFactura: string
  numeroSerieContador: string
  fechaEnvioAFacturar: string // dd/mm/yyyy HH:mm o '-'
  autoFactura: string
}

export const ATR_SALDO_EXPECTED_HEADERS: string[] = [
  'CUPS',
  'Contrato ATR',
  'Fecha desde',
  'Fecha hasta',
  'Consumo total activa',
  'Fuente agregada',
  'Estado medida',
  'Potencia (kW)',
  'Código factura',
  'Tipo de factura',
  'Estado factura',
  'Número de serie del contador',
  'Fecha de envío a facturar',
  'Autofactura'
]

// Utilidad para convertir valores numéricos con separador de miles "." y decimal ","
export function parseLocaleNumberES(input: string): number {
  const cleaned = input.replace(/\./g, '').replace(/,/g, '.').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function mapToATRSaldoRow(cols: string[]): ATRSaldoRow | null {
  if (cols.length !== ATR_SALDO_EXPECTED_HEADERS.length) return null
  const [
    cups,
    contratoATR,
    fechaDesde,
    fechaHasta,
    consumoTotalActivaStr,
    fuenteAgregada,
    estadoMedida,
    potenciaKWStr,
    codigoFactura,
    tipoFactura,
    estadoFactura,
    numeroSerieContador,
    fechaEnvioAFacturar,
    autoFactura
  ] = cols
  const consumoTotalActivaKWh = parseLocaleNumberES(consumoTotalActivaStr)
  const potenciaKW = parseLocaleNumberES(potenciaKWStr)
  if (Number.isNaN(consumoTotalActivaKWh) || Number.isNaN(potenciaKW)) return null
  return {
    cups,
    contratoATR,
    fechaDesde,
    fechaHasta,
    consumoTotalActivaKWh,
    fuenteAgregada,
    estadoMedida,
    potenciaKW,
    codigoFactura,
    tipoFactura,
    estadoFactura,
    numeroSerieContador,
    fechaEnvioAFacturar,
    autoFactura
  }
}
