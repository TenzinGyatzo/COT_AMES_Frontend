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

    <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-8 text-center">
      <p class="text-gray-500">Cargando usuarios...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <template v-else>
      <div
        v-if="actionError"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
      >
        <p class="text-red-800">{{ actionError }}</p>
      </div>
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
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
                  No hay usuarios activos
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
                    @click="desactivar(u)"
                  >
                    Desactivar
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  createUser,
  deactivateUser,
  getTenants,
  getUsers,
  updateUser,
  type AdminUser,
} from '../../services/admin-api.service';
import type { Tenant } from '../../types/backend';

const usuarios = ref<AdminUser[]>([]);
const tenants = ref<Tenant[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const modalAbierto = ref(false);
const editando = ref(false);
const editId = ref<string | null>(null);
const guardando = ref(false);
const formError = ref<string | null>(null);

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

function labelRol(rol: string) {
  return rol === 'admin_sistema' ? 'Admin sistema' : 'Operativo';
}

function tenantLabel(id?: string) {
  if (!id) return '—';
  return tenantById.value.get(id) || id.slice(-6);
}

function extractError(err: any): string {
  const raw = err?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join('. ');
  if (typeof raw === 'string') return raw;
  return 'No se pudo completar la operación';
}

async function cargar() {
  isLoading.value = true;
  error.value = null;
  actionError.value = null;
  try {
    const usersResult = await getUsers().then(
      (users) => ({ ok: true as const, users }),
      (e: unknown) => ({ ok: false as const, error: e }),
    );
    const tenantsResult = await getTenants().then(
      (t) => ({ ok: true as const, t }),
      (e: unknown) => ({ ok: false as const, error: e }),
    );

    if (usersResult.ok) {
      usuarios.value = usersResult.users;
    } else {
      error.value = extractError(usersResult.error);
    }

    if (tenantsResult.ok) {
      tenants.value = tenantsResult.t;
    } else if (usersResult.ok) {
      // Lista usable aunque falle el catálogo de tenants (labels caen a sufijo id)
      actionError.value =
        extractError(tenantsResult.error) ||
        'No se pudieron cargar los tenants';
    }
  } finally {
    isLoading.value = false;
  }
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
  } catch (e: any) {
    formError.value = extractError(e);
  } finally {
    guardando.value = false;
  }
}

async function desactivar(u: AdminUser) {
  if (!confirm(`¿Desactivar a ${u.nombre}?`)) return;
  actionError.value = null;
  try {
    await deactivateUser(u._id);
    await cargar();
  } catch (e: any) {
    actionError.value = extractError(e);
  }
}

onMounted(() => {
  void cargar();
});
</script>
