<template>
  <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
    <div class="mb-4 pb-4 border-b border-gray-200">
      <h2 class="text-lg md:text-xl font-semibold text-gray-800">
        Notas internas
      </h2>
      <p class="mt-1 text-xs md:text-sm text-gray-500">
        Solo visible para el equipo AMES. No aparece en PDF ni en la vista del
        cliente.
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {{ successMessage }}
    </div>

    <div
      v-if="errorMessage"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ errorMessage }}
    </div>

    <div v-if="notasOrdenadas.length === 0" class="mb-4 text-sm text-gray-500 italic">
      No hay notas internas todavía.
    </div>

    <ul v-else class="mb-6 space-y-4">
      <li
        v-for="nota in notasOrdenadas"
        :key="nota._id"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <div v-if="editingNotaId === nota._id">
          <textarea
            v-model="editTexto"
            rows="3"
            maxlength="2000"
            :disabled="isBusy"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-medical-blue-500 focus:ring-medical-blue-500 disabled:opacity-50"
          />
          <div class="mt-2 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              :disabled="isBusy"
              @click="cancelarEdicion"
            >
              Cancelar
            </button>
            <BaseButtonLoader
              type="button"
              variant="primary"
              size="sm"
              :disabled="isBusy || !editTexto.trim()"
              :loading="isSavingEdit"
              @click="guardarEdicion(nota._id)"
            >
              Guardar
            </BaseButtonLoader>
          </div>
        </div>

        <template v-else>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ nota.autorNombre }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDateTime(nota.createdAt) }}
                <span v-if="nota.updatedAt"> · editada</span>
              </p>
            </div>
            <div v-if="esNotaPropia(nota)" class="flex gap-2 shrink-0">
              <button
                type="button"
                class="text-xs font-medium text-medical-blue-600 hover:text-medical-blue-800 disabled:opacity-50"
                :disabled="isBusy"
                @click="iniciarEdicion(nota)"
              >
                Editar
              </button>
              <button
                type="button"
                class="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                :disabled="isBusy"
                @click="solicitarEliminar(nota._id)"
              >
                Eliminar
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
            {{ nota.texto }}
          </p>
        </template>
      </li>
    </ul>

    <div class="pt-4 border-t border-gray-200">
      <button
        v-if="!showNuevaNotaForm"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-medical-blue-600 hover:border-medical-blue-400 hover:bg-medical-blue-50 disabled:opacity-50"
        :disabled="isBusy"
        @click="abrirFormularioNuevaNota"
      >
        <span aria-hidden="true" class="text-base leading-none">+</span>
        Agregar nota
      </button>

      <div v-else>
        <label
          for="nueva-nota-interna"
          class="block text-xs md:text-sm font-medium text-gray-700 mb-1"
        >
          Nueva nota
        </label>
        <textarea
          id="nueva-nota-interna"
          ref="nuevaNotaTextareaRef"
          v-model="nuevaNota"
          rows="3"
          maxlength="2000"
          :disabled="isBusy"
          placeholder="Escriba una nota interna para el equipo..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-medical-blue-500 focus:ring-medical-blue-500 disabled:opacity-50"
        />
        <div class="mt-2 flex items-center justify-between gap-3">
          <span class="text-xs text-gray-400">{{ nuevaNota.length }}/2000</span>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              :disabled="isBusy"
              @click="cancelarNuevaNota"
            >
              Cancelar
            </button>
            <BaseButtonLoader
              type="button"
              variant="primary"
              size="sm"
              :disabled="isBusy || !nuevaNota.trim()"
              :loading="isAdding"
              @click="agregarNota"
            >
              Guardar nota
            </BaseButtonLoader>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      :show="!!notaIdEliminar"
      title="¿Eliminar nota?"
      message="Esta acción no se puede deshacer."
      type="danger"
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      @confirm="confirmarEliminar"
      @cancel="notaIdEliminar = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type {
  CotizacionDetalleDto,
  NotaInternaCotizacion,
} from '../../types/backend';
import {
  agregarNotaInternaCotizacion,
  actualizarNotaInternaCotizacion,
  eliminarNotaInternaCotizacion,
} from '../../services/admin-api.service';
import { useAuthStore } from '../../store/auth';
import BaseButtonLoader from '../base/BaseButtonLoader.vue';
import ConfirmationModal from '../common/ConfirmationModal.vue';

