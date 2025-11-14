/**
 * 📊 Servicio dataService
 *
 * Transformación, agrupación y procesamiento de datos de consumo energético.
 */

import type {
  ConsumoEnergetico,
  ConsumoPeriodo,
  EstadisticasConsumo,
  ComparativaPeriodos,
} from '../types';
import {
  obtenerPeriodo,
  calcularPromedio,
  calcularMediana,
  calcularDesviacionEstandar,
} from '../utils';

/**
 * Agrupa consumos por periodo (mes/año)
 */
export const agruparPorPeriodo = (consumos: ConsumoEnergetico[]): ConsumoPeriodo[] => {
  const agrupado = consumos.reduce(
    (acc, consumo) => {
      const periodo = obtenerPeriodo(consumo.fecha);

      if (!acc[periodo]) {
        acc[periodo] = {
          periodo,
          consumoTotal: 0,
          consumoPromedio: 0,
          dias: 0,
        };
      }

      acc[periodo].consumoTotal += consumo.consumo;
      acc[periodo].dias += 1;

      return acc;
    },
    {} as Record<string, ConsumoPeriodo>
  );

  return Object.values(agrupado)
    .map((p) => ({
      ...p,
      consumoPromedio: p.consumoTotal / p.dias,
    }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
};

/**
 * Filtra consumos por rango de fechas
 */
export const filtrarPorRangoFechas = (
  consumos: ConsumoEnergetico[],
  fechaInicio: string,
  fechaFin: string
): ConsumoEnergetico[] => {
  const inicio = new Date(fechaInicio).getTime();
  const fin = new Date(fechaFin).getTime();

  return consumos.filter((c) => {
    const fecha = new Date(c.fecha).getTime();
    return fecha >= inicio && fecha <= fin;
  });
};

/**
 * Calcula estadísticas generales de consumo
 */
export const calcularEstadisticas = (consumos: ConsumoEnergetico[]): EstadisticasConsumo => {
  if (consumos.length === 0) {
    return {
      promedio: 0,
      mediana: 0,
      desviacionEstandar: 0,
      minimo: 0,
      maximo: 0,
      totalRegistros: 0,
    };
  }

  const valores = consumos.map((c) => c.consumo);

  return {
    promedio: calcularPromedio(valores),
    mediana: calcularMediana(valores),
    desviacionEstandar: calcularDesviacionEstandar(valores),
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
    totalRegistros: consumos.length,
  };
};

/**
 * Compara dos periodos de consumo
 */
export const compararPeriodos = (
  periodoAnterior: ConsumoPeriodo,
  periodoActual: ConsumoPeriodo
): ComparativaPeriodos => {
  const diferencia = periodoActual.consumoTotal - periodoAnterior.consumoTotal;
  const porcentaje = (diferencia / periodoAnterior.consumoTotal) * 100;

  let tendencia: 'aumento' | 'descenso' | 'estable';
  if (Math.abs(porcentaje) < 5) {
    tendencia = 'estable';
  } else if (porcentaje > 0) {
    tendencia = 'aumento';
  } else {
    tendencia = 'descenso';
  }

  return {
    periodoAnterior,
    periodoActual,
    diferenciaAbsoluta: diferencia,
    diferenciaPorcentual: porcentaje,
    tendencia,
  };
};

/**
 * Limpia datos inválidos de consumo
 */
export const limpiarDatos = (consumos: ConsumoEnergetico[]): ConsumoEnergetico[] => {
  return consumos.filter((c) => {
    if (!c.id || !c.fecha || c.consumo === undefined) return false;

    const fecha = new Date(c.fecha);
    if (isNaN(fecha.getTime())) return false;

    if (typeof c.consumo !== 'number' || isNaN(c.consumo)) return false;

    return true;
  });
};

/**
 * Elimina duplicados basándose en fecha y contador
 */
export const eliminarDuplicados = (consumos: ConsumoEnergetico[]): ConsumoEnergetico[] => {
  const vistos = new Set<string>();

  return consumos.filter((c) => {
    const clave = `${c.fecha}-${c.numeroContador}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
};

/**
 * Convierte consumos a formato para gráficos
 */
export const prepararDatosGrafico = (consumosPorPeriodo: ConsumoPeriodo[]) => {
  return consumosPorPeriodo.map((p) => ({
    etiqueta: p.periodo,
    valor: p.consumoTotal,
    metadata: {
      promedio: p.consumoPromedio,
      dias: p.dias,
    },
  }));
};
