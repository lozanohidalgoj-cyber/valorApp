/**
 * 📊 Servicio de Extracción de Métricas Correctas
 *
 * Garantiza que las operaciones matemáticas en el heatmap sean correctas
 * Reemplaza los extractores simples por lógica validada y documentada
 */

import type { ConsumoMensual } from '../types';

/**
 * Validar que un dato de ConsumoMensual sea válido antes de extraer
 */
const validarConsumoMensual = (dato: ConsumoMensual | undefined): boolean => {
  if (!dato) return false;
  if (dato.registros === 0) return false;
  if (dato.dias <= 0) return false;
  return true;
};

/**
 * 📌 MÉTRICA 1: CONSUMO DE ENERGÍA ACTIVA
 * Fórmula: P1 + P2 + P3 (en kWh)
 * Descripción: Suma de todas las potencias activas del periodo
 *
 * @param dato - ConsumoMensual del periodo
 * @returns Consumo activa total en kWh
 */
export const extraerConsumoActiva = (dato: ConsumoMensual | undefined): number => {
  if (!validarConsumoMensual(dato)) return 0;

  // ✅ El servicio de análisis ya calcula esto correctamente
  // consumoActivaTotal = suma de (P1 + P2 + P3) de todas las facturas del mes
  return dato?.consumoActivaTotal ?? 0;
};

/**
 * 📌 MÉTRICA 2: PROMEDIO DE ENERGÍA ACTIVA
 * Fórmula: Consumo Activa / Días (en kWh/día)
 * Descripción: Consumo diario promedio del periodo
 *
 * ⚠️ IMPORTANTE: Si el campo "Promedio Activa" viene en las facturas,
 * se debe promediar ponderado por días, no suma simple
 *
 * @param dato - ConsumoMensual del periodo
 * @returns Promedio diario en kWh/día
 */
export const extraerPromedioActiva = (dato: ConsumoMensual | undefined): number => {
  if (!validarConsumoMensual(dato)) return 0;

  // Opción A: Si el servicio ya calcula promedioDiario correcto
  if (dato && dato.consumoPromedioDiario > 0) {
    return dato.consumoPromedioDiario;
  }

  // Opción B: Calcular a partir de consumo total y días
  if (dato && dato.dias > 0) {
    return dato.consumoActivaTotal / dato.dias;
  }

  return 0;
};

/**
 * 📌 MÉTRICA 3: MAXÍMETRO
 * Fórmula: MAX(Maxímetro P1, P2, P3, P4, P5, P6) (en kW)
 * Descripción: Máxima demanda instantánea del periodo
 *
 * ⚠️ IMPORTANTE: Es el MÁXIMO de todas las potencias,
 * no la suma. Se toma el valor más alto registrado.
 *
 * @param dato - ConsumoMensual del periodo
 * @returns Maxímetro máximo en kW
 */
export const extraerMaximetro = (dato: ConsumoMensual | undefined): number => {
  if (!validarConsumoMensual(dato)) return 0;

  // ✅ El servicio ya calcula MAX(P1...P6) de todas las facturas
  return dato?.maximetroTotal ?? 0;
};

/**
 * 📌 MÉTRICA 4: ENERGÍA RECONSTRUIDA (A + B + C)
 * Fórmula: A + B + C (en kWh)
 * Descripción: Energía total reconstruida tras refacturación
 *
 * DEFINICIONES:
 * - A: Consumo de medidor que se reconstruye
 * - B: Diferencia entre lecturas
 * - C: Ajustes finales
 *
 * @param dato - ConsumoMensual del periodo
 * @returns Energía reconstruida total en kWh
 */
export const extraerEnergiaReconstruida = (dato: ConsumoMensual | undefined): number => {
  if (!validarConsumoMensual(dato)) return 0;

  // ✅ El servicio ya sumó el campo "A + B + C" de todas las facturas
  return dato?.energiaReconstruidaTotal ?? 0;
};

/**
 * 🔍 AUDITORIA: Validar que los datos sean consistentes
 */
