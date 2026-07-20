<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Plantillas</h1>
      <button
        type="button"
        @click="abrirModalCrear"
        class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
      >
        + Nueva plantilla
      </button>
    </div>

    <div class="mb-4 space-y-3">
      <div
        class="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4"
      >
        <div class="flex-1 min-w-[180px]">
          <label
            for="filtro-nombre-plantilla"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Buscar por nombre</label
          >
          <input
            id="filtro-nombre-plantilla"
            v-model="filters.nombre"
            type="text"
            placeholder="Buscar por nombre..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>
        <div class="flex items-center pb-1 shrink-0">
          <ToggleSwitch
            id="ver-inactivos-plantillas"
            v-model="verInactivos"
            @change="onVerInactivosChange"
          />
        </div>
      </div>
    </div>

    <div
      v-if="successMsg"
      class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMsg }}
    </div>
    <div
      v-if="actionError"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ actionError }}
    </div>

    <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-8 text-center">
      <p class="text-gray-500">Cargando plantillas...</p>
    </div>
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <template v-else>
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  #
                </th>
                <th
                  class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Nombre
                </th>
                <th
                  class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Secciones
                </th>
                <th
                  class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="plantillas.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  <p>{{ emptyListMessage }}</p>
                  <button
                    v-if="!tieneFiltrosBusqueda && !verInactivos"
                    type="button"
                    class="mt-3 text-sm font-medium text-medical-blue-600 hover:underline"
                    @click="abrirModalCrear"
                  >
                    Crear primera plantilla
                  </button>
                </td>
              </tr>
              <tr v-for="(p, index) in plantillas" :key="p._id">
                <td class="px-3 lg:px-4 py-4 text-sm text-gray-500">
                  {{ rowNumber(index) }}
                </td>
                <td class="px-3 lg:px-4 py-4 text-sm font-medium text-gray-900">
                  {{ p.nombre }}
                  <span
                    v-if="p.claveSeed"
                    class="ml-2 text-xs font-normal text-gray-400"
                    >seed</span
                  >
                </td>
                <td class="px-3 lg:px-4 py-4 text-sm text-gray-600">
                  {{ resumenSecciones(p) }}
                </td>
                <td class="px-3 lg:px-4 py-4 text-sm">
                  <span
                    :class="
                      isActiva(p)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    "
                    class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ isActiva(p) ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-3 lg:px-4 py-4 text-sm whitespace-nowrap space-x-2">
                  <button
                    type="button"
                    class="text-medical-blue-600 hover:underline"
                    :disabled="isMutating"
                    @click="abrirModalEditar(p)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="isActiva(p)"
                    type="button"
                    class="text-red-600 hover:underline"
                    :disabled="isMutating"
                    @click="confirmarDesactivar(p)"
                  >
                    Desactivar
                  </button>
                  <button
                    v-else
                    type="button"
                    class="text-medical-green-600 hover:underline"
                    :disabled="isMutating"
                    @click="reactivar(p)"
                  >
                    Reactivar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="pagination.total > 0"
          class="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600"
        >
          <span
            >{{ pagination.total }} plantilla(s) · Página
            {{ pagination.page }} / {{ pagination.totalPages }}</span
          >
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1 border rounded-md disabled:opacity-40"
              :disabled="pagination.page <= 1"
              @click="prevPage"
            >
              Anterior
            </button>
            <button
              type="button"
              class="px-3 py-1 border rounded-md disabled:opacity-40"
              :disabled="pagination.page >= pagination.totalPages"
              @click="nextPage"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal create/edit -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modoEdicion ? 'titulo-editar-plantilla' : 'titulo-crear-plantilla'"
        @pointerdown.stop
      >
        <div class="px-5 py-4 border-b border-gray-200">
          <h2
            :id="modoEdicion ? 'titulo-editar-plantilla' : 'titulo-crear-plantilla'"
            class="text-lg font-semibold text-gray-900"
          >
            {{ modoEdicion ? 'Editar plantilla' : 'Nueva plantilla' }}
          </h2>
        </div>

        <form class="px-5 py-4 space-y-4" @submit.prevent="guardar">
          <div v-if="errorCrear" class="rounded-md bg-red-50 text-red-800 text-sm px-3 py-2">
            {{ errorCrear }}
          </div>

          <div>
            <label for="plantilla-nombre" class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre</label
            >
            <input
              id="plantilla-nombre"
              v-model="formulario.nombre"
              type="text"
              required
              maxlength="200"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            />
          </div>

          <PlantillaSeccionesEditor v-model="formulario.secciones" />

          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100"
          >
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              :disabled="isSubmitting"
              @click="cerrarModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 font-medium disabled:opacity-50"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Guardando...' : 'Guardar y cerrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmationModal
      :show="mostrarConfirmDesactivar"
      title="Desactivar plantilla"
      :message="mensajeConfirmDesactivar"
      type="danger"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @confirm="ejecutarDesactivar"
      @cancel="cancelarDesactivar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  getPlantillas,
  createPlantilla,
  updatePlantilla,
  deletePlantilla,
  togglePlantillaActivo,
  type AdminPlantillasFilters,
  type CreatePlantillaPayload,
} from '../../services/admin-api.service';
import type { Plantilla, SeccionPlantilla } from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import PlantillaSeccionesEditor from '../../components/plantillas/PlantillaSeccionesEditor.vue';
import {
  emptyTipTapDoc,
  tipTapContentFromCuerpo,
} from '../../components/plantillas/richtext-cuerpo';
import { useModalDismiss } from '../../composables/useModalDismiss';

