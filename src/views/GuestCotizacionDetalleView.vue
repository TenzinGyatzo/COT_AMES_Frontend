<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
        Detalle de Cotización
      </h1>
      <div v-if="cotizacion" class="text-right">
        <p class="text-sm font-medium text-gray-500">Folio</p>
        <p class="text-lg font-mono font-bold text-medical-blue-600">{{ cotizacion.folio }}</p>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-6 rounded-lg bg-red-50 p-4 border border-red-200"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Mensaje de éxito -->
    <div
      v-if="successMessage"
      class="mb-6 rounded-lg bg-green-50 p-4 border border-green-200"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <BaseSectionLoader
      v-if="isLoading && !cotizacion"
      message="Cargando información de tu cotización..."
    />

    <div v-else-if="cotizacion" class="space-y-6">
      <!-- Banner de Estado -->
      <div
        :class="getEstadoBannerClass(cotizacion.estado)"
        class="rounded-xl border shadow-sm p-6"
      >
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div
              :class="getEstadoIconClass(cotizacion.estado)"
              class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
            >
              <svg
                v-if="cotizacion.estado === 'vigente'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'aceptada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'vencida'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'rechazada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium opacity-80 mb-0.5">Estado actual</p>
              <h3
                :class="getEstadoTextClass(cotizacion.estado)"
                class="text-2xl font-bold"
              >
                {{ getEstadoLabel(cotizacion.estado) }}
              </h3>
              <p class="text-xs opacity-70 mt-1">
                {{ getEstadoSublabel(cotizacion) }}
              </p>
            </div>
          </div>

          <div v-if="cotizacion.estado === 'vigente' && !successMessage" class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <BaseButtonLoader
              variant="primary"
              size="lg"
              :disabled="isProcessing"
              :loading="isProcessing"
              custom-class="bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-md font-bold px-8"
              @click="prepareAceptar"
            >
              Aceptar Cotización
            </BaseButtonLoader>
            <BaseButtonLoader
              variant="danger"
              size="lg"
              :disabled="isProcessing"
              :loading="isProcessing"
              custom-class="shadow-md font-bold px-8"
              @click="showRechazarConfirm = true"
            >
              Rechazar
            </BaseButtonLoader>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Izquierda: Información -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Detalles Generales -->
          <div class="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <h2 class="text-xl font-bold text-gray-800">Resumen del Servicio</h2>
              <button
                @click="handleDownloadPDF"
                class="inline-flex items-center text-medical-blue-600 hover:text-medical-blue-800 font-medium transition-colors"
                title="Descargar versión PDF"
              >
                <svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Descargar PDF
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Empresa / Cliente</p>
                <p class="text-gray-900 font-medium">{{ cotizacion.nombreEmpresa || 'No especificada' }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Sede de atención</p>
                <p class="text-gray-900 font-medium">{{ cotizacion.sedeId?.ciudad || '-' }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Contacto Solicitante</p>
                <p class="text-gray-900 font-medium">{{ cotizacion.nombreContacto || 'No especificado' }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Correo Electrónico</p>
                <p class="text-gray-900 font-medium">{{ cotizacion.emailContacto || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Servicios Cotizados -->
          <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
            <div class="p-6 pb-2 border-b border-gray-50 bg-gray-50/50">
              <h2 class="text-lg font-bold text-gray-800">Servicios Detallados</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50/80">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant.</th>
                    <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">P. Unitario</th>
                    <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 bg-white">
                  <tr v-for="(item, index) in cotizacion.items" :key="index" class="hover:bg-medical-blue-50/30 transition-colors">
                    <td class="px-6 py-4">
                      <p class="text-sm font-bold text-gray-900">{{ item.nombreServicioSnapshot }}</p>
                      <p v-if="item.descripcionServicioSnapshot" class="text-xs text-gray-500 mt-1 line-clamp-5 italic">
                        {{ item.descripcionServicioSnapshot }}
                      </p>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600 text-center font-medium">{{ item.cantidad }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 text-right">{{ formatCurrency(item.precioUnitarioSnapshot) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900 text-right font-bold">{{ formatCurrency(item.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Totales -->
        <div class="space-y-6">
          <div class="bg-white shadow-md border border-medical-blue-100 rounded-xl p-6 sticky top-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Resumen de Pago</h2>
            <div class="space-y-4">
              <div v-if="cotizacion.ordenTrabajofolio || cotizacion.ordenTrabajoFolio" class="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                <p class="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Orden Generada</p>
                <p class="text-green-800 font-mono font-black text-sm">{{ cotizacion.ordenTrabajofolio || cotizacion.ordenTrabajoFolio }}</p>
              </div>
              
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-500 font-medium">Subtotal</span>
                <span class="text-gray-900 font-bold">{{ formatCurrency(cotizacion.total) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-500 font-medium">I.V.A (16%)</span>
                <span class="text-gray-900 font-bold">{{ formatCurrency(iva) }}</span>
              </div>
              <div class="pt-4 border-t-2 border-gray-50">
                <div class="flex justify-between items-center">
                  <span class="text-medical-blue-600 font-black text-lg">TOTAL</span>
                  <span class="text-medical-blue-700 font-black text-2xl">{{ formatCurrency(grandTotal) }}</span>
                </div>
                <p class="text-right text-[10px] text-gray-400 mt-1 font-bold">MONEDA: {{ cotizacion.moneda }}</p>
              </div>
            </div>

            <div v-if="cotizacion.estado === 'vigente' && !successMessage" class="mt-8 pt-6 border-t border-gray-50 space-y-4">
              <p class="text-xs text-center text-gray-500 font-medium italic">
                Al aceptar esta cotización, confirmas tu solicitud para los servicios listados.
              </p>
              <BaseButtonLoader
                variant="primary"
                full-width
                :disabled="isProcessing"
                :loading="isProcessing"
                custom-class="bg-medical-blue-600 hover:bg-medical-blue-700 h-12 text-lg shadow-lg font-bold"
                @click="prepareAceptar"
              >
                Confirmar Aceptación
              </BaseButtonLoader>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalTrabajadores
      v-if="cotizacion"
      :mostrar="showModalTrabajadores"
      :max-trabajadores="totalServicios"
      :cotizacion-folio="cotizacion.folio"
      @close="showModalTrabajadores = false"
      @confirm="handleAceptarFinal"
    />

    <ConfirmationModal
      :show="showRechazarConfirm"
      title="Rechazar Cotización"
      message="¿Estás seguro de que deseas rechazar esta cotización? Esta acción no se puede deshacer."
      confirm-text="Sí, rechazar"
      type="danger"
      @confirm="handleRechazar"
      @cancel="showRechazarConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { publicApiService } from '../services/public-api.service';
import ModalTrabajadores from '../components/common/ModalTrabajadores.vue';
import ConfirmationModal from '../components/common/ConfirmationModal.vue';
import { downloadCotizacionPDF } from '../utils/pdfHelper';
import BaseSectionLoader from '../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../components/base/BaseButtonLoader.vue';

const route = useRoute();
const token = route.params.token as string;

const cotizacion = ref<any>(null);
const isLoading = ref(true);
const isProcessing = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const showModalTrabajadores = ref(false);
const showRechazarConfirm = ref(false);

const fetchCotizacion = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    cotizacion.value = await publicApiService.getCotizacionByToken(token);
    // Limpiar error anterior si la carga fue exitosa
    if (cotizacion.value) error.value = null;
  } catch (err: any) {
    console.error('Error al cargar cotización:', err);
    error.value = err.response?.data?.message || 'Hubo un problema al cargar la cotización.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (token) {
    fetchCotizacion();
  } else {
    error.value = 'Token de acceso no proporcionado.';
    isLoading.value = false;
  }
});

// Cálculos
const iva = computed(() => (cotizacion.value?.total || 0) * 0.16);
const grandTotal = computed(() => (cotizacion.value?.total || 0) + iva.value);
const totalServicios = computed(() => {
  if (!cotizacion.value) return 0;
  return cotizacion.value.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
});

// Formateadores
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Handlers
const prepareAceptar = () => {
  showModalTrabajadores.value = true;
};

const handleAceptarFinal = async (trabajadoresData: any[]) => {
  try {
    isProcessing.value = true;
    error.value = null;
    successMessage.value = null;
    showModalTrabajadores.value = false;
    
    const updated = await publicApiService.aceptarCotizacionByToken(token, trabajadoresData);
    cotizacion.value = updated;
    
    successMessage.value = '¡Cotización aceptada con éxito! Te contactaremos pronto.';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al aceptar la cotización.';
  } finally {
    isProcessing.value = false;
  }
};

const handleRechazar = async () => {
  try {
    isProcessing.value = true;
    error.value = null;
    successMessage.value = null;
    showRechazarConfirm.value = false;

    const updated = await publicApiService.rechazarCotizacionByToken(token);
    cotizacion.value = updated;
    
    successMessage.value = 'Has rechazado la cotización.';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al rechazar la cotización.';
  } finally {
    isProcessing.value = false;
  }
};

const handleDownloadPDF = async () => {
  if (!cotizacion.value) return;
  try {
    await downloadCotizacionPDF(cotizacion.value);
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    alert('No se pudo generar el PDF en este momento.');
  }
};

// Helper Classes (Copying from AdminView for consistency)
const getEstadoLabel = (estado: string) => {
  const labels: any = {
    vigente: 'Vigente',
    aceptada: 'Aceptada',
    vencida: 'Vencida',
    rechazada: 'Rechazada',
  };
  return labels[estado] || estado;
};

const getEstadoSublabel = (cot: any) => {
  if (!cot) return '';
  if (cot.estado === 'vigente') return `Vence el: ${formatDate(cot.fechaVencimiento)}`;
  if (cot.estado === 'aceptada') return `Aceptada el: ${formatDate(cot.fechaAceptacion)}`;
  if (cot.estado === 'rechazada') return `Rechazada el: ${formatDate(cot.fechaRechazo)}`;
  if (cot.estado === 'vencida') return `Expiró el: ${formatDate(cot.fechaVencimiento)}`;
  return '';
};

const getEstadoBannerClass = (estado: string) => {
  const classes: any = {
    vigente: 'bg-blue-50 border-blue-200 text-blue-800',
    aceptada: 'bg-green-50 border-green-200 text-green-800',
    vencida: 'bg-orange-50 border-orange-200 text-orange-800',
    rechazada: 'bg-red-50 border-red-200 text-red-800',
  };
  return classes[estado] || 'bg-gray-50 border-gray-200';
};

const getEstadoIconClass = (estado: string) => {
  const classes: any = {
    vigente: 'bg-blue-100 text-blue-600',
    aceptada: 'bg-green-100 text-green-600',
    vencida: 'bg-orange-100 text-orange-600',
    rechazada: 'bg-red-100 text-red-600',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
};

const getEstadoTextClass = (estado: string) => {
  const classes: any = {
    vigente: 'text-blue-700',
    aceptada: 'text-green-700',
    vencida: 'text-orange-700',
    rechazada: 'text-red-700',
  };
  return classes[estado] || 'text-gray-700';
};
</script>
