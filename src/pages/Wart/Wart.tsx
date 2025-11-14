/**
 * 🔌 Módulo WART - Verificación de Anomalías de Carga
 *
 * Interfaz para verificar dos condiciones críticas en la detección de WART:
 * 1. Diferencia de tiempo entre carga y WART ≤ 1 minuto
 * 2. Diferencia de carga real (acometida - contador) > 0.5 kW
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WartCheckItem } from './WartCheckItem';
import { WART_CHECKS } from './wartConfig';
import './Wart.css';

type WartState = Record<string, boolean>;

export const Wart = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<WartState>(
    WART_CHECKS.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );

  const handleCheckChange = (checkId: string) => {
    setChecks((prev) => ({
      ...prev,
      [checkId]: !prev[checkId],
    }));
  };

  const ambosChequeos = WART_CHECKS.every((check) => checks[check.id]);

  const handleVolver = () => {
    navigate('/averia');
  };

  const handleContinuar = () => {
    if (ambosChequeos) {
      navigate('/expediente-tipo-v');
    }
  };

  return (
    <div className="wart-container">
      <div className="wart-content">
        <div className="wart-header">
          <h1 className="wart-title">Módulo WART</h1>
          <p className="wart-subtitle">Antes de continuar recuerde revisar:</p>
        </div>

        <div className="wart-card">
          {WART_CHECKS.map((check, index) => (
            <div key={check.id}>
              <WartCheckItem
                id={check.id}
                titulo={check.titulo}
                descripcion={check.descripcion}
                checked={checks[check.id]}
                onChange={() => handleCheckChange(check.id)}
              />
              {index < WART_CHECKS.length - 1 && <div className="wart-separator"></div>}
            </div>
          ))}
        </div>

        <div className="wart-footer">
          <button
            onClick={handleVolver}
            className="wart-back-btn"
            title="Volver a la interfaz anterior"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <button onClick={handleContinuar} disabled={!ambosChequeos} className="wart-continue-btn">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
