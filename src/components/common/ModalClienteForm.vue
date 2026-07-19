<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      @pointerdown.stop
    >
      <div class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ modoEdicion ? 'Editar cliente' : 'Nuevo cliente' }}
          </h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            <svg
              class="w-6 h-6"
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
          </button>
        </div>

        <div
          v-if="formError"
          class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ formError }}
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label
              for="modal-cliente-empresa"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Empresa <span class="text-red-500">*</span>
            </label>
            <input
              id="modal-cliente-empresa"
              v-model="local.empresa"
              type="text"
              required
              maxlength="200"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Nombre comercial"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <label
              for="modal-cliente-razon-social"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Razón Social
            </label>
            <input
              id="modal-cliente-razon-social"
              v-model="local.razonSocial"
              type="text"
              maxlength="300"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Ej. Servicios Industriales del Pacífico"
              :disabled="isSubmitting"
            />
            <p class="mt-1 text-xs text-gray-500">Opcional</p>
          </div>
          <div>
            <label
              for="modal-cliente-rfc"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              RFC
            </label>
            <input
              id="modal-cliente-rfc"
              v-model="local.rfc"
              type="text"
              maxlength="20"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
              placeholder="Ej. ABC010101AB1"
              :disabled="isSubmitting"
            />
            <p class="mt-1 text-xs text-gray-500">
              Opcional. Si se captura, debe ser único en esta administración.
            </p>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-medical-blue-600 text-white rounded-md text-sm font-medium hover:bg-medical-blue-700 disabled:opacity-50"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useModalDismiss } from '../../composables/useModalDismiss';

export type ClienteFormFields = {
  empresa: string;
  razonSocial: string;
  rfc: string;
};

const props = withDefaults(
  defineProps<{
    show: boolean;
    modoEdicion?: boolean;
    initial?: Partial<ClienteFormFields>;
    formError?: string | null;
    isSubmitting?: boolean;
  }>(),
  {
    modoEdicion: false,
    formError: null,
    isSubmitting: false,
  },
);

const emit = defineEmits<{
  close: [];
  submit: [payload: ClienteFormFields];
}>();

const local = reactive<ClienteFormFields>({
  empresa: '',
  razonSocial: '',
  rfc: '',
});

function syncFromInitial() {
  local.empresa = props.initial?.empresa ?? '';
  local.razonSocial = props.initial?.razonSocial ?? '';
  local.rfc = props.initial?.rfc ?? '';
}

watch(
  () => props.show,
  (open) => {
    if (open) syncFromInitial();
  },
);

function onSubmit() {
  emit('submit', {
    empresa: local.empresa,
    razonSocial: local.razonSocial,
    rfc: local.rfc,
  });
}

const {
  onBackdropPointerDown,
  onBackdropPointerUp,
  onBackdropPointerCancel,
} = useModalDismiss(() => {
  if (!props.isSubmitting) emit('close');
}, () => props.show);
</script>
