/**
 * Servicio API para autenticación y recuperación de contraseña
 */

import httpClient from './http';

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ValidateResetTokenPayload {
  email: string;
  token: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
}

/**
 * Servicios de autenticación
 */
const authApiService = {
  /**
   * Solicitar restablecimiento de contraseña (admin)
   */
  async requestPasswordResetAdmin(
    payload: RequestPasswordResetPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth/password-reset/request',
      payload,
    );
    return response.data;
  },

  /**
   * Validar token de restablecimiento (admin)
   */
  async validateResetTokenAdmin(
    payload: ValidateResetTokenPayload,
  ): Promise<ValidateTokenResponse> {
    const response = await httpClient.post<ValidateTokenResponse>(
      '/auth/password-reset/validate',
      payload,
    );
    return response.data;
  },

  /**
   * Restablecer contraseña (admin)
   */
  async resetPasswordAdmin(
    payload: ResetPasswordPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth/password-reset/reset',
      payload,
    );
    return response.data;
  },

  /**
   * Solicitar restablecimiento de contraseña (cliente)
   */
  async requestPasswordResetCliente(
    payload: RequestPasswordResetPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth-cliente/password-reset/request',
      payload,
    );
    return response.data;
  },

  /**
   * Validar token de restablecimiento (cliente)
   */
  async validateResetTokenCliente(
    payload: ValidateResetTokenPayload,
  ): Promise<ValidateTokenResponse> {
    const response = await httpClient.post<ValidateTokenResponse>(
      '/auth-cliente/password-reset/validate',
      payload,
    );
    return response.data;
  },

  /**
   * Restablecer contraseña (cliente)
   */
  async resetPasswordCliente(
    payload: ResetPasswordPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth-cliente/password-reset/reset',
      payload,
    );
    return response.data;
  },
};

export default authApiService;
