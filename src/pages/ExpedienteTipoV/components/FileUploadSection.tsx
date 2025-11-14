/**
 * Sección de carga de archivos - Versión simplificada
 */

import { Upload, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface FileUploadSectionProps {
  loaded: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

export const FileUploadSection = ({
  loaded,
  onFileChange,
  onClearData,
}: FileUploadSectionProps) => {
  return (
    <div className="expediente-card expediente-card--import">
      {!loaded ? (
        <div className="expediente-upload-section">
          <label className="expediente-upload-btn">
            <Upload size={32} />
            <span className="expediente-upload-title">Derivación Individual</span>
            <span className="expediente-upload-description">
              Haga clic para importar archivo CSV o Excel
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      ) : (
        <div className="expediente-upload-section">
          <button
            onClick={onClearData}
            className="expediente-upload-btn expediente-upload-btn--danger"
          >
            <Trash2 size={32} />
            <span className="expediente-upload-title">Limpiar Datos Guardados</span>
            <span className="expediente-upload-description">
              Eliminar todos los datos y empezar de nuevo
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
