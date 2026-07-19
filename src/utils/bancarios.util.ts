import type { TenantBancarios } from '../types/backend';

/** Contenido bancario útil: CLABE, o banco+cuenta (Story 2.4 / 6.5). Paridad BE. */
export function hasBancariosUtiles(b?: TenantBancarios | null): boolean {
  if (!b) return false;
  if (typeof b.clabe === 'string' && b.clabe.trim()) return true;
  const banco = typeof b.banco === 'string' ? b.banco.trim() : '';
  const cuenta = typeof b.cuenta === 'string' ? b.cuenta.trim() : '';
  return Boolean(banco && cuenta);
}
