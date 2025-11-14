/**
 * 🔍 Servicio anomaliaService
 *
 * Detección de anomalías en datos de consumo energético,
 * identificando descensos, picos y patrones irregulares.
 */

import type { ConsumoPeriodo, Anomalia, TipoAnomalia, NivelSeveridad } from '../types';
import { calcularPromedio, calcularDesviacionEstandar, generarId } from '../utils';

const UMBRALES = {
  DESCENSO_MINIMO: 15,
  DESCENSO_ABRUPTO: 30,
  CONSUMO_CERO: 5,
  FACTOR_DESVIACION: 2,
};

/**
 * Detecta anomalías en una serie de consumos por periodo
 */
export const detectarAnomalias = (consumosPorPeriodo: ConsumoPeriodo[]): Anomalia[] => {
  if (consumosPorPeriodo.length < 2) return [];

  const anomalias: Anomalia[] = [];
  const consumos = consumosPorPeriodo.map((c) => c.consumoTotal);
  const promedio = calcularPromedio(consumos);
  const desviacionEstandar = calcularDesviacionEstandar(consumos);

  consumosPorPeriodo.forEach((periodo, index) => {
    if (index === 0) return;

    const periodoAnterior = consumosPorPeriodo[index - 1];
    const variacion =
      ((periodo.consumoTotal - periodoAnterior.consumoTotal) / periodoAnterior.consumoTotal) * 100;

    if (variacion < -UMBRALES.DESCENSO_ABRUPTO) {
      anomalias.push(
        crearAnomalia(
          'descenso_abrupto',
          periodo,
          periodoAnterior.consumoTotal,
          periodo.consumoTotal,
          variacion,
          'alta'
        )
      );
    } else if (variacion < -UMBRALES.DESCENSO_MINIMO) {
      anomalias.push(
        crearAnomalia(
          'descenso_gradual',
          periodo,
          periodoAnterior.consumoTotal,
          periodo.consumoTotal,
          variacion,
          'media'
        )
      );
    }

    if (periodo.consumoTotal <= UMBRALES.CONSUMO_CERO) {
      anomalias.push(
        crearAnomalia('consumo_cero', periodo, promedio, periodo.consumoTotal, -100, 'critica')
      );
    }

    if (periodo.consumoTotal < 0) {
      anomalias.push(
        crearAnomalia('consumo_negativo', periodo, promedio, periodo.consumoTotal, -100, 'critica')
      );
    }

    const umbralSuperior = promedio + desviacionEstandar * UMBRALES.FACTOR_DESVIACION;
    if (periodo.consumoTotal > umbralSuperior) {
      anomalias.push(
        crearAnomalia('pico_anomalo', periodo, promedio, periodo.consumoTotal, variacion, 'media')
      );
    }
  });

  marcarPrimerasOcurrencias(anomalias);
  return anomalias;
};

/**
 * Crea un objeto de anomalía
 */
const crearAnomalia = (
  tipo: TipoAnomalia,
  periodo: ConsumoPeriodo,
  consumoEsperado: number,
  consumoReal: number,
  variacion: number,
  severidad: NivelSeveridad
): Anomalia => {
  const descripciones: Record<TipoAnomalia, string> = {
    descenso_abrupto: `Descenso abrupto del ${Math.abs(variacion).toFixed(1)}%.`,
    descenso_gradual: `Descenso gradual del ${Math.abs(variacion).toFixed(1)}%.`,
    consumo_cero: `Consumo prácticamente nulo (${consumoReal.toFixed(2)} kWh).`,
    consumo_negativo: `Consumo negativo detectado (${consumoReal.toFixed(2)} kWh).`,
    pico_anomalo: `Consumo anormalmente alto (${variacion.toFixed(1)}% sobre promedio).`,
  };

  return {
    id: generarId(),
    tipo,
    periodo: periodo.periodo,
    fechaDeteccion: new Date().toISOString(),
    severidad,
    variacionPorcentaje: variacion,
    consumoEsperado,
    consumoReal,
    descripcion: descripciones[tipo],
    esPrimeraOcurrencia: false,
  };
};

/**
 * Marca la primera ocurrencia de cada tipo de anomalía
 */
const marcarPrimerasOcurrencias = (anomalias: Anomalia[]): void => {
  const tiposEncontrados = new Set<TipoAnomalia>();

  anomalias.forEach((anomalia) => {
    if (!tiposEncontrados.has(anomalia.tipo)) {
      anomalia.esPrimeraOcurrencia = true;
      tiposEncontrados.add(anomalia.tipo);
    }
  });
};

/**
 * Filtra anomalías por nivel de severidad
 */
export const filtrarPorSeveridad = (
  anomalias: Anomalia[],
  severidad: NivelSeveridad
): Anomalia[] => {
  const niveles: Record<NivelSeveridad, number> = {
    baja: 1,
    media: 2,
    alta: 3,
    critica: 4,
  };

  const nivelMinimo = niveles[severidad];
  return anomalias.filter((a) => niveles[a.severidad] >= nivelMinimo);
};

/**
 * Obtiene la primera anomalía de una serie
 */
export const obtenerPrimeraAnomalia = (anomalias: Anomalia[]): Anomalia | undefined => {
  return anomalias.find((a) => a.esPrimeraOcurrencia);
};
