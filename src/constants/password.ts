export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 200;
export const PASSWORD_POLICY_MESSAGE =
  'Mínimo 8 caracteres, con al menos una letra y un número.';
export const PASSWORD_MAX_MESSAGE = 'Máximo 200 caracteres.';

export function evaluateUserPassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.trim() === '') {
    return PASSWORD_POLICY_MESSAGE;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_POLICY_MESSAGE;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return PASSWORD_MAX_MESSAGE;
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return PASSWORD_POLICY_MESSAGE;
  }
  return null;
}
