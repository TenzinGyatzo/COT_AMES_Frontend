<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Usuarios</h1>
      <button
        type="button"
        class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
        @click="abrirModalCrear"
      >
        + Nuevo usuario
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-4 mb-4">
      <ToggleSwitch
        id="usuarios-ver-inactivos"
        v-model="verInactivos"
        @change="onVerInactivosChange"
      />
    </div>

    <BaseSectionLoader
      v-if="!hasLoadedOnce"
      message="Cargando usuarios..."
    />

    <template v-else>
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <p class="text-red-800">{{ error }}</p>
      </div>
      <div
        v-if="actionError"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <p class="text-red-800">{{ actionError }}</p>
      </div>
      <div class="relative bg-white shadow-md rounded-lg overflow-hidden">
        <ListLoadingOverlay v-if="isLoading" />
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Nombre
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Email
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Rol
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Tenant
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="usuarios.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  {{
                    verInactivos
                      ? 'No hay usuarios inactivos'
                      : 'No hay usuarios activos'
                  }}
                </td>
              </tr>
              <tr v-for="u in usuarios" :key="u._id">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                  {{ u.nombre }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ u.email }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ labelRol(u.rol) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ tenantLabel(u.tenantId) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      u.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-medium space-x-3">
                  <button
                    type="button"
                    class="text-medical-blue-600 hover:text-medical-blue-900"
                    @click="abrirModalEditar(u)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="u.activo"
                    type="button"
                    class="text-red-600 hover:text-red-900"
                    @click="pedirDesactivar(u)"
                  >
                    Desactivar
                  </button>
                  <button
                    v-else
                    type="button"
                    class="text-green-700 hover:text-green-900"
                    @click="pedirReactivar(u)"
                  >
                    Reactivar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal crear / editar -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ editando ? 'Editar usuario' : 'Nuevo usuario' }}
        </h2>

        <form class="space-y-4" @submit.prevent="guardar">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre</label
            >
            <input
              v-model="form.nombre"
              required
              type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Email</label
            >
            <input
              v-model="form.email"
              required
              type="email"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
              <span v-if="editando" class="text-gray-400 font-normal"
                >(opcional)</span
              >
            </label>
            <input
              v-model="form.password"
              :required="!editando"
              type="password"
              minlength="6"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Rol</label
            >
            <select
              v-model="form.rol"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="operativo">Operativo</option>
              <option value="admin_sistema">Administrador de sistema</option>
            </select>
          </div>
          <div v-if="form.rol === 'operativo'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tenant</label
            >
            <select
              v-model="form.tenantId"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option disabled value="">Seleccione tenant</option>
              <option v-for="t in tenants" :key="t._id" :value="t._id">
                {{ t.nombre }}
              </option>
            </select>
          </div>

          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              @click="cerrarModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmationModal
      :show="!!pendienteConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmText"
      :type="pendienteConfirm?.tipo === 'desactivar' ? 'danger' : 'info'"
      :loading="confirmLoading"
      @confirm="ejecutarConfirmacion"
      @cancel="onCancelConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  createUser,
  deactivateUser,
  getTenants,
  getUsers,
  updateUser,
  type AdminUser,
} from '../../services/admin-api.service';
import type { Tenant } from '../../types/backend';
import { extractError } from '../../utils/extractError';
import {
  boolQuery,
  compactQuery,
  queryFlag,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';
import { useAuthStore } from '../../store/auth';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import ListLoadingOverlay from '../../components/base/ListLoadingOverlay.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { activeTenantId } = storeToRefs(authStore);

const usuarios = ref<AdminUser[]>([]);
const tenants = ref<Tenant[]>([]);
const isLoading = ref(true);
const hasLoadedOnce = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const verInactivos = ref(false);
const modalAbierto = ref(false);
const editando = ref(false);
const editId = ref<string | null>(null);
const guardando = ref(false);
const formError = ref<string | null>(null);
const confirmLoading = ref(false);

type ConfirmAction = {
  tipo: 'desactivar' | 'reactivar';
  user: AdminUser;
};
const pendienteConfirm = ref<ConfirmAction | null>(null);

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  rol: 'operativo' as 'operativo' | 'admin_sistema',
  tenantId: '',
});

const tenantById = computed(() => {
  const map = new Map<string, string>();
  for (const t of tenants.value) {
    if (t._id) map.set(t._id, t.nombre);
  }
  return map;
});

const confirmTitle = computed(() =>
  pendienteConfirm.value?.tipo === 'reactivar'
    ? 'Reactivar usuario'
    : 'Desactivar usuario',
);
const confirmMessage = computed(() => {
  const u = pendienteConfirm.value?.user;
  if (!u) return '';
  return pendienteConfirm.value?.tipo === 'reactivar'
    ? `¿Reactivar a ${u.nombre}? Volverá a poder iniciar sesión.`
    : `¿Desactivar a ${u.nombre}? No podrá iniciar sesión; el histórico se conserva.`;
});
const confirmText = computed(() =>
  pendienteConfirm.value?.tipo === 'reactivar' ? 'Reactivar' : 'Desactivar',
);

