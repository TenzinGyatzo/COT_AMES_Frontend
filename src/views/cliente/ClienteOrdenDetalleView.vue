<template>
  <section class="p-5">
    <BaseBackButton to="/cliente/ordenes">
      Volver a mis órdenes de trabajo
    </BaseBackButton>

    <BasePageHeader
      title="Detalle de orden de trabajo"
      description="Información completa de la orden de trabajo seleccionada."
      align="left"
    />

    <div
      v-if="detalleError"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ detalleError }}
    </div>

    <BaseSectionLoader
      v-if="detalleLoading && !detalle"
      message="Cargando detalle de la orden de trabajo..."
    />

    <BaseEmptyState
      v-else-if="!detalle && !detalleLoading && !detalleError"
      title="Orden de trabajo no encontrada"
      description="La orden de trabajo solicitada no existe o no tienes permisos para verla."
      size="md"
    >
      <template #actions>
        <BaseButtonLoader
          type="button"
          variant="primary"
          @click="$router.push('/cliente/ordenes')"
        >
          Volver a la lista
        </BaseButtonLoader>
      </template>
    </BaseEmptyState>

    <div v-else-if="detalle" class="space-y-6 pb-6">
      <!-- Estado destacado -->
      <div
        :class="getEstadoBannerClass(detalle.estado)"
        class="rounded-lg border-2 shadow-lg p-6"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              :class="getEstadoIconClass(detalle.estado)"
              class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="detalle.estado === 'pendiente'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="detalle.estado === 'en_proceso'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <svg
                v-else-if="detalle.estado === 'completada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="detalle.estado === 'cancelada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium opacity-75 mb-1">Estado de la Orden</p>
              <h3
                :class="getEstadoTextClass(detalle.estado)"
                class="text-2xl md:text-3xl font-bold"
              >
                {{ getEstadoLabel(detalle.estado) }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Desde {{ formatDateTime(getEstadoTimestamp(detalle.estado)) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium opacity-75 mb-1">Folio</p>
            <p class="text-lg font-mono font-bold">
              {{ detalle.folio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Información general -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Información General
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Folio
            </label>
            <p class="text-sm text-gray-900 font-mono font-semibold">
              {{ detalle.folio }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <span
              :class="getEstadoBadgeClass(detalle.estado)"
              class="inline-block px-4 py-2 text-sm font-semibold rounded-lg"
            >
              {{ getEstadoLabel(detalle.estado) }}
            </span>
          </div>

          <div v-if="getSedeNombre()">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <p class="text-sm text-gray-900">
              {{ getSedeNombre() }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de creación
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaCreacion) }}
            </p>
          </div>

          <div v-if="detalle.fechaInicio">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaInicio) }}
            </p>
          </div>

          <div v-if="detalle.fechaCompletacion">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de completación
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaCompletacion) }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descargar
            </label>
            <button
              type="button"
              @click="handleDownloadPDF"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors"
            >
              <svg
                class="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Descargar PDF
            </button>
          </div>

          <div v-if="detalle.cotizacionId">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Cotización Asociada
            </label>
            <router-link
              :to="{
                name: 'cliente-cotizacion-detalle',
                params: { id: detalle.cotizacionId },
              }"
              class="inline-flex items-center text-sm text-medical-blue-600 hover:text-medical-blue-900 font-medium font-mono"
            >
              {{ getCotizacionFolio() || '-' }}
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Información del cliente -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Información del Cliente
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-if="getClienteNombre()">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <p class="text-sm text-gray-900 font-semibold">
              {{ getClienteNombre() }}
            </p>
          </div>

          <div v-if="getClienteRfc()">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              RFC
            </label>
            <p class="text-sm text-gray-900 font-mono uppercase">
              {{ getClienteRfc() }}
            </p>
          </div>

          <div v-if="getUsuarioNombre()">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre del usuario
            </label>
            <p class="text-sm text-gray-900">{{ getUsuarioNombre() }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <p class="text-sm text-gray-900">{{ getUsuarioEmail() }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del usuario
            </label>
            <p class="text-sm text-gray-900">
              {{ getUsuarioTelefono() || '-' }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mi Perfil
            </label>
            <router-link
              :to="{ name: 'cliente-perfil' }"
              class="inline-flex items-center text-sm text-medical-blue-600 hover:text-medical-blue-900 font-medium"
            >
              Ver mi perfil
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Servicios contratados -->
      <div
        v-if="detalle.cotizacion?.items && detalle.cotizacion.items.length > 0"
        class="rounded-lg border border-gray-200 bg-white shadow-md p-6"
      >
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Servicios Contratados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
                >
                  Servicio
                </th>
                <th
                  class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descripción
                </th>
                <th
                  class="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(item, index) in detalle.cotizacion.items"
                :key="index"
              >
                <td class="px-4 py-2 text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-4 py-2 text-gray-600">
                  {{ getServicioDescripcion(item) || '-' }}
                </td>
                <td class="px-4 py-2 text-center text-gray-600">
                  {{ item.cantidad }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Trabajadores -->
      <div
        v-if="detalle.trabajadores && detalle.trabajadores.length > 0"
        class="rounded-lg border border-gray-200 bg-white shadow-md p-6"
      >
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">
            Trabajadores ({{ detalle.trabajadores.length }})
          </h2>
        </div>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div
            v-for="(trabajador, index) in detalle.trabajadores"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Nombre Completo
                  </label>
                  <p class="text-sm font-medium text-gray-900">
                    {{ trabajador.nombre }}
                    {{ trabajador.primerApellido }}
                    {{ trabajador.segundoApellido || '' }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Puesto
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.puesto }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ formatOnlyDate(trabajador.fechaNacimiento) }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Sexo
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.sexo }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Escolaridad
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ trabajador.escolaridad }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Estado Civil
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ trabajador.estadoCivil }}
                  </p>
                </div>
                <div v-if="trabajador.fechaIngreso">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Fecha de Ingreso a la Empresa
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ formatOnlyDate(trabajador.fechaIngreso) }}
                  </p>
                </div>
                <div v-if="trabajador.telefono">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Teléfono
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.telefono }}</p>
                </div>
                <div v-if="trabajador.curp">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    CURP
                  </label>
                  <p class="text-sm text-gray-900 font-mono uppercase">
                    {{ trabajador.curp }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bitácora de Observaciones -->
        <div
          class="rounded-lg border border-gray-200 bg-white shadow-md p-6"
        >
          <h2
            class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
          >
            Bitácora de Observaciones
          </h2>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-if="getObservacionesArray().length > 0"
              v-for="(obs, index) in getObservacionesArray()"
              :key="index"
              class="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 whitespace-pre-wrap break-words mb-1">
                  {{ obs.texto }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ formatDateTime(obs.timestamp) }}
                </p>
              </div>
            </div>
            <div v-else>
              <p class="text-xs text-gray-500 italic p-3 text-center border border-gray-200 rounded-md bg-gray-50">No hay observaciones</p>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="rounded-lg border border-gray-200 bg-white shadow-md p-6">
          <h2
            class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
          >
            Información Adicional
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ID de la orden
              </label>
              <p class="text-xs text-gray-900 font-mono">{{ detalle.id }}</p>
            </div>

            <div v-if="detalle.createdAt">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Última actualización
              </label>
              <p class="text-sm text-gray-900">
                {{ formatDate(detalle.updatedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>


      <!-- Botones de acción -->
      <div class="flex justify-between items-center">
        <BaseButtonLoader
          type="button"
          variant="secondaryOutline"
          @click="handleDownloadPDF"
        >
          <svg
            class="-ml-1 mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar PDF
        </BaseButtonLoader>
        <BaseButtonLoader
          type="button"
          variant="secondary"
          @click="$router.push('/cliente/ordenes')"
        >
          Volver a la lista
        </BaseButtonLoader>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useClienteOrdenes } from '../../composables/useClienteOrdenes';
import { useClientePerfil } from '../../composables/useClientePerfil';
import { downloadOrdenTrabajoPDF } from '../../utils/pdfHelper';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseEmptyState from '../../components/base/BaseEmptyState.vue';
import BaseButtonLoader from '../../components/base/BaseButtonLoader.vue';
import BasePageHeader from '../../components/base/BasePageHeader.vue';

const route = useRoute();
const { detalle, detalleLoading, detalleError, fetchOrden, clearDetalle } =
  useClienteOrdenes();

const { data: perfilCliente, fetchMiPerfil } = useClientePerfil();

// Cargar detalle al montar el componente
onMounted(async () => {
  const ordenId = route.params.id as string;
  if (ordenId) {
    try {
      // Cargar perfil del usuario para obtener nombre y email (solo la primera vez)
      if (!perfilCliente.value) {
        await fetchMiPerfil();
      }
      await fetchOrden(ordenId);
    } catch (err) {
      console.error('Error al cargar el detalle de la orden de trabajo:', err);
    }
  }
});

// Limpiar detalle al desmontar
onUnmounted(() => {
  clearDetalle();
});

// Helpers para obtener información poblada
function getClienteNombre(): string {
  if (!detalle.value?.cliente) return '';
  const cliente = detalle.value.cliente;
  return cliente.empresa || '';
}

function getClienteRfc(): string {
  if (!detalle.value?.cliente) return '';
  const cliente = detalle.value.cliente;
  return cliente.rfc || '';
}

function getUsuarioNombre(): string {
  // Mostrar nombre del usuario cliente
  // Primero intentar desde usuarioCliente poblado
  if (detalle.value?.usuarioCliente) {
    return detalle.value.usuarioCliente.nombre || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.nombre || '';
  }
  return '';
}

function getUsuarioEmail(): string {
  // Mostrar email del usuario cliente
  // Primero intentar desde usuarioCliente poblado
  if (detalle.value?.usuarioCliente) {
    return detalle.value.usuarioCliente.email || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.email || '';
  }
  return '';
}

function getUsuarioTelefono(): string {
  // Mostrar teléfono del usuario cliente
  // Primero intentar desde usuarioCliente poblado
  if (detalle.value?.usuarioCliente) {
    return detalle.value.usuarioCliente.telefono || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.telefono || '';
  }
  return '';
}

function getSedeNombre(): string {
  if (!detalle.value?.sede) return '';
  return detalle.value.sede.ciudad || detalle.value.sede.clave || '';
}

function getCotizacionFolio(): string {
  if (detalle.value?.cotizacion?.folio) {
    return detalle.value.cotizacion.folio;
  }
  return '';
}

function getServicioNombre(item: any): string {
  return item.nombreServicioSnapshot || 'Servicio no disponible';
}

function getServicioDescripcion(item: any): string {
  return item.descripcionServicioSnapshot || '';
}

// Función para normalizar observaciones
function normalizarObservaciones(observaciones: any): Array<{ texto: string; timestamp: Date }> {
  if (Array.isArray(observaciones)) {
    return observaciones.map((obs: any) => ({
      texto: obs.texto || obs,
      timestamp: obs.timestamp ? new Date(obs.timestamp) : new Date(),
    }));
  } else if (typeof observaciones === 'string' && observaciones.trim()) {
    // Migración: convertir string antiguo a array
    return [
      {
        texto: observaciones,
        timestamp: new Date(),
      },
    ];
  }
  return [];
}

function getObservacionesArray(): Array<{ texto: string; timestamp: Date }> {
  if (!detalle.value?.observaciones) return [];
  return normalizarObservaciones(detalle.value.observaciones);
}

// Helpers de formato
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatOnlyDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
}

function getEstadoBannerClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-50 border-yellow-300',
    en_proceso: 'bg-blue-50 border-blue-300',
    completada: 'bg-green-50 border-green-300',
    cancelada: 'bg-red-50 border-red-300',
  };
  return classes[estado] || 'bg-gray-50 border-gray-300';
}

function getEstadoIconClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-600',
    en_proceso: 'bg-blue-100 text-blue-600',
    completada: 'bg-green-100 text-green-600',
    cancelada: 'bg-red-100 text-red-600',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
}

function getEstadoTextClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'text-yellow-700',
    en_proceso: 'text-blue-700',
    completada: 'text-green-700',
    cancelada: 'text-red-700',
  };
  return classes[estado] || 'text-gray-700';
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getEstadoTimestamp(estado: string): Date | string | undefined {
  if (!detalle.value) return undefined;
  
  switch (estado) {
    case 'pendiente':
      return detalle.value.fechaEstadoPendiente || detalle.value.fechaCreacion;
    case 'en_proceso':
      return detalle.value.fechaEstadoEnProceso || detalle.value.fechaInicio;
    case 'completada':
      return detalle.value.fechaEstadoCompletada || detalle.value.fechaCompletacion;
    case 'cancelada':
      return detalle.value.fechaEstadoCancelada || detalle.value.updatedAt || detalle.value.fechaCreacion;
    default:
      return detalle.value.fechaCreacion;
  }
}

// Handler para descargar PDF
// Handler para descargar PDF
async function handleDownloadPDF(): Promise<void> {
  if (!detalle.value) return;
  await downloadOrdenTrabajoPDF(detalle.value);
}
</script>
