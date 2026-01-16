import http from './http';

export const publicApiService = {
  /**
   * Obtener detalle de cotización por magic token
   */
  async getCotizacionByToken(token: string) {
    const response = await http.get(`/cotizaciones/public/${token}`);
    return response.data;
  },

  /**
   * Aceptar cotización por magic token
   */
  async aceptarCotizacionByToken(token: string, trabajadores: any[]) {
    const response = await http.patch(`/cotizaciones/public/${token}/aceptar`, {
      trabajadores
    });
    return response.data;
  },

  /**
   * Rechazar cotización por magic token
   */
  async rechazarCotizacionByToken(token: string) {
    const response = await http.patch(`/cotizaciones/public/${token}/rechazar`);
    return response.data;
  }
};