function labelRol(rol: string) {
  return rol === 'admin_sistema' ? 'Admin sistema' : 'Operativo';
}

function tenantLabel(id?: string) {
  if (!id) return '—';
  return tenantById.value.get(id) || id.slice(-6);
}

function applyQueryToState() {
  verInactivos.value = queryFlag(route.query, 'verInactivos');
}

async function syncQuery() {
  const next = compactQuery({
    verInactivos: boolQuery(verInactivos.value),
  });
  const cur = compactQuery({
    verInactivos: boolQuery(queryFlag(route.query, 'verInactivos')),
  });
  if (JSON.stringify(next) === JSON.stringify(cur)) return;
  await router.replace({ query: next });
}

let loadSeq = 0;

async function cargar() {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;
  actionError.value = null;
  try {
    const usersResult = await getUsers({
      activo: verInactivos.value ? false : true,
    }).then(
      (users) => ({ ok: true as const, users }),
      (e: unknown) => ({ ok: false as const, error: e }),
    );
    const tenantsResult = await getTenants().then(
      (t) => ({ ok: true as const, t }),
      (e: unknown) => ({ ok: false as const, error: e }),
    );

    if (seq !== loadSeq) return;

    if (usersResult.ok) {
      usuarios.value = usersResult.users;
    } else {
      error.value = extractError(usersResult.error);
    }

    if (tenantsResult.ok) {
      tenants.value = tenantsResult.t;
    } else if (usersResult.ok) {
      actionError.value =
        extractError(tenantsResult.error) ||
        'No se pudieron cargar los tenants';
    }
  } finally {
    if (seq === loadSeq) {
      isLoading.value = false;
      hasLoadedOnce.value = true;
    }
  }
}

function onVerInactivosChange() {
  void (async () => {
    await syncQuery();
    await cargar();
  })();
}

function resetForm() {
  form.nombre = '';
  form.email = '';
  form.password = '';
  form.rol = 'operativo';
  form.tenantId = '';
  formError.value = null;
}

function abrirModalCrear() {
  editando.value = false;
  editId.value = null;
  resetForm();
  modalAbierto.value = true;
}

function abrirModalEditar(u: AdminUser) {
  editando.value = true;
  editId.value = u._id;
  form.nombre = u.nombre;
  form.email = u.email;
  form.password = '';
  form.rol = u.rol;
  form.tenantId = u.tenantId || '';
  formError.value = null;
  modalAbierto.value = true;
}

function cerrarModal() {
  modalAbierto.value = false;
}

async function guardar() {
  formError.value = null;
  guardando.value = true;
  try {
    if (form.rol === 'operativo' && !form.tenantId) {
      formError.value = 'Seleccione un tenant para el operativo';
      return;
    }

    if (editando.value && editId.value) {
      const payload: Parameters<typeof updateUser>[1] = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
      };
      if (form.password) payload.password = form.password;
      if (form.rol === 'operativo') {
        payload.tenantId = form.tenantId;
      } else {
        payload.tenantId = null;
      }
      await updateUser(editId.value, payload);
    } else {
      await createUser({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
        ...(form.rol === 'operativo' ? { tenantId: form.tenantId } : {}),
      });
    }
    cerrarModal();
    await cargar();
  } catch (e: unknown) {
    formError.value = extractError(e);
  } finally {
    guardando.value = false;
  }
}

function pedirDesactivar(u: AdminUser) {
  pendienteConfirm.value = { tipo: 'desactivar', user: u };
}

function pedirReactivar(u: AdminUser) {
  pendienteConfirm.value = { tipo: 'reactivar', user: u };
}

function onCancelConfirm() {
  if (confirmLoading.value) return;
  pendienteConfirm.value = null;
}

async function ejecutarConfirmacion() {
  const pend = pendienteConfirm.value;
  if (!pend || confirmLoading.value) return;
  confirmLoading.value = true;
  actionError.value = null;
  try {
    if (pend.tipo === 'desactivar') {
      await deactivateUser(pend.user._id);
    } else {
      await updateUser(pend.user._id, { activo: true });
    }
    pendienteConfirm.value = null;
    await cargar();
  } catch (e: unknown) {
    actionError.value = extractError(e);
  } finally {
    confirmLoading.value = false;
  }
}

watch(activeTenantId, () => {
  verInactivos.value = false;
  hasLoadedOnce.value = false;
  void (async () => {
    await syncQuery();
    await cargar();
  })();
});

onMounted(() => {
  if (shouldResetListQueryForTenant(activeTenantId.value)) {
    verInactivos.value = false;
  } else {
    applyQueryToState();
  }
  void cargar();
});
</script>
