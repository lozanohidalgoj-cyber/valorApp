/**
 * 🛠️ Helpers de Detección de Anomalías
 *
 * Funciones auxiliares para el análisis de consumos energéticos:
 * - Normalización de consumos por días
 * - Cálculos de baseline y promedios históricos
 * - Detección de ciclos de facturación
 * - Análisis de tendencias y recuperación
 */

import type { ConsumoMensual } from '../../types';

/**
 * Detecta el tipo de ciclo de facturación basado en días
 * @param dias - Número de días del período
 * @returns Tipo de ciclo ('mensual', 'bimestral', 'trimestral', etc.)
 */
export const detectarCicloFacturacion = (dias: number): string => {
  if (dias >= 25 && dias <= 35) return 'mensual';
  if (dias >= 50 && dias <= 70) return 'bimestral';
  if (dias >= 75 && dias <= 105) return 'trimestral';
  if (dias >= 100 && dias <= 140) return 'cuatrimestral';
  if (dias >= 150 && dias <= 200) return 'semestral';
  if (dias >= 350 && dias <= 380) return 'anual';
  return 'irregular';
};

/**
 * Normaliza el consumo activo a un periodo equivalente de 30 días.
 * Considera los días facturados para evitar falsos descensos por ciclos cortos.
 *
 * @param registro - Datos mensuales agregados
 * @returns Consumo equivalente a 30 días
 */
export const obtenerConsumoNormalizadoMensual = (registro: ConsumoMensual): number => {
  const consumoBase =
    registro.consumoActivaTotal > 0
      ? registro.consumoActivaTotal
      : registro.consumoTotal > 0
        ? registro.consumoTotal
        : registro.energiaReconstruidaTotal;

  if (registro.dias > 0 && consumoBase > 0) {
    const normalizado = (consumoBase / registro.dias) * 30;
    if (Number.isFinite(normalizado)) return normalizado;
  }

  if (registro.consumoPromedioDiario > 0) {
    const normalizado = registro.consumoPromedioDiario * 30;
    if (Number.isFinite(normalizado)) return normalizado;
  }

  if (Number.isFinite(consumoBase)) {
    return consumoBase;
  }

  return 0;
};

/**
 * Calcula baseline normalizado a partir de N meses anteriores
 * @param normalizados - Array de consumos normalizados
 * @param indice - Índice actual
 * @param minimo - Mínimo de meses requeridos
 * @param maximo - Máximo de meses a considerar
 * @returns Promedio baseline o null si no hay suficientes datos
 */
