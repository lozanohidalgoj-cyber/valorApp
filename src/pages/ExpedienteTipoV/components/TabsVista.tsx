/**
 * Componente de Pestañas de Vista
 * Navegación entre diferentes vistas del análisis
 */

import { BarChart3, Calendar, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';
import type { VistaAnalisis } from '../types';

interface TabsVistaProps {
  vistaActual: VistaAnalisis;
  onCambiarVista: (vista: VistaAnalisis) => void;
}

export const TabsVista = ({ vistaActual, onCambiarVista }: TabsVistaProps) => {
  const tabs: Array<{ id: VistaAnalisis; label: string; icon: React.ReactNode }> = [
    { id: 'anual', label: 'Vista por Años', icon: <BarChart3 size={16} /> },
    { id: 'mensual', label: 'Comparativa Mensual', icon: <Calendar size={16} /> },
    { id: 'listado', label: 'Listado', icon: <ClipboardList size={16} /> },
    { id: 'grafico', label: 'Gráfico', icon: <TrendingUp size={16} /> },
    { id: 'anomalia', label: 'Anomalía', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="expediente-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`expediente-tab ${vistaActual === tab.id ? 'active' : ''}`}
          onClick={() => onCambiarVista(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};
