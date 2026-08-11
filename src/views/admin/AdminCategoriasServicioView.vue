<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Categorías</h1>
        <p class="mt-1 text-sm text-gray-500">
          Taxonomía del catálogo del tenant (nombre + código).
        </p>
      </div>
      <button
        type="button"
        @click="abrirModalCrear"
        class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
      >
        + Nueva categoría
      </button>
    </div>

    <div class="mb-4">
      <div class="flex items-center pb-1">
        <ToggleSwitch
          id="ver-inactivos-categorias"
          v-model="verInactivos"
          @change="onVerInactivosChange"
        />
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

    <div
      v-if="!hasLoadedOnce"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">Cargando categorías...</p>
    </div>

    <template v-else>
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-800">{{ error }}</p>
      </div>
      <div class="relative">
        <ListLoadingOverlay v-if="isLoading" />
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Nombre
                  </th>
                  <th
                    class="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Código
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
                <tr v-if="categorias.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                    <p>{{ emptyListMessage }}</p>
                    <button
                      v-if="!verInactivos"
                      type="button"
                      class="mt-3 text-sm font-medium text-medical-blue-600 hover:underline"
                      @click="abrirModalCrear"
                    >
                      Crear primera categoría
                    </button>
                  </td>
                </tr>
                <tr v-for="c in categorias" :key="c._id">
                  <td class="px-3 lg:px-4 py-4 text-sm font-medium text-gray-900">
                    {{ c.nombre }}
                  </td>
                  <td class="px-3 lg:px-4 py-4 text-sm font-mono text-gray-700">
                    {{ c.codigo }}
                  </td>
                  <td class="px-3 lg:px-4 py-4 text-sm">
                    <span
                      :class="
                        isActiva(c)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      "
                      class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ isActiva(c) ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td
                    class="px-3 lg:px-4 py-4 text-sm whitespace-nowrap space-x-2"
                  >
                    <button
                      type="button"
                      class="text-medical-blue-600 hover:underline"
                      :disabled="isMutating"
                      @click="abrirModalEditar(c)"
                    >
                      Editar
                    </button>
                    <button
                      v-if="isActiva(c)"
                      type="button"
                      class="text-red-600 hover:underline"
                      :disabled="isMutating"
                      @click="confirmarDesactivar(c)"
                    >
                      Desactivar
                    </button>
                    <button
                      v-else
                      type="button"
                      class="text-medical-green-600 hover:underline"
                      :disabled="isMutating"
                      @click="reactivar(c)"
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
              >{{ pagination.total }} categoría(s) · Página
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
      </div>
    </template>

    <div
      v-if="mostrarModal"
      class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="
          modoEdicion ? 'titulo-editar-categoria' : 'titulo-crear-categoria'
        "
        @pointerdown.stop
      >
        <div class="px-5 py-4 border-b border-gray-200">
          <h2
            :id="
              modoEdicion ? 'titulo-editar-categoria' : 'titulo-crear-categoria'
            "
            class="text-lg font-semibold text-gray-900"
          >
            {{ modoEdicion ? 'Editar categoría' : 'Nueva categoría' }}
          </h2>
        </div>

        <form class="px-5 py-4 space-y-4" @submit.prevent="guardar">
          <div
            v-if="errorCrear"
            class="rounded-md bg-red-50 text-red-800 text-sm px-3 py-2"
          >
            {{ errorCrear }}
          </div>

          <div>
            <label
              for="categoria-nombre"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre</label
            >
            <input
              id="categoria-nombre"
              v-model="formulario.nombre"
              type="text"
              required
              maxlength="200"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            />
          </div>

          <div>
            <label
              for="categoria-codigo"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Código</label
            >
            <input
              id="categoria-codigo"
              v-model="formulario.codigo"
              type="text"
              required
              minlength="2"
              maxlength="3"
              pattern="[A-Za-z0-9]{2,3}"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              @blur="formulario.codigo = formulario.codigo.trim().toUpperCase()"
            />
            <p class="mt-1 text-xs text-gray-500">
              2 o 3 caracteres alfanuméricos; se guarda en mayúsculas.
            </p>
          </div>

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
      title="Desactivar categoría"
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
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  getCategoriasServicio,
  createCategoriaServicio,
  updateCategoriaServicio,
  deleteCategoriaServicio,
  type AdminCategoriasServicioFilters,
} from '../../services/admin-api.service';
import type { CategoriaServicioCatalogo } from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import ListLoadingOverlay from '../../components/base/ListLoadingOverlay.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { extractError } from '../../utils/extractError';
import {
  boolQuery,
  compactQuery,
  queryFlag,
  queryInt,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';
import { useAuthStore } from '../../store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { activeTenantId } = storeToRefs(authStore);

const categorias = ref<CategoriaServicioCatalogo[]>([]);
const isLoading = ref(false);
const hasLoadedOnce = ref(false);
const error = ref<string | null>(null);
const verInactivos = ref(false);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
let loadSeq = 0;

const filters = ref({ page: 1, limit: 20 });
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 });

