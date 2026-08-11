/**
 * Selftest Story 5.2 — validación de código de categoría (espejo FE del DTO BE).
 * Run: npx --yes tsx src/utils/categoriaCodigo.selftest.ts
 */

function isValidCodigoCategoria(raw: string): boolean {
  return /^[A-Z0-9]{2,3}$/.test(raw.trim().toUpperCase());
}

function normalizeCodigo(raw: string): string {
  return raw.trim().toUpperCase();
}

const cases: Array<{ input: string; ok: boolean; normalized?: string }> = [
  { input: 'med', ok: true, normalized: 'MED' },
  { input: 'ME', ok: true, normalized: 'ME' },
  { input: 'A', ok: false },
  { input: 'ABCD', ok: false },
  { input: 'M-', ok: false },
  { input: '12', ok: true, normalized: '12' },
];

let failed = 0;
for (const c of cases) {
  const ok = isValidCodigoCategoria(c.input);
  if (ok !== c.ok) {
    console.error(`FAIL valid(${c.input}): expected ${c.ok}, got ${ok}`);
    failed++;
    continue;
  }
  if (c.ok && c.normalized && normalizeCodigo(c.input) !== c.normalized) {
    console.error(
      `FAIL normalize(${c.input}): expected ${c.normalized}, got ${normalizeCodigo(c.input)}`,
    );
    failed++;
  }
}

if (failed) {
  console.error(`categoriaCodigo.selftest: ${failed} failure(s)`);
  process.exit(1);
}
console.log('categoriaCodigo.selftest: OK');
