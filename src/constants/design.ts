/**
 * 🎨 Constantes de Diseño
 * Valores centralizados para mantener consistencia visual
 */

export const COLORS = {
  PRIMARY: 'var(--color-primary)',
  SECONDARY: 'var(--color-secondary)',
  WHITE: 'var(--color-white)',
  LIGHT_GRAY: 'var(--color-light-gray)',
  MEDIUM_GRAY: 'var(--color-medium-gray)',
  DARK_GRAY: 'var(--color-dark-gray)',
} as const;

export const SPACING = {
  XS: 'var(--spacing-xs)',
  SM: 'var(--spacing-sm)',
  MD: 'var(--spacing-md)',
  LG: 'var(--spacing-lg)',
  XL: 'var(--spacing-xl)',
  XXL: 'var(--spacing-2xl)',
  XXXL: 'var(--spacing-3xl)',
} as const;

export const BORDER_RADIUS = {
  SM: '0.25rem',
  MD: '0.5rem',
  LG: '0.75rem',
  XL: '1rem',
  FULL: '9999px',
} as const;

export const TRANSITIONS = {
  FAST: '0.15s ease',
  DEFAULT: '0.3s ease',
  SLOW: '0.5s ease',
} as const;

export const BREAKPOINTS = {
  MOBILE: '640px',
  TABLET: '768px',
  DESKTOP: '1024px',
  WIDE: '1280px',
} as const;
