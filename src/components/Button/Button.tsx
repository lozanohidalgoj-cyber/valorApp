/**
 * 🎯 Componente Button
 *
 * Botón reutilizable con variantes y estilos corporativos.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Contenido del botón */
  children: ReactNode;
  /** Variante de estilo */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Tamaño del botón */
  size?: 'small' | 'medium' | 'large';
  /** Ancho completo */
  fullWidth?: boolean;
}

/**
 * Botón reutilizable con estilos corporativos
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};
