/**
 * Helpers para VistaGrafico
 * Funciones auxiliares de formateo y validación
 */
import type { AnalisisPeriodoConsumo } from '../../../../types';

/**
 * Obtiene etiqueta corta del mes (formato "ene 24")
 * @param periodo - Periodo en formato YYYY-MM
 * @returns Etiqueta formateada
 */
export const obtenerEtiquetaMes = (periodo: string): string => {
  const [año, mes] = periodo.split('-').map(Number);
  if (!año || !mes) {
    return periodo;
  }

  const fecha = new Date(año, mes - 1, 1);
  return fecha.toLocaleDateString('es-ES', {
    month: 'short',
    year: '2-digit',
  });
};

/**
 * Determina si un análisis representa baja de consumo
 * @param analisis - Análisis del periodo
 * @returns true si es baja de consumo
 */
export const esBajaDeConsumo = (analisis: AnalisisPeriodoConsumo | null | undefined): boolean => {
  if (!analisis) {
    return false;
  }
  return (
    analisis.comportamiento === 'Descenso brusco mes a mes' ||
    analisis.comportamiento === 'Cero sospechoso'
  );
};
