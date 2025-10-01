/**
 * Convierte fecha DD/MM/YYYY a formato ISO YYYY-MM-DD
 */
export const ddmmyyyyToISO = (dateString: string): string => {
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return new Date().toISOString().slice(0, 10)
  
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Convierte fecha DD/MM/YYYY a objeto Date
 */
export const ddmmyyyyToDate = (dateString: string): Date => {
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return new Date(0)
  
  const [, dd, mm, yyyy] = match
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

/**
 * Formatea fecha ISO a formato español DD/MM/YYYY
 */
export const formatDateToSpanish = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('es-ES')
}

/**
 * Formatea número como kWh con 2 decimales
 */
export const formatKWh = (value: number): string => {
  return `${value.toFixed(2)} kWh`
}

/**
 * Formatea número con decimales específicos
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toFixed(decimals)
}