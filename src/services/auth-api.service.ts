/**
 * Servicio API para autenticación y recuperación de contraseña (admin AMES)
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

const authApiService = {
  async requestPasswordResetAdmin(
    payload: RequestPasswordResetPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth/password-reset/request',
      payload,
    );
    return response.data;
  },

  async validateResetTokenAdmin(
    payload: ValidateResetTokenPayload,
  ): Promise<ValidateTokenResponse> {
    const response = await httpClient.post<ValidateTokenResponse>(
      '/auth/password-reset/validate',
      payload,
    );
    return response.data;
  },

  async resetPasswordAdmin(
    payload: ResetPasswordPayload,
  ): Promise<PasswordResetResponse> {
    const response = await httpClient.post<PasswordResetResponse>(
      '/auth/password-reset/reset',
      payload,
    );
    return response.data;
  },
};

export default authApiService;
