/**
 * 🔍 Servicio de Detección de Inicio de Anomalía (Sistema Experto)
 *
 * Detecta SOLO EL INICIO de anomalías considerando múltiples factores:
 * - Descenso sostenido (>10% durante 3+ meses)
 * - Variación anómala (>20% vs histórico del mismo mes)
 * - Consumo cero (esperado vs sospechoso)
 * - Descenso brusco mes a mes (≥30%)
 * - Ciclo de facturación
 *
 * Retorna clasificación en 3 categorías:
 * 1. "Anomalía indeterminada" - No hay descenso claro o es estacional
 * 2. "Período indeterminado" - Necesita análisis por horas
 * 3. "Determinación del descenso en [mes/año]" - Inicio detectado
 */

import type { ConsumoMensual } from '../types';
import {
  evaluarReglaTendencia,
  evaluarReglaDescensoBrusco,
  evaluarReglaDescensoSostenido,
  evaluarReglaVariacionHistorica,
  evaluarReglaConsumoCero,
} from './deteccion/reglas';

// ============================================================================
// 📊 TIPOS INTERNOS
// ============================================================================

/**
 * Clasificación de anomalía
 */
export type ClasificacionAnomalia = 'sin_anomalia' | 'periodo_indeterminado' | 'anomalia_detectada';

/**
 * Resultado de detección de anomalía
 */
export interface ResultadoDeteccionInicio {
  /** Clasificación de la anomalía */
  clasificacion: ClasificacionAnomalia;
  /** Mensaje legible para el usuario */
  mensaje: string;
  /** Periodo donde inicia la anomalía (si aplica) */
  periodoInicio?: string;
  /** Mes y año legible (ej: "enero 2024") */
  periodoLegible?: string;
  /** Razón/factor detectado */
  razon: string;
  /** Confianza de la detección (0-100) */
  confianza: number;
  /** Detalles técnicos para debugging */
  detalles: Record<string, unknown>;
}

// ============================================================================
// 🔍 DETECTOR PRINCIPAL
// ============================================================================

/**
 * Detecta el INICIO de anomalía en los datos evaluando TODAS las reglas
 * Retorna la anomalía con MAYOR confianza (prioridad por fiabilidad)
 *
 * @param comparativa - Array de datos mensuales ordenados cronológicamente
 * @returns Resultado con clasificación y periodo de inicio (de mayor confianza)
 *
 * @example
 * const resultado = detectarInicioAnomalia(comparativaMensual);
 * // {
 * //   clasificacion: 'anomalia_detectada',
 * //   mensaje: 'Determinación del descenso en enero 2024',
 * //   periodoInicio: '2024-01',
 * //   periodoLegible: 'enero 2024',
 * //   razon: 'Descenso brusco >= 30% respecto mes anterior',
 * //   confianza: 95
 * // }
 */
export const detectarInicioAnomalia = (comparativa: ConsumoMensual[]): ResultadoDeteccionInicio => {
  // Validar entrada
  if (!comparativa || comparativa.length === 0) {
    return {
      clasificacion: 'periodo_indeterminado',
      mensaje: 'No hay suficientes datos para análisis',
      razon: 'Datos insuficientes',
      confianza: 0,
      detalles: { tipo: 'sin_datos' },
    };
  }

  // Ordenar cronológicamente
  const comparativaOrdenada = [...comparativa].sort((a, b) => {
    if (a.año !== b.año) return a.año - b.año;
    return a.mes - b.mes;
  });

  // Array para almacenar TODAS las anomalías detectadas
  const anomaliasDetectadas: ResultadoDeteccionInicio[] = [];

  // Evaluar todas las reglas y recolectar anomalías
  const resultadosRegla0 = evaluarReglaTendencia(comparativaOrdenada);
  const resultadosRegla1 = evaluarReglaDescensoBrusco(comparativaOrdenada);
  const resultadosRegla2 = evaluarReglaDescensoSostenido(comparativaOrdenada);
  const resultadosRegla3 = evaluarReglaVariacionHistorica(comparativaOrdenada);
  const resultadosRegla4 = evaluarReglaConsumoCero(comparativaOrdenada);

  anomaliasDetectadas.push(
    ...resultadosRegla0,
    ...resultadosRegla1,
    ...resultadosRegla2,
    ...resultadosRegla3,
    ...resultadosRegla4
  );

  // Seleccionar anomalía con mayor confianza
  if (anomaliasDetectadas.length > 0) {
    anomaliasDetectadas.sort((a, b) => {
      // Primero por confianza (descendente)
      if (b.confianza !== a.confianza) {
        return b.confianza - a.confianza;
      }
      // Si confianza igual, preferir más reciente (año descendente)
      if (a.periodoInicio && b.periodoInicio) {
        return b.periodoInicio.localeCompare(a.periodoInicio);
      }
      return 0;
    });

    return anomaliasDetectadas[0];
  }

  // NINGUNA ANOMALÍA DETECTADA
  return {
    clasificacion: 'sin_anomalia',
    mensaje: 'No se detectaron anomalías en los datos',
    razon: 'Cambios menores al 40%, comportamiento estacional normal o contrato con bajo uso',
    confianza: 90,
    detalles: {
      tipo: 'sin_anomalia',
      umbralesVerificados: [
        'descenso_brusco: < -30%',
        'descenso_sostenido: < -10% por 3+ meses',
        'variacion_historica: < 20%',
      ],
    },
  };
};

/**
 * Convierte un resultado a formato legible para mostrar en UI
 * @param resultado - Resultado de detección
 * @returns Mensaje formateado
 */
export const formatearResultadoDeteccion = (resultado: ResultadoDeteccionInicio): string => {
  if (resultado.clasificacion === 'sin_anomalia') {
    return `⚠️ Anomalía indeterminada - ${resultado.mensaje}`;
  }

  if (resultado.clasificacion === 'anomalia_detectada') {
    return `⚠️ ${resultado.mensaje}\n📍 Razón: ${resultado.razon}\n🎯 Confianza: ${resultado.confianza}%`;
  }

  return `❓ ${resultado.mensaje}`;
};
