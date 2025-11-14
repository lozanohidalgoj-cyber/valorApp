/**
 * Servicio de clasificación global de expedientes
 * Analiza toda la serie temporal de consumos y determina la clasificación general
 */

import type { ConsumoMensual, ResultadoClasificacionExpediente } from '../types';
import {
  esEstacional,
  contarCambiosPotencia,
  calcularTendenciaGlobal,
  verificarCambioPotenciaEnAnomalia,
} from './clasificador/helpers';
import { detectarRecuperaciones, encontrarInicioAnomalia } from './clasificador/detectores';

/**
 * 🌈 Análisis avanzado del patrón de mapa de calor
 * Detecta tipos de anomalías específicas
 * basándose en colores, tendencias y distribución temporal
 */
/* function analizarPatronMapaCalor(consumos: ConsumoMensual[]): {
  patronDetectado: string;
  justificacion: string;
  mostrarInicioAnomalia: boolean;
} {
  if (consumos.length < 3) {
    return {
      patronDetectado: 'datos_insuficientes',
      justificacion: 'Necesita al menos 3 periodos para análisis',
      mostrarInicioAnomalia: false
    };
  }

  // Calcular baseline de primeros periodos (30% o máximo 12 meses)
  const periodoBaseline = Math.min(12, Math.floor(consumos.length * 0.3));
  const consumosBaseline = consumos.slice(0, periodoBaseline).map(c => c.consumoActivaTotal);
  const promedioBaseline = consumosBaseline.reduce((sum, val) => sum + val, 0) / consumosBaseline.length;
  
  // Analizar distribución de consumos por rangos de color
  let periodosVerdes = 0;     // Consumo normal (≥ 80% baseline)
  let periodosAmarillos = 0;  // Consumo moderado (50-80% baseline)
  let periodosNaranjas = 0;   // Consumo bajo (20-50% baseline)
  let periodosRojos = 0;      // Consumo crítico (< 20% baseline)
  let periodosConCambios = 0; // Cambios de potencia
  
  // Detectar patrones temporales
  let bloquesCeroConsecutivos = 0;
  let periodosSinAnomalias = 0;
  let descensoSostenidoDetectado = false;
  let cambiosPotenciaTotales = 0;

  consumos.forEach((consumo, indice) => {
    const porcentajeVsBaseline = (consumo.consumoActivaTotal / promedioBaseline) * 100;
    
    // Clasificar por color según porcentaje del baseline
    if (porcentajeVsBaseline >= 80) {
      periodosVerdes++;
    } else if (porcentajeVsBaseline >= 50) {
      periodosAmarillos++;
    } else if (porcentajeVsBaseline >= 20) {
      periodosNaranjas++;
    } else {
      periodosRojos++;
    }

    // Detectar cambios de potencia
    if (indice > 0) {
      const actual = consumo.potenciaPromedio;
      const anterior = consumos[indice - 1].potenciaPromedio;
      if (actual !== null && anterior !== null && Math.abs(actual - anterior) >= 0.5) {
        cambiosPotenciaTotales++;
        periodosConCambios++;
      }
    }

    // Detectar bloques de cero
    if (consumo.consumoActivaTotal === 0) {
      bloquesCeroConsecutivos++;
    }

    // Verificar si es periodo sin anomalías (comportamiento normal)
    if (porcentajeVsBaseline >= 75 && porcentajeVsBaseline <= 125) {
      periodosSinAnomalias++;
    }
  });

  // Detectar descenso sostenido: 3+ periodos rojos/naranjas consecutivos o distribuidos
  const periodosAnomalos = periodosNaranjas + periodosRojos;
  const porcentajeAnomalos = (periodosAnomalos / consumos.length) * 100;
  
  if (periodosAnomalos >= 3 && porcentajeAnomalos >= 30) {
    descensoSostenidoDetectado = true;
  }

  // 🎯 REGLAS DE CLASIFICACIÓN BASADAS EN PATRONES VISUALES

  // REGLA 1: No anomalía - 0 esperado (patrones estacionales de ceros)
  if (bloquesCeroConsecutivos >= 3 && periodosVerdes >= consumos.length * 0.6) {
    return {
      patronDetectado: 'No anomalía - 0 esperado',
      justificacion: `${bloquesCeroConsecutivos} periodos con cero esperado estacional, ${periodosVerdes} periodos normales`,
      mostrarInicioAnomalia: false
    };
  }

  // REGLA 2: Sin anomalía (mayoría verde/amarillo, patrón estable)
  if (periodosSinAnomalias >= consumos.length * 0.75 && periodosRojos === 0) {
    return {
      patronDetectado: 'Sin anomalía',
      justificacion: `${periodosSinAnomalias}/${consumos.length} periodos con comportamiento normal`,
      mostrarInicioAnomalia: false
    };
  }

  // REGLA 3: No objetivo por cambio de potencia (cambios frecuentes)
  if (cambiosPotenciaTotales >= 2 && periodosConCambios >= consumos.length * 0.3) {
    return {
      patronDetectado: 'No objetivo por cambio de potencia',
      justificacion: `${cambiosPotenciaTotales} cambios de potencia detectados, ${periodosConCambios} periodos afectados`,
      mostrarInicioAnomalia: false
    };
  }

  // REGLA 4: Descenso sostenido (patrón rojo/naranja dominante CON tendencia descendente)
  if (descensoSostenidoDetectado && (periodosRojos >= 2 || periodosNaranjas >= 3)) {
    return {
      patronDetectado: 'Descenso sostenido',
      justificacion: `${periodosAnomalos} periodos anómalos (${periodosRojos} críticos, ${periodosNaranjas} bajos), ${porcentajeAnomalos.toFixed(1)}% del total`,
      mostrarInicioAnomalia: true // ✅ ÚNICO QUE MUESTRA INICIO
    };
  }

  // REGLA 5: Anomalía indeterminada (patrones mixtos sin tendencia clara)
  return {
    patronDetectado: 'Anomalía indeterminada',
    justificacion: `Patrón mixto: ${periodosVerdes}V ${periodosAmarillos}A ${periodosNaranjas}N ${periodosRojos}R, sin tendencia clara`,
    mostrarInicioAnomalia: false
  };
} */

