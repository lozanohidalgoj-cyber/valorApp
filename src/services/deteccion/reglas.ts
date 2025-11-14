/**
 * 📏 Reglas de Evaluación de Anomalías
 *
 * Funciones que implementan las 5 reglas principales de detección:
 * 1. Tendencia descendente sostenida (≥3 descensos consecutivos)
 * 2. Descenso brusco mes a mes (≥30%)
 * 3. Descenso sostenido sin recuperación (>10% durante 3+ meses)
 * 4. Variación anómala vs histórico (>20%)
 * 5. Consumo cero sospechoso
 */

import type { ConsumoMensual } from '../../types';
import type { ResultadoDeteccionInicio } from '../detectarInicioAnomaliaService';
import {
  detectarCicloFacturacion,
  obtenerConsumoNormalizadoMensual,
  calcularBaselineNormalizado,
  calcularPromedioHistoricoMes,
  calcularPromedioAnual,
  esCeroEsperado,
  detectarDescensoSostenidoSinRecuperacion,
  hayDescensobrusCo,
  getNombreMes,
  analizarTendencias,
} from './helpers';

/**
 * Evalúa REGLA 0: Tendencia descendente sostenida
 * @param comparativaOrdenada - Array de datos mensuales ordenados cronológicamente
 * @returns Array de anomalías detectadas por tendencia
 */
export const evaluarReglaTendencia = (
  comparativaOrdenada: ConsumoMensual[]
): ResultadoDeteccionInicio[] => {
  const resultados: ResultadoDeteccionInicio[] = [];
  const tendencia = analizarTendencias(comparativaOrdenada);

  if (tendencia.tieneBloqueDescenso && !tendencia.recuperacionConfirmada) {
    const periodoInicio = tendencia.periodoInicioBloque;
    const [anioInicio, mesInicio] = periodoInicio.split('-').map(Number);

    resultados.push({
      clasificacion: 'anomalia_detectada',
      mensaje: `Determinación del descenso en ${getNombreMes(mesInicio)} ${anioInicio}`,
      periodoInicio,
      periodoLegible: `${getNombreMes(mesInicio)} ${anioInicio}`,
      razon:
        'Tendencia descendente sostenida: ≥ 3 descensos consecutivos (variación mes a mes < 0)',
      confianza: 70,
      detalles: {
        tipo: 'tendencia_descendente_sostenida',
        inicioBloqueIndice: tendencia.inicioBloqueDescenso,
        finBloqueIndice: tendencia.finBloqueDescenso,
        longitudBloque: tendencia.longitudBloque,
        inicioRecuperacionIndice: tendencia.indiceInicioRecuperacion,
        recuperacionConfirmada: tendencia.recuperacionConfirmada,
      },
    });
  }

  return resultados;
};

/**
 * Evalúa REGLA 1: Descenso brusco mes a mes (≥30%)
 * @param comparativaOrdenada - Array de datos mensuales ordenados cronológicamente
 * @returns Array de anomalías detectadas por descenso brusco
 */
export const evaluarReglaDescensoBrusco = (
  comparativaOrdenada: ConsumoMensual[]
): ResultadoDeteccionInicio[] => {
  const resultados: ResultadoDeteccionInicio[] = [];
  const consumosNormalizados = comparativaOrdenada.map(obtenerConsumoNormalizadoMensual);

  for (let i = 1; i < comparativaOrdenada.length; i++) {
    const actual = comparativaOrdenada[i];
    const anterior = comparativaOrdenada[i - 1];
    const consumoAnteriorNormalizado = consumosNormalizados[i - 1];
    const consumoActualNormalizado = consumosNormalizados[i];

    if (
      !Number.isFinite(consumoAnteriorNormalizado) ||
      consumoAnteriorNormalizado <= 0 ||
      !Number.isFinite(consumoActualNormalizado) ||
      consumoActualNormalizado <= 0 ||
      !hayDescensobrusCo(consumoActualNormalizado, consumoAnteriorNormalizado)
    ) {
      continue;
    }

    const MESES_BASELINE_DESCENSO_BRUSCO_MIN = 3;
    const MESES_BASELINE_DESCENSO_BRUSCO_MAX = 6;
    const baseline = calcularBaselineNormalizado(
      consumosNormalizados,
      i,
      MESES_BASELINE_DESCENSO_BRUSCO_MIN,
      MESES_BASELINE_DESCENSO_BRUSCO_MAX
    );

    if (baseline === null || baseline <= 0) {
      continue;
    }

    const variacion =
      ((consumoActualNormalizado - consumoAnteriorNormalizado) / consumoAnteriorNormalizado) * 100;
    const variacionVsBaseline = ((consumoActualNormalizado - baseline) / baseline) * 100;
    const ciclo = detectarCicloFacturacion(actual.dias);

    resultados.push({
      clasificacion: 'anomalia_detectada',
      mensaje: `Determinación del descenso en ${getNombreMes(actual.mes)} ${actual.año}`,
      periodoInicio: actual.periodo,
      periodoLegible: `${getNombreMes(actual.mes)} ${actual.año}`,
      razon: `Descenso brusco >= 30% respecto mes anterior (normalizado por días facturados: ${variacion.toFixed(1)}%)`,
      confianza: 95,
      detalles: {
        tipo: 'descenso_brusco_mes_a_mes',
        variacionDetectada: variacion,
        variacionVsBaseline,
        umbral: -30,
        cicloFacturacion: ciclo,
        consumoAnteriorNormalizado,
        consumoActualNormalizado,
        baselineHistorial: baseline,
        diasAnterior: anterior.dias,
        diasActual: actual.dias,
      },
    });
  }

  return resultados;
};

