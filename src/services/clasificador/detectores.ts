/**
 * Funciones de detección para el clasificador de expedientes
 */
import type { ConsumoMensual } from '../../types';

/**
 * Detecta periodos donde hubo un descenso SOSTENIDO (múltiples periodos)
 * pero luego el consumo se recuperó a niveles normales
 */
export function detectarRecuperaciones(
  consumos: ConsumoMensual[],
  promedioBaseline: number
): Array<{
  periodoDescenso: string;
  periodoRecuperacion: string;
  consumoDescenso: number;
  consumoRecuperacion: number;
  variacionDescenso: number;
}> {
  const recuperaciones: Array<{
    periodoDescenso: string;
    periodoRecuperacion: string;
    consumoDescenso: number;
    consumoRecuperacion: number;
    variacionDescenso: number;
  }> = [];

  // Necesitamos al menos 4 periodos para detectar descenso sostenido + recuperación
  if (consumos.length < 4) {
    return recuperaciones;
  }

  const umbralDescenso = 0.7; // 70% del baseline
  const umbralRecuperacion = 0.85; // 85% del baseline (recuperación)
  const minPeriodosDescenso = 2; // Mínimo 2 periodos en descenso para ser "sostenido"

  let i = 0;
  while (i < consumos.length) {
    // Buscar inicio de descenso
    if (consumos[i].consumoActivaTotal >= promedioBaseline * umbralDescenso) {
      i++;
      continue;
    }

    // Encontramos un periodo en descenso, contar cuántos consecutivos hay
    const inicioDescenso = i;
    let periodosBajos = 0;
    let consumoPromedioDescenso = 0;
    let variacionPromedioDescenso = 0;

    // Contar periodos consecutivos en descenso
    while (
      i < consumos.length &&
      consumos[i].consumoActivaTotal < promedioBaseline * umbralDescenso
    ) {
      // Verificar que no haya cambio de potencia
      if (i > 0) {
        const potenciaAnterior = consumos[i - 1].potenciaPromedio;
        const potenciaActual = consumos[i].potenciaPromedio;
        const cambioPotencia =
          potenciaAnterior !== null &&
          potenciaActual !== null &&
          Math.abs(potenciaActual - potenciaAnterior) >= 0.5;

        if (cambioPotencia) {
          // Si hay cambio de potencia, no es una recuperación válida
          i++;
          break;
        }
      }

      consumoPromedioDescenso += consumos[i].consumoActivaTotal;
      variacionPromedioDescenso += consumos[i].variacionPorcentual ?? 0;
      periodosBajos++;
      i++;
    }

    // Si hubo suficientes periodos en descenso, buscar recuperación
    if (periodosBajos >= minPeriodosDescenso && i < consumos.length) {
      const periodoRecuperacion = consumos[i];

      // Verificar que no haya cambio de potencia en la recuperación
      const potenciaAnterior = consumos[i - 1].potenciaPromedio;
      const potenciaActual = periodoRecuperacion.potenciaPromedio;
      const cambioPotencia =
        potenciaAnterior !== null &&
        potenciaActual !== null &&
        Math.abs(potenciaActual - potenciaAnterior) >= 0.5;

      if (
        !cambioPotencia &&
        periodoRecuperacion.consumoActivaTotal >= promedioBaseline * umbralRecuperacion
      ) {
        // ¡Recuperación detectada!
        const promedioConsumoDescenso = consumoPromedioDescenso / periodosBajos;
        const promedioVariacionDescenso = variacionPromedioDescenso / periodosBajos;

        recuperaciones.push({
          periodoDescenso: `${consumos[inicioDescenso].periodo} - ${consumos[i - 1].periodo}`,
          periodoRecuperacion: periodoRecuperacion.periodo,
          consumoDescenso: promedioConsumoDescenso,
          consumoRecuperacion: periodoRecuperacion.consumoActivaTotal,
          variacionDescenso: promedioVariacionDescenso,
        });
      }
    }

    i++;
  }

  return recuperaciones;
}

/**
 * Encuentra el primer periodo donde se detectó una anomalía significativa
 * Considera TODO el histórico (anterior Y posterior) para determinar si es anomalía real
 * IGNORA periodos con cambio de potencia (no son anomalías reales)
 * IGNORA primeros periodos (necesita baseline histórico)
 */
