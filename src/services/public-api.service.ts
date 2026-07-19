import http from './http';
import type { PublicCotizacionResponse } from '../types/backend';

function publicCotizacionPath(token: string, suffix = ''): string {
  return `/cotizaciones/public/${encodeURIComponent(token)}${suffix}`;
}

export const publicApiService = {
  async getCotizacionByToken(token: string): Promise<PublicCotizacionResponse> {
    const response = await http.get<PublicCotizacionResponse>(
      publicCotizacionPath(token),
    );
    return response.data;
  },

  async aceptarCotizacionByToken(
    token: string,
  ): Promise<PublicCotizacionResponse> {
    const response = await http.patch<PublicCotizacionResponse>(
      publicCotizacionPath(token, '/aceptar'),
      {},
    );
    return response.data;
  },

  async rechazarCotizacionByToken(
    token: string,
  ): Promise<PublicCotizacionResponse> {
    const response = await http.patch<PublicCotizacionResponse>(
      publicCotizacionPath(token, '/rechazar'),
    );
    return response.data;
  },
};
