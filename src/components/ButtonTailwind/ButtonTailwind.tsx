/**
 * 🎯 Componente ButtonTailwind
 *
 * Botón personalizable con Tailwind CSS, soporta variantes,
 * tamaños e iconos.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonTailwindProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Contenido del botón */
  children: ReactNode;
  /** Variante de estilo */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Tamaño del botón */
  size?: 'small' | 'medium' | 'large';
  /** Ancho completo */
  fullWidth?: boolean;
  /** Icono a la izquierda */
  iconLeft?: ReactNode;
  /** Icono a la derecha */
  iconRight?: ReactNode;
}

/**
 * Botón reutilizable con estilos de Tailwind CSS
 */
export const ButtonTailwind = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  disabled,
  ...props
}: ButtonTailwindProps) => {
  const baseClasses =
    'group relative font-semibold rounded-2xl shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-4 overflow-hidden';

  const variantClasses = {
    primary:
      'bg-gradient-to-br from-secondary to-secondary-dark text-white hover:shadow-pink-glow-lg hover:scale-110 focus:ring-white/30',
    secondary:
      'bg-gradient-to-br from-primary to-primary-light text-white hover:shadow-blue-glow hover:scale-105 focus:ring-white/30',
    outline:
      'bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 focus:ring-white/30',
    ghost: 'bg-white/5 hover:bg-white/15 text-white hover:scale-105 focus:ring-white/20',
  };

  const sizeClasses = {
    small: 'py-3 px-5 text-sm',
    medium: 'py-4 px-8 text-base',
    large: 'py-6 px-10 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled
    ? 'opacity-40 cursor-not-allowed transform-none'
    : 'cursor-pointer';

  const finalClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${disabledClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button className={finalClasses} disabled={disabled} {...props}>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {iconLeft && <span>{iconLeft}</span>}
        <span>{children}</span>
        {iconRight && <span>{iconRight}</span>}
      </span>
      {!disabled && variant !== 'ghost' && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
        />
      )}
    </button>
  );
};
