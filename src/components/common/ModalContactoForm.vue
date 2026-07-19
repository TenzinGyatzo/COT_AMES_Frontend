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
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">
            {{ modoEdicion ? 'Editar contacto' : 'Nuevo contacto' }}
          </h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            ✕
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
              for="modal-contacto-nombre"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="modal-contacto-nombre"
              v-model="local.nombre"
              type="text"
              required
              maxlength="200"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <label
              for="modal-contacto-correo"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo
            </label>
            <input
              id="modal-contacto-correo"
              v-model="local.correo"
              type="text"
              inputmode="email"
              autocomplete="email"
              maxlength="200"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :disabled="isSubmitting"
            />
            <p class="mt-1 text-xs text-gray-500">Opcional.</p>
          </div>
          <div>
            <label
              for="modal-contacto-telefono"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono
            </label>
            <input
              id="modal-contacto-telefono"
              v-model="local.telefono"
              type="text"
              maxlength="40"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <label
              for="modal-contacto-cargo"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Cargo
            </label>
            <input
              id="modal-contacto-cargo"
              v-model="local.cargo"
              type="text"
              maxlength="120"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :disabled="isSubmitting"
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm"
              :disabled="isSubmitting"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-medical-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
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

export type ContactoFormFields = {
  nombre: string;
  correo: string;
  telefono: string;
  cargo: string;
};

const props = withDefaults(
  defineProps<{
    show: boolean;
    modoEdicion?: boolean;
    initial?: Partial<ContactoFormFields>;
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
  submit: [payload: ContactoFormFields];
}>();

const local = reactive<ContactoFormFields>({
  nombre: '',
  correo: '',
  telefono: '',
  cargo: '',
});

function syncFromInitial() {
  local.nombre = props.initial?.nombre ?? '';
  local.correo = props.initial?.correo ?? '';
  local.telefono = props.initial?.telefono ?? '';
  local.cargo = props.initial?.cargo ?? '';
}

watch(
  () => props.show,
  (open) => {
    if (open) syncFromInitial();
  },
);

function onSubmit() {
  emit('submit', {
    nombre: local.nombre,
    correo: local.correo,
    telefono: local.telefono,
    cargo: local.cargo,
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
