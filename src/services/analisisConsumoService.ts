/**
 * 📊 Servicio de Análisis de Consumo
 *
 * Replica la funcionalidad del Excel "Análisis de Expedientes.xlsm"
 * - Vista por años: Agrupación anual con todas las métricas
 * - Comparativa mensual: Evolución mes a mes con detección de anomalías (umbral 40%)
 */

import type {
  DerivacionData,
  ResultadoAnalisis,
  AnalisisPeriodoConsumo,
  ConsumoMensual,
} from '../types';
import { extraerAñoDeFormato, extraerMesDeFormato, formatearNumero } from '../utils';
import { generarVistaAnual, generarComparativaMensual } from './analisis/generadores';

/**
 * Analiza los datos de derivación y genera el análisis completo
 * Replica todas las funcionalidades del Excel
 * @param datos - Array de registros de derivación
 * @returns Resultado del análisis completo con vistas anual y mensual
 */
export const analizarConsumoCompleto = (datos: DerivacionData[]): ResultadoAnalisis => {
  // Generar vista anual
  const vistaAnual = generarVistaAnual(datos);

  // Generar comparativa mensual
  const { comparativa: comparativaMensual, detalles: detallesPorPeriodo } =
    generarComparativaMensual(datos);

  // Calcular periodo total
  const fechas = datos
    .map((d) => {
      const año = extraerAñoDeFormato(d['Fecha desde']);
      const mes = extraerMesDeFormato(d['Fecha desde']);
      return { año, mes, fecha: d['Fecha desde'] };
    })
    .sort((a, b) => a.año - b.año || a.mes - b.mes);

  const periodoTotal = {
    fechaInicio: fechas.length > 0 ? fechas[0].fecha : '',
    fechaFin: fechas.length > 0 ? fechas[fechas.length - 1].fecha : '',
    totalAños: vistaAnual.length,
    totalMeses: comparativaMensual.length,
  };

  // Calcular resumen ejecutivo
  const consumoTotalGeneral = vistaAnual.reduce((suma, año) => suma + año.sumaConsumoActiva, 0);
  const maxMaximetroGeneral = vistaAnual.reduce((max, año) => Math.max(max, año.maxMaximetro), 0);
  const promedioAnual = vistaAnual.length > 0 ? consumoTotalGeneral / vistaAnual.length : 0;
  const anomaliasDetectadas = comparativaMensual.filter((m) => m.esAnomalia).length;

  return {
    vistaAnual,
    comparativaMensual,
    detallesPorPeriodo,
    periodoTotal,
    resumen: {
      consumoTotalGeneral,
      promedioAnual,
      maxMaximetroGeneral,
      totalFacturas: datos.length,
      anomaliasDetectadas,
    },
  };
};

// Re-exportar formatearNumero para retrocompatibilidad
export { formatearNumero };

const COMPORTAMIENTOS_NO_ANOMALIA = new Set([
  'Normal',
  'Sin cambio',
  'Estacionalidad – uso temporal',
  'Cero esperado estacional',
  'Descenso leve',
  'Aumento de consumo',
]);

/**
 * Analiza una serie de consumos mensuales y determina el comportamiento por periodo
 * replicando la lógica empleada en la vista de anomalías.
 *
 * Detección de consumos cero:
 * - "Cero esperado estacional": Cuando el cero ocurre en meses estacionales (1,7,8,12)
 *   O cuando el mismo mes tiene historial de ceros en otros años
 * - "Normal": Para consumos cero sin patrón estacional claro
 *
 * @param datos Serie mensual de consumos
 * @returns Mapa periodo -> análisis detectado
 */