const plantillas = ref<Plantilla[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const verInactivos = ref(false);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
let loadSeq = 0;
let filterTimeout: ReturnType<typeof setTimeout> | null = null;

const filters = ref({ nombre: '', page: 1, limit: 20 });
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 });

const mostrarModal = ref(false);
const modoEdicion = ref(false);
const plantillaEditando = ref<Plantilla | null>(null);
const isSubmitting = ref(false);
const errorCrear = ref<string | null>(null);

type SeccionForm = SeccionPlantilla;

const formulario = ref<{ nombre: string; secciones: SeccionForm[] }>({
  nombre: '',
  secciones: [],
});

const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = ref('');
const plantillaADesactivar = ref<Plantilla | null>(null);

function newSeccionId(): string {
  return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function seccionRichtextBlank(): SeccionForm {
  return {
    id: newSeccionId(),
    tipo: 'richtext',
    titulo: '',
    cuerpo: { text: '', doc: emptyTipTapDoc() },
  };
}

function cloneDoc(
  doc: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return undefined;
  return structuredClone(doc);
}

function isActiva(p: Plantilla): boolean {
  return p.activo !== false;
}

const tieneFiltrosBusqueda = computed(() => !!filters.value.nombre?.trim());

const emptyListMessage = computed(() => {
  if (tieneFiltrosBusqueda.value)
    return 'No se encontraron plantillas con esos filtros';
  if (verInactivos.value) return 'No hay plantillas inactivas';
  return 'No hay plantillas aún. Puedes crear una o usar las seeds precargadas del tenant.';
});

function rowNumber(index: number): number {
  return (pagination.value.page - 1) * pagination.value.limit + index + 1;
}

function resumenSecciones(p: Plantilla): string {
  const secs = p.secciones ?? [];
  if (!secs.length) return '0';
  const counts = secs.reduce(
    (acc, s) => {
      acc[s.tipo] = (acc[s.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  return Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
}

function extractError(err: any, fallback: string): string {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || fallback;
}

const cargarPlantillas = async () => {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;
  try {
    let page = filters.value.page ?? 1;
    const limit = filters.value.limit ?? 20;
    const activeFilters: AdminPlantillasFilters = { page, limit };
    if (filters.value.nombre?.trim()) {
      activeFilters.nombre = filters.value.nombre.trim();
    }
    if (verInactivos.value) activeFilters.activo = false;

    let res = await getPlantillas(activeFilters);
    if (seq !== loadSeq) return;

    if (res.data.length === 0 && res.total > 0 && res.page > res.totalPages) {
      page = res.totalPages;
      filters.value.page = page;
      res = await getPlantillas({ ...activeFilters, page });
      if (seq !== loadSeq) return;
    }

    plantillas.value = res.data;
    pagination.value = {
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
    filters.value.page = res.total === 0 ? 1 : res.page;
  } catch (err: any) {
    if (seq !== loadSeq) return;
    error.value = extractError(err, 'No fue posible cargar las plantillas');
  } finally {
    if (seq === loadSeq) isLoading.value = false;
  }
};

function clearFilterDebounce() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
}

function handleFilterChange() {
  clearFilterDebounce();
  filterTimeout = setTimeout(() => {
    filters.value.page = 1;
    successMsg.value = null;
    actionError.value = null;
    void cargarPlantillas();
  }, 500);
}

function onVerInactivosChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  successMsg.value = null;
  actionError.value = null;
  void cargarPlantillas();
}

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) - 1;
    void cargarPlantillas();
  }
}

function nextPage() {
  if ((filters.value.page ?? 1) < (pagination.value.totalPages ?? 1)) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) + 1;
    void cargarPlantillas();
  }
}

function abrirModalCrear() {
  modoEdicion.value = false;
  plantillaEditando.value = null;
  formulario.value = {
    nombre: '',
    secciones: [seccionRichtextBlank()],
  };
  errorCrear.value = null;
  mostrarModal.value = true;
}

