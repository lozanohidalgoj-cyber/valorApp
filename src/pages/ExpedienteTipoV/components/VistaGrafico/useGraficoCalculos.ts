/**
 * Hook para cálculos y configuración del gráfico
 * Encapsula toda la lógica de generación de datos del gráfico SVG
 */
import { useMemo } from 'react';
import type { ConsumoMensual, AnalisisPeriodoConsumo } from '../../../../types';
import { obtenerEtiquetaMes, esBajaDeConsumo } from './graficoHelpers';

interface PuntoGrafico {
  x: number;
  y: number;
  mes: ConsumoMensual;
  etiqueta: string;
  bajaConsumo: boolean;
  comportamiento: string;
}

interface LineaGrid {
  y: number;
  valor: number;
}

interface ConfiguracionGrafico {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  puntos: PuntoGrafico[];
  lineaPath: string;
  areaPath: string;
  promedioY: number;
  gridLines: LineaGrid[];
}

interface ResultadoCalculos {
  maxConsumo: number;
  minConsumo: number;
  promedioConsumo: number;
  totalBajasConsumo: number;
  totalMeses: number;
  graficoConfig: ConfiguracionGrafico | null;
}

interface UseGraficoCalculosProps {
  comparativaMensual: ConsumoMensual[];
  analisisPorPeriodo: Map<string, AnalisisPeriodoConsumo>;
}

/**
 * Hook que calcula estadísticas y configuración del gráfico SVG
 */
export const useGraficoCalculos = ({
  comparativaMensual,
  analisisPorPeriodo,
}: UseGraficoCalculosProps): ResultadoCalculos => {
  return useMemo(() => {
    if (comparativaMensual.length === 0) {
      return {
        maxConsumo: 0,
        minConsumo: 0,
        promedioConsumo: 0,
        totalBajasConsumo: 0,
        totalMeses: 0,
        graficoConfig: null,
      };
    }

    const consumos = comparativaMensual.map((d) => d.consumoTotal);
    const maximo = Math.max(...consumos);
    const minimo = Math.min(...consumos);
    const promedio = consumos.reduce((acc, val) => acc + val, 0) / consumos.length;

    const bajasDetectadas = comparativaMensual.reduce((acumulado, mes) => {
      const analisis = analisisPorPeriodo.get(mes.periodo);
      return esBajaDeConsumo(analisis) ? acumulado + 1 : acumulado;
    }, 0);

    const meses = comparativaMensual.length;
    const rango = Math.max(maximo - minimo, 1);

    // Configuración de dimensiones del gráfico
    const width = 120;
    const height = 80;
    const paddingX = 14;
    const paddingY = 16;
    const areaHeight = height - paddingY * 2;
    const safeLength = Math.max(comparativaMensual.length - 1, 1);

    // Generar puntos del gráfico
    const puntos: PuntoGrafico[] = comparativaMensual.map((mes, index) => {
      const avanceX = comparativaMensual.length === 1 ? 0.5 : index / safeLength;
      const x = paddingX + avanceX * (width - paddingX * 2);
      const valorNormalizado = (mes.consumoTotal - minimo) / rango;
      const y = height - paddingY - valorNormalizado * areaHeight;
      const analisis = analisisPorPeriodo.get(mes.periodo);
      const bajaConsumo = esBajaDeConsumo(analisis);

      return {
        x,
        y,
        mes,
        etiqueta: obtenerEtiquetaMes(mes.periodo),
        bajaConsumo,
        comportamiento: analisis?.comportamiento ?? 'Sin cambios destacados',
      };
    });

    // Generar path de línea
    const lineaPath = puntos.reduce((acumulado, punto, indice) => {
      const comando = indice === 0 ? 'M' : 'L';
      return `${acumulado} ${comando} ${punto.x} ${punto.y}`.trim();
    }, '');

    // Generar path de área sombreada
    const areaPath = [
      `M ${puntos[0]?.x ?? paddingX} ${height - paddingY}`,
      ...puntos.map((p) => `L ${p.x} ${p.y}`),
      `L ${puntos[puntos.length - 1]?.x ?? width - paddingX} ${height - paddingY}`,
      'Z',
    ].join(' ');

    // Posición Y de línea de promedio
    const promedioY = height - paddingY - ((promedio - minimo) / rango) * areaHeight;

    // Líneas de grid horizontales
    const gridLines: LineaGrid[] = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const valor = minimo + ratio * (maximo - minimo);
      const y = height - paddingY - ratio * areaHeight;
      return { y, valor };
    });

    return {
      maxConsumo: maximo,
      minConsumo: minimo,
      promedioConsumo: promedio,
      totalBajasConsumo: bajasDetectadas,
      totalMeses: meses,
      graficoConfig: {
        width,
        height,
        paddingX,
        paddingY,
        puntos,
        lineaPath,
        areaPath,
        promedioY,
        gridLines,
      },
    };
  }, [analisisPorPeriodo, comparativaMensual]);
};
