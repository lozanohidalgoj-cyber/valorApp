/**
 * Configuración de tipos de avería disponibles
 */

export interface TipoAveria {
  id: string;
  nombre: string;
  habilitado: boolean;
  ruta?: string;
}

/**
 * Lista de tipos de avería disponibles
 */
export const TIPOS_AVERIA: TipoAveria[] = [
  {
    id: 'WART',
    nombre: 'WART',
    habilitado: true,
    ruta: '/wart',
  },
  {
    id: 'ERROR_MONTAJE',
    nombre: 'ERROR DE MONTAJE',
    habilitado: false,
  },
  {
    id: 'ERROR_AVERIA',
    nombre: 'ERROR DE AVERÍA',
    habilitado: false,
  },
];