export const analizarComportamientoMensual = (
  datos: ConsumoMensual[]
): Map<string, AnalisisPeriodoConsumo> => {
  const compararPorPeriodo = (a: ConsumoMensual, b: ConsumoMensual) => {
    if (a.año === b.año) {
      return a.mes - b.mes;
    }
    return a.año - b.año;
  };

  const promedioHistoricoPorMes = new Map<number, number>();
  const acumulados = new Map<number, { suma: number; cantidad: number }>();

  datos.forEach((registro) => {
    if (!Number.isFinite(registro.consumoPromedioDiario)) {
      return;
    }

    const actual = acumulados.get(registro.mes) ?? { suma: 0, cantidad: 0 };
    acumulados.set(registro.mes, {
      suma: actual.suma + registro.consumoPromedioDiario,
      cantidad: actual.cantidad + 1,
    });
  });

  acumulados.forEach((valor, mes) => {
    if (valor.cantidad > 0) {
      promedioHistoricoPorMes.set(mes, valor.suma / valor.cantidad);
    }
  });

  const consumos = datos
    .map((registro) => (registro.dias > 0 ? registro.consumoTotal / registro.dias : null))
    .filter((valor): valor is number => typeof valor === 'number' && Number.isFinite(valor));

  const promedioGlobalConsumoDiario =
    consumos.length === 0
      ? null
      : consumos.reduce((acumulado, valor) => acumulado + valor, 0) / consumos.length;

  const ordenados = [...datos].sort(compararPorPeriodo);
  const registrosPorPeriodo = new Map<string, ConsumoMensual>();
  const resultado = new Map<string, AnalisisPeriodoConsumo>();
  let cambioPotenciaActivo = false;

  // Primera pasada: detectar descensos mes a mes (usando consumo TOTAL)
  const descentosPorIndice = new Map<number, boolean>();

  ordenados.forEach((registro, indice) => {
    registrosPorPeriodo.set(registro.periodo, registro);
    const anterior = indice > 0 ? ordenados[indice - 1] : undefined;

    if (anterior && anterior.consumoTotal !== 0 && registro.consumoTotal !== null) {
      const variacionMes =
        ((registro.consumoTotal - anterior.consumoTotal) / anterior.consumoTotal) * 100;
      // Marcar descenso si es negativo
      if (variacionMes < 0) {
        descentosPorIndice.set(indice, true);
      }
    }
  });

  // Identificar descensos sostenidos (3+ meses en ventana de 5 meses, tolerando 1-2 meses de recuperación)
  const indicesDescentoSostenido = new Set<number>();
  for (let i = 0; i < ordenados.length; i++) {
    if (descentosPorIndice.get(i)) {
      // Contar descensos en ventana de hasta 5 meses permitiendo máximo 2 meses sin descenso
      let descuentosEnVentana = 0;
      let mesesSinDescenso = 0;
      let ventanaFin = i;

      for (let j = i; j < Math.min(i + 5, ordenados.length); j++) {
        if (descentosPorIndice.get(j)) {
          descuentosEnVentana += 1;
          mesesSinDescenso = 0; // Reset contador
        } else {
          mesesSinDescenso += 1;
          // Si llegamos a 3 meses sin descenso, salir de la ventana
          if (mesesSinDescenso >= 3) {
            break;
          }
        }
        ventanaFin = j;
      }

      // Si hay 3 o más descensos en la ventana, marcar TODO como sostenido (incluyendo recuperaciones)
      if (descuentosEnVentana >= 3) {
        for (let j = i; j <= ventanaFin; j++) {
          indicesDescentoSostenido.add(j);
        }
      }
    }
  }

  // Calcular MÁXIMO histórico por mes (para detectar descensos desde picos)
  const maximoHistoricoPorMes = new Map<number, number>();
  datos.forEach((registro) => {
    const consumoTotal = registro.consumoTotal;
    const maximoActual = maximoHistoricoPorMes.get(registro.mes) ?? 0;
    if (consumoTotal > maximoActual) {
      maximoHistoricoPorMes.set(registro.mes, consumoTotal);
    }
  });

  // 🌍 CÁLCULO GLOBAL: Promedio y desviación estándar de TODO el histórico
  const consumosTotales = datos
    .map((r) => r.consumoTotal)
    .filter((c): c is number => c !== null && Number.isFinite(c));

  const promedioGlobalConsumoTotal =
    consumosTotales.length > 0
      ? consumosTotales.reduce((sum, val) => sum + val, 0) / consumosTotales.length
      : 0;

  const varianzaGlobal =
    consumosTotales.length > 0
      ? consumosTotales.reduce(
          (sum, val) => sum + Math.pow(val - promedioGlobalConsumoTotal, 2),
          0
        ) / consumosTotales.length
      : 0;

  const desviacionGlobal = Math.sqrt(varianzaGlobal);

  // Pre-calcular mapa de ceros por mes (para detección de patrón estacional)
  const mesesCero = new Map<number, number>();
  datos.forEach((registro) => {
    if (registro.consumoTotal === 0) {
      const conteoCeros = mesesCero.get(registro.mes) ?? 0;
      mesesCero.set(registro.mes, conteoCeros + 1);
    }
  });

  // Umbrales de clasificación de comportamiento (basados en análisis estadístico)
  const UMBRALES = {
    DESCENSO_FUERTE: -40, // Descenso fuerte (anomalía) - variaciones críticas
    DESCENSO_MODERADO: -20, // Descenso moderado - variaciones significativas
    DESCENSO_LEVE: -10, // Descenso leve - variaciones normales
    VARIACION_INUSUAL: 60, // Variación histórica inusual (±60% respecto al promedio)
    AUMENTO_SIGNIFICATIVO: 50, // Aumento de consumo significativo
    SIN_CAMBIO: 5, // Sin cambio (±5%)
    ZSCORE_BAJO: -2.0, // Z-Score bajo indica consumo muy inferior al promedio global
    ZSCORE_MUY_BAJO: -2.5, // Z-Score muy bajo indica consumo crítico
  };

  ordenados.forEach((registro, indice) => {
    registrosPorPeriodo.set(registro.periodo, registro);
    const consumoPromedioActual = registro.dias > 0 ? registro.consumoTotal / registro.dias : null;
    const promedioHistorico = promedioHistoricoPorMes.get(registro.mes) ?? null;
    const maximoHistorico = maximoHistoricoPorMes.get(registro.mes) ?? null;

    const variacionHistorica =
      promedioHistorico === null || promedioHistorico === 0 || consumoPromedioActual === null
        ? null
        : ((consumoPromedioActual - promedioHistorico) / promedioHistorico) * 100;

    // Variación respecto al MÁXIMO histórico del mismo mes
    const variacionDesdeMaximo =
      maximoHistorico === null || maximoHistorico === 0 || registro.consumoTotal === null
        ? null
        : ((registro.consumoTotal - maximoHistorico) / maximoHistorico) * 100;

    const variacionGlobal =
      promedioGlobalConsumoDiario === null ||
      promedioGlobalConsumoDiario === 0 ||
      consumoPromedioActual === null
        ? null
        : ((consumoPromedioActual - promedioGlobalConsumoDiario) / promedioGlobalConsumoDiario) *
          100;

    // 🌍 Z-Score Global: Mide cuántas desviaciones estándar está el consumo del promedio global
    const zScoreGlobal =
      desviacionGlobal > 0 && registro.consumoTotal !== null
        ? (registro.consumoTotal - promedioGlobalConsumoTotal) / desviacionGlobal
        : 0;

    // Obtener variación mes-a-mes comparando CONSUMO TOTAL (no promedio diario)
    const anterior = indice > 0 ? ordenados[indice - 1] : undefined;
    let variacionMesMes: number | null = null;
    if (anterior && anterior.consumoTotal !== 0 && registro.consumoTotal !== null) {
      // Comparar consumo TOTAL directamente
      variacionMesMes =
        ((registro.consumoTotal - anterior.consumoTotal) / anterior.consumoTotal) * 100;
    }

    const consumoEsCero = registro.consumoTotal === 0;
    const potenciaActual = registro.potenciaPromedio;
    const potenciaPeriodoAnterior =
      indice > 0 ? ordenados[indice - 1].potenciaPromedio : potenciaActual;

    if (indice > 0 && potenciaActual !== potenciaPeriodoAnterior) {
      cambioPotenciaActivo = true;
    }

    let comportamiento = 'Normal';
    let ceroEsperadoPersistente = false;

    // Prioridad 1: Detección de ceros
    if (consumoEsCero) {
      // Verificar si es un patrón estacional:
      // - El mismo mes tiene ceros en otros años (histórico) O
      // - Es un mes típicamente estacional (julio, agosto, diciembre, enero)
      const esMesEstacional = [1, 7, 8, 12].includes(registro.mes);
      const tieneCerosHistoricos =
        mesesCero.get(registro.mes) !== undefined && (mesesCero.get(registro.mes) ?? 0) > 1;

      if (esMesEstacional || tieneCerosHistoricos) {
        comportamiento = 'Cero esperado estacional';
        ceroEsperadoPersistente = true;
      } else {
        // Cero sin patrón estacional - clasificar como comportamiento normal con consumo nulo
        comportamiento = 'Normal';
      }
    }
    // Prioridad 2: Cambio de potencia
    else if (cambioPotenciaActivo) {
      comportamiento = 'Cambio de potencia';
    }
    // Prioridad 3: Clasificar descensos y aumentos usando CONTEXTO GLOBAL
    else if (variacionMesMes !== null) {
      // 🌍 CRITERIO GLOBAL: Consumo muy bajo respecto al promedio global (Z-Score < -2.5)
      const esConsumoMuyBajoGlobal = zScoreGlobal < UMBRALES.ZSCORE_MUY_BAJO;
      const esConsumoBajoGlobal = zScoreGlobal < UMBRALES.ZSCORE_BAJO;

      if (variacionMesMes < UMBRALES.DESCENSO_FUERTE) {
        // < -40%
        comportamiento = 'Descenso fuerte (anomalía)';
      }
      // 🌍 NUEVO: Detectar descenso fuerte si Z-Score muy bajo incluso sin variación mes-a-mes extrema
      else if (esConsumoMuyBajoGlobal && variacionMesMes < UMBRALES.DESCENSO_MODERADO) {
        // Z-Score < -2.5 Y descenso > -20%
        comportamiento = 'Descenso fuerte (anomalía)';
      } else if (variacionMesMes < UMBRALES.DESCENSO_MODERADO) {
        // -40% a -20%
        comportamiento = 'Descenso moderado';
      } else if (variacionMesMes < UMBRALES.DESCENSO_LEVE) {
        // -20% a -10%
        comportamiento = 'Descenso leve';
      } else if (variacionMesMes < 0) {
        // -10% a 0% (descensos menores)
        comportamiento = 'Descenso leve';
      } else if (variacionMesMes <= UMBRALES.SIN_CAMBIO) {
        // 0% a +5% - Verificar contexto global Y máximo histórico

        // 🌍 PRIORIDAD 1: Z-Score muy bajo indica anomalía incluso sin cambio mes-a-mes
        if (esConsumoMuyBajoGlobal) {
          comportamiento = 'Descenso fuerte (anomalía)';
        }
        // 🌍 PRIORIDAD 2: Z-Score bajo + descenso desde máximo histórico
        else if (
          esConsumoBajoGlobal &&
          variacionDesdeMaximo !== null &&
          variacionDesdeMaximo < UMBRALES.DESCENSO_MODERADO
        ) {
          comportamiento = 'Descenso moderado';
        }
        // Verificar descenso desde máximo histórico del mes
        else if (variacionDesdeMaximo !== null && variacionDesdeMaximo < UMBRALES.DESCENSO_FUERTE) {
          comportamiento = 'Descenso fuerte (anomalía)';
        } else if (
          variacionDesdeMaximo !== null &&
          variacionDesdeMaximo < UMBRALES.DESCENSO_MODERADO
        ) {
          comportamiento = 'Descenso moderado';
        } else if (variacionDesdeMaximo !== null && variacionDesdeMaximo < UMBRALES.DESCENSO_LEVE) {
          comportamiento = 'Descenso leve';
        } else {
          comportamiento = 'Sin cambio';
        }
      } else if (variacionMesMes >= UMBRALES.AUMENTO_SIGNIFICATIVO) {
        // >= +50%
        comportamiento = 'Aumento de consumo';
      } else {
        // +5% a +50% (aumentos moderados) - PERO verificar descenso global/histórico

        // 🌍 PRIORIDAD 1: Z-Score muy bajo sobrescribe aumento aparente
        if (esConsumoMuyBajoGlobal) {
          comportamiento = 'Descenso fuerte (anomalía)';
        }
        // 🌍 PRIORIDAD 2: Z-Score bajo + descenso desde máximo
        else if (
          esConsumoBajoGlobal &&
          variacionDesdeMaximo !== null &&
          variacionDesdeMaximo < UMBRALES.DESCENSO_MODERADO
        ) {
          comportamiento = 'Descenso moderado';
        }
        // Verificar descenso desde máximo histórico
        else if (variacionDesdeMaximo !== null && variacionDesdeMaximo < UMBRALES.DESCENSO_FUERTE) {
          comportamiento = 'Descenso fuerte (anomalía)';
        } else if (
          variacionDesdeMaximo !== null &&
          variacionDesdeMaximo < UMBRALES.DESCENSO_MODERADO
        ) {
          comportamiento = 'Descenso moderado';
        } else if (variacionDesdeMaximo !== null && variacionDesdeMaximo < UMBRALES.DESCENSO_LEVE) {
          comportamiento = 'Descenso leve';
        } else {
          comportamiento = 'Sin cambio';
        }
      }
    }
    // Prioridad 4: Si no hay variación mes-a-mes, usar variación histórica
    else if (variacionHistorica !== null) {
      if (Math.abs(variacionHistorica) >= UMBRALES.VARIACION_INUSUAL) {
        comportamiento = 'Variación inusual respecto al promedio histórico';
      } else if (variacionHistorica >= UMBRALES.AUMENTO_SIGNIFICATIVO) {
        comportamiento = 'Aumento de consumo';
      } else if (Math.abs(variacionHistorica) <= UMBRALES.SIN_CAMBIO) {
        comportamiento = 'Sin cambio';
      }
    }
    // Prioridad 5: Usar variación global como último recurso
    else if (variacionGlobal !== null) {
      if (variacionGlobal >= UMBRALES.AUMENTO_SIGNIFICATIVO) {
        comportamiento = 'Aumento de consumo';
      } else if (Math.abs(variacionGlobal) <= UMBRALES.SIN_CAMBIO) {
        comportamiento = 'Sin cambio';
      }
    }

    resultado.set(registro.periodo, {
      variacionHistorica,
      variacionGlobal,
      comportamiento,
      ceroEsperado: ceroEsperadoPersistente,
    });
  });

  // Calcular mesesConConsumo (ya tenemos mesesCero calculado antes del bucle principal)
  const mesesConConsumo = new Map<number, number>();

  ordenados.forEach((registro) => {
    if (registro.consumoTotal !== 0) {
      const conteoConsumo = mesesConConsumo.get(registro.mes) ?? 0;
      mesesConConsumo.set(registro.mes, conteoConsumo + 1);
    }
  });

  resultado.forEach((valor, periodo) => {
    const registro = registrosPorPeriodo.get(periodo);
    if (!registro) {
      return;
    }

    const totalConsumoMes = mesesConConsumo.get(registro.mes) ?? 0;
    const totalCerosMes = mesesCero.get(registro.mes) ?? 0;
    const totalPeriodosMes = totalConsumoMes + totalCerosMes;

    if (
      valor.ceroEsperado &&
      totalConsumoMes >= 1 &&
      totalCerosMes >= totalConsumoMes &&
      totalPeriodosMes >= 3
    ) {
      const nuevoValor = resultado.get(periodo);
      if (nuevoValor) {
        nuevoValor.comportamiento = 'Estacionalidad – uso temporal';
        nuevoValor.ceroEsperado = true;
        resultado.set(periodo, nuevoValor);
      }
    }
  });

  return resultado;
};

/**
 * Determina si un comportamiento detectado debe marcarse como anomalía.
 * @param analisis Resultado del análisis por periodo
 * @returns Verdadero si el comportamiento es anómalo
 */
export const esComportamientoAnomalo = (
  analisis: AnalisisPeriodoConsumo | null | undefined
): boolean => {
  if (!analisis) {
    return false;
  }
  return !COMPORTAMIENTOS_NO_ANOMALIA.has(analisis.comportamiento);
};
