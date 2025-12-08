<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton to="/admin/cotizaciones" class="mb-4" />

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      Detalle de Cotización
    </h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingCotizaciones && !cotizacionDetalle"
      message="Cargando detalle de la cotización..."
    />

    <div v-else-if="cotizacionDetalle" class="space-y-4 md:space-y-6">
      <!-- Estado destacado -->
      <div
        :class="getEstadoBannerClass(cotizacionDetalle.estado)"
        class="rounded-lg border-2 shadow-lg p-4 md:p-6"
      >
        <div class="flex items-center justify-between flex-col md:flex-row gap-4">
          <div class="flex items-center gap-4">
            <div
              :class="getEstadoIconClass(cotizacionDetalle.estado)"
              class="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="cotizacionDetalle.estado === 'vigente'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'aceptada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'vencida'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'rechazada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
              <p class="text-xs md:text-sm font-medium opacity-75 mb-1">Estado de la Cotización</p>
              <h3
                :class="getEstadoTextClass(cotizacionDetalle.estado)"
                class="text-xl md:text-2xl lg:text-3xl font-bold"
              >
                {{ getEstadoLabel(cotizacionDetalle.estado) }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Desde {{ formatDateTime(getEstadoTimestamp(cotizacionDetalle.estado)) }}
              </p>
            </div>
          </div>
          <div class="text-left md:text-right">
            <p class="text-xs md:text-sm font-medium opacity-75 mb-1">Folio</p>
            <p class="text-base md:text-lg font-mono font-bold">
              {{ cotizacionDetalle.folio }}
            </p>
          </div>
        </div>
      </div>

      <!-- Información General -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información General
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Folio
            </label>
            <p
              class="text-sm md:text-base text-gray-900 font-mono font-semibold"
            >
              {{ cotizacionDetalle.folio }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Estado
            </label>
            <span
              :class="getEstadoBadgeClass(cotizacionDetalle.estado)"
              class="inline-block px-4 py-2 text-xs md:text-sm font-semibold rounded-lg"
            >
              {{ getEstadoLabel(cotizacionDetalle.estado) }}
            </span>
          </div>

          <div v-if="getSedeNombre()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Sede
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getSedeNombre() }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de creación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaCreacion) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de vencimiento
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaVencimiento) }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaAceptacion">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de aceptación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaAceptacion) }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaRechazo">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de rechazo
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaRechazo) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
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

          <div v-if="cotizacionDetalle.ordenTrabajoId">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Orden de Trabajo Asociada
            </label>
            <router-link
              :to="{
                name: 'admin-orden-detalle',
                params: { id: cotizacionDetalle.ordenTrabajoId },
              }"
              class="inline-flex items-center text-sm md:text-base text-medical-blue-600 hover:text-medical-blue-900 font-medium font-mono"
            >
              {{ cotizacionDetalle.ordenTrabajoFolio || '-' }}
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

      <!-- Información del Cliente -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información del Cliente
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div v-if="getClienteNombre()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Empresa
            </label>
            <p class="text-sm md:text-base text-gray-900 font-medium">
              {{ getClienteNombre() }}
            </p>
          </div>

          <div v-if="getClienteRfc()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              RFC
            </label>
            <p class="text-sm md:text-base text-gray-900 font-mono uppercase">
              {{ getClienteRfc() }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Nombre del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteNombre() || '-' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Correo del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{
                getUsuarioClienteEmail() ||
                cotizacionDetalle.emailContacto ||
                '-'
              }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Teléfono del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteTelefono() || '-' }}
            </p>
          </div>

          <div v-if="getClienteId()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Cliente
            </label>
            <router-link
              :to="{
                name: 'admin-cliente-detalle',
                params: { id: getClienteId()! },
              }"
              class="inline-flex items-center text-sm md:text-base text-medical-blue-600 hover:text-medical-blue-900 font-medium"
            >
              Ver detalle del cliente
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

      <!-- Items de la cotización -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Servicios Cotizados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Cantidad
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Precio Unitario
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(item, index) in cotizacionDetalle.items"
                :key="index"
                class="hover:bg-gray-50 border-b border-gray-100"
              >
                <td class="px-3 py-2 text-sm text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-center">
                  {{ item.cantidad }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-right">
                  ${{
                    item.precioUnitarioSnapshot.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
                <td
                  class="px-3 py-2 text-sm text-gray-900 text-right font-medium"
                >
                  ${{
                    item.subtotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900"
                >
                  Subtotal:
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900"
                >
                  ${{
                    cotizacionDetalle.total.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  IVA:
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  ${{
                    iva.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-bold text-gray-900"
                >
                  Total:
                </td>
                <td
                  class="px-3 py-2 text-right font-bold text-lg text-gray-900"
                >
                  ${{
                    totalConIva.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- PDF -->
      <div
        v-if="cotizacionDetalle.pdfUrl"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Documento PDF
        </h2>
        <a
          :href="cotizacionDetalle.pdfUrl"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm"
        >
          <svg
            class="w-4 h-4 mr-2"
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
          Ver PDF
        </a>
      </div>
    </div>

    <div
      v-else-if="!isLoadingCotizaciones"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">
        No se pudo cargar la información de la cotización
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import { downloadDummyPDF } from '../../utils/pdfHelper';
import type { Servicio, UsuarioCliente } from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const route = useRoute();
const {
  cotizacionDetalle,
  isLoadingCotizaciones,
  error,
  obtenerCotizacionAdmin,
  limpiarCotizacionDetalle,
} = useAdmin();

// Computed para calcular el IVA (16% del subtotal)
const iva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total * 0.16;
});

// Computed para calcular el total con IVA
const totalConIva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total + iva.value;
});

// Cargar cotización al montar el componente
onMounted(async () => {
  const cotizacionId = route.params.id as string;
  if (cotizacionId) {
    try {
      await obtenerCotizacionAdmin(cotizacionId);
    } catch (err) {
      // El error ya se maneja en el store
      console.error('Error al cargar cotización:', err);
    }
  }
});

// Limpiar detalle al desmontar
onUnmounted(() => {
  limpiarCotizacionDetalle();
});

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return cliente.empresa || '';
  }
  return '';
}

function getClienteId(): string | null {
  if (!cotizacionDetalle.value) return null;
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null && cliente._id) {
    return cliente._id;
  }
  if (typeof cliente === 'string') {
    return cliente;
  }
  return null;
}

function getClienteRfc(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return cliente.rfc || '';
  }
  return '';
}

function getSedeNombre(): string {
  if (!cotizacionDetalle.value) return '';
  const sede = cotizacionDetalle.value.sedeId;
  if (typeof sede === 'object' && sede !== null) {
    return sede.ciudad || sede.clave || '';
  }
  return '';
}

function getUsuarioClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  const usuarioCliente = cotizacionDetalle.value.usuarioClienteId;
  if (typeof usuarioCliente === 'object' && usuarioCliente !== null) {
    return (usuarioCliente as UsuarioCliente).nombre || '';
  }
  return '';
}

function getUsuarioClienteEmail(): string {
  if (!cotizacionDetalle.value) return '';
  const usuarioCliente = cotizacionDetalle.value.usuarioClienteId;
  if (typeof usuarioCliente === 'object' && usuarioCliente !== null) {
    return (usuarioCliente as UsuarioCliente).email || '';
  }
  return '';
}

function getUsuarioClienteTelefono(): string {
  if (!cotizacionDetalle.value) return '';
  const usuarioCliente = cotizacionDetalle.value.usuarioClienteId;
  if (typeof usuarioCliente === 'object' && usuarioCliente !== null) {
    return (usuarioCliente as UsuarioCliente).telefono || '';
  }
  return '';
}

function getServicioNombre(item: any): string {
  const servicio = item.servicioId;
  if (typeof servicio === 'object' && servicio !== null) {
    return (servicio as Servicio).nombre || '';
  }
  return item.nombreServicioSnapshot || 'Servicio desconocido';
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    vencida: 'Vencida',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
  };
  return labels[estado] || estado;
}

function getEstadoBannerClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-50 border-green-300',
    vencida: 'bg-red-50 border-red-300',
    aceptada: 'bg-blue-50 border-blue-300',
    rechazada: 'bg-gray-50 border-gray-300',
  };
  return classes[estado] || 'bg-gray-50 border-gray-300';
}

function getEstadoIconClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-600',
    vencida: 'bg-red-100 text-red-600',
    aceptada: 'bg-blue-100 text-blue-600',
    rechazada: 'bg-gray-100 text-gray-600',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
}

function getEstadoTextClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'text-green-700',
    vencida: 'text-red-700',
    aceptada: 'text-blue-700',
    rechazada: 'text-gray-700',
  };
  return classes[estado] || 'text-gray-700';
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    vencida: 'bg-red-100 text-red-800',
    aceptada: 'bg-blue-100 text-blue-800',
    rechazada: 'bg-gray-100 text-gray-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getEstadoTimestamp(estado: string): Date | string | undefined {
  if (!cotizacionDetalle.value) return undefined;
  
  switch (estado) {
    case 'vigente':
      return cotizacionDetalle.value.fechaEstadoVigente || cotizacionDetalle.value.fechaCreacion;
    case 'vencida':
      return cotizacionDetalle.value.fechaEstadoVencida;
    case 'aceptada':
      return cotizacionDetalle.value.fechaEstadoAceptada || cotizacionDetalle.value.fechaAceptacion;
    case 'rechazada':
      return cotizacionDetalle.value.fechaEstadoRechazada || cotizacionDetalle.value.fechaRechazo;
    default:
      return cotizacionDetalle.value.fechaCreacion;
  }
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

function handleDownloadPDF(): void {
  if (!cotizacionDetalle.value) return;

  const filename = `${cotizacionDetalle.value.folio}.pdf`;
  const title = `${cotizacionDetalle.value.folio}`;
  const content = ['Este es un PDF dummy generado para el MVP.'];

  downloadDummyPDF(filename, title, content);
}
</script>
