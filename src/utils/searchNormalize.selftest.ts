/**
 * Smoke self-test: npx --yes tsx src/utils/searchNormalize.selftest.ts
 */
import { filterBySearch, foldSearchText, matchesSearch } from './searchNormalize';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(foldSearchText('  Núñez  ') === 'nunez', 'fold accents and trim');
assert(foldSearchText('AIT1503277N5') === 'ait1503277n5', 'fold rfc case');

assert(
  matchesSearch('nunez', ['Transportes Núñez']),
  'name match ignores accents',
);
assert(
  matchesSearch('ait150', ['AITSA', 'AIT1503277N5']),
  'rfc substring match',
);
assert(
  matchesSearch('norte', ['Acme', 'Transportes del Norte', 'TNO010101AAA']),
  'razon social / empresa',
);
assert(
  matchesSearch('LUIS.ZAVALA@AITSA.MX', ['Luis', 'luis.zavala@aitsa.mx', '668']),
  'email case-insensitive',
);
assert(matchesSearch('668 150', ['Luis', '', '668 150 9511']), 'phone match');
assert(
  matchesSearch('6681509511', ['Luis', '', '668 150 9511']),
  'phone digits ignore separators',
);
assert(matchesSearch('', ['Cualquiera']), 'empty query matches all');
assert(!matchesSearch('zzz', ['AITSA', 'AIT150']), 'no false positive');

const clientes = [
  { empresa: 'AITSA', razonSocial: 'Aitsa SA de CV', rfc: 'AIT1503277N5' },
  { empresa: 'Transportes del Norte', razonSocial: '', rfc: '' },
];
assert(
  filterBySearch(clientes, 'aitsa', (c) => [c.empresa, c.razonSocial, c.rfc])
    .length === 1,
  'filter empresa',
);
assert(
  filterBySearch(clientes, 'AIT150', (c) => [c.empresa, c.razonSocial, c.rfc])[0]
    ?.empresa === 'AITSA',
  'filter rfc',
);
assert(
  filterBySearch(clientes, 'xyz', (c) => [c.empresa, c.razonSocial, c.rfc])
    .length === 0,
  'filter empty',
);

console.log('searchNormalize.selftest: OK');
