/** Fold de acentos + minúsculas para búsquedas locales. */
export function foldSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function foldDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function matchesSearch(
  query: string,
  fields: Array<string | undefined | null>,
): boolean {
  const q = foldSearchText(query);
  if (!q) return true;
  const qDigits = foldDigits(query);
  return fields.some((field) => {
    const text = foldSearchText(field ?? '');
    if (text.includes(q)) return true;
    if (qDigits.length >= 3) {
      const fieldDigits = foldDigits(field ?? '');
      if (fieldDigits && fieldDigits.includes(qDigits)) return true;
    }
    return false;
  });
}

export function filterBySearch<T>(
  items: T[],
  query: string,
  getFields: (item: T) => Array<string | undefined | null>,
): T[] {
  return items.filter((item) => matchesSearch(query, getFields(item)));
}