/**
 * Clasifica el expediente completo en una de las 5 categorías globales
 * @param consumosMensuales - Array de consumos mensuales ordenados cronológicamente
 * @returns Resultado de la clasificación global con detalles
 */
export const clasificarExpediente = (
  consumosMensuales: ConsumoMensual[]
): ResultadoClasificacionExpediente => {
  if (!consumosMensuales || consumosMensuales.length === 0) {
    return {
      clasificacion: 'Anomalía indeterminada',
      inicioPeriodoAnomalia: null,
      inicioFechaAnomalia: null,
      consumoInicio: null,
      consumoPrevio: null,
      variacionInicio: null,
      periodosConAnomalia: 0,
      cambiosPotencia: 0,
      periodosConCeroEsperado: 0,
      detalle: ['No hay datos suficientes para clasificar'],
      confianza: 0,
    };
  }

  // Si hay menos de 3 periodos, no hay suficiente histórico para detectar anomalías
  if (consumosMensuales.length < 3) {
    return {
      clasificacion: 'Anomalía indeterminada',
      inicioPeriodoAnomalia: null,
      inicioFechaAnomalia: null,
      consumoInicio: null,
      consumoPrevio: null,
      variacionInicio: null,
      periodosConAnomalia: 0,
      cambiosPotencia: 0,
      periodosConCeroEsperado: 0,
      detalle: [
        `Solo ${consumosMensuales.length} periodo(s) disponible(s)`,
        'Se necesitan al menos 3 periodos para establecer un patrón de referencia',
      ],
      confianza: 0,
    };
  }

  const detalle: string[] = [];
  let confianza = 0;

  // 1. CONTAR ESTADÍSTICAS GENERALES
  const totalPeriodos = consumosMensuales.length;
  const periodosConCeroEsperado = consumosMensuales.filter(
    (c) => c.consumoActivaTotal <= 5 && esEstacional(c.mes)
  ).length;

  const cambiosPotencia = contarCambiosPotencia(consumosMensuales);

  // Anomalías por tipo de comportamiento
  // IMPORTANTE: Ignorar los primeros 2 periodos (índices 0 y 1) porque no tienen histórico suficiente
  const periodosConDescensoFuerte = consumosMensuales
    .slice(2) // Saltar los primeros 2 periodos
    .filter((c) => c.motivosAnomalia.includes('variacion_consumo_activa')).length;

  const periodosConDescensoModerado = consumosMensuales
    .slice(2) // Saltar los primeros 2 periodos
    .filter(
      (c) => c.tipoVariacion === 'descenso' && c.variacionPorcentual && c.variacionPorcentual <= -20
    ).length;

  const periodosConAnomalia = periodosConDescensoFuerte + periodosConDescensoModerado;

  // 2. CALCULAR ESTADÍSTICAS GLOBALES (TODO EL HISTÓRICO)
  const consumosTotales = consumosMensuales.map((c) => c.consumoActivaTotal);
  const promedioGlobal =
    consumosTotales.reduce((sum, val) => sum + val, 0) / consumosTotales.length;

  // Desviación estándar global
  const varianzaGlobal =
    consumosTotales.reduce((sum, val) => sum + Math.pow(val - promedioGlobal, 2), 0) /
    consumosTotales.length;
  const desviacionGlobal = Math.sqrt(varianzaGlobal);

  // Promedio histórico por mes (para comparar enero con enero, febrero con febrero, etc.)
  const promediosPorMes = new Map<number, number>();
  const acumuladosPorMes = new Map<number, { suma: number; cantidad: number }>();

  consumosMensuales.forEach((c) => {
    const actual = acumuladosPorMes.get(c.mes) ?? { suma: 0, cantidad: 0 };
    acumuladosPorMes.set(c.mes, {
      suma: actual.suma + c.consumoActivaTotal,
      cantidad: actual.cantidad + 1,
    });
  });

  acumuladosPorMes.forEach((valor, mes) => {
    promediosPorMes.set(mes, valor.suma / valor.cantidad);
  });

  // 3. ENCONTRAR INICIO DE ANOMALÍA usando análisis global
  // 2.5. ANALIZAR TENDENCIAS (≥3 descensos consecutivos / recuperación)
  const ordenados = [...consumosMensuales].sort((a, b) => a.año - b.año || a.mes - b.mes);
  const variaciones = ordenados.map((c) =>
    typeof c.variacionPorcentual === 'number' ? c.variacionPorcentual : null
  );
  let inicioBloqueDescenso = -1;
  let finBloqueDescenso = -1;
  let longitudBloque = 0;
  for (let i = 0; i < variaciones.length; i++) {
    const v = variaciones[i];
    if (v !== null && v < 0) {
      if (inicioBloqueDescenso === -1) inicioBloqueDescenso = i;
      finBloqueDescenso = i;
      longitudBloque++;
      if (longitudBloque >= 3) break;
    } else {
      inicioBloqueDescenso = -1;
      finBloqueDescenso = -1;
      longitudBloque = 0;
    }
  }
  let recuperacionConfirmada = false;
  if (longitudBloque >= 3) {
    const startEval = finBloqueDescenso + 1;
    for (let i = startEval; i < variaciones.length; i++) {
      const v = variaciones[i];
      if (v !== null && v >= 0) {
        const v1 = variaciones[i];
        const v2 = i + 1 < variaciones.length ? variaciones[i + 1] : null;
        if (v1 !== null && v1 > 0 && v2 !== null && v2 > 0) {
          recuperacionConfirmada = true;
        }
        break;
      }
    }
  }

  const inicioAnomalia = encontrarInicioAnomalia(
    consumosMensuales,
    promedioGlobal,
    desviacionGlobal,
    promediosPorMes
  );

  // 3.5. DETECTAR RECUPERACIONES (descensos temporales que luego se recuperaron)
  const periodoBaseline = Math.min(12, Math.floor(consumosMensuales.length * 0.3));
  const consumosBaseline = consumosMensuales
    .slice(0, periodoBaseline)
    .map((c) => c.consumoActivaTotal);
  const promedioBaseline =
    consumosBaseline.reduce((sum, val) => sum + val, 0) / consumosBaseline.length;

  const recuperaciones = detectarRecuperaciones(consumosMensuales, promedioBaseline);

  if (recuperaciones.length > 0) {
    // Agregar información de recuperaciones al detalle
    detalle.push(
      `[RECUPERACION] ${recuperaciones.length} periodo(s) con descenso temporal que se recuperó`
    );
    recuperaciones.forEach((r) => {
      detalle.push(
        `  • ${r.periodoDescenso}: ${r.consumoDescenso.toFixed(0)} kWh → ${r.periodoRecuperacion}: ${r.consumoRecuperacion.toFixed(0)} kWh (${r.variacionDescenso.toFixed(1)}%)`
      );
    });
  }

  // 4. ANÁLISIS DE TENDENCIA GLOBAL
  const tendenciaGlobal = calcularTendenciaGlobal(consumosMensuales);

  // 5. LÓGICA DE CLASIFICACIÓN (en orden de prioridad)

  // CASO 1: Todos los consumos son cero esperado (estacional)
  if (periodosConCeroEsperado === totalPeriodos) {
    confianza = 100;
    detalle.push(`Todos los ${totalPeriodos} periodos tienen consumo cero esperado`);
    detalle.push('Patrón consistente con uso estacional (ej: vivienda vacacional)');
    return {
      clasificacion: 'No anomalía - 0 esperado',
      inicioPeriodoAnomalia: null,
      inicioFechaAnomalia: null,
      consumoInicio: null,
      consumoPrevio: null,
      variacionInicio: null,
      periodosConAnomalia: 0,
      cambiosPotencia,
      periodosConCeroEsperado,
      detalle,
      confianza,
      periodosConRecuperacion: recuperaciones,
    };
  }

  // CASO 2: Mayoría de periodos con cero esperado (> 60%)
  if (periodosConCeroEsperado / totalPeriodos > 0.6) {
    confianza = 95;
    detalle.push(
      `${periodosConCeroEsperado} de ${totalPeriodos} periodos con consumo cero esperado (${Math.round((periodosConCeroEsperado / totalPeriodos) * 100)}%)`
    );
    detalle.push('Uso predominantemente estacional');
    return {
      clasificacion: 'No anomalía - 0 esperado',
      inicioPeriodoAnomalia: null,
      inicioFechaAnomalia: null,
      consumoInicio: null,
      consumoPrevio: null,
      variacionInicio: null,
      periodosConAnomalia: 0,
      cambiosPotencia,
      periodosConCeroEsperado,
      detalle,
      confianza,
      periodosConRecuperacion: recuperaciones,
    };
  }

  // CASO 2.5: PRIORIDAD MÁXIMA - Cambio de potencia significativo (> 0.5 kW) durante inicio de anomalía
  // Este caso debe verificarse ANTES que cualquier otra clasificación de anomalía
  if (cambiosPotencia > 0 && inicioAnomalia) {
    const cambioPotenciaEnAnomalia = verificarCambioPotenciaEnAnomalia(
      consumosMensuales,
      inicioAnomalia.indice
    );
    if (cambioPotenciaEnAnomalia) {
      confianza = 95;
      detalle.push(`Cambio de potencia detectado en periodo ${inicioAnomalia.periodo}`);
      detalle.push(`Variación de potencia: ${cambioPotenciaEnAnomalia.variacion.toFixed(2)} kW`);
      detalle.push('El descenso de consumo coincide con cambio de potencia contratada');
      detalle.push('[NOTA] No se considera anomalía - cambio contractual esperado');
      return {
        clasificacion: 'No objetivo por cambio de potencia',
        inicioPeriodoAnomalia: inicioAnomalia.periodo,
        inicioFechaAnomalia: new Date(inicioAnomalia.periodo + '-01'),
        consumoInicio: inicioAnomalia.consumo,
        consumoPrevio: inicioAnomalia.consumoPrevio,
        variacionInicio: inicioAnomalia.variacion,
        periodosConAnomalia,
        cambiosPotencia,
        periodosConCeroEsperado,
        detalle,
        confianza,
        periodosConRecuperacion: recuperaciones,
      };
    }
  }

  // CASO 3: Descenso sostenido
  // REGLA ACTUALIZADA (v3) – Descenso sostenido progresivo:
  // Detecta tanto descensos abruptos como graduales que muestran deterioro sostenido.
  // DEFINICIÓN MEJORADA:
  //   1. Existe inicio estimado (heurística O bloque de descensos) O
  //   2. Análisis de tendencia global muestra descenso significativo (promedio final < 70% promedio inicial)
  //   3. A partir del inicio: racha máxima consecutiva de periodos "bajos" >= RACHA_MINIMA O
  //      mayoría de periodos posteriores son bajos (>= 50%)
  //   4. Reducción media significativa respecto al promedio global
  //   5. "Bajo" = consumo <= FACTOR_CONSUMO_BAJO * promedioGlobal O zScore < ZSCORE_BAJO

  // NUEVA LÓGICA: Detectar descenso sostenido incluso sin inicio puntual claro
  const hayDescensoSostenido = inicioAnomalia || (longitudBloque >= 3 && !recuperacionConfirmada);

  // Análisis de tendencia global para descensos graduales
  const tercioInicial = Math.floor(consumosMensuales.length / 3);
  const tercioFinal = Math.floor((consumosMensuales.length * 2) / 3);

  const promedioInicial =
    tercioInicial > 0
      ? consumosMensuales
          .slice(0, tercioInicial)
          .reduce((sum, c) => sum + c.consumoActivaTotal, 0) / tercioInicial
      : promedioGlobal;

  const promedioFinal =
    consumosMensuales.length > tercioFinal
      ? consumosMensuales.slice(tercioFinal).reduce((sum, c) => sum + c.consumoActivaTotal, 0) /
        (consumosMensuales.length - tercioFinal)
      : promedioGlobal;

  const reduccionGlobal =
    promedioInicial > 0 ? ((promedioFinal - promedioInicial) / promedioInicial) * 100 : 0;

  // Detectar descenso sostenido por tendencia global (sin necesidad de inicio puntual)
  const hayDescensoGlobalSignificativo = reduccionGlobal <= -30; // Reducción >= 30% entre inicio y final

  if (hayDescensoSostenido || hayDescensoGlobalSignificativo) {
    // Preferir inicio por tendencia si existe bloque de ≥3 descensos y NO hay recuperación confirmada
    const usarInicioPorTendencia = longitudBloque >= 3 && !recuperacionConfirmada;
    const inicioPeriodo = usarInicioPorTendencia
      ? ordenados[inicioBloqueDescenso].periodo
      : inicioAnomalia!.periodo;
    const indiceInicio = usarInicioPorTendencia ? inicioBloqueDescenso : inicioAnomalia!.indice;

    // ========= REGLA MEJORADA DE DESCENSO SOSTENIDO (v3) =========
    // Umbrales relajados para capturar descensos graduales pero sostenidos
    const UMBRALES_DESCENSO = {
      RACHA_MINIMA: 2, // Reducido de 3 a 2 para descensos graduales
      FACTOR_CONSUMO_BAJO: 0.6, // Aumentado de 0.5 a 0.6 (60% del promedio global)
      ZSCORE_BAJO: -1.0, // Relajado de -1.5 a -1.0
      PORCENTAJE_MIN_BAJOS_POST: 0.5, // Reducido de 0.6 a 0.5 (50% suficiente)
      UMBRAL_REDUCCION_PROMEDIO: -15, // Relajado de -20% a -15%
      UMBRAL_REDUCCION_MUY_FUERTE: -30, // Relajado de -40% a -30%
    } as const;

    // Si hay descenso global significativo, usar toda la serie desde el primer descenso detectado
    const indiceInicioAnalisis =
      hayDescensoGlobalSignificativo && !hayDescensoSostenido
        ? Math.max(0, tercioInicial) // Empezar desde el primer tercio si es descenso global
        : indiceInicio;

    const inicioPeriodoFinal =
      hayDescensoGlobalSignificativo && !hayDescensoSostenido
        ? tercioInicial < consumosMensuales.length
          ? consumosMensuales[tercioInicial].periodo
          : inicioPeriodo
        : inicioPeriodo;

    const periodosPost = consumosMensuales.slice(indiceInicioAnalisis);
    const consumosDespuesAnomalia = periodosPost.map((c) => c.consumoActivaTotal);
    const promedioDespuesAnomalia =
      consumosDespuesAnomalia.reduce((s, v) => s + v, 0) / consumosDespuesAnomalia.length;
    const variacionVsGlobal = ((promedioDespuesAnomalia - promedioGlobal) / promedioGlobal) * 100;

    const bajosFlags = periodosPost.map((c) => {
      const z =
        desviacionGlobal > 0 ? (c.consumoActivaTotal - promedioGlobal) / desviacionGlobal : 0;
      return (
        c.consumoActivaTotal <= promedioGlobal * UMBRALES_DESCENSO.FACTOR_CONSUMO_BAJO ||
        z < UMBRALES_DESCENSO.ZSCORE_BAJO
      );
    });

    // Calcular racha máxima consecutiva de "bajos"
    let rachaMax = 0;
    let rachaActual = 0;
    bajosFlags.forEach((esBajo) => {
      if (esBajo) {
        rachaActual += 1;
        if (rachaActual > rachaMax) rachaMax = rachaActual;
      } else {
        rachaActual = 0;
      }
    });

    const totalBajos = bajosFlags.filter(Boolean).length;
    const porcentajeBajos = totalBajos / bajosFlags.length;

    const cumpleRacha = rachaMax >= UMBRALES_DESCENSO.RACHA_MINIMA;
    const cumplePorcentaje = porcentajeBajos >= UMBRALES_DESCENSO.PORCENTAJE_MIN_BAJOS_POST;
    const cumpleReduccion = variacionVsGlobal <= UMBRALES_DESCENSO.UMBRAL_REDUCCION_PROMEDIO;
    const reduccionMuyFuerte = variacionVsGlobal <= UMBRALES_DESCENSO.UMBRAL_REDUCCION_MUY_FUERTE;

    // NUEVA LÓGICA: También aceptar si hay descenso global significativo
    const esDescensoSostenido =
      hayDescensoGlobalSignificativo || // Descenso global del 30%+ es suficiente
      (cumpleRacha && cumplePorcentaje && cumpleReduccion) ||
      (cumpleRacha && reduccionMuyFuerte) ||
      (porcentajeBajos >= 0.7 && cumpleReduccion); // 70%+ periodos bajos con reducción

    if (esDescensoSostenido) {
      confianza = hayDescensoGlobalSignificativo ? 95 : 90;
      detalle.push(`Inicio de anomalía detectado en: ${inicioPeriodoFinal}`);

      if (hayDescensoGlobalSignificativo) {
        detalle.push(`Descenso global progresivo detectado`);
        detalle.push(`Promedio inicial (primer tercio): ${promedioInicial.toFixed(0)} kWh`);
        detalle.push(`Promedio final (último tercio): ${promedioFinal.toFixed(0)} kWh`);
        detalle.push(`Reducción global: ${reduccionGlobal.toFixed(1)}%`);
      } else if (usarInicioPorTendencia) {
        detalle.push(
          `Regla de tendencia: ≥3 descensos consecutivos (recuperación confirmada: ${recuperacionConfirmada ? 'sí' : 'no'})`
        );
      } else if (inicioAnomalia) {
        detalle.push(`Consumo previo: ${inicioAnomalia.consumoPrevio?.toFixed(0)} kWh`);
        detalle.push(`Consumo al inicio: ${inicioAnomalia.consumo?.toFixed(0)} kWh`);
        detalle.push(`Variación inicial: ${inicioAnomalia.variacion?.toFixed(1)}%`);
      }

      detalle.push(
        `Racha baja máx: ${rachaMax} · Bajos: ${totalBajos}/${bajosFlags.length} (${(porcentajeBajos * 100).toFixed(0)}%)`
      );
      detalle.push(`Promedio global histórico: ${promedioGlobal.toFixed(0)} kWh`);
      detalle.push(`Promedio desde inicio de anomalía: ${promedioDespuesAnomalia.toFixed(0)} kWh`);
      detalle.push(`Reducción vs. promedio global: ${variacionVsGlobal.toFixed(1)}%`);

      return {
        clasificacion: 'Descenso sostenido',
        inicioPeriodoAnomalia: inicioPeriodoFinal,
        inicioFechaAnomalia: new Date(inicioPeriodoFinal + '-01'),
        consumoInicio:
          inicioAnomalia?.consumo ?? ordenados[indiceInicioAnalisis].consumoActivaTotal ?? null,
        consumoPrevio:
          inicioAnomalia?.consumoPrevio ??
          (indiceInicioAnalisis > 0
            ? ordenados[indiceInicioAnalisis - 1].consumoActivaTotal
            : null),
        variacionInicio: inicioAnomalia?.variacion ?? null,
        periodosConAnomalia,
        cambiosPotencia,
        periodosConCeroEsperado,
        detalle,
        confianza,
        periodosConRecuperacion: recuperaciones,
      };
    }
  }

  // CASO 5: Anomalía indeterminada
  // Solo si hay variaciones significativas pero no cumplen criterios de descenso sostenido
  // Verifica que al menos algunos periodos estén fuera del rango normal (±1.5 desviaciones)
  if (inicioAnomalia) {
    const periodosAnomalosVsGlobal = consumosMensuales
      .slice(2) // Ignorar primeros 2 periodos
      .filter((c) => {
        const zScore = (c.consumoActivaTotal - promedioGlobal) / desviacionGlobal;
        return Math.abs(zScore) > 1.5; // Fuera de rango normal
      }).length;

    // Es anomalía indeterminada si:
    // - Hay al menos 2 periodos anómalos respecto al promedio global
    // - Pero NO cumple criterios de descenso sostenido
    if (periodosAnomalosVsGlobal >= 2) {
      // 🔍 VERIFICAR SI HAY CAMBIO DE POTENCIA (última verificación por si no se detectó antes)
      const cambioPotenciaEnAnomalia = verificarCambioPotenciaEnAnomalia(
        consumosMensuales,
        inicioAnomalia.indice
      );

      if (cambioPotenciaEnAnomalia) {
        confianza = 95;
        detalle.push(`Cambio de potencia detectado en periodo ${inicioAnomalia.periodo}`);
        detalle.push(`Variación de potencia: ${cambioPotenciaEnAnomalia.variacion.toFixed(2)} kW`);
        detalle.push('Anomalía indeterminada coincide con cambio de potencia contratada');
        detalle.push('[NOTA] Se reclasifica como No objetivo por cambio de potencia');
        return {
          clasificacion: 'No objetivo por cambio de potencia',
          inicioPeriodoAnomalia: inicioAnomalia.periodo,
          inicioFechaAnomalia: new Date(inicioAnomalia.periodo + '-01'),
          consumoInicio: inicioAnomalia.consumo,
          consumoPrevio: inicioAnomalia.consumoPrevio,
          variacionInicio: inicioAnomalia.variacion,
          periodosConAnomalia: periodosAnomalosVsGlobal,
          cambiosPotencia,
          periodosConCeroEsperado,
          detalle,
          confianza,
          periodosConRecuperacion: recuperaciones,
        };
      }

      confianza = 70;
      detalle.push(`${periodosAnomalosVsGlobal} periodos fuera del rango normal de consumo`);
      detalle.push(`Promedio global: ${promedioGlobal.toFixed(0)} kWh`);
      detalle.push(
        `Rango normal: ${(promedioGlobal - 1.5 * desviacionGlobal).toFixed(0)} - ${(promedioGlobal + 1.5 * desviacionGlobal).toFixed(0)} kWh`
      );
      detalle.push('Patrón de consumo irregular sin tendencia sostenida clara');

      return {
        clasificacion: 'Anomalía indeterminada',
        inicioPeriodoAnomalia: inicioAnomalia?.periodo || null,
        inicioFechaAnomalia: inicioAnomalia ? new Date(inicioAnomalia.periodo + '-01') : null,
        consumoInicio: inicioAnomalia?.consumo || null,
        consumoPrevio: inicioAnomalia?.consumoPrevio || null,
        variacionInicio: inicioAnomalia?.variacion || null,
        periodosConAnomalia: periodosAnomalosVsGlobal,
        cambiosPotencia,
        periodosConCeroEsperado,
        detalle,
        confianza,
        periodosConRecuperacion: recuperaciones,
      };
    }
  }

  // CASO NUEVO: Consumo bajo con picos (muchos periodos muy bajos y algunos picos aislados)
  // Definición:
  // - ≥50% de los periodos con consumo <= 40% del promedioGlobal
  // - Al menos 2 picos (consumo >= 140% del promedioGlobal)
  // - No clasificado ya como descenso sostenido
  const consumosBajos = consumosMensuales.filter(
    (c) => c.consumoActivaTotal <= promedioGlobal * 0.4
  ).length;
  const picosAltos = consumosMensuales.filter(
    (c) => c.consumoActivaTotal >= promedioGlobal * 1.4
  ).length;
  const cumplePatronBajoConPicos =
    consumosBajos >= totalPeriodos * 0.5 && picosAltos >= 2 && consumosMensuales.length >= 6;

  if (cumplePatronBajoConPicos) {
    confianza = 80;
    detalle.push(
      `Patrón mixto: ${consumosBajos} periodos muy bajos y ${picosAltos} picos altos respecto a promedio ${promedioGlobal.toFixed(0)} kWh`
    );
    const primerBajo = consumosMensuales.find((c) => c.consumoActivaTotal <= promedioGlobal * 0.4);
    return {
      clasificacion: 'Consumo bajo con picos',
      inicioPeriodoAnomalia: primerBajo ? primerBajo.periodo : null,
      inicioFechaAnomalia: primerBajo ? new Date(primerBajo.periodo + '-01') : null,
      consumoInicio: primerBajo ? primerBajo.consumoActivaTotal : null,
      consumoPrevio: null,
      variacionInicio: null,
      periodosConAnomalia: consumosBajos + picosAltos,
      cambiosPotencia,
      periodosConCeroEsperado,
      detalle,
      confianza,
    };
  }

  // CASO 6: Anomalía indeterminada (comportamiento sin patrones claros de anomalía)
  confianza = 95;
  detalle.push('No se detectaron anomalías significativas con patrón claro');
  detalle.push(`${totalPeriodos} periodos analizados - comportamiento indeterminado`);

  if (tendenciaGlobal > 0) {
    detalle.push(`Tendencia al alza: +${tendenciaGlobal.toFixed(0)} kWh/mes`);
  } else if (tendenciaGlobal < 0 && tendenciaGlobal > -50) {
    detalle.push(`Tendencia descendente leve: ${tendenciaGlobal.toFixed(0)} kWh/mes`);
  } else {
    detalle.push('Consumo estable');
  }

  return {
    clasificacion: 'Anomalía indeterminada',
    inicioPeriodoAnomalia: null,
    inicioFechaAnomalia: null,
    consumoInicio: null,
    consumoPrevio: null,
    variacionInicio: null,
    periodosConAnomalia: 0,
    cambiosPotencia,
    periodosConCeroEsperado,
    detalle,
    confianza,
    periodosConRecuperacion: recuperaciones,
  };
};

// ==================== FUNCIONES AUXILIARES ====================
// Las funciones auxiliares se han movido a:
// - ./clasificador/helpers.ts: esEstacional, contarCambiosPotencia, calcularTendenciaGlobal, verificarCambioPotenciaEnAnomalia
// - ./clasificador/detectores.ts: detectarRecuperaciones, encontrarInicioAnomalia