const props = defineProps<{
  cotizacionId: string;
  notas?: NotaInternaCotizacion[];
}>();

const emit = defineEmits<{
  updated: [cotizacion: CotizacionDetalleDto];
}>();

const authStore = useAuthStore();

const nuevaNota = ref('');
const showNuevaNotaForm = ref(false);
const nuevaNotaTextareaRef = ref<HTMLTextAreaElement | null>(null);
const editingNotaId = ref<string | null>(null);
const editTexto = ref('');
const notaIdEliminar = ref<string | null>(null);
const isAdding = ref(false);
const isSavingEdit = ref(false);
const isDeleting = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

let successTimer: ReturnType<typeof setTimeout> | null = null;

const isBusy = computed(
  () => isAdding.value || isSavingEdit.value || isDeleting.value,
);

const notasOrdenadas = computed(() => {
  const list = [...(props.notas || [])];
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
});

function esNotaPropia(nota: NotaInternaCotizacion): boolean {
  const currentId = authStore.user?._id;
  if (!currentId) return false;
  return String(nota.autorUserId) === String(currentId);
}

function formatDateTime(date: string | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function flashSuccess(message: string) {
  successMessage.value = message;
  if (successTimer) clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    successMessage.value = null;
    successTimer = null;
  }, 3000);
}

function extractError(err: unknown): string {
  const raw = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join('. ');
  if (typeof raw === 'string' && raw.trim()) return raw;
  return 'No se pudo completar la operación. Intente de nuevo.';
}

async function agregarNota() {
  const texto = nuevaNota.value.trim();
  if (!texto || isBusy.value) return;
  errorMessage.value = null;
  isAdding.value = true;
  try {
    const updated = await agregarNotaInternaCotizacion(props.cotizacionId, {
      texto,
    });
    cancelarNuevaNota();
    emit('updated', updated);
    flashSuccess('Nota agregada.');
  } catch (err) {
    errorMessage.value = extractError(err);
  } finally {
    isAdding.value = false;
  }
}

function abrirFormularioNuevaNota() {
  showNuevaNotaForm.value = true;
  cancelarEdicion();
  errorMessage.value = null;
  void nextTick(() => nuevaNotaTextareaRef.value?.focus());
}

function cancelarNuevaNota() {
  showNuevaNotaForm.value = false;
  nuevaNota.value = '';
}

function iniciarEdicion(nota: NotaInternaCotizacion) {
  cancelarNuevaNota();
  editingNotaId.value = nota._id;
  editTexto.value = nota.texto;
  errorMessage.value = null;
}

function cancelarEdicion() {
  editingNotaId.value = null;
  editTexto.value = '';
}

async function guardarEdicion(notaId: string) {
  const texto = editTexto.value.trim();
  if (!texto || isBusy.value) return;
  errorMessage.value = null;
  isSavingEdit.value = true;
  try {
    const updated = await actualizarNotaInternaCotizacion(
      props.cotizacionId,
      notaId,
      { texto },
    );
    cancelarEdicion();
    emit('updated', updated);
    flashSuccess('Nota actualizada.');
  } catch (err) {
    errorMessage.value = extractError(err);
  } finally {
    isSavingEdit.value = false;
  }
}

function solicitarEliminar(notaId: string) {
  notaIdEliminar.value = notaId;
}

async function confirmarEliminar() {
  const notaId = notaIdEliminar.value;
  if (!notaId || isBusy.value) return;
  errorMessage.value = null;
  isDeleting.value = true;
  try {
    const updated = await eliminarNotaInternaCotizacion(
      props.cotizacionId,
      notaId,
    );
    notaIdEliminar.value = null;
    emit('updated', updated);
    flashSuccess('Nota eliminada.');
  } catch (err) {
    errorMessage.value = extractError(err);
  } finally {
    isDeleting.value = false;
  }
}
</script>
