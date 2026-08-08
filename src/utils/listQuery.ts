import type { LocationQuery, LocationQueryValue } from 'vue-router';

function first(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string | null {
  if (value == null) return null;
  const v = Array.isArray(value) ? value[0] : value;
  if (v == null || v === '') return null;
  return v;
}

export function queryString(
  query: LocationQuery,
  key: string,
): string | undefined {
  const v = first(query[key]);
  return v ?? undefined;
}

export function queryInt(
  query: LocationQuery,
  key: string,
  fallback: number,
  opts?: { min?: number; max?: number },
): number {
  const v = first(query[key]);
  if (v == null) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  const min = opts?.min ?? 1;
  if (n < min) return fallback;
  if (opts?.max != null && n > opts.max) return fallback;
  return n;
}

/** `1` / `true` / `yes` → true; else false. */
export function queryFlag(query: LocationQuery, key: string): boolean {
  const v = first(query[key])?.toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function boolQuery(value: boolean): string | undefined {
  return value ? '1' : undefined;
}

/** Omite undefined/null/'' para no ensuciar la URL. */
export function compactQuery(
  entries: Record<string, string | number | undefined | null>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(entries)) {
    if (v == null || v === '') continue;
    out[k] = String(v);
  }
  return out;
}

const LIST_QUERY_TENANT_KEY = 'ames.admin.listQueryTenant';

/**
 * Detecta cambio de tenant respecto a la última visita a un listado admin.
 * AdminLayout remonta por `viewKey`, así que el watch(activeTenantId) del hijo
 * no alcanza a limpiar: hay que resetear query en mount cuando el tenant cambió.
 */
export function shouldResetListQueryForTenant(
  activeTenantId: string | null | undefined,
): boolean {
  const tid = activeTenantId ?? '';
  try {
    const prev = sessionStorage.getItem(LIST_QUERY_TENANT_KEY);
    sessionStorage.setItem(LIST_QUERY_TENANT_KEY, tid);
    return prev !== null && prev !== tid;
  } catch {
    return false;
  }
}

/** Solo `YYYY-MM-DD` de calendario válido; si no, undefined (default seguro). */
export function queryDate(
  query: LocationQuery,
  key: string,
): string | undefined {
  const v = queryString(query, key);
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const parts = v.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y == null || m == null || d == null) return undefined;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return undefined;
  }
  return v;
}
