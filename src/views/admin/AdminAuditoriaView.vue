<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-0">
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Auditoría de seguridad
      </h1>
      <p class="text-sm text-gray-600 mt-1">
        Registro mínimo de acciones sensibles. Solo lectura; no incluye el CRUD
        comercial ordinario.
      </p>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="mb-4 bg-white shadow-md rounded-lg p-4 md:p-6">
      <form
        class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        @submit.prevent="aplicarFiltros"
      >
        <div>
          <label for="audit-desde" class="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            id="audit-desde"
            v-model="fechaDesde"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <div>
          <label for="audit-hasta" class="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            id="audit-hasta"
            v-model="fechaHasta"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <div>
          <label for="audit-evento" class="block text-sm font-medium text-gray-700 mb-1">
            Evento
          </label>
          <select
            id="audit-evento"
            v-model="actionType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          >
            <option value="">Todos</option>
            <option
              v-for="opt in actionOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="audit-recurso" class="block text-sm font-medium text-gray-700 mb-1">
            Recurso
          </label>
          <select
            id="audit-recurso"
            v-model="resourceType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          >
            <option value="">Todos</option>
            <option value="auth">Autenticación</option>
            <option value="user">Usuario</option>
            <option value="tenant">Tenant</option>
            <option value="tenant_config">Configuración</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label for="audit-actor" class="block text-sm font-medium text-gray-700 mb-1">
            ID de actor
          </label>
          <input
            id="audit-actor"
            v-model="actorId"
            type="text"
            placeholder="ObjectId del usuario que actuó"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <div class="md:col-span-2">
          <label for="audit-resource-id" class="block text-sm font-medium text-gray-700 mb-1">
            ID de recurso
          </label>
          <input
            id="audit-resource-id"
            v-model="resourceId"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <label
          v-if="authStore.isAdminSistema"
          class="md:col-span-2 flex items-center gap-2 text-sm text-gray-700"
        >
          <input v-model="includePlatform" type="checkbox" class="rounded" />
          Incluir eventos de plataforma (sin tenant)
        </label>
        <div class="md:col-span-2 flex gap-2 justify-end">
          <button
            type="button"
            class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            @click="limpiarFiltros"
          >
            Limpiar
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-medical-blue-600 rounded-md hover:bg-medical-blue-700"
          >
            Filtrar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-sm text-gray-500">Cargando…</div>
      <div v-else-if="events.length === 0" class="p-6 text-sm text-gray-500">
        No hay eventos con esos filtros.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Cuándo</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Actor</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Evento</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Recurso</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Resultado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="ev in events" :key="ev._id" class="align-top">
              <td class="px-4 py-3 whitespace-nowrap text-gray-700">
                {{ formatWhen(ev.timestamp) }}
                <div v-if="ev.ip" class="text-xs text-gray-400 font-mono">
                  {{ ev.ip }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-gray-900">
                  {{ ev.actorSnapshot?.email || '—' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ ev.actorSnapshot?.rol || '' }}
                </div>
              </td>
              <td class="px-4 py-3">
                {{ labelFor(ev.actionType) }}
                <pre
                  v-if="ev.payload && Object.keys(ev.payload).length"
                  class="mt-1 text-xs text-gray-500 whitespace-pre-wrap break-all"
                >{{ formatPayload(ev.payload) }}</pre>
              </td>
              <td class="px-4 py-3 text-gray-700">
                {{ ev.resourceType }}
                <div v-if="ev.resourceId" class="text-xs font-mono text-gray-400 break-all">
                  {{ ev.resourceId }}
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                  :class="
                    ev.result === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ ev.result === 'success' ? 'Éxito' : 'Fallo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm"
      >
        <span class="text-gray-600">{{ total }} evento(s)</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1 border rounded-md disabled:opacity-40"
            :disabled="page <= 1"
            @click="goPage(page - 1)"
          >
            Anterior
          </button>
          <span class="py-1">{{ page }} / {{ totalPages }}</span>
          <button
            type="button"
            class="px-3 py-1 border rounded-md disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="goPage(page + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { getAuditEvents } from '../../services/admin-api.service';
import type { AuditEvent } from '../../types/backend';
import {
  compactQuery,
  queryInt,
  queryString,
  queryFlag,
  queryDate,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';

const ACTION_LABELS: Record<string, string> = {
  'auth.login.success': 'Login exitoso',
  'auth.login.failure': 'Login fallido',
  'auth.password_reset.requested': 'Reset de contraseña solicitado',
  'auth.password_reset.completed': 'Reset de contraseña completado',
  'auth.bootstrap.register': 'Bootstrap del primer admin',
  'user.created': 'Usuario creado',
  'user.role.changed': 'Cambio de rol',
  'user.activated': 'Usuario activado',
  'user.suspended': 'Usuario suspendido',
  'user.password.changed': 'Contraseña de usuario cambiada',
  'user.deleted': 'Usuario desactivado',
  'tenant.onboarded': 'Tenant provisionado',
  'tenant.activated': 'Tenant reactivado',
  'tenant.suspended': 'Tenant suspendido',
  'tenant_config.branding.updated': 'Branding actualizado',
  'tenant_config.email.updated': 'Email/SMTP actualizado',
  'tenant_config.vigencia_bancarios.updated': 'Vigencia/bancarios actualizados',
  'tenant_config.logo.updated': 'Logo de tenant actualizado',
  'tenant_config.logo.deleted': 'Logo de tenant eliminado',
  'tenant_config.bank_logo.updated': 'Logo de banco actualizado',
  'tenant_config.bank_logo.deleted': 'Logo de banco eliminado',
};

const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const events = ref<AuditEvent[]>([]);
const loading = ref(true);
const error = ref('');
const total = ref(0);
const page = ref(1);
const totalPages = ref(0);

const fechaDesde = ref('');
const fechaHasta = ref('');
const actionType = ref('');
const resourceType = ref('');
const actorId = ref('');
const resourceId = ref('');
const includePlatform = ref(false);

function labelFor(action: string): string {
  return ACTION_LABELS[action] || action;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-MX');
}

function formatPayload(payload: Record<string, unknown>): string {
  try {
    return JSON.stringify(payload);
  } catch {
    return '';
  }
}

function readQuery() {
  if (shouldResetListQueryForTenant(authStore.activeTenantId)) {
    fechaDesde.value = '';
    fechaHasta.value = '';
    actionType.value = '';
    resourceType.value = '';
    actorId.value = '';
    resourceId.value = '';
    includePlatform.value = false;
    page.value = 1;
    return;
  }
  fechaDesde.value = queryDate(route.query, 'fechaDesde') || '';
  fechaHasta.value = queryDate(route.query, 'fechaHasta') || '';
  actionType.value = queryString(route.query, 'actionType') || '';
  resourceType.value = queryString(route.query, 'resourceType') || '';
  actorId.value = queryString(route.query, 'actorId') || '';
  resourceId.value = queryString(route.query, 'resourceId') || '';
  includePlatform.value = queryFlag(route.query, 'includePlatform');
  page.value = queryInt(route.query, 'page', 1);
}

async function syncQuery() {
  await router.replace({
    query: compactQuery({
      fechaDesde: fechaDesde.value || undefined,
      fechaHasta: fechaHasta.value || undefined,
      actionType: actionType.value || undefined,
      resourceType: resourceType.value || undefined,
      actorId: actorId.value || undefined,
      resourceId: resourceId.value || undefined,
      includePlatform: includePlatform.value ? '1' : undefined,
      page: page.value > 1 ? page.value : undefined,
    }),
  });
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAuditEvents({
      fechaDesde: fechaDesde.value || undefined,
      fechaHasta: fechaHasta.value || undefined,
      actionType: actionType.value || undefined,
      resourceType: resourceType.value || undefined,
      actorId: actorId.value || undefined,
      resourceId: resourceId.value || undefined,
      includePlatform: includePlatform.value || undefined,
      page: page.value,
      limit: 20,
    });
    events.value = res.data;
    total.value = res.total;
    page.value = res.page;
    totalPages.value = res.totalPages;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    error.value =
      status === 403
        ? 'No tiene permiso para consultar la auditoría.'
        : 'No se pudieron cargar los eventos de auditoría.';
    events.value = [];
  } finally {
    loading.value = false;
  }
}

async function aplicarFiltros() {
  page.value = 1;
  await syncQuery();
  await load();
}

async function limpiarFiltros() {
  fechaDesde.value = '';
  fechaHasta.value = '';
  actionType.value = '';
  resourceType.value = '';
  actorId.value = '';
  resourceId.value = '';
  includePlatform.value = false;
  page.value = 1;
  await syncQuery();
  await load();
}

async function goPage(next: number) {
  page.value = next;
  await syncQuery();
  await load();
}

onMounted(async () => {
  readQuery();
  await syncQuery();
  await load();
});
</script>
