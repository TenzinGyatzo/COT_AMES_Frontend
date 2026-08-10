<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Tenants de plataforma
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          Inventario de administraciones. Suspende o reactiva clientes sin
          borrar datos. Usa el contexto (también inactivo) para dar soporte.
        </p>
      </div>
      <router-link
        to="/admin/onboard"
        class="inline-flex items-center justify-center px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors text-sm font-medium"
      >
        Onboard tenant
      </router-link>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </div>
    <div
      v-if="actionSuccess"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
      role="status"
    >
      {{ actionSuccess }}
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-sm text-gray-500">Cargando…</div>
      <div
        v-else-if="tenants.length === 0"
        class="p-6 text-sm text-gray-500"
      >
        No hay tenants registrados.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-4 py-3 text-left font-medium text-gray-700"
              >
                Nombre
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left font-medium text-gray-700"
              >
                Clave
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left font-medium text-gray-700"
              >
                Estado
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-left font-medium text-gray-700"
              >
                Creado
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-right font-medium text-gray-700"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in tenants" :key="t._id || t.clave">
              <td class="px-4 py-3 font-medium text-gray-900">
                {{ t.nombre }}
              </td>
              <td class="px-4 py-3 font-mono text-gray-700">{{ t.clave }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                  :class="
                    t.activo !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  "
                >
                  {{ t.activo !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                {{ formatDate(t.createdAt) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div
                  class="inline-flex flex-wrap items-center justify-end gap-2"
                >
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm font-medium rounded-md bg-medical-blue-600 text-white hover:bg-medical-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    :disabled="!t._id || actionBusy"
                    title="Fijar selector y abrir Dashboard (soporte)"
                    @click="usarContexto(t)"
                  >
                    Usar contexto
                  </button>
                  <button
                    v-if="t.activo !== false"
                    type="button"
                    class="px-3 py-1.5 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    :disabled="!t._id || actionBusy"
                    @click="pedirConfirmacion(t, 'suspender')"
                  >
                    Suspender
                  </button>
                  <button
                    v-else
                    type="button"
                    class="px-3 py-1.5 text-sm font-medium rounded-md bg-medical-green-600 text-white hover:bg-medical-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    :disabled="!t._id || actionBusy"
                    @click="pedirConfirmacion(t, 'reactivar')"
                  >
                    Reactivar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmationModal
      :show="!!pendiente"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmText"
      :type="pendiente?.tipo === 'suspender' ? 'warning' : 'info'"
      :loading="actionBusy"
      @confirm="confirmarAccion"
      @cancel="pendiente = null"
      @dismiss="pendiente = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import {
  getTenants,
  setTenantActivo,
} from '../../services/admin-api.service';
import { useAuthStore } from '../../store/auth';
import type { Tenant } from '../../types/backend';

type ConfirmTipo = 'suspender' | 'reactivar';

const authStore = useAuthStore();
const router = useRouter();

const tenants = ref<Tenant[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const actionSuccess = ref<string | null>(null);
const actionBusy = ref(false);
const pendiente = ref<{ tipo: ConfirmTipo; tenant: Tenant } | null>(null);

const confirmTitle = computed(() =>
  pendiente.value?.tipo === 'suspender'
    ? 'Suspender tenant'
    : 'Reactivar tenant',
);
const confirmMessage = computed(() => {
  const t = pendiente.value?.tenant;
  if (!t) return '';
  return pendiente.value?.tipo === 'suspender'
    ? `¿Suspender «${t.nombre}» (${t.clave})? Los usuarios del tenant no podrán iniciar sesión; los datos se conservan.`
    : `¿Reactivar «${t.nombre}» (${t.clave})? Los usuarios del tenant podrán volver a operar.`;
});
const confirmText = computed(() =>
  pendiente.value?.tipo === 'suspender' ? 'Suspender' : 'Reactivar',
);

function formatDate(iso?: string) {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function extractError(err: unknown, fallback: string): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || fallback;
}

/** Sidebar mantiene su propio catálogo; notificar tras mutar activo. */
function notifyTenantsCatalogChanged() {
  window.dispatchEvent(new CustomEvent('ames:tenants-catalog-changed'));
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    tenants.value = await getTenants();
  } catch (err: unknown) {
    error.value = extractError(
      err,
      'No se pudo cargar el inventario de tenants.',
    );
    tenants.value = [];
  } finally {
    loading.value = false;
  }
}

function usarContexto(t: Tenant) {
  if (!t._id) return;
  authStore.setActiveTenantId(t._id);
  void router.push({ name: 'admin-dashboard' });
}

function pedirConfirmacion(t: Tenant, tipo: ConfirmTipo) {
  if (!t._id || actionBusy.value) return;
  actionSuccess.value = null;
  pendiente.value = { tipo, tenant: t };
}

async function confirmarAccion() {
  const pend = pendiente.value;
  if (!pend?.tenant._id || actionBusy.value) return;
  actionBusy.value = true;
  error.value = null;
  actionSuccess.value = null;
  try {
    const updated = await setTenantActivo(
      pend.tenant._id,
      pend.tipo === 'reactivar',
    );
    const idx = tenants.value.findIndex((x) => x._id === updated._id);
    if (idx >= 0) {
      tenants.value[idx] = { ...tenants.value[idx], ...updated };
    } else {
      await load();
    }
    actionSuccess.value =
      pend.tipo === 'suspender'
        ? `Tenant «${updated.nombre}» suspendido.`
        : `Tenant «${updated.nombre}» reactivado.`;
    pendiente.value = null;
    notifyTenantsCatalogChanged();
  } catch (err: unknown) {
    error.value = extractError(err, 'No se pudo completar la operación.');
    // Mantener pendiente para reintentar sin perder contexto del modal.
  } finally {
    actionBusy.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>
