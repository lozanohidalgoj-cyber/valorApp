/**
 * 📦 Barrel Export - Módulo DeteccionAnomalia
 */

export { DeteccionAnomalia } from './DeteccionAnomalia';
export { useDeteccionAnomalia } from './useDeteccionAnomalia';
export type { CeldaAnomalia } from './useDeteccionAnomalia';
export {
  NOMBRES_MESES,
  organizarDatosPorAñoMes,
  calcularEstadisticasAnomalias,
} from './deteccionHelpers';
