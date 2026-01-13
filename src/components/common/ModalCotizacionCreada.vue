<template>
  <div
    v-if="cotizacion"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-4 relative" @click.stop>
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
      >
        <span class="sr-only">Cerrar</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Cotización Creada Exitosamente
      </h3>
      <div class="space-y-2 mb-6">
        <p class="text-gray-700">
          <span class="font-medium">Folio:</span> {{ cotizacion.folio }}
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Subtotal:</span>
          ${{
            cotizacion.total.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            }) 
          }} <span class="text-gray-500 text-xs">*No incluye IVA</span>
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Total:</span>
          ${{
            (cotizacion.total + (cotizacion.total * 0.16)).toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })
          }} <span class="text-gray-500 text-xs">*IVA incluido</span>
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Fecha de vencimiento:</span>
          {{ formatDate(cotizacion.fechaVencimiento) }}
        </p>
      </div>
        <button
          @click="$emit('ver-detalles')"
          class="w-full mb-2 px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
        >
          Ver Detalles
        </button>
      <div class="flex gap-3">
        <button
          @click="handleDownloadPDF"
          :disabled="isDownloading"
          class="flex-1 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium border border-gray-300 rounded-md shadow-sm transition-colors "
        >
          <span v-if="isDownloading">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-else>Descargar PDF</span>
        </button>
        <button
          @click="$emit('ver-cotizaciones')"
          class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Ver Cotizaciones
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useClienteCotizaciones } from '../../composables/useClienteCotizaciones';
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
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
  'ver-cotizaciones': [];
  'ver-detalles': [];
}>();

const { fetchCotizacion, detalle } = useClienteCotizaciones();
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
    // Cargar detalle completo si no lo tenemos o es diferente
    // Nota: fetchCotizacion actualiza 'detalle' en el store
    await fetchCotizacion(id);
    
    if (detalle.value) {
      await downloadCotizacionPDF(detalle.value);
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
