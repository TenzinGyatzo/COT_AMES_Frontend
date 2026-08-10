<template>
  <div class="px-2 sm:px-0 max-w-2xl">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
      Onboard de tenant
    </h1>
    <p class="text-sm text-gray-600 mb-6">
      Crea un tenant, su primer administrador y las plantillas seed en un solo
      paso. No se siembra CRM ni catálogo de servicios.
    </p>

    <div
      v-if="success"
      class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 space-y-2"
    >
      <p class="text-green-900 font-medium">Tenant provisionado</p>
      <p class="text-sm text-green-800">
        <span class="font-semibold">{{ success.tenant.nombre }}</span>
        (<span class="text-green-700"> ({{ success.tenant.clave }})</span>
        — admin
        <span class="font-semibold">{{ success.admin.email }}</span>
        — {{ success.plantillasSeedCount }} plantilla(s) seed.
      </p>
      <p class="text-xs text-green-700">
        Contexto de administración fijado al nuevo tenant. Completa branding y
        correo en Configuración cuando corresponda.
      </p>
      <button
        type="button"
        class="mt-2 px-4 py-2 text-sm font-medium rounded-md bg-medical-blue-600 text-white hover:bg-medical-blue-700"
        @click="resetForm"
      >
        Onboardear otro
      </button>
    </div>

    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <form
      v-if="!success"
      class="bg-white shadow-md rounded-lg p-6 space-y-6"
      @submit.prevent="onSubmit"
    >
      <fieldset class="space-y-4">
        <legend class="text-sm font-semibold text-gray-900">Tenant</legend>
        <div>
          <label
            for="onboard-tenant-nombre"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <input
            id="onboard-tenant-nombre"
            v-model="form.tenant.nombre"
            type="text"
            required
            autocomplete="organization"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            placeholder="Demo SA"
          />
        </div>
        <div>
          <label
            for="onboard-tenant-clave"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Clave (slug)
          </label>
          <input
            id="onboard-tenant-clave"
            v-model="form.tenant.clave"
            type="text"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 font-mono text-sm"
            placeholder="demo-sa"
            @input="onClaveInput"
          />
          <p class="mt-1 text-xs text-gray-500">
            Lowercase, números y guiones (ej. demo-sa). Se normaliza a
            minúsculas al escribir.
          </p>
        </div>
      </fieldset>

      <fieldset class="space-y-4">
        <legend class="text-sm font-semibold text-gray-900">
          Primer admin_tenant
        </legend>
        <div>
          <label
            for="onboard-admin-nombre"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre
          </label>
          <input
            id="onboard-admin-nombre"
            v-model="form.admin.nombre"
            type="text"
            required
            autocomplete="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <div>
          <label
            for="onboard-admin-email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="onboard-admin-email"
            v-model="form.admin.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
        </div>
        <div>
          <label
            for="onboard-admin-password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="onboard-admin-password"
            v-model="form.admin.password"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres.</p>
        </div>
      </fieldset>

      <button
        type="submit"
        class="w-full sm:w-auto px-5 py-2.5 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50"
        :disabled="submitting"
      >
        {{ submitting ? 'Provisionando…' : 'Crear tenant' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import {
  onboardTenant,
  type OnboardTenantResponse,
} from '../../services/admin-api.service';
import { useAuthStore } from '../../store/auth';

const authStore = useAuthStore();

const form = reactive({
  tenant: { nombre: '', clave: '' },
  admin: { nombre: '', email: '', password: '' },
});

const submitting = ref(false);
const error = ref<string | null>(null);
const success = ref<OnboardTenantResponse | null>(null);

function resetForm() {
  form.tenant.nombre = '';
  form.tenant.clave = '';
  form.admin.nombre = '';
  form.admin.email = '';
  form.admin.password = '';
  error.value = null;
  success.value = null;
}

function onClaveInput(event: Event) {
  const el = event.target as HTMLInputElement;
  form.tenant.clave = el.value.toLowerCase();
}

async function onSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    const res = await onboardTenant({
      tenant: {
        nombre: form.tenant.nombre.trim(),
        clave: form.tenant.clave.trim().toLowerCase(),
      },
      admin: {
        nombre: form.admin.nombre.trim(),
        email: form.admin.email.trim(),
        password: form.admin.password,
      },
    });
    success.value = res;
    authStore.setActiveTenantId(res.tenant._id);
    // Refresca opciones del selector (incluye el tenant nuevo).
    await authStore.ensureAdminTenantContext();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    error.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'No se pudo completar el onboarding.';
  } finally {
    submitting.value = false;
  }
}
</script>
