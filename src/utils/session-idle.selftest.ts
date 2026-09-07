/**
 * Selftest del reloj de inactividad.
 * Run: npx --yes tsx src/utils/session-idle.selftest.ts
 */
import { IDLE_TIMEOUT_MS } from '../constants/session';
import {
  createThrottled,
  remainingMs,
  resolveRestoredLock,
  shouldLock,
} from './session-idle';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const t0 = Date.parse('2026-09-07T12:00:00.000Z');
const min29 = t0 + 29 * 60 * 1000;
const min30 = t0 + 30 * 60 * 1000;
const min31 = t0 + 31 * 60 * 1000;

assert(shouldLock(t0, min29, IDLE_TIMEOUT_MS) === false, '29 min no bloquea');
assert(shouldLock(t0, min30, IDLE_TIMEOUT_MS) === true, '30 min bloquea');
assert(shouldLock(t0, min31, IDLE_TIMEOUT_MS) === true, '31 min bloquea');

const afterActivity = t0 + 10 * 60 * 1000;
assert(
  shouldLock(afterActivity, min29, IDLE_TIMEOUT_MS) === false,
  'actividad reinicia: 19 min restantes no bloquea',
);
assert(
  remainingMs(afterActivity, min29, IDLE_TIMEOUT_MS) === 11 * 60 * 1000,
  'remaining tras actividad',
);

assert(remainingMs(t0, min30, IDLE_TIMEOUT_MS) === 0, 'remaining en el umbral es 0');
assert(remainingMs(t0, min29, IDLE_TIMEOUT_MS) === 60 * 1000, 'remaining 1 min');

let calls = 0;
let fakeNow = t0;
const throttled = createThrottled(
  () => {
    calls += 1;
  },
  1000,
  () => fakeNow,
);
throttled();
throttled();
assert(calls === 1, 'throttle ignora el segundo tick inmediato');
fakeNow = t0 + 1000;
throttled();
assert(calls === 2, 'throttle permite tras 1s');

// Wake/suspensión: el reloj compara timestamps, no setTimeout.
const slept = t0 + 45 * 60 * 1000;
assert(shouldLock(t0, slept, IDLE_TIMEOUT_MS) === true, 'wake > 30 min bloquea');

const failClosed = resolveRestoredLock(null, true, t0, IDLE_TIMEOUT_MS);
assert(failClosed.sessionLocked === true, 'lock flag sin timestamp permanece locked');

const fresh = resolveRestoredLock(null, false, t0, IDLE_TIMEOUT_MS);
assert(fresh.sessionLocked === false, 'sin flag ni timestamp no bloquea');
assert(fresh.lastActivityAt === t0, 'sin timestamp usa now');

console.log('session-idle.selftest: ok');
