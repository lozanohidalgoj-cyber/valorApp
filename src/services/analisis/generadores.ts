/**
 * Funciones generadoras de vistas de análisis (anual y mensual)
 */
import type { DerivacionData, ConsumoAnual, ConsumoMensual } from '../../types';
import {
  convertirNumeroEspañol,
  extraerAñoDeFormato,
  extraerMesDeFormato,
  calcularDiasEntreFechas,
} from '../../utils';
import {
  calcularZScore,
  calcularIndiceEstacional,
  calcularTendencia3M,
  calcularDiasDesdeAnomalia,
  calcularRatioConsumoPotencia,
  calcularCoeficienteVariacion,
} from './calculosEstadisticos';

/**
 * Genera la vista anual con todas las métricas del Excel
 * Calcula: Suma Consumo Activa, Máx Maxímetro, Periodos facturados,
 * Suma de días, Promedio consumo por día
 * @param datos - Array de registros de derivación individual
 * @returns Array de consumos anuales con todas las métricas calculadas
 */
export const generarVistaAnual = (datos: DerivacionData[]): ConsumoAnual[] => {
  const datosPorAño: { [año: number]: DerivacionData[] } = {};

  // Agrupar por año
  datos.forEach((registro) => {
    const año = extraerAñoDeFormato(registro['Fecha desde']);
    if (año > 0) {
      if (!datosPorAño[año]) {
        datosPorAño[año] = [];
      }
      datosPorAño[año].push(registro);
    }
  });

  // Calcular métricas por año
  const consumosPorAño = Object.keys(datosPorAño)
    .map(Number)
    .sort((a, b) => a - b)
    .map((año) => {
      const registrosAño = datosPorAño[año];

      // 1. Suma Consumo Activa (P1 + P2 + P3)
      const sumaConsumoActiva = registrosAño.reduce((suma, registro) => {
        const p1 = convertirNumeroEspañol(registro['Consumo P1/punta']);
        const p2 = convertirNumeroEspañol(registro['Consumo P2/llano']);
        const p3 = convertirNumeroEspañol(registro['Consumo P3/valle']);
        return suma + p1 + p2 + p3;
      }, 0);

      // 2. Máx de Maxímetro (mayor valor de todos los periodos)
      const maxMaximetro = registrosAño.reduce((max, registro) => {
        const maxP1 = convertirNumeroEspañol(registro['Maxímetro P1/Punta']);
        const maxP2 = convertirNumeroEspañol(registro['Maxímetro P2/Llano']);
        const maxP3 = convertirNumeroEspañol(registro['Maxímetro P3/Valle']);
        const maxP4 = convertirNumeroEspañol(registro['Maxímetro P4']);
        const maxP5 = convertirNumeroEspañol(registro['Maxímetro P5']);
        const maxP6 = convertirNumeroEspañol(registro['Maxímetro P6']);
        const maxActual = Math.max(maxP1, maxP2, maxP3, maxP4, maxP5, maxP6);
        return Math.max(max, maxActual);
      }, 0);

      // 3. Periodos facturados (número de facturas)
      const periodosFacturados = registrosAño.length;

      // 4. Suma de Días
      const sumaDias = registrosAño.reduce((suma, registro) => {
        const dias = calcularDiasEntreFechas(registro['Fecha desde'], registro['Fecha hasta']);
        return suma + dias;
      }, 0);

      // 5. Promedio consumo por día
      const promedioConsumoPorDia = sumaDias > 0 ? sumaConsumoActiva / sumaDias : 0;

      return {
        año,
        sumaConsumoActiva,
        maxMaximetro,
        periodosFacturados,
        sumaDias,
        promedioConsumoPorDia,
      };
    });

  return consumosPorAño;
};

/**
 * Genera la comparativa mensual con detección de anomalías
 * Detecta variaciones > 40% como anomalías
 * @param datos - Array de registros de derivación individual
 * @returns Array de consumos mensuales con detección de anomalías
 */
