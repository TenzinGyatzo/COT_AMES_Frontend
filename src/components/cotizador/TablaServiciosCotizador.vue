<template>
  <div
    class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
  >
    <!-- Encabezado de la sección -->
    <div
      class="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shrink-0"
          :class="[
            serviciosSeleccionados.length > 0
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-500',
          ]"
        >
          <svg
            v-if="serviciosSeleccionados.length > 0"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span v-else>2</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ titulo }}</h2>
          <p class="text-sm text-gray-500">{{ subtitulo }}</p>
        </div>
      </div>
      <button
        type="button"
        :disabled="isLoading"
        class="w-full lg:w-auto px-5 py-2.5 bg-medical-green-500 text-white rounded-xl hover:bg-medical-green-600 active:scale-95 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-medical-green-100 disabled:opacity-50"
        @click="$emit('abrir-modal')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Agregar Servicios
      </button>
    </div>

    <!-- VISTA MOBILE / TABLET: Tarjetas (Visible solo en < lg) -->
    <div class="lg:hidden">
      <div v-if="serviciosSeleccionados.length === 0" class="p-10 text-center">
        <div class="flex flex-col items-center opacity-40">
          <svg
            class="w-16 h-16 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
          <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
        </div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="(servicio, index) in serviciosSeleccionados"
          :key="servicio._id"
          class="p-4 bg-white hover:bg-gray-50/50 transition-colors space-y-3"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold text-gray-300 mt-1"
              >#{{ index + 1 }}</span
            >
            <button
              type="button"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              @click="$emit('eliminar-servicio', servicio._id || '')"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-400 uppercase"
              >Nombre</label
            >
            <VerticalCenterTextarea
              :model-value="displayOf(servicio).nombre"
              textarea-class="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-medical-blue-400 resize-y min-h-[4.5rem] leading-snug"
              @update:model-value="
                emitOverride(servicio._id || '', 'nombre', $event)
              "
            />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400 uppercase"
              >Descripción</label
            >
            <VerticalCenterTextarea
              :model-value="displayOf(servicio).descripcion"
              textarea-class="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-medical-blue-400 resize-y min-h-[4.5rem] leading-snug"
              @update:model-value="
                emitOverride(servicio._id || '', 'descripcion', $event)
              "
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,7rem)_1fr] gap-3 sm:gap-5">
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase"
                >Precio</label
              >
              <input
                type="number"
                min="0"
                step="0.01"
                :value="displayOf(servicio).precioUnitario"
                class="mt-1 w-full max-w-[7rem] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-right outline-none focus:ring-2 focus:ring-medical-blue-400"
                @input="onMobilePrecio(servicio._id || '', $event)"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase"
                >Unidades</label
              >
              <div class="mt-1 flex sm:justify-start">
                <QuantitySelector
                  :model-value="cantidadesPorServicio[servicio._id || ''] || 0"
                  @update:model-value="
                    (value) =>
                      $emit('actualizar-cantidad', servicio._id || '', value)
                  "
                />
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between pt-2 border-t border-gray-50"
          >
            <span class="text-xs font-bold text-gray-400 uppercase"
              >Subtotal</span
            >
            <span class="text-sm font-bold text-gray-900">{{
              formatMoney(subtotalOf(servicio))
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA DESKTOP: Tabla (Visible solo en >= lg) -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="min-w-[960px] w-full table-fixed divide-y divide-gray-100">
        <thead class="bg-gray-50/50">
          <tr>
            <th
              class="w-10 px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              #
            </th>
            <th
              class="w-[14rem] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Servicio
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Descripción
            </th>
            <th
              class="w-24 pl-3 pr-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Precio
            </th>
            <th
              class="w-[8.75rem] pl-4 pr-2 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Unidades
            </th>
            <th
              class="w-32 px-3 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Subtotal
            </th>
            <th
              class="w-12 px-2 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="serviciosSeleccionados.length === 0">
            <td colspan="7" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center opacity-40">
                <svg
                  class="w-16 h-16 text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
                <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
              </div>
            </td>
          </tr>
          <ServiceItemRow
            v-else
            v-for="(servicio, index) in serviciosSeleccionados"
            :key="servicio._id"
            :index="index + 1"
            :nombre="displayOf(servicio).nombre"
            :descripcion="displayOf(servicio).descripcion"
            :precio-unitario="displayOf(servicio).precioUnitario"
            :cantidad="cantidadesPorServicio[servicio._id || ''] || 0"
            :subtotal="subtotalOf(servicio)"
            @update:nombre="
              (v) => emitOverride(servicio._id || '', 'nombre', v)
            "
            @update:descripcion="
              (v) => emitOverride(servicio._id || '', 'descripcion', v)
            "
            @update:precio-unitario="
              (v) => emitOverride(servicio._id || '', 'precioUnitario', v)
            "
            @update:cantidad="
              (value) => $emit('actualizar-cantidad', servicio._id || '', value)
            "
            @remove="$emit('eliminar-servicio', servicio._id || '')"
          />
        </tbody>
      </table>
    </div>

    <div
      v-if="serviciosSeleccionados.length > 0"
      class="px-4 lg:px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4"
    >
      <span class="text-sm font-bold text-gray-600">Total (sin IVA)</span>
      <span class="text-lg font-bold text-gray-900">{{
        formatMoney(totalSinIva)
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ServiceItemRow from '../common/ServiceItemRow.vue';
import VerticalCenterTextarea from '../common/VerticalCenterTextarea.vue';
import QuantitySelector from '../common/QuantitySelector.vue';
import type { Servicio } from '@/types/backend';
import { formatMoney } from '@/utils/currency';

export type ItemOverrideFields = {
  nombre: string;
  descripcion: string;
  precioUnitario: number;
};

interface Props {
  serviciosSeleccionados: Servicio[];
  cantidadesPorServicio: Record<string, number>;
  itemOverrides: Record<string, ItemOverrideFields>;
  isLoading?: boolean;
  titulo?: string;
  subtitulo?: string;
  textoVacio?: string;
  ayudaVacia?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  titulo: 'Servicios a Cotizar',
  subtitulo: 'Agrega los estudios o servicios médicos solicitados.',
  textoVacio: 'Lista de servicios vacía',
  ayudaVacia: 'Haz clic en el botón verde para comenzar a añadir items.',
});

const emit = defineEmits<{
  (e: 'abrir-modal'): void;
  (e: 'actualizar-cantidad', id: string, cantidad: number): void;
  (e: 'eliminar-servicio', id: string): void;
  (
    e: 'actualizar-override',
    id: string,
    field: keyof ItemOverrideFields,
    value: string | number,
  ): void;
}>();

function displayOf(servicio: Servicio): ItemOverrideFields {
  const id = servicio._id || '';
  const o = props.itemOverrides[id];
  if (o) return o;
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario ?? 0,
  };
}

function subtotalOf(servicio: Servicio): number {
  const id = servicio._id || '';
  const qty = props.cantidadesPorServicio[id] || 0;
  return displayOf(servicio).precioUnitario * qty;
}

const totalSinIva = computed(() =>
  props.serviciosSeleccionados.reduce(
    (acc, s) => acc + subtotalOf(s),
    0,
  ),
);

function emitOverride(
  id: string,
  field: keyof ItemOverrideFields,
  value: string | number,
) {
  if (!id) return;
  emit('actualizar-override', id, field, value);
}

function onMobilePrecio(id: string, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const n = Number(raw);
  emitOverride(id, 'precioUnitario', Number.isFinite(n) && n >= 0 ? n : 0);
}
</script>