function cloneSecciones(secs: SeccionPlantilla[]): SeccionForm[] {
  return secs.map((s) => {
    if (s.tipo === 'richtext') {
      const doc = cloneDoc(s.cuerpo?.doc);
      return {
        id: s.id,
        tipo: 'richtext',
        titulo: s.titulo ?? '',
        cuerpo: {
          text: s.cuerpo?.text ?? '',
          ...(doc ? { doc } : {}),
        },
      };
    }
    return {
      id: s.id,
      tipo: 'tabla',
      titulo: s.titulo ?? '',
      encabezados: [...(s.encabezados ?? [])],
      filas: (s.filas ?? []).map((r) => [...r]),
    };
  });
}

function abrirModalEditar(p: Plantilla) {
  modoEdicion.value = true;
  plantillaEditando.value = p;
  formulario.value = {
    nombre: p.nombre,
    secciones:
      p.secciones?.length > 0
        ? cloneSecciones(p.secciones)
        : [seccionRichtextBlank()],
  };
  errorCrear.value = null;
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
  errorCrear.value = null;
  isSubmitting.value = false;
}

const {
  onBackdropPointerDown,
  onBackdropPointerUp,
  onBackdropPointerCancel,
} = useModalDismiss(cerrarModal, mostrarModal);

function buildPayload(): CreatePlantillaPayload {
  const secciones = formulario.value.secciones.map((s) => {
    if (s.tipo === 'richtext') {
      const text = s.cuerpo.text ?? '';
      const doc =
        s.cuerpo.doc &&
        typeof s.cuerpo.doc === 'object' &&
        !Array.isArray(s.cuerpo.doc)
          ? s.cuerpo.doc
          : (tipTapContentFromCuerpo({ text }) as Record<string, unknown>);
      return {
        id: s.id,
        tipo: 'richtext' as const,
        ...(s.titulo?.trim() ? { titulo: s.titulo.trim() } : {}),
        cuerpo: { text, doc },
      };
    }
    return {
      id: s.id,
      tipo: 'tabla' as const,
      ...(s.titulo?.trim() ? { titulo: s.titulo.trim() } : {}),
      encabezados: s.encabezados,
      filas: s.filas,
    };
  });
  return {
    nombre: formulario.value.nombre.trim(),
    secciones,
  };
}

async function guardar() {
  errorCrear.value = null;
  const payload = buildPayload();
  if (!payload.nombre) {
    errorCrear.value = 'Debe proporcionar el nombre de la plantilla';
    return;
  }
  if (!payload.secciones.length) {
    errorCrear.value = 'Debe incluir al menos una sección';
    return;
  }
  isSubmitting.value = true;
  try {
    if (modoEdicion.value && plantillaEditando.value?._id) {
      await updatePlantilla(plantillaEditando.value._id, payload);
      successMsg.value = 'Plantilla actualizada';
    } else {
      await createPlantilla(payload);
      successMsg.value = 'Plantilla creada';
    }
    actionError.value = null;
    cerrarModal();
    await cargarPlantillas();
  } catch (err: any) {
    errorCrear.value = extractError(err, 'No fue posible guardar la plantilla');
  } finally {
    isSubmitting.value = false;
  }
}

function confirmarDesactivar(p: Plantilla) {
  plantillaADesactivar.value = p;
  mensajeConfirmDesactivar.value = `¿Desactivar «${p.nombre}»? Dejará de aparecer en listados activos y en futuras cotizaciones.`;
  mostrarConfirmDesactivar.value = true;
}

function cancelarDesactivar() {
  mostrarConfirmDesactivar.value = false;
  plantillaADesactivar.value = null;
}

async function ejecutarDesactivar() {
  const p = plantillaADesactivar.value;
  mostrarConfirmDesactivar.value = false;
  if (!p?._id) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deletePlantilla(p._id);
    successMsg.value = 'Plantilla desactivada';
    await cargarPlantillas();
  } catch (err: any) {
    actionError.value = extractError(err, 'No fue posible desactivar');
  } finally {
    isMutating.value = false;
    plantillaADesactivar.value = null;
  }
}

async function reactivar(p: Plantilla) {
  if (!p._id) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await togglePlantillaActivo(p._id);
    successMsg.value = 'Plantilla reactivada';
    await cargarPlantillas();
  } catch (err: any) {
    actionError.value = extractError(err, 'No fue posible reactivar');
  } finally {
    isMutating.value = false;
  }
}

onMounted(() => {
  void cargarPlantillas();
});

onUnmounted(() => {
  clearFilterDebounce();
});
</script>