export const generarComparativaMensual = (
  datos: DerivacionData[]
): {
  comparativa: ConsumoMensual[];
  detalles: Record<string, DerivacionData[]>;
} => {
  const datosPorMes: Record<
    string,
    {
      registros: DerivacionData[];
      sumaConsumoP123: number;
      sumaConsumoActiva: number;
      sumaPromedioActiva: number;
      sumaMaximetro: number;
      sumaEnergiaReconstruida: number;
      sumaDias: number;
      sumaPotencia: number;
      registrosPotencia: number;
      tieneConsumoActiva: boolean;
      tienePromedioActiva: boolean;
      tieneEnergiaReconstruida: boolean;
    }
  > = {};

  // Agrupar por periodo (YYYY-MM)
  datos.forEach((registro) => {
    const año = extraerAñoDeFormato(registro['Fecha desde']);
    const mes = extraerMesDeFormato(registro['Fecha desde']);
    if (año > 0 && mes > 0) {
      const periodo = `${año}-${mes.toString().padStart(2, '0')}`;
      if (!datosPorMes[periodo]) {
        datosPorMes[periodo] = {
          registros: [],
          sumaConsumoP123: 0,
          sumaConsumoActiva: 0,
          sumaPromedioActiva: 0,
          sumaMaximetro: 0,
          sumaEnergiaReconstruida: 0,
          sumaDias: 0,
          sumaPotencia: 0,
          registrosPotencia: 0,
          tieneConsumoActiva: false,
          tienePromedioActiva: false,
          tieneEnergiaReconstruida: false,
        };
      }

      const entrada = datosPorMes[periodo];
      entrada.registros.push(registro);

      const consumoP1 = convertirNumeroEspañol(registro['Consumo P1/punta']);
      const consumoP2 = convertirNumeroEspañol(registro['Consumo P2/llano']);
      const consumoP3 = convertirNumeroEspañol(registro['Consumo P3/valle']);
      entrada.sumaConsumoP123 += consumoP1 + consumoP2 + consumoP3;

      const valorConsumoActiva = convertirNumeroEspañol(registro['Consumo Activa']);
      if (
        Object.prototype.hasOwnProperty.call(registro, 'Consumo Activa') &&
        registro['Consumo Activa'] !== '' &&
        registro['Consumo Activa'] !== null &&
        registro['Consumo Activa'] !== undefined
      ) {
        entrada.sumaConsumoActiva += valorConsumoActiva;
        entrada.tieneConsumoActiva = true;
      }

      const valorPromedioActiva = convertirNumeroEspañol(registro['Promedio Activa']);
      if (
        Object.prototype.hasOwnProperty.call(registro, 'Promedio Activa') &&
        registro['Promedio Activa'] !== '' &&
        registro['Promedio Activa'] !== null &&
        registro['Promedio Activa'] !== undefined
      ) {
        entrada.sumaPromedioActiva += valorPromedioActiva;
        entrada.tienePromedioActiva = true;
      }

      const maximetroCampo = convertirNumeroEspañol(registro['Maxímetro']);
      const maximetroDerivado = Math.max(
        convertirNumeroEspañol(registro['Maxímetro P1/Punta']),
        convertirNumeroEspañol(registro['Maxímetro P2/Llano']),
        convertirNumeroEspañol(registro['Maxímetro P3/Valle']),
        convertirNumeroEspañol(registro['Maxímetro P4']),
        convertirNumeroEspañol(registro['Maxímetro P5']),
        convertirNumeroEspañol(registro['Maxímetro P6'])
      );
      entrada.sumaMaximetro += maximetroCampo > 0 ? maximetroCampo : maximetroDerivado;

      const energiaReconstruida = convertirNumeroEspañol(
        registro['A + B + C'] ?? registro['Energía Total Reconstruida']
      );
      const tieneEnergiaReconstruida =
        (Object.prototype.hasOwnProperty.call(registro, 'A + B + C') &&
          registro['A + B + C'] !== '' &&
          registro['A + B + C'] !== null &&
          registro['A + B + C'] !== undefined) ||
        (Object.prototype.hasOwnProperty.call(registro, 'Energía Total Reconstruida') &&
          registro['Energía Total Reconstruida'] !== '' &&
          registro['Energía Total Reconstruida'] !== null &&
          registro['Energía Total Reconstruida'] !== undefined);

      if (tieneEnergiaReconstruida) {
        entrada.sumaEnergiaReconstruida += energiaReconstruida;
        entrada.tieneEnergiaReconstruida = true;
      }

      const diasDeclarados = convertirNumeroEspañol(registro['Días']);
      const diasCalculados = calcularDiasEntreFechas(
        registro['Fecha desde'],
        registro['Fecha hasta']
      );
      entrada.sumaDias += diasDeclarados > 0 ? diasDeclarados : diasCalculados;

      if (
        Object.prototype.hasOwnProperty.call(registro, 'Potencia') &&
        registro['Potencia'] !== '' &&
        registro['Potencia'] !== null &&
        registro['Potencia'] !== undefined
      ) {
        const potenciaDeclarada = convertirNumeroEspañol(registro['Potencia']);
        if (!Number.isNaN(potenciaDeclarada)) {
          entrada.sumaPotencia += potenciaDeclarada;
          entrada.registrosPotencia += 1;
        }
      }
    }
  });

  // Ordenar periodos cronológicamente
  const periodosOrdenados = Object.keys(datosPorMes).sort();

  const obtenerMetricas = (agrupado: (typeof datosPorMes)[string]) => {
    const consumoActivaTotal = agrupado.tieneConsumoActiva
      ? agrupado.sumaConsumoActiva
      : agrupado.sumaConsumoP123;

    const promedioActivaTotal = agrupado.tienePromedioActiva
      ? agrupado.sumaPromedioActiva
      : consumoActivaTotal;

    const energiaReconstruidaTotal = agrupado.tieneEnergiaReconstruida
      ? agrupado.sumaEnergiaReconstruida
      : agrupado.sumaConsumoP123;

    return {
      consumoActivaTotal,
      promedioActivaTotal,
      energiaReconstruidaTotal,
    };
  };

  // Calcular métricas por mes
  const comparativaMensual: ConsumoMensual[] = periodosOrdenados.map((periodo, index) => {
    const agrupado = datosPorMes[periodo];
    const [año, mes] = periodo.split('-').map(Number);

    const metricasActuales = obtenerMetricas(agrupado);

    const consumoReferencia = metricasActuales.consumoActivaTotal;
    const dias = agrupado.sumaDias;
    // Calcular promedio diario usando días facturados reales
    const consumoPromedioDiario = dias > 0 ? consumoReferencia / dias : 0;
    const potenciaPromedio =
      agrupado.registrosPotencia > 0 ? agrupado.sumaPotencia / agrupado.registrosPotencia : null;

    let variacionPorcentual: number | null = null;
    let variacionPotenciaPorcentual: number | null = null;
    let tipoVariacion: 'aumento' | 'descenso' | 'estable' | null = null;
    const motivosAnomalia: string[] = [];

    if (index > 0) {
      const periodoAnterior = periodosOrdenados[index - 1];
      const agregadoAnterior = datosPorMes[periodoAnterior];
      const metricasAnteriores = obtenerMetricas(agregadoAnterior);
      const consumoAnterior = metricasAnteriores.consumoActivaTotal;

      // Calcular variación porcentual usando CONSUMO TOTAL (no promedio diario)
      // Esto es consistente con la lógica de detección de anomalías
      if (consumoAnterior > 0) {
        variacionPorcentual = ((consumoReferencia - consumoAnterior) / consumoAnterior) * 100;

        if (variacionPorcentual > 5) {
          tipoVariacion = 'aumento';
        } else if (variacionPorcentual < -5) {
          tipoVariacion = 'descenso';
        } else {
          tipoVariacion = 'estable';
        }

        if (Math.abs(variacionPorcentual) >= 40) {
          motivosAnomalia.push('variacion_consumo_activa');
        }

        const variacionPromActiva =
          metricasAnteriores.promedioActivaTotal > 0
            ? ((metricasActuales.promedioActivaTotal - metricasAnteriores.promedioActivaTotal) /
                metricasAnteriores.promedioActivaTotal) *
              100
            : null;
        if (variacionPromActiva !== null && Math.abs(variacionPromActiva) >= 40) {
          motivosAnomalia.push('variacion_promedio_activa');
        }

        const variacionEnergia =
          metricasAnteriores.energiaReconstruidaTotal > 0
            ? ((metricasActuales.energiaReconstruidaTotal -
                metricasAnteriores.energiaReconstruidaTotal) /
                metricasAnteriores.energiaReconstruidaTotal) *
              100
            : null;
        if (variacionEnergia !== null && Math.abs(variacionEnergia) >= 40) {
          motivosAnomalia.push('variacion_energia_reconstruida');
        }

        const variacionMaximetro =
          agregadoAnterior.sumaMaximetro > 0
            ? ((agrupado.sumaMaximetro - agregadoAnterior.sumaMaximetro) /
                agregadoAnterior.sumaMaximetro) *
              100
            : null;
        if (variacionMaximetro !== null && Math.abs(variacionMaximetro) >= 40) {
          motivosAnomalia.push('variacion_maximetro');
        }
      }

      const potenciaAnterior =
        agregadoAnterior.registrosPotencia > 0
          ? agregadoAnterior.sumaPotencia / agregadoAnterior.registrosPotencia
          : null;

      if (potenciaPromedio !== null && potenciaAnterior !== null && potenciaAnterior !== 0) {
        variacionPotenciaPorcentual =
          ((potenciaPromedio - potenciaAnterior) / potenciaAnterior) * 100;
      }
    }

    // ==== NUEVAS MÉTRICAS ADICIONALES ====
    // Necesitamos calcularlas después del bucle principal para tener acceso a todos los datos
    // Por ahora retornamos null, se calcularán en un segundo paso
    const zScore: number | null = null;
    const indiceEstacional: number | null = null;
    const tendencia3M: number | null = null;
    const diasDesdeAnomalia: number | null = null;
    const ratioConsumoPotencia = calcularRatioConsumoPotencia(
      consumoReferencia,
      potenciaPromedio,
      dias
    );
    const coeficienteVariacion: number | null = null;

    return {
      año,
      mes,
      periodo,
      consumoTotal: consumoReferencia,
      consumoActivaTotal: metricasActuales.consumoActivaTotal,
      promedioActivaTotal: metricasActuales.promedioActivaTotal,
      maximetroTotal: agrupado.sumaMaximetro,
      energiaReconstruidaTotal: metricasActuales.energiaReconstruidaTotal,
      consumoPromedioDiario,
      potenciaPromedio,
      variacionPotenciaPorcentual,
      dias,
      variacionPorcentual,
      esAnomalia: motivosAnomalia.length > 0,
      tipoVariacion,
      motivosAnomalia,
      registros: agrupado.registros.length,
      zScore,
      indiceEstacional,
      tendencia3M,
      diasDesdeAnomalia,
      ratioConsumoPotencia,
      coeficienteVariacion,
    };
  });

  // ==== SEGUNDO PASO: CALCULAR MÉTRICAS QUE REQUIEREN TODA LA SERIE ====
  const consumosTotales = comparativaMensual.map((c) => c.consumoActivaTotal);
  const coeficienteVariacionGlobal = calcularCoeficienteVariacion(consumosTotales);

  // Calcular promedios históricos por mes (para índice estacional)
  const promediosPorMes = new Map<number, number>();
  const acumuladosPorMes = new Map<number, { suma: number; cantidad: number }>();

  comparativaMensual.forEach((c) => {
    const actual = acumuladosPorMes.get(c.mes) ?? { suma: 0, cantidad: 0 };
    acumuladosPorMes.set(c.mes, {
      suma: actual.suma + c.consumoActivaTotal,
      cantidad: actual.cantidad + 1,
    });
  });

  acumuladosPorMes.forEach((valor, mes) => {
    if (valor.cantidad > 1) {
      // Solo si hay al menos 2 años
      promediosPorMes.set(mes, valor.suma / valor.cantidad);
    }
  });

  // Actualizar cada registro con las métricas calculadas
  comparativaMensual.forEach((registro, index) => {
    registro.zScore = calcularZScore(consumosTotales, index);
    registro.indiceEstacional = calcularIndiceEstacional(
      registro.consumoActivaTotal,
      promediosPorMes.get(registro.mes) ?? null
    );
    registro.tendencia3M = calcularTendencia3M(consumosTotales, index);
    registro.diasDesdeAnomalia = calcularDiasDesdeAnomalia(comparativaMensual, index);
    registro.coeficienteVariacion = coeficienteVariacionGlobal;
  });

  const detallesPorPeriodo: Record<string, DerivacionData[]> = {};
  periodosOrdenados.forEach((periodo) => {
    detallesPorPeriodo[periodo] = datosPorMes[periodo].registros;
  });

  return { comparativa: comparativaMensual, detalles: detallesPorPeriodo };
};
