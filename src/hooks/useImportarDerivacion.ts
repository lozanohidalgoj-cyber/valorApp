/**
 * 📥 Hook para importación mejorada de archivos de derivación
 *
 * Proporciona importación con validación exhaustiva, vista previa y
 * manejo de errores detallado.
 */

import { useState } from 'react';
import type { DerivacionData } from '../types';
import {
  importarArchivoDerivacion,
  formatearErroresImportacion,
  type ResultadoImportacionDerivacion,
} from '../services/importDerivacionService';

interface UseImportarDerivacionResult {
  importando: boolean;
  progreso: number;
  error: string | null;
  resultado: ResultadoImportacionDerivacion | null;
  importarArchivo: (archivo: File) => Promise<DerivacionData[]>;
  limpiarResultado: () => void;
}

/**
 * Hook para importación de archivos de derivación con validación completa
 */
export const useImportarDerivacion = (): UseImportarDerivacionResult => {
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacionDerivacion | null>(null);

  const importarArchivo = async (archivo: File): Promise<DerivacionData[]> => {
    setImportando(true);
    setProgreso(0);
    setError(null);
    setResultado(null);

    try {
      // Simular progreso visual
      setProgreso(10);

      // Validar tipo de archivo
      const extensionesValidas = ['.csv', '.xlsx', '.xls'];
      const extension = archivo.name.toLowerCase().match(/\.[^.]+$/)?.[0];

      if (!extension || !extensionesValidas.includes(extension)) {
        throw new Error(`Tipo de archivo no soportado. Use: ${extensionesValidas.join(', ')}`);
      }

      setProgreso(30);

      // Importar archivo
      const resultadoImportacion = await importarArchivoDerivacion(archivo);

      setProgreso(80);
      setResultado(resultadoImportacion);

      // Verificar errores críticos
      if (!resultadoImportacion.exito) {
        const mensajeError = formatearErroresImportacion(resultadoImportacion.errores);
        setError(mensajeError || 'Error desconocido al importar');
        setProgreso(100);
        return [];
      }

      setProgreso(100);

      return resultadoImportacion.datos;
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensajeError);
      setProgreso(0);
      return [];
    } finally {
      setImportando(false);
    }
  };

  const limpiarResultado = () => {
    setResultado(null);
    setError(null);
    setProgreso(0);
  };

  return {
    importando,
    progreso,
    error,
    resultado,
    importarArchivo,
    limpiarResultado,
  };
};
