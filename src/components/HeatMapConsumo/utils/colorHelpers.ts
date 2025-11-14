/**
 * Funciones auxiliares para cálculo de colores en HeatMap
 */

/**
 * Calcula el color para la métrica de detección de anomalías
 * Usa la misma paleta: Rojo → Amarillo → Verde
 * @param consumoPromedioDiario - Consumo promedio diario del periodo
 * @param baseline - Baseline de referencia
 * @returns Color RGB en formato string
 */
export const calcularColorAnomalia = (consumoPromedioDiario: number, baseline: number): string => {
  if (consumoPromedioDiario === 0 || baseline === 0) {
    return 'rgb(255, 0, 0)'; // Rojo para cero consumo
  }

  const porcentajeVsBaseline = (consumoPromedioDiario / baseline) * 100;

  // Mapear porcentaje a rango 0-1
  // 0% = 0 (rojo), 100% = 0.5 (amarillo), 200% = 1 (verde)
  let normalizado: number;

  if (porcentajeVsBaseline <= 100) {
    // 0-100%: mapear a 0-0.5 (rojo a amarillo)
    normalizado = (porcentajeVsBaseline / 100) * 0.5;
  } else {
    // 100-200%: mapear a 0.5-1 (amarillo a verde)
    const exceso = Math.min(porcentajeVsBaseline - 100, 100); // máximo 100% exceso
    normalizado = 0.5 + (exceso / 100) * 0.5;
  }

  // Interpolación de colores
  let r, g, b;

  if (normalizado < 0.5) {
    // Rojo → Amarillo (0 a 0.5)
    const t = normalizado * 2; // 0 a 1
    r = 255;
    g = Math.round(255 * t);
    b = 0;
  } else {
    // Amarillo → Verde (0.5 a 1)
    const t = (normalizado - 0.5) * 2; // 0 a 1
    r = Math.round(255 * (1 - t));
    g = 255;
    b = 0;
  }

  return `rgb(${r}, ${g}, ${b})`;
};
