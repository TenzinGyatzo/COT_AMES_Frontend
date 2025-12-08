/**
 * Store de Pinia para las cotizaciones del cliente
 * Maneja el estado del listado y detalle de cotizaciones del cliente autenticado
 * Expone acciones para cargar el listado y el detalle desde el backend
 */

import { defineStore } from 'pinia';
import type {
  CotizacionListItemDto,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
} from '../types/backend';
import {
  getMisCotizaciones,
  getCotizacionById,
  aceptarCotizacion,
  rechazarCotizacion,
  repetirCotizacion,
} from '../services/cliente-api.service';
import type { MisCotizacionesFilters } from '../services/cliente-api.service';

interface ClienteCotizacionesState {
  listado: CotizacionListItemDto[];
  detalle: CotizacionDetalleDto | null;
  isLoading: boolean;
  isActionLoading: boolean; // Estado de carga para acciones (aceptar/rechazar)
  isRepeatLoading: boolean; // Estado de carga específico para repetir cotización
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useClienteCotizacionesStore = defineStore('cliente-cotizaciones', {
  state: (): ClienteCotizacionesState => ({
    listado: [],
    detalle: null,
    isLoading: false,
    isActionLoading: false,
    isRepeatLoading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  }),

  actions: {
    /**
     * Carga el listado de cotizaciones del cliente autenticado desde el backend
     * @param filters - Filtros opcionales (estado, página, límite)
     */
    async fetchMisCotizaciones(
      filters: MisCotizacionesFilters = {},
    ): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response: PaginatedCotizacionesResponseDto =
          await getMisCotizaciones(filters);
        this.listado = response.data;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar las cotizaciones';
        this.listado = [];
        this.pagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Carga el detalle de una cotización específica del cliente autenticado
     * @param id - ID de la cotización
     */
    async fetchCotizacion(id: string): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await getCotizacionById(id);
        this.detalle = response;
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible cargar el detalle de la cotización';
        this.detalle = null;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Limpia el detalle del estado
     */
    clearDetalle(): void {
      this.detalle = null;
      this.error = null;
    },

    /**
     * Acepta una cotización del cliente autenticado
     * @param id - ID de la cotización a aceptar
     */
    async aceptarCotizacion(id: string): Promise<void> {
      this.isActionLoading = true;
      this.error = null;

      try {
        const response = await aceptarCotizacion(id);

        // Actualizar el detalle si está cargado
        if (this.detalle && this.detalle._id === id) {
          this.detalle = response;
        }

        // Actualizar en el listado si existe
        const index = this.listado.findIndex((item) => item.id === id);
        if (index !== -1 && this.listado[index]) {
          const itemActualizado = this.listado[index];
          this.listado[index] = {
            id: itemActualizado.id,
            folio: itemActualizado.folio,
            fecha: itemActualizado.fecha,
            montoTotal: itemActualizado.montoTotal,
            empresa: itemActualizado.empresa,
            nombreSolicitante: itemActualizado.nombreSolicitante,
            correo: itemActualizado.correo,
            estado: response.estado,
            pdfUrl: itemActualizado.pdfUrl,
          };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible aceptar la cotización';
        throw error;
      } finally {
        this.isActionLoading = false;
      }
    },

    /**
     * Rechaza una cotización del cliente autenticado
     * @param id - ID de la cotización a rechazar
     */
    async rechazarCotizacion(id: string): Promise<void> {
      this.isActionLoading = true;
      this.error = null;

      try {
        const response = await rechazarCotizacion(id);

        // Actualizar el detalle si está cargado
        if (this.detalle && this.detalle._id === id) {
          this.detalle = response;
        }

        // Actualizar en el listado si existe
        const index = this.listado.findIndex((item) => item.id === id);
        if (index !== -1 && this.listado[index]) {
          const itemActualizado = this.listado[index];
          this.listado[index] = {
            id: itemActualizado.id,
            folio: itemActualizado.folio,
            fecha: itemActualizado.fecha,
            montoTotal: itemActualizado.montoTotal,
            empresa: itemActualizado.empresa,
            nombreSolicitante: itemActualizado.nombreSolicitante,
            correo: itemActualizado.correo,
            estado: response.estado,
            pdfUrl: itemActualizado.pdfUrl,
          };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible rechazar la cotización';
        throw error;
      } finally {
        this.isActionLoading = false;
      }
    },

    /**
     * Repite una cotización del cliente autenticado
     * @param id - ID de la cotización a repetir
     * @returns Cotización completa creada
     */
    async repetirCotizacion(id: string): Promise<CotizacionDetalleDto> {
      this.isRepeatLoading = true;
      this.error = null;

      try {
        const nuevaCotizacion = await repetirCotizacion(id);

        // Convertir CotizacionDetalleDto a CotizacionListItemDto
        const cliente =
          typeof nuevaCotizacion.clienteId === 'object'
            ? nuevaCotizacion.clienteId
            : null;
        const usuarioCliente =
          typeof nuevaCotizacion.usuarioClienteId === 'object'
            ? nuevaCotizacion.usuarioClienteId
            : null;

        const nuevoItem: CotizacionListItemDto = {
          id: nuevaCotizacion._id,
          folio: nuevaCotizacion.folio,
          fecha:
            typeof nuevaCotizacion.fechaCreacion === 'string'
              ? new Date(nuevaCotizacion.fechaCreacion)
              : nuevaCotizacion.fechaCreacion,
          montoTotal: nuevaCotizacion.total,
          empresa: cliente?.empresa,
          nombreSolicitante: usuarioCliente?.nombre,
          correo: nuevaCotizacion.emailContacto,
          estado: nuevaCotizacion.estado,
          pdfUrl: nuevaCotizacion.pdfUrl,
        };

        // Agregar la nueva cotización al inicio del listado
        this.listado.unshift(nuevoItem);

        // Actualizar el total de la paginación
        this.pagination.total += 1;

        return nuevaCotizacion;
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          'No fue posible repetir la cotización';
        throw error;
      } finally {
        this.isRepeatLoading = false;
      }
    },
  },
});