export const auditarConsumoMensual = (
  dato: ConsumoMensual
): {
  esValido: boolean;
  errores: string[];
  advertencias: string[];
} => {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // ❌ ERROR: Sin registros
  if (dato.registros === 0) {
    errores.push('Sin registros en el periodo');
  }

  // ❌ ERROR: Días inválidos
  if (dato.dias <= 0) {
    errores.push(`Días inválido: ${dato.dias}`);
  }

  // ❌ ERROR: Consumo negativo
  if (dato.consumoActivaTotal < 0) {
    errores.push(`Consumo activa negativo: ${dato.consumoActivaTotal}`);
  }

  // ⚠️ ADVERTENCIA: Consumo muy bajo (posible baja contractual)
  if (dato.consumoActivaTotal < 10 && dato.dias >= 25) {
    advertencias.push(`Consumo muy bajo: ${dato.consumoActivaTotal} kWh (${dato.dias} días)`);
  }

  // ⚠️ ADVERTENCIA: Promedio inconsistente
  if (dato.consumoPromedioDiario > 0 && dato.dias > 0) {
    const promedioCalculado = dato.consumoActivaTotal / dato.dias;
    const diferencia = Math.abs(promedioCalculado - dato.consumoPromedioDiario);
    if (diferencia > 1) {
      advertencias.push(
        `Promedio inconsistente: ${dato.consumoPromedioDiario} vs calculado ${promedioCalculado}`
      );
    }
  }

  // ⚠️ ADVERTENCIA: Maxímetro sin datos
  if (dato.maximetroTotal === 0 && dato.consumoActivaTotal > 0) {
    advertencias.push('Maxímetro no disponible');
  }

  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
  };
};

/**
 * 📋 DEFINICIÓN DE MÉTRICAS PARA HEATMAP
 * Cada métrica incluye extractor validado + metadata
 */
export const METRICAS_VALIDADAS = [
  {
    id: 'consumoActiva',
    titulo: 'Consumo de E. Activa',
    descripcion: 'Suma del consumo activo (P1+P2+P3) en kWh',
    unidad: 'kWh',
    decimales: 0,
    extractor: extraerConsumoActiva,
    formula: 'P1 + P2 + P3',
    umbrales: {
      minimo: 0,
      maximo: 100000,
      normal_rango: [100, 5000],
    },
  },
  {
    id: 'promedioActiva',
    titulo: 'Promedio de E. Activa',
    descripcion: 'Consumo diario promedio en kWh/día',
    unidad: 'kWh/día',
    decimales: 2,
    extractor: extraerPromedioActiva,
    formula: 'Consumo Activa / Días',
    umbrales: {
      minimo: 0,
      maximo: 1000,
      normal_rango: [1, 100],
    },
  },
  {
    id: 'maximetro',
    titulo: 'Maxímetro',
    descripcion: 'Máxima demanda instantánea en kW',
    unidad: 'kW',
    decimales: 2,
    extractor: extraerMaximetro,
    formula: 'MAX(P1, P2, P3, P4, P5, P6)',
    umbrales: {
      minimo: 0,
      maximo: 10000,
      normal_rango: [1, 100],
    },
  },
  {
    id: 'energiaReconstruida',
    titulo: 'E. Activa reconstruida',
    descripcion: 'Energía reconstruida tras refacturación (A+B+C)',
    unidad: 'kWh',
    decimales: 0,
    extractor: extraerEnergiaReconstruida,
    formula: 'A + B + C',
    umbrales: {
      minimo: 0,
      maximo: 100000,
      normal_rango: [100, 5000],
    },
  },
] as const;

/**
 * 🔧 HELPER: Obtener extractor por ID
 */
export const obtenerExtractor = (metricaId: string) => {
  const metrica = METRICAS_VALIDADAS.find((m) => m.id === metricaId);
  return metrica?.extractor ?? extraerConsumoActiva;
};

/**
 * 📊 GENERAR REPORTE DE AUDITORÍA
 * Verificar que todos los datos del heatmap sean válidos
 */
export const generarReporteAuditoria = (datos: ConsumoMensual[]) => {
  const reportes = datos.map((dato) => ({
    periodo: dato.periodo,
    auditoria: auditarConsumoMensual(dato),
  }));

  const resumen = {
    totalPeriodos: datos.length,
    periodosValidos: reportes.filter((r) => r.auditoria.esValido).length,
    periodoConErrores: reportes.filter((r) => r.auditoria.errores.length > 0),
    periodoConAdvertencias: reportes.filter((r) => r.auditoria.advertencias.length > 0),
  };

  return { reportes, resumen };
};
