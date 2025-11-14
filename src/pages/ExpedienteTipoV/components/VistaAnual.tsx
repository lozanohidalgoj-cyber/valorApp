/**
 * 📊 Vista Anual - Tabla de consumos por año
 */

import { Download } from 'lucide-react';
import type { ConsumoAnual } from '../../../types';
import { formatearNumero } from '../../../services/analisisConsumoService';

interface VistaAnualProps {
  datos: ConsumoAnual[];
  onExportar: () => void;
}

export const VistaAnual = ({ datos, onExportar }: VistaAnualProps) => {
  return (
    <>
      <div className="expediente-table-wrapper">
        <table className="expediente-table expediente-table-analisis">
          <thead>
            <tr>
              <th>Año</th>
              <th>Suma Consumo Activa (kWh)</th>
              <th>Máx Maxímetro</th>
              <th>Periodos Facturados</th>
              <th>Suma de Días</th>
              <th>Promedio Consumo por Día (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((consumo) => (
              <tr key={consumo.año}>
                <td className="td-año">{consumo.año}</td>
                <td className="td-numero">{formatearNumero(consumo.sumaConsumoActiva)}</td>
                <td className="td-numero">
                  {consumo.maxMaximetro > 0 ? formatearNumero(consumo.maxMaximetro) : '-'}
                </td>
                <td className="td-numero">{consumo.periodosFacturados}</td>
                <td className="td-numero">{consumo.sumaDias}</td>
                <td className="td-numero">{formatearNumero(consumo.promedioConsumoPorDia)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="expediente-export-buttons expediente-export-bottom">
        <button className="btn-export" onClick={onExportar}>
          <Download size={16} />
          Exportar Vista por Años
        </button>
      </div>
    </>
  );
};
