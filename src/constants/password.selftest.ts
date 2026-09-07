/**
 * Selftest de la política de nueva contraseña (espejo FE).
 * Run: npx --yes tsx src/constants/password.selftest.ts
 */
import {
  evaluateUserPassword,
  PASSWORD_MAX_MESSAGE,
  PASSWORD_POLICY_MESSAGE,
} from './password';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const exact8 = 'letra123';
const exact200 = `a1${'x'.repeat(198)}`;
assert(exact8.length === 8, 'fixture 8 chars');
assert(exact200.length === 200, 'fixture 200 chars');

const valid = [
  'secreto123',
  'Secreto123',
  'Aestimare-2026!',
  'mi clave 2026',
  '  ab12cd  ',
  'contraseña1',
  exact8,
  exact200,
];
for (const password of valid) {
  assert(
    evaluateUserPassword(password) === null,
    `debería aceptar ${JSON.stringify(password)}`,
  );
}

const invalid = ['abc123', 'abcdefgh', '12345678', '        '];
for (const password of invalid) {
  assert(
    evaluateUserPassword(password) === PASSWORD_POLICY_MESSAGE,
    `debería rechazar ${JSON.stringify(password)}`,
  );
}

const tooLong = `a1${'x'.repeat(199)}`;
assert(tooLong.length === 201, 'fixture 201 chars');
assert(
  evaluateUserPassword(tooLong) === PASSWORD_MAX_MESSAGE,
  '201 chars → máximo',
);

console.log('password.selftest: ok');
