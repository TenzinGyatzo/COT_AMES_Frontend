/**
 * Store de Pinia para el cotizador
 * Maneja el estado del catálogo (sedes y servicios) y las cantidades seleccionadas
 * Expone acciones para cargar datos del backend y crear cotizaciones autenticadas
 */

import { defineStore } from 'pinia';
import type {
  Servicio,
  Sede,
  PublicCotizacionResponse,
} from '../types/backend';
import httpClient from '../services/http';

interface CotizadorState {
  sedes: Sede[];
  servicios: Servicio[];
  selectedSedeId: string | null;
  cantidadesPorServicio: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  ultimaRespuesta: PublicCotizacionResponse | null;
}

export const useCotizadorStore = defineStore('cotizador', {
  state: (): CotizadorState => ({
    sedes: [],
    servicios: [],
    selectedSedeId: null,
    cantidadesPorServicio: {},
    isLoading: false,
    error: null,
    ultimaRespuesta: null,
  }),

  actions: {
    /**
     * Carga todas las sedes disponibles desde el backend
     */
    async fetchSedes(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await httpClient.get<Sede[]>('/sedes');
        this.sedes = response.data;
      } catch (error: any) {
        this.error = 'No fue posible cargar las sedes';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Carga los servicios de una sede específica o todos si no se especifica sedeId
     * @param sedeId - ID de la sede (opcional)
     */
    async fetchServicios(sedeId?: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const params = sedeId ? { sedeId } : {};
        const response = await httpClient.get<Servicio[]>('/servicios', {
          params,
        });
        this.servicios = response.data;
      } catch (error: any) {
        this.error = 'No fue posible cargar los servicios';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Actualiza la cantidad seleccionada para un servicio
     * @param servicioId - ID del servicio
     * @param cantidad - Cantidad seleccionada
     */
    setCantidad(servicioId: string, cantidad: number): void {
      if (cantidad <= 0) {
        delete this.cantidadesPorServicio[servicioId];
      } else {
        this.cantidadesPorServicio[servicioId] = cantidad;
      }
    },

    /**
     * Crea una cotización autenticada desde el portal cliente
     * Usa el endpoint /cliente-portal/cotizaciones que requiere autenticación
     * @param emailContacto - Correo electrónico de contacto para la cotización
     */
    async crearCotizacionAutenticada(emailContacto: string): Promise<void> {
      if (!this.selectedSedeId) {
        throw new Error('Debe seleccionar una sede');
      }

      // Filtrar solo servicios con cantidad > 0
      const items = Object.entries(this.cantidadesPorServicio)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([servicioId, cantidad]) => ({
          servicioId,
          cantidad,
        }));

      if (items.length === 0) {
        throw new Error('Debe seleccionar al menos un servicio');
      }

      this.isLoading = true;
      this.error = null;

      try {
        const payload = {
          sedeId: this.selectedSedeId,
          emailContacto,
          items,
        };

        const response = await httpClient.post<PublicCotizacionResponse>(
          '/cliente-portal/cotizaciones',
          payload,
        );

        this.ultimaRespuesta = response.data;

        // Limpiar cantidades después de crear la cotización
        this.cantidadesPorServicio = {};
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'No fue posible crear la cotización';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
