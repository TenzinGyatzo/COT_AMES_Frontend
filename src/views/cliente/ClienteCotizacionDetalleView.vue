<template>
  <section class="p-5">
    <BaseBackButton to="/cliente/cotizaciones">
      Volver a mis cotizaciones
    </BaseBackButton>

    <BasePageHeader
      title="Detalle de cotización"
      description="Información completa de la cotización seleccionada."
      align="left"
    />

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoading && !detalle"
      message="Cargando detalle de la cotización..."
    />

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
                v-if="detalle.estado === 'vigente'"
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
                v-else-if="detalle.estado === 'aceptada'"
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
                v-else-if="detalle.estado === 'vencida'"
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
                v-else-if="detalle.estado === 'rechazada'"
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
              <p class="text-sm font-medium opacity-75 mb-1">Estado de la Cotización</p>
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaVencimiento) }}
            </p>
          </div>

          <div v-if="detalle.fechaAceptacion">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de aceptación
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaAceptacion) }}
            </p>
          </div>

          <div v-if="detalle.fechaAceptacion">
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

          <div v-if="detalle.ordenTrabajoId">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Orden de Trabajo Asociada
            </label>
            <router-link
              :to="{
                name: 'cliente-orden-detalle',
                params: { id: detalle.ordenTrabajoId },
              }"
              class="inline-flex items-center text-sm text-medical-blue-600 hover:text-medical-blue-900 font-medium font-mono"
            >
              {{ detalle.ordenTrabajoFolio || '-' }}
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

          <div v-if="detalle.fechaRechazo">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha de rechazo
            </label>
            <p class="text-sm text-gray-900">
              {{ formatDate(detalle.fechaRechazo) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Información del cliente y sede -->
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

      <!-- Items de la cotización -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Servicios Cotizados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Cantidad
                </th>
                <th
                  class="px-3 py-2 text-right font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Precio Unitario
                </th>
                <th
                  class="px-3 py-2 text-right font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in detalle.items"
                :key="index"
                class="border-b border-gray-100"
              >
                <td class="px-3 py-2 text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-3 py-2 text-center text-gray-600">
                  {{ item.cantidad }}
                </td>
                <td class="px-3 py-2 text-right text-gray-600">
                  {{ formatCurrency(item.precioUnitarioSnapshot) }}
                </td>
                <td class="px-3 py-2 text-right text-gray-900 font-medium">
                  {{ formatCurrency(item.subtotal) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-700"
                >
                  Subtotal
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-base"
                >
                  {{ formatCurrency(detalle.total) }}
                </td>
              </tr>
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-700 text-sm"
                >
                  IVA
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  {{ formatCurrency(iva) }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-bold text-gray-900"
                >
                  Total
                </td>
                <td
                  class="px-3 py-2 text-right font-bold text-gray-900 text-lg"
                >
                  {{ formatCurrency(totalConIva) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div
        v-if="successMessage"
        class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <!-- Acciones de aceptar/rechazar -->
      <div
        v-if="esCotizacionPendiente"
        class="rounded-lg border border-gray-200 bg-white shadow-md p-6"
      >
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Acciones
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          Puede aceptar o rechazar esta cotización. Una vez aceptada, se
          generará automáticamente una orden de trabajo.
        </p>
        <div class="flex gap-3">
          <BaseButtonLoader
            type="button"
            variant="primary"
            :disabled="!esCotizacionPendiente"
            :loading="isActionLoading"
            custom-class="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            @click="handleAceptar"
          >
            <svg
              v-if="!isActionLoading"
              class="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Aceptar cotización
          </BaseButtonLoader>
          <BaseButtonLoader
            type="button"
            variant="danger"
            :disabled="!esCotizacionPendiente"
            :loading="isActionLoading"
            @click="handleRechazar"
          >
            <svg
              v-if="!isActionLoading"
              class="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Rechazar cotización
          </BaseButtonLoader>
        </div>
      </div>

      <!-- Acción de repetir cotización -->
      <div class="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <h2
          class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
        >
          Otras Acciones
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          Puede generar una nueva cotización basada en esta, con precios
          actualizados y un nuevo folio.
        </p>
        <div class="flex gap-3">
          <BaseButtonLoader
            type="button"
            variant="primary"
            :loading="isRepeatLoading"
            @click="handleRepetir"
          >
            <svg
              v-if="!isRepeatLoading"
              class="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Repetir cotización
          </BaseButtonLoader>
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
        </div>
      </div>

      <!-- Botón de volver -->
      <div class="flex justify-end">
        <BaseButtonLoader
          type="button"
          variant="secondary"
          @click="$router.push('/cliente/cotizaciones')"
        >
          Volver a la lista
        </BaseButtonLoader>
      </div>
    </div>

    <!-- Modal de éxito al repetir cotización -->
    <ModalCotizacionCreada
      :cotizacion="nuevaCotizacionCreada"
      @close="cerrarModalNuevaCotizacion"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetallesNuevaCotizacion"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClienteCotizaciones } from '../../composables/useClienteCotizaciones';
import { useClientePerfil } from '../../composables/useClientePerfil';
import { downloadDummyPDF } from '../../utils/pdfHelper';
import type {
  Cliente,
  Sede,
  Servicio,
  UsuarioCliente,
  CotizacionDetalleDto,
} from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../../components/base/BaseButtonLoader.vue';
import BasePageHeader from '../../components/base/BasePageHeader.vue';
import ModalCotizacionCreada from '../../components/common/ModalCotizacionCreada.vue';

const route = useRoute();
const router = useRouter();
const {
  detalle,
  isLoading,
  isActionLoading,
  isRepeatLoading,
  error,
  fetchCotizacion,
  clearDetalle,
  aceptarCotizacion,
  rechazarCotizacion,
  repetirCotizacion,
} = useClienteCotizaciones();

const { data: perfilCliente, fetchMiPerfil } = useClientePerfil();

// Estado para mensajes de éxito (para aceptar/rechazar)
const successMessage = ref<string | null>(null);

// Estado para la nueva cotización creada (para el modal de repetir)
const nuevaCotizacionCreada = ref<CotizacionDetalleDto | null>(null);

// Función para cargar el detalle de la cotización
async function cargarDetalleCotizacion(cotizacionId: string) {
  if (!cotizacionId) return;

  try {
    // Cargar perfil del usuario para obtener nombre y email (solo la primera vez)
    if (!perfilCliente.value) {
      await fetchMiPerfil();
    }
    await fetchCotizacion(cotizacionId);
  } catch (err) {
    console.error('Error al cargar el detalle de la cotización:', err);
  }
}

// Cargar detalle al montar el componente
onMounted(async () => {
  const cotizacionId = route.params.id as string;
  await cargarDetalleCotizacion(cotizacionId);
});

// Observar cambios en el parámetro id de la ruta para recargar el detalle
watch(
  () => route.params.id,
  async (newId, oldId) => {
    // Solo recargar si el ID cambió y es diferente
    if (newId && newId !== oldId) {
      nuevaCotizacionCreada.value = null; // Cerrar modal si está abierto
      await cargarDetalleCotizacion(newId as string);
    }
  },
);

// Limpiar detalle al desmontar
onUnmounted(() => {
  clearDetalle();
});

// Helpers para obtener Información poblada
function getClienteNombre(): string {
  // Mostrar empresa del cliente
  if (!detalle.value?.clienteId) return '';
  if (typeof detalle.value.clienteId === 'string') return '';
  const cliente = detalle.value.clienteId as Cliente;
  return cliente.empresa || '';
}

function getClienteRfc(): string {
  // Mostrar RFC del cliente
  if (!detalle.value?.clienteId) return '';
  if (typeof detalle.value.clienteId === 'string') return '';
  const cliente = detalle.value.clienteId as Cliente;
  return cliente.rfc || '';
}

function getUsuarioNombre(): string {
  // Mostrar nombre del usuario cliente
  // Primero intentar desde usuarioClienteId poblado
  if (
    detalle.value?.usuarioClienteId &&
    typeof detalle.value.usuarioClienteId === 'object'
  ) {
    const usuarioCliente = detalle.value.usuarioClienteId as UsuarioCliente;
    return usuarioCliente.nombre || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.nombre || '';
  }
  return '';
}

function getUsuarioEmail(): string {
  // Mostrar email del usuario cliente
  // Primero intentar desde usuarioClienteId poblado
  if (
    detalle.value?.usuarioClienteId &&
    typeof detalle.value.usuarioClienteId === 'object'
  ) {
    const usuarioCliente = detalle.value.usuarioClienteId as UsuarioCliente;
    return usuarioCliente.email || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.email || '';
  }
  // Fallback al emailContacto de la cotización
  return detalle.value?.emailContacto || '';
}

function getUsuarioTelefono(): string {
  // Mostrar teléfono del usuario cliente
  // Primero intentar desde usuarioClienteId poblado
  if (
    detalle.value?.usuarioClienteId &&
    typeof detalle.value.usuarioClienteId === 'object'
  ) {
    const usuarioCliente = detalle.value.usuarioClienteId as UsuarioCliente;
    return usuarioCliente.telefono || '';
  }
  // Si no está poblado, usar el perfil del usuario autenticado
  if (perfilCliente.value?.usuario) {
    return perfilCliente.value.usuario.telefono || '';
  }
  return '';
}

function getSedeNombre(): string {
  if (!detalle.value?.sedeId) return '';
  if (typeof detalle.value.sedeId === 'string') return '';
  const sede = detalle.value.sedeId as Sede;
  return sede.ciudad || '';
}

function getServicioNombre(item: any): string {
  if (typeof item.servicioId === 'string') {
    return item.nombreServicioSnapshot || 'Servicio no disponible';
  }
  const servicio = item.servicioId as Servicio;
  return (
    servicio.nombre || item.nombreServicioSnapshot || 'Servicio no disponible'
  );
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
  if (!detalle.value) return undefined;
  
  switch (estado) {
    case 'vigente':
      return detalle.value.fechaEstadoVigente || detalle.value.fechaCreacion;
    case 'vencida':
      return detalle.value.fechaEstadoVencida;
    case 'aceptada':
      return detalle.value.fechaEstadoAceptada || detalle.value.fechaAceptacion;
    case 'rechazada':
      return detalle.value.fechaEstadoRechazada || detalle.value.fechaRechazo;
    default:
      return detalle.value.fechaCreacion;
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

function formatCurrency(value: number | undefined): string {
  if (value == null) return '';
  return value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

// Computed para verificar si la cotización está pendiente (solo vigente)
// Según el backend, solo se pueden aceptar/rechazar cotizaciones en estado 'vigente'
const esCotizacionPendiente = computed(() => {
  return detalle.value?.estado === 'vigente';
});

// Computed para calcular el IVA (16% del subtotal)
const iva = computed(() => {
  if (!detalle.value?.total) return 0;
  return detalle.value.total * 0.16;
});

// Computed para calcular el total con IVA
const totalConIva = computed(() => {
  if (!detalle.value?.total) return 0;
  return detalle.value.total + iva.value;
});

// Manejo de acciones
async function handleAceptar(): Promise<void> {
  if (!detalle.value?._id) return;

  const confirmacion = window.confirm(
    '¿Está seguro de que desea aceptar esta cotización? Se generará automáticamente una orden de trabajo.',
  );

  if (!confirmacion) return;

  successMessage.value = null;
  try {
    await aceptarCotizacion(detalle.value._id);
    // Recargar el detalle para mostrar el nuevo estado
    await fetchCotizacion(detalle.value._id);
    successMessage.value =
      'cotización aceptada exitosamente. Se ha generado una orden de trabajo.';
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  } catch (err) {
    console.error('Error al aceptar la cotización:', err);
    // El error ya se maneja en el store y se muestra en el template
  }
}

async function handleRechazar(): Promise<void> {
  if (!detalle.value?._id) return;

  const confirmacion = window.confirm(
    '¿Está seguro de que desea rechazar esta cotización? Esta acción no se puede deshacer.',
  );

  if (!confirmacion) return;

  successMessage.value = null;
  try {
    await rechazarCotizacion(detalle.value._id);
    // Recargar el detalle para mostrar el nuevo estado
    await fetchCotizacion(detalle.value._id);
    successMessage.value = 'cotización rechazada exitosamente.';
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  } catch (err) {
    console.error('Error al rechazar la cotización:', err);
    // El error ya se maneja en el store y se muestra en el template
  }
}

async function handleRepetir(): Promise<void> {
  if (!detalle.value?._id) return;

  const confirmacion = window.confirm(
    '¿Desea generar una nueva cotización basada en esta? Se creará una nueva cotización con precios actualizados y un nuevo folio.',
  );

  if (!confirmacion) return;

  nuevaCotizacionCreada.value = null;
  try {
    const nuevaCotizacion = await repetirCotizacion(detalle.value._id);
    // Mostrar el modal con la nueva cotización
    nuevaCotizacionCreada.value = nuevaCotizacion;
  } catch (err) {
    console.error('Error al repetir la cotización:', err);
    // El error ya se maneja en el store y se muestra en el template
  }
}

// Cerrar modal de nueva cotización
function cerrarModalNuevaCotizacion(): void {
  nuevaCotizacionCreada.value = null;
}

// Ver lista de cotizaciones
function verCotizaciones(): void {
  nuevaCotizacionCreada.value = null;
  router.push({ name: 'cliente-cotizaciones' });
}

// Ver detalles de la nueva cotización creada
function verDetallesNuevaCotizacion(): void {
  if (!nuevaCotizacionCreada.value?._id) {
    console.error('No hay ID de cotización disponible');
    return;
  }

  const cotizacionId = nuevaCotizacionCreada.value._id;
  nuevaCotizacionCreada.value = null;
  // Usar replace para reemplazar la entrada actual en el historial
    // y asegurar que el watch detecte el cambio de parámetro
  router.replace({
    name: 'cliente-cotizacion-detalle',
    params: { id: cotizacionId },
  });
}

// Handler para descargar PDF
function handleDownloadPDF(): void {
  if (!detalle.value) return;

  const filename = `${detalle.value.folio}.pdf`;
  const title = `${detalle.value.folio}`;
  const content = ['Este es un PDF dummy generado para el MVP.'];

  downloadDummyPDF(filename, title, content);
}
</script>