const mostrarModal = ref(false);
const modoEdicion = ref(false);
const categoriaEditando = ref<CategoriaServicioCatalogo | null>(null);
const isSubmitting = ref(false);
const errorCrear = ref<string | null>(null);

const formulario = ref({ nombre: '', codigo: '' });

const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = ref('');
const categoriaADesactivar = ref<CategoriaServicioCatalogo | null>(null);

function isActiva(c: CategoriaServicioCatalogo): boolean {
  return c.activo !== false;
}

const emptyListMessage = computed(() => {
  if (verInactivos.value) return 'No hay categorías inactivas';
  return 'Este tenant aún no tiene categorías. Crea la primera para organizar el catálogo.';
});

function applyQueryToState() {
  filters.value.page = queryInt(route.query, 'page', 1);
  filters.value.limit = queryInt(route.query, 'limit', 20, { max: 100 });
  verInactivos.value = queryFlag(route.query, 'verInactivos');
}

async function syncQuery() {
  const next = compactQuery({
    page: (filters.value.page ?? 1) > 1 ? filters.value.page : undefined,
    limit:
      (filters.value.limit ?? 20) !== 20 ? filters.value.limit : undefined,
    verInactivos: boolQuery(verInactivos.value),
  });
  await router.replace({ query: next });
}

function resetFilters() {
  filters.value = { page: 1, limit: 20 };
  verInactivos.value = false;
}

const cargarCategorias = async () => {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;
  try {
    let page = filters.value.page ?? 1;
    const limit = filters.value.limit ?? 20;
    const activeFilters: AdminCategoriasServicioFilters = { page, limit };
    if (verInactivos.value) activeFilters.activo = false;

    let res = await getCategoriasServicio(activeFilters);
    if (seq !== loadSeq) return;

    if (res.data.length === 0 && res.total > 0 && res.page > res.totalPages) {
      page = res.totalPages;
      filters.value.page = page;
      res = await getCategoriasServicio({ ...activeFilters, page });
      if (seq !== loadSeq) return;
    }

    categorias.value = res.data;
    pagination.value = {
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
    filters.value.page = res.total === 0 ? 1 : res.page;
    await syncQuery();
  } catch (err: unknown) {
    if (seq !== loadSeq) return;
    error.value = extractError(err, 'No fue posible cargar las categorías');
  } finally {
    if (seq === loadSeq) {
      isLoading.value = false;
      hasLoadedOnce.value = true;
    }
  }
};

function reloadFromFilters() {
  successMsg.value = null;
  actionError.value = null;
  void (async () => {
    await syncQuery();
    await cargarCategorias();
  })();
}

function onVerInactivosChange() {
  filters.value.page = 1;
  reloadFromFilters();
}

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    filters.value.page = (filters.value.page ?? 1) - 1;
    reloadFromFilters();
  }
}

function nextPage() {
  if ((filters.value.page ?? 1) < (pagination.value.totalPages ?? 1)) {
    filters.value.page = (filters.value.page ?? 1) + 1;
    reloadFromFilters();
  }
}

function abrirModalCrear() {
  modoEdicion.value = false;
  categoriaEditando.value = null;
  formulario.value = { nombre: '', codigo: '' };
  errorCrear.value = null;
  mostrarModal.value = true;
}