export const calcularBaselineNormalizado = (
  normalizados: number[],
  indice: number,
  minimo: number,
  maximo: number
): number | null => {
  const valores: number[] = [];

  for (let i = indice - 1; i >= 0 && valores.length < maximo; i--) {
    const valor = normalizados[i];
    if (!Number.isFinite(valor) || valor <= 0) {
      continue;
    }
    valores.push(valor);
  }

  if (valores.length < minimo) {
    return null;
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  return suma / valores.length;
};

/**
 * Calcula el promedio histórico de un mes específico
 * excluyendo el año actual
 * @param comparativa - Array de datos mensuales
 * @param mesObjetivo - Mes a analizar (1-12)
 * @param añoActual - Año actual (para excluir)
 * @returns Promedio histórico del mes
 */
export const calcularPromedioHistoricoMes = (
  comparativa: ConsumoMensual[],
  mesObjetivo: number,
  añoActual: number
): number => {
  const registrosMes = comparativa.filter(
    (c) => c.mes === mesObjetivo && c.año !== añoActual && obtenerConsumoNormalizadoMensual(c) > 0
  );

  if (registrosMes.length === 0) return 0;

  const suma = registrosMes.reduce((acc, r) => acc + obtenerConsumoNormalizadoMensual(r), 0);
  return suma / registrosMes.length;
};

/**
 * Calcula promedio anual
 * @param comparativa - Array de datos mensuales
 * @param año - Año a promediar
 * @returns Promedio anual
 */
export const calcularPromedioAnual = (comparativa: ConsumoMensual[], año: number): number => {
  const registrosAño = comparativa.filter(
    (c) => c.año === año && obtenerConsumoNormalizadoMensual(c) > 0
  );

  if (registrosAño.length === 0) return 0;

  const suma = registrosAño.reduce((acc, r) => acc + obtenerConsumoNormalizadoMensual(r), 0);
  return suma / registrosAño.length;
};

/**
 * Verifica si un consumo cero es esperado (patrón histórico)
 * @param comparativa - Array de datos mensuales
 * @param mes - Mes actual
 * @param año - Año actual
 * @returns true si el cero es esperado en historial
 */
export const esCeroEsperado = (
  comparativa: ConsumoMensual[],
  mes: number,
  año: number
): boolean => {
  // Revisar años anteriores para ver si en este mes había ceros
  const cerosEnMes = comparativa.filter(
    (c) => c.mes === mes && c.año !== año && c.consumoActivaTotal === 0
  );

  // Solo es "esperado" si hay precedente Y además los últimos 2-3 meses antes también fueron cero
  // Esto evita reportar consumos cero como anomalía cuando siempre fueron cero
  if (cerosEnMes.length === 0) return false; // No hay precedente histórico → es sospechoso

  // Verificar si hay cambio reciente de consumo a cero (últimos 6 meses)
  const ordenada = [...comparativa].sort((a, b) => (a.año - b.año) * 12 + (a.mes - b.mes));
  const indiceActual = ordenada.findIndex((c) => c.mes === mes && c.año === año);

  if (indiceActual <= 0) return true; // Sin datos previos

  // Revisar los últimos 2-3 meses previos
  const mesesPrevios = ordenada.slice(Math.max(0, indiceActual - 3), indiceActual);

  // Si había consumo antes y ahora es cero = cambio reciente = sospechoso
  const hayConsumoPrevio = mesesPrevios.some((c) => c.consumoActivaTotal > 0);

  return !hayConsumoPrevio; // Si había consumo previo, es sospechoso
};

/**
 * Detecta descenso sostenido SIN RECUPERACIÓN (>10% durante 3+ meses)
 * ⚠️ IMPORTANTE: Solo marca anomalía si NO hay recuperación posterior
 *
 * CASOS:
 * ✅ Detecta: 500→450→405→365→340 (baja continua, SIN recuperación)
 * ❌ NO detecta: 500→450→405→480→510 (hay recuperación, es normal)
 *
 * @param comparativa - Array de datos mensuales
 * @returns Array de descensos sostenidos sin recuperación detectados
 */
export const detectarDescensoSostenidoSinRecuperacion = (
  comparativa: ConsumoMensual[]
): Array<{
  detectado: boolean;
  indiceInicio: number;
  indiceFin: number;
  duracionMeses: number;
  huboRecuperacion: boolean;
  promedioBaseline: number;
  consumoNormalizadoInicio: number;
  consumoMinimoNormalizado: number;
  variacionInicioBaseline: number;
  variacionMinimaBaseline: number;
  umbralRecuperacion: number;
}> => {
  const UMBRAL_DESCENSO = 10; // %
  const MESES_REQUERIDOS = 3;
  const MESES_BASELINE_MAX = 3;
  const MESES_BASELINE_MIN = 2;
  const FACTOR_RECUPERACION = 1.15;

  const resultados: Array<{
    detectado: boolean;
    indiceInicio: number;
    indiceFin: number;
    duracionMeses: number;
    huboRecuperacion: boolean;
    promedioBaseline: number;
    consumoNormalizadoInicio: number;
    consumoMinimoNormalizado: number;
    variacionInicioBaseline: number;
    variacionMinimaBaseline: number;
    umbralRecuperacion: number;
  }> = [];

  if (comparativa.length < MESES_REQUERIDOS) {
    return resultados;
  }

  const normalizados = comparativa.map(obtenerConsumoNormalizadoMensual);

  for (let i = 0; i < comparativa.length; i++) {
    const consumoActual = normalizados[i];

    if (!Number.isFinite(consumoActual) || consumoActual <= 0) {
      continue;
    }

    const baseline = calcularBaselineNormalizado(
      normalizados,
      i,
      MESES_BASELINE_MIN,
      MESES_BASELINE_MAX
    );

    if (baseline === null || baseline <= 0) {
      continue;
    }

    const umbralDescensoAbsoluto = baseline * (1 - UMBRAL_DESCENSO / 100);

    if (consumoActual > umbralDescensoAbsoluto) {
      continue;
    }

    let indiceFin = i;
    let consumoMinimo = consumoActual;

    for (let j = i + 1; j < comparativa.length; j++) {
      const consumoEvaluado = normalizados[j];

      if (!Number.isFinite(consumoEvaluado) || consumoEvaluado <= 0) {
        break;
      }

      if (consumoEvaluado <= umbralDescensoAbsoluto) {
        indiceFin = j;
        consumoMinimo = Math.min(consumoMinimo, consumoEvaluado);
      } else {
        break;
      }
    }

    const duracion = indiceFin - i + 1;

    if (duracion < MESES_REQUERIDOS) {
      i = indiceFin;
      continue;
    }

    const umbralRecuperacion = consumoMinimo * FACTOR_RECUPERACION;
    let huboRecuperacion = false;

    for (let k = indiceFin + 1; k < comparativa.length; k++) {
      const consumoPosterior = normalizados[k];
      if (!Number.isFinite(consumoPosterior) || consumoPosterior <= 0) {
        continue;
      }

      if (consumoPosterior >= umbralRecuperacion) {
        huboRecuperacion = true;
        break;
      }
    }

    if (!huboRecuperacion) {
      const variacionInicioBaseline = ((consumoActual - baseline) / baseline) * 100;
      const variacionMinimaBaseline = ((consumoMinimo - baseline) / baseline) * 100;

      resultados.push({
        detectado: true,
        indiceInicio: i,
        indiceFin,
        duracionMeses: duracion,
        huboRecuperacion,
        promedioBaseline: baseline,
        consumoNormalizadoInicio: consumoActual,
        consumoMinimoNormalizado: consumoMinimo,
        variacionInicioBaseline,
        variacionMinimaBaseline,
        umbralRecuperacion,
      });
    }

    i = indiceFin;
  }

  return resultados;
};

/**
 * Detecta descenso brusco mes a mes (≥30%)
 * @param consumoActual - Consumo actual
 * @param consumoAnterior - Consumo mes anterior
 * @returns true si hay descenso ≥ 30%
 */
export const hayDescensobrusCo = (consumoActual: number, consumoAnterior: number): boolean => {
  if (consumoAnterior === 0) return false;

  const variacion = ((consumoActual - consumoAnterior) / consumoAnterior) * 100;
  return variacion <= -30;
};

/**
 * Convierte mes (1-12) a nombre español
 * @param mes - Número de mes
 * @returns Nombre del mes
 */
export const getNombreMes = (mes: number): string => {
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  return meses[mes - 1] || '';
};

/**
 * Analiza la serie de variaciones mes-a-mes para identificar:
 * - TODOS los bloques de descensos consecutivos (variación < 0)
 * - Selecciona el bloque MÁS SIGNIFICATIVO (sin recuperación > con recuperación)
 * - Inicio de recuperación (cambio de signo: negativo → positivo o cero)
 * - Recuperación confirmada (≥2 aumentos consecutivos: variación > 0)
 */
export const analizarTendencias = (comparativa: ConsumoMensual[]) => {
  const ordenada = [...comparativa].sort((a, b) => a.año - b.año || a.mes - b.mes);
  const variaciones: Array<number | null> = ordenada.map((c) => {
    // Usar la variaciónPorcentual ya calculada en generarComparativaMensual
    // Puede ser null para el primer mes
    return typeof c.variacionPorcentual === 'number' ? c.variacionPorcentual : null;
  });

  // Encontrar TODOS los bloques de ≥3 descensos consecutivos (variación < 0)
  const bloques: Array<{
    inicio: number;
    fin: number;
    longitud: number;
    recuperacionConfirmada: boolean;
    indiceRecuperacion: number;
  }> = [];

  let inicioActual = -1;
  let longitudActual = 0;

  for (let i = 0; i < variaciones.length; i++) {
    const v = variaciones[i];
    if (v !== null && v < 0) {
      if (inicioActual === -1) inicioActual = i;
      longitudActual++;
    } else {
      // Se rompió la racha
      if (longitudActual >= 3) {
        const finBloque = i - 1;

        // Buscar recuperación confirmada después de este bloque
        let recuperacionConfirmada = false;
        let indiceRecuperacion = -1;

        for (let j = i; j < variaciones.length; j++) {
          const vj = variaciones[j];
          if (vj !== null && vj >= 0) {
            indiceRecuperacion = j;
            // Verificar si hay dos aumentos consecutivos (> 0)
            const v1 = variaciones[j];
            const v2 = j + 1 < variaciones.length ? variaciones[j + 1] : null;
            if (v1 !== null && v1 > 0 && v2 !== null && v2 > 0) {
              recuperacionConfirmada = true;
            }
            break;
          }
        }

        bloques.push({
          inicio: inicioActual,
          fin: finBloque,
          longitud: longitudActual,
          recuperacionConfirmada,
          indiceRecuperacion,
        });
      }
      inicioActual = -1;
      longitudActual = 0;
    }
  }

  // Verificar si el último bloque llega hasta el final
  if (longitudActual >= 3) {
    bloques.push({
      inicio: inicioActual,
      fin: variaciones.length - 1,
      longitud: longitudActual,
      recuperacionConfirmada: false,
      indiceRecuperacion: -1,
    });
  }

  if (bloques.length === 0) {
    return {
      tieneBloqueDescenso: false,
      inicioBloqueDescenso: -1,
      finBloqueDescenso: -1,
      longitudBloque: 0,
      indiceInicioRecuperacion: -1,
      recuperacionConfirmada: false,
      periodoInicioBloque: undefined,
      periodoInicioRecuperacion: undefined,
    } as const;
  }

  // PRIORIDAD: Seleccionar el bloque MÁS SIGNIFICATIVO
  // 1. Sin recuperación confirmada (prioridad máxima)
  // 2. Mayor duración
  // 3. Más reciente
  const bloqueSeleccionado = bloques.reduce((mejor, actual) => {
    // Priorizar bloques SIN recuperación
    if (!actual.recuperacionConfirmada && mejor.recuperacionConfirmada) {
      return actual;
    }
    if (actual.recuperacionConfirmada && !mejor.recuperacionConfirmada) {
      return mejor;
    }

    // Si ambos tienen o no recuperación, preferir el de mayor duración
    if (actual.longitud > mejor.longitud) {
      return actual;
    }
    if (actual.longitud < mejor.longitud) {
      return mejor;
    }

    // Si tienen igual duración, preferir el más reciente
    return actual.inicio > mejor.inicio ? actual : mejor;
  });

  return {
    tieneBloqueDescenso: true,
    inicioBloqueDescenso: bloqueSeleccionado.inicio,
    finBloqueDescenso: bloqueSeleccionado.fin,
    longitudBloque: bloqueSeleccionado.longitud,
    indiceInicioRecuperacion: bloqueSeleccionado.indiceRecuperacion,
    recuperacionConfirmada: bloqueSeleccionado.recuperacionConfirmada,
    periodoInicioBloque: ordenada[bloqueSeleccionado.inicio].periodo,
    periodoInicioRecuperacion:
      bloqueSeleccionado.indiceRecuperacion >= 0
        ? ordenada[bloqueSeleccionado.indiceRecuperacion].periodo
        : undefined,
  } as const;
};
