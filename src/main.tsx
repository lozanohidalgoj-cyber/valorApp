/**
 * Punto de entrada de la aplicación React
 * Renderiza el componente App en el elemento root del DOM
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
