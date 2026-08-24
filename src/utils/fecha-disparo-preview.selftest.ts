/**
 * Selftest espejo BE — Story 9.2.
 * Run: npx --yes tsx src/utils/fecha-disparo-preview.selftest.ts
 */
import {
  calcularFechaDisparoPreview,
  fechaExactaToDateInput,
  resolveTenantZone,
  DEFAULT_TENANT_ZONE,
} from './fecha-disparo-preview';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const zone = 'America/Mexico_City';
const nowUtc = new Date('2026-06-15T15:00:00.000Z');

assert(resolveTenantZone(undefined) === DEFAULT_TENANT_ZONE, 'fallback zone');
assert(resolveTenantZone('  ') === DEFAULT_TENANT_ZONE, 'whitespace zone');

const hoy = calcularFechaDisparoPreview({
  receta: { familia: 'relativo_hoy', preset: '1_mes' },
  zonaHoraria: zone,
  nowUtc,
});
assert(hoy.ok === true, 'relativo_hoy ok');
assert(
  hoy.ok &&
    hoy.fechaDisparoUtc.getTime() ===
      new Date('2026-07-15T06:00:00.000Z').getTime(),
  'relativo_hoy date',
);

const pastExact = calcularFechaDisparoPreview({
  receta: { familia: 'fecha_exacta', fechaExacta: '2020-01-01' },
  zonaHoraria: zone,
  nowUtc,
});
assert(pastExact.ok === false && pastExact.code === 'not_future', 'past exact');

// Ancla antigua + now fijo → aniversario no futuro (sin Date.now())
const anivOld = calcularFechaDisparoPreview({
  receta: {
    familia: 'relativo_aniversario',
    preset: '2_meses_antes',
  },
  zonaHoraria: zone,
  fechaCreacion: new Date('2025-01-15T12:00:00.000Z'),
  nowUtc: new Date('2026-06-15T15:00:00.000Z'),
});
assert(
  anivOld.ok === false && anivOld.eligible === false,
  'aniversario no futuro',
);

// UTC Instant start-of-day Mexico (UTC-6) → día civil tenant
const feInput = fechaExactaToDateInput(
  new Date('2030-03-15T06:00:00.000Z'),
  zone,
);
assert(feInput === '2030-03-15', 'fechaExactaToDateInput tenant day');

console.log('fecha-disparo-preview.selftest OK');