/**
 * Evalúa REGLA 2: Descenso sostenido sin recuperación
 * @param comparativaOrdenada - Array de datos mensuales ordenados cronológicamente
 * @returns Array de anomalías detectadas por descenso sostenido
 */
export const evaluarReglaDescensoSostenido = (
  comparativaOrdenada: ConsumoMensual[]
): ResultadoDeteccionInicio[] => {
  const resultados: ResultadoDeteccionInicio[] = [];
  const descensosSostenidos = detectarDescensoSostenidoSinRecuperacion(comparativaOrdenada);

  // Procesar TODOS los descensos sostenidos encontrados
  for (const descensoSostenido of descensosSostenidos) {
    const {
      indiceInicio,
      duracionMeses,
      promedioBaseline,
      consumoNormalizadoInicio,
      consumoMinimoNormalizado,
      variacionInicioBaseline,
      variacionMinimaBaseline,
      umbralRecuperacion,
    } = descensoSostenido;

    const periodoInicio = comparativaOrdenada[indiceInicio];
    const promedioAnterior = calcularPromedioAnual(comparativaOrdenada, periodoInicio.año - 1);
    const variacionPromedio =
      promedioAnterior > 0
        ? ((consumoNormalizadoInicio - promedioAnterior) / promedioAnterior) * 100
        : variacionInicioBaseline;

    resultados.push({
      clasificacion: 'anomalia_detectada',
      mensaje: `Determinación del descenso en ${getNombreMes(periodoInicio.mes)} ${periodoInicio.año} (descenso sostenido ${duracionMeses} meses sin recuperación)`,
      periodoInicio: periodoInicio.periodo,
      periodoLegible: `${getNombreMes(periodoInicio.mes)} ${periodoInicio.año}`,
      razon: `Descenso sostenido > 10% durante ${duracionMeses} meses consecutivos SIN recuperación posterior`,
      confianza: 85,
      detalles: {
        tipo: 'descenso_sostenido_sin_recuperacion',
        variacionDetectada: variacionPromedio,
        umbral: -10,
        duracionMeses,
        huboRecuperacion: false,
        indiceInicio,
        umbralRecuperacion,
        consumoMinimoNormalizado,
        promedioBaseline,
        variacionInicioBaseline,
        variacionMinimaBaseline,
        consumoNormalizadoInicio,
      },
    });
  }

  return resultados;
};

/**
 * Evalúa REGLA 3: Variación anómala vs histórico
 * @param comparativaOrdenada - Array de datos mensuales ordenados cronológicamente
 * @returns Array de anomalías detectadas por variación histórica
 */
export const evaluarReglaVariacionHistorica = (
  comparativaOrdenada: ConsumoMensual[]
): ResultadoDeteccionInicio[] => {
  const resultados: ResultadoDeteccionInicio[] = [];
  const añoActual = Math.max(...comparativaOrdenada.map((c) => c.año));

  for (const registro of comparativaOrdenada.filter((c) => c.año === añoActual)) {
    const promedioHistorico = calcularPromedioHistoricoMes(
      comparativaOrdenada,
      registro.mes,
      añoActual
    );

    if (promedioHistorico === 0) continue;

    const consumoActualNormalizado = obtenerConsumoNormalizadoMensual(registro);
    const variacion = ((consumoActualNormalizado - promedioHistorico) / promedioHistorico) * 100;

    if (Math.abs(variacion) > 20) {
      const tipo = variacion < 0 ? 'Descenso' : 'Aumento';
      const ciclo = detectarCicloFacturacion(registro.dias);

      resultados.push({
        clasificacion: 'anomalia_detectada',
        mensaje: `Determinación del descenso en ${getNombreMes(registro.mes)} ${registro.año}`,
        periodoInicio: registro.periodo,
        periodoLegible: `${getNombreMes(registro.mes)} ${registro.año}`,
        razon: `${tipo} > 20% respecto al promedio histórico de ${getNombreMes(registro.mes)}`,
        confianza: 80,
        detalles: {
          tipo: 'variacion_historio_anual',
          variacionDetectada: variacion,
          historicoPromedio: promedioHistorico,
          umbral: 20,
          cicloFacturacion: ciclo,
          consumoActualNormalizado,
        },
      });
    }
  }

  return resultados;
};

/**
 * Evalúa REGLA 4: Consumo cero sospechoso
 * @param comparativaOrdenada - Array de datos mensuales ordenados cronológicamente
 * @returns Array de anomalías detectadas por consumo cero
 */
export const evaluarReglaConsumoCero = (
  comparativaOrdenada: ConsumoMensual[]
): ResultadoDeteccionInicio[] => {
  const resultados: ResultadoDeteccionInicio[] = [];

  for (const registro of comparativaOrdenada) {
    if (registro.consumoActivaTotal !== 0 || registro.registros <= 0) {
      continue;
    }

    const esEsperado = esCeroEsperado(comparativaOrdenada, registro.mes, registro.año);
    if (esEsperado) {
      continue;
    }

    const ciclo = detectarCicloFacturacion(registro.dias);

    resultados.push({
      clasificacion: 'anomalia_detectada',
      mensaje: `Determinación del descenso en ${getNombreMes(registro.mes)} ${registro.año} (consumo cero sospechoso)`,
      periodoInicio: registro.periodo,
      periodoLegible: `${getNombreMes(registro.mes)} ${registro.año}`,
      razon: 'Consumo cero registrado en mes donde nunca antes ocurrió',
      confianza: 90,
      detalles: {
        tipo: 'consumo_cero_sospechoso',
        cicloFacturacion: ciclo,
        registrosEnPeriodo: registro.registros,
      },
    });
  }

  return resultados;
};
