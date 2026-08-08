/**
 * Smoke self-test: npx --yes tsx src/utils/extractError.selftest.ts
 */
import { extractError } from './extractError';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  extractError({ response: { data: { message: 'Hola' } } }) === 'Hola',
  'string message',
);
assert(
  extractError({ response: { data: { message: ['A', 'B'] } } }) === 'A. B',
  'array message',
);
assert(
  extractError({}, 'fallback-x') === 'fallback-x',
  'fallback when empty',
);
assert(
  extractError(null) === 'No se pudo completar la operación',
  'default fallback',
);

console.log('extractError.selftest: OK');
