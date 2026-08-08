/**
 * Extrae mensaje de error Nest/Axios para banners admin.
 * Semántica alineada al helper CRM (message string | string[] → fallback).
 */
export function extractError(
  err: unknown,
  fallback = 'No se pudo completar la operación',
): string {
  const e = err as {
    response?: { data?: { message?: string | string[] } };
  };
  const raw = e?.response?.data?.message;
  const msg = Array.isArray(raw)
    ? raw.join('. ')
    : typeof raw === 'string'
      ? raw
      : '';
  if (msg.trim()) return msg;
  return fallback;
}
