/**
 * Store de Pinia para el perfil del cliente
 * Maneja el estado del perfil del cliente autenticado (usuario y empresa)
 * Expone acciones para cargar y actualizar el perfil desde el backend
 */

import { defineStore } from 'pinia';
import type { MiPerfilResponse, UpdateMiPerfilPayload } from '../types/backend';
import { getMiPerfil, updateMiPerfil } from '../services/cliente-api.service';

interface ClientePerfilState {
  data: MiPerfilResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const useClientePerfilStore = defineStore('cliente-perfil', {
  state: (): ClientePerfilState => ({
    data: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * Carga el perfil del cliente autenticado desde el backend
     */
    async fetchMiPerfil(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await getMiPerfil();
        this.data = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'No fue posible cargar el perfil';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza el perfil del cliente autenticado
     * @param payload - Datos a actualizar (nombre, email, telefono)
     */
    async updateMiPerfil(payload: UpdateMiPerfilPayload): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await updateMiPerfil(payload);
        this.data = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible actualizar el perfil';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
