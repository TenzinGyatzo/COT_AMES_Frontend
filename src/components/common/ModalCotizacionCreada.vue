<template>
  <div
    v-if="cotizacion"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
      @click.stop
    >
      <!-- Encabezado con gradiente sutil -->
      <div class="bg-gradient-to-r from-medical-blue-50 to-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">
            ¡Cotización Lista!
          </h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
        >
          <span class="sr-only">Cerrar</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <!-- Resumen de Cotización -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm font-medium">Folio</span>
            <span class="text-medical-blue-600 font-bold bg-medical-blue-50 px-2 py-0.5 rounded text-sm">
              {{ cotizacion.folio }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-sm font-medium">Subtotal</span>
            <div class="text-right">
              <span class="text-gray-900 font-semibold">
                ${{ cotizacion.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">*Sin IVA</p>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-gray-200">
            <span class="text-gray-900 font-bold">Total Final</span>
            <div class="text-right">
              <span class="text-medical-blue-700 text-lg font-extrabold">
                ${{ (cotizacion.total * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-[10px] text-medical-blue-400 uppercase tracking-wider font-bold">*IVA Incluido</p>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2 text-xs">
            <span class="text-gray-400 font-medium italic">Válida hasta</span>
            <span class="text-gray-500 font-semibold">{{ formatDate(cotizacion.fechaVencimiento) }}</span>
          </div>
        </div>

        <!-- Mensajes Dinámicos de Email (Solo para Admin) -->
        <div v-if="mostrarMensajeEmail" class="mb-6 animate-in slide-in-from-top-2 duration-500">
          <div 
            v-if="emailEnviado" 
            class="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-sm font-bold">Correo enviado</p>
              <p class="text-xs text-green-700/80">Se ha enviado la cotización al correo del cliente.</p>
            </div>
          </div>
          <div 
            v-else 
            class="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <div>
              <p class="text-sm font-bold">Sin notificación por correo</p>
              <p class="text-xs text-gray-500">No se envió la cotización por correo electrónico al cliente.</p>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="space-y-3">
          <button
            @click="$emit('ver-detalles')"
            class="w-full py-3 bg-medical-blue-600 text-white rounded-xl hover:bg-medical-blue-700 active:scale-[0.98] transition-all font-bold shadow-lg shadow-medical-blue-200 flex items-center justify-center gap-2"
          >
            Ver Detalles Completos
          </button>
          
          <div class="flex gap-3">
            <button
              @click="handleDownloadPDF"
              :disabled="isDownloading"
              class="flex-1 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold border border-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg v-if="isDownloading" class="animate-spin h-5 w-5 text-medical-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span v-if="!isDownloading">PDF</span>
            </button>
            <button
              @click="$emit('ver-cotizaciones')"
              class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all font-bold flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Ver cotizaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { useAuthStore } from '../../store/auth';
import { useClienteCotizaciones } from '../../composables/useClienteCotizaciones';
import { getCotizacionAdminById } from '../../services/admin-api.service';
import { downloadCotizacionPDF } from '../../utils/pdfHelper';

// Tipo mínimo requerido para mostrar el modal
interface CotizacionModalData {
  id?: string;
  _id?: string;
  folio: string;
  total: number;
  fechaVencimiento: Date | string;
}

interface Props {
  cotizacion: CotizacionModalData | null;
  mostrarMensajeEmail?: boolean;
  emailEnviado?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mostrarMensajeEmail: false,
  emailEnviado: false,
});

const emit = defineEmits<{
  close: [];
  'ver-cotizaciones': [];
  'ver-detalles': [];
}>();

const {
  onBackdropPointerDown,
  onBackdropPointerUp,
  onBackdropPointerCancel,
} = useModalDismiss(() => emit('close'), () => !!props.cotizacion);

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const { fetchCotizacion, detalle: detalleCliente } = useClienteCotizaciones();
const isDownloading = ref(false);

const handleDownloadPDF = async () => {
  if (!props.cotizacion) return;
  const id = props.cotizacion._id || props.cotizacion.id;
  if (!id) {
     console.error('No se encontró ID para descargar PDF');
     return;
  }

  try {
    isDownloading.value = true;
    
    let cotizacionDetalle;
    
    // Usar endpoint correcto según el rol del usuario
    if (isAdmin.value) {
      // Admin: usar endpoint de admin
      cotizacionDetalle = await getCotizacionAdminById(id);
    } else {
      // Cliente: usar endpoint de cliente
      await fetchCotizacion(id);
      cotizacionDetalle = detalleCliente.value;
    }
    
    if (cotizacionDetalle) {
      await downloadCotizacionPDF(cotizacionDetalle);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor intente más tarde.');
  } finally {
    isDownloading.value = false;
  }
};

// Formatear fecha para mostrar
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>