export function encontrarInicioAnomalia(
  consumos: ConsumoMensual[],
  promedioGlobal: number,
  desviacionGlobal: number,
  promediosPorMes: Map<number, number>
): {
  periodo: string;
  indice: number;
  consumo: number;
  consumoPrevio: number | null;
  variacion: number | null;
} | null {
  // Calcular promedio de los primeros 12 meses (o todos si hay menos)
  const periodoBaseline = Math.min(12, Math.floor(consumos.length * 0.3));
  const consumosBaseline = consumos.slice(0, periodoBaseline).map((c) => c.consumoActivaTotal);
  const promedioBaseline =
    consumosBaseline.reduce((sum, val) => sum + val, 0) / consumosBaseline.length;

  // IMPORTANTE: Empezar desde después del periodo de baseline
  const indiceInicio = Math.max(2, periodoBaseline);

  // Recolectar TODOS los candidatos en lugar de retornar el primero
  const candidatos: Array<{
    periodo: string;
    indice: number;
    consumo: number;
    consumoPrevio: number | null;
    variacion: number | null;
    prioridad: number; // Menor número = mayor prioridad
    severidad: number; // Mayor número = más severo
  }> = [];

  for (let i = indiceInicio; i < consumos.length; i++) {
    const actual = consumos[i];
    const anterior = consumos[i - 1];

    // FILTRO CRÍTICO 1: Ignorar si hubo cambio de potencia (≥ 0.5 kW)
    const potenciaActual = actual.potenciaPromedio;
    const potenciaAnterior = anterior.potenciaPromedio;
    const huboCAMBIO_POTENCIA =
      potenciaActual !== null &&
      potenciaAnterior !== null &&
      Math.abs(potenciaActual - potenciaAnterior) >= 0.5;

    if (huboCAMBIO_POTENCIA) {
      continue; // Saltar este periodo
    }

    // Z-Score Global para este periodo
    const desviacionDelPromedio = actual.consumoActivaTotal - promedioGlobal;
    const zScoreGlobal = desviacionGlobal > 0 ? desviacionDelPromedio / desviacionGlobal : 0;

    // Variación vs promedio histórico del mes
    const promedioMes = promediosPorMes.get(actual.mes);
    const variacionVsHistoricoMes =
      promedioMes && promedioMes > 0
        ? ((actual.consumoActivaTotal - promedioMes) / promedioMes) * 100
        : null;

    // 🎯 PRIORIDAD 1: Consumo CERO o extremadamente bajo (≤ 15 kWh)
    if (actual.consumoActivaTotal <= 15) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 1,
        severidad: 100 - actual.consumoActivaTotal,
      });
      continue;
    }

    // 🎯 PRIORIDAD 2: Descenso mes-a-mes fuerte (≤ -40%)
    const esDescensoFuerte =
      actual.variacionPorcentual !== null && actual.variacionPorcentual <= -40;

    if (esDescensoFuerte) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 2,
        severidad: Math.abs(actual.variacionPorcentual!),
      });
    }

    // 🎯 PRIORIDAD 2.5: Consumo muy bajo vs baseline (≤ 60%)
    const esConsumoMuyBajoVsBaseline = actual.consumoActivaTotal <= promedioBaseline * 0.6;

    if (esConsumoMuyBajoVsBaseline) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 2.5,
        severidad: (1 - actual.consumoActivaTotal / promedioBaseline) * 100,
      });
    }

    // 🎯 PRIORIDAD 2.7: Descenso significativo vs baseline (< 70% Y descenso mes-a-mes)
    const esConsumoBajoConDescenso =
      actual.consumoActivaTotal < promedioBaseline * 0.7 &&
      actual.variacionPorcentual !== null &&
      actual.variacionPorcentual < -15;

    if (esConsumoBajoConDescenso) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 2.7,
        severidad: Math.abs(actual.variacionPorcentual!),
      });
    }

    // 🎯 PRIORIDAD 2.8: Descenso significativo vs promedio histórico del mes (< -50%)
    const esDescensoVsHistoricoMes =
      variacionVsHistoricoMes !== null && variacionVsHistoricoMes <= -50;

    if (esDescensoVsHistoricoMes && promedioMes && promedioMes > 0) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 2.8,
        severidad: Math.abs(variacionVsHistoricoMes!),
      });
    }

    // 🎯 PRIORIDAD 3: Z-Score muy bajo (< -2.5) + consumo bajo vs baseline (< 40%)
    const esZScoreMuyBajo = zScoreGlobal < -2.5;
    const esConsumoBajoVsBaseline = actual.consumoActivaTotal < promedioBaseline * 0.4;

    if (esZScoreMuyBajo && esConsumoBajoVsBaseline) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 3,
        severidad: Math.abs(zScoreGlobal) * 10,
      });
    }

    // 🎯 PRIORIDAD 4: Descenso fuerte + muy por debajo del histórico del mes (< -70%)
    const esDescensoFuerteVsHistorico =
      actual.variacionPorcentual !== null && actual.variacionPorcentual <= -40;
    const esMuyBajoVsHistoricoMes =
      variacionVsHistoricoMes !== null && variacionVsHistoricoMes < -70;

    if (esDescensoFuerteVsHistorico && esMuyBajoVsHistoricoMes) {
      candidatos.push({
        periodo: actual.periodo,
        indice: i,
        consumo: actual.consumoActivaTotal,
        consumoPrevio: anterior.consumoActivaTotal,
        variacion: actual.variacionPorcentual,
        prioridad: 4,
        severidad: Math.abs(variacionVsHistoricoMes!),
      });
    }
  }

  // Si no hay candidatos, retornar null
  if (candidatos.length === 0) {
    return null;
  }

  // Seleccionar el mejor candidato: menor prioridad, más reciente, mayor severidad
  candidatos.sort((a, b) => {
    if (a.prioridad !== b.prioridad) {
      return a.prioridad - b.prioridad;
    }
    if (b.indice !== a.indice) {
      return b.indice - a.indice;
    }
    return b.severidad - a.severidad;
  });

  return {
    periodo: candidatos[0].periodo,
    indice: candidatos[0].indice,
    consumo: candidatos[0].consumo,
    consumoPrevio: candidatos[0].consumoPrevio,
    variacion: candidatos[0].variacion,
  };
}