function abrirModalEditar(c: CategoriaServicioCatalogo) {
  modoEdicion.value = true;
  categoriaEditando.value = c;
  formulario.value = {
    nombre: c.nombre,
    codigo: c.codigo,
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

function validarFormulario(): string | null {
  const nombre = formulario.value.nombre.trim();
  const codigo = formulario.value.codigo.trim().toUpperCase();
  if (!nombre) return 'Debe proporcionar el nombre de la categoría';
  if (!/^[A-Z0-9]{2,3}$/.test(codigo)) {
    return 'El código debe tener 2 o 3 caracteres alfanuméricos';
  }
  return null;
}

async function guardar() {
  errorCrear.value = null;
  const validationError = validarFormulario();
  if (validationError) {
    errorCrear.value = validationError;
    return;
  }
  if (modoEdicion.value && !categoriaEditando.value?._id) {
    errorCrear.value = 'No fue posible editar: categoría sin identificador';
    return;
  }
  const nombre = formulario.value.nombre.trim();
  const codigo = formulario.value.codigo.trim().toUpperCase();
  isSubmitting.value = true;
  try {
    if (modoEdicion.value && categoriaEditando.value?._id) {
      const payload: { nombre?: string; codigo?: string } = {};
      if (nombre !== categoriaEditando.value.nombre) payload.nombre = nombre;
      if (codigo !== categoriaEditando.value.codigo) payload.codigo = codigo;
      if (Object.keys(payload).length === 0) {
        cerrarModal();
        return;
      }
      await updateCategoriaServicio(categoriaEditando.value._id, payload);
      successMsg.value = 'Categoría actualizada';
    } else {
      await createCategoriaServicio({ nombre, codigo });
      successMsg.value = 'Categoría creada';
      // Tras alta, listar activas para que la fila nueva sea visible
      if (verInactivos.value) {
        verInactivos.value = false;
        filters.value.page = 1;
      }
    }
    actionError.value = null;
    cerrarModal();
    await cargarCategorias();
  } catch (err: unknown) {
    errorCrear.value = extractError(err, 'No fue posible guardar la categoría');
  } finally {
    isSubmitting.value = false;
  }
}

function confirmarDesactivar(c: CategoriaServicioCatalogo) {
  categoriaADesactivar.value = c;
  mensajeConfirmDesactivar.value = `¿Desactivar «${c.nombre}» (${c.codigo})? Dejará de aparecer en listados activos. Si hay ítems activos asociados, la API bloqueará la baja.`;
  mostrarConfirmDesactivar.value = true;
}

function cancelarDesactivar() {
  mostrarConfirmDesactivar.value = false;
  categoriaADesactivar.value = null;
}

function httpStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

async function ejecutarDesactivar() {
  const c = categoriaADesactivar.value;
  mostrarConfirmDesactivar.value = false;
  if (!c?._id) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deleteCategoriaServicio(c._id);
    successMsg.value = 'Categoría desactivada';
    await cargarCategorias();
  } catch (err: unknown) {
    // FR57 / UX-DR6: mensaje de negocio solo en 409; otros errores usan fallback genérico
    successMsg.value = null;
    const fallback =
      httpStatus(err) === 409
        ? 'No se puede dar de baja: hay ítems activos asociados a esta categoría. Reasigna o da de baja los ítems primero.'
        : 'No fue posible desactivar la categoría';
    actionError.value = extractError(err, fallback);
  } finally {
    isMutating.value = false;
    categoriaADesactivar.value = null;
  }
}

/** Reactivar vía POST create (BE unique absoluto AD-20) — no hay toggle-activo. */
async function reactivar(c: CategoriaServicioCatalogo) {
  if (!c.codigo) {
    actionError.value =
      'No fue posible reactivar: la categoría no tiene código';
    return;
  }
  isMutating.value = true;
  actionError.value = null;
  try {
    await createCategoriaServicio({
      nombre: c.nombre,
      codigo: c.codigo,
    });
    successMsg.value = 'Categoría reactivada';
    await cargarCategorias();
  } catch (err: unknown) {
    successMsg.value = null;
    actionError.value = extractError(err, 'No fue posible reactivar');
  } finally {
    isMutating.value = false;
  }
}

watch(activeTenantId, () => {
  resetFilters();
  hasLoadedOnce.value = false;
  void (async () => {
    await syncQuery();
    await cargarCategorias();
  })();
});

onMounted(() => {
  if (shouldResetListQueryForTenant(activeTenantId.value)) {
    resetFilters();
  } else {
    applyQueryToState();
  }
  void cargarCategorias();
});
</script>
