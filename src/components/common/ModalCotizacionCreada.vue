<template>
  <div
    v-if="cotizacion"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-4" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Cotización Creada Exitosamente
      </h3>
      <div class="space-y-2 mb-6">
        <p class="text-gray-700">
          <span class="font-medium">Folio:</span> {{ cotizacion.folio }}
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Total:</span>
          ${{
            cotizacion.total.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })
          }}
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Fecha de vencimiento:</span>
          {{ formatDate(cotizacion.fechaVencimiento) }}
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="$emit('ver-cotizaciones')"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Ver Cotizaciones
        </button>
        <button
          @click="$emit('ver-detalles')"
          class="flex-1 px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Tipo mínimo requerido para mostrar el modal
interface CotizacionModalData {
  folio: string;
  total: number;
  fechaVencimiento: Date | string;
}

interface Props {
  cotizacion: CotizacionModalData | null;
}

defineProps<Props>();

defineEmits<{
  close: [];
  'ver-cotizaciones': [];
  'ver-detalles': [];
}>();

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
