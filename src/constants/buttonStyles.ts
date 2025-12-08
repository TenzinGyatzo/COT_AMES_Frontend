/**
 * Estilos unificados para botones
 * Usado en todo el Portal Cliente
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Clases base para botones
 */
export const BUTTON_BASE_CLASSES =
  'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

/**
 * Clases por variante de botón
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

/**
 * Clases por tamaño de botón
 */
export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Clases para botones secundarios (outline)
 */
export const BUTTON_SECONDARY_OUTLINE_CLASSES =
  'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500';

/**
 * Función helper para construir clases de botón
 */
export function getButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return [
    BUTTON_BASE_CLASSES,
    BUTTON_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
