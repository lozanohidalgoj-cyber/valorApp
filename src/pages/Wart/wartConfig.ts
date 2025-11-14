/**
 * Configuración de chequeos WART
 * Define las validaciones críticas para detección de anomalías
 */

export interface WartCheck {
  id: 'check1' | 'check2';
  titulo: string;
  descripcion: string;
}

/**
 * Chequeos requeridos para validación WART
 */
export const WART_CHECKS: WartCheck[] = [
  {
    id: 'check1',
    titulo: 'La diferencia de tiempo entre carga y WART es menor o igual a un minuto',
    descripcion: 'Verifica que el tiempo transcurrido sea ≤ 60 segundos',
  },
  {
    id: 'check2',
    titulo: 'La resta de la carga real en acometida y la carga real en contador es mayor a 0,5',
    descripcion: '(Carga Acometida - Carga Contador) > 0.5 kW',
  },
];
