/**
 * Formatea cantidades en pesos para la UI y PDFs.
 * Ejemplo: 5500 → "$ 5,500.00"
 */
export function formatMoney(amount: number | null | undefined): string {
  const value = Number(amount);
  const n = Number.isFinite(value) ? value : 0;
  const formatted = n.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$ ${formatted}`;
}

/** Alias para PDFs y vistas que ya usaban formatCurrency. */
export const formatCurrency = formatMoney;
