<template>
  <div class="px-2 sm:px-0">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
      Configuración
    </h1>
    <p class="text-gray-600 mb-6">
      Parámetros del tenant activo. Solo el administrador de sistema puede
      editar branding, remitente, notificaciones, vigencia y datos bancarios.
    </p>

    <div
      v-if="isLoading"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">Cargando configuración…</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      role="alert"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <template v-else-if="config">
      <div class="bg-white shadow-md rounded-lg p-6 space-y-4 mb-6">
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Administración activa
          </p>
          <p class="text-lg font-semibold text-gray-900 mt-1">
            {{ tenantLabel }}
          </p>
          <p class="text-sm text-gray-500 mt-1 font-mono">
            tenantId: {{ config.tenantId }}
          </p>
        </div>
      </div>

      <form
        class="bg-white shadow-md rounded-lg p-6 space-y-5 mb-6"
        @submit.prevent="guardarBranding"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Branding y datos legales
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Se usan en PDF y superficies del tenant. Distinto del remitente SMTP
            de cotizaciones (sección siguiente).
          </p>
        </div>

        <div
          v-if="formError"
          class="bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ formError }}</p>
        </div>
        <div
          v-if="formSuccess"
          class="bg-green-50 border border-green-200 rounded-lg p-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ formSuccess }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-gray-700">Razón social</span>
            <input
              v-model="form.razonSocial"
              type="text"
              maxlength="200"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">RFC</span>
            <input
              v-model="form.rfc"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Teléfono</span>
            <input
              v-model="form.telefono"
              type="text"
              maxlength="40"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-gray-700">Domicilio</span>
            <input
              v-model="form.domicilio"
              type="text"
              maxlength="500"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Email de contacto</span>
            <input
              v-model="form.emailContacto"
              type="email"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Sitio web</span>
            <input
              v-model="form.sitioWeb"
              type="text"
              maxlength="200"
              placeholder="ejemplo.com"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>

        <div class="border-t border-gray-100 pt-4 space-y-3">
          <p class="text-sm font-medium text-gray-700">Logo</p>
          <div class="flex flex-wrap items-center gap-4">
            <div
              class="w-24 h-24 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Logo del tenant"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-xs text-gray-400 text-center px-2"
                >Sin logo</span
              >
            </div>
            <div class="flex flex-col gap-2">
              <input
                ref="logoInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="text-sm text-gray-600 disabled:opacity-50"
                :disabled="isBusy"
                @change="onLogoSelected"
              />
              <p class="text-xs text-gray-500">PNG, JPEG o WebP · máx. 1MB</p>
              <button
                v-if="config.branding?.logoUrl"
                type="button"
                class="text-sm text-red-600 hover:text-red-800 self-start disabled:opacity-50"
                :disabled="isBusy"
                @click="eliminarLogo"
              >
                Eliminar logo
              </button>
            </div>
          </div>
          <p v-if="logoError" class="text-sm text-red-700">{{ logoError }}</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSaving ? 'Guardando…' : 'Guardar branding' }}
          </button>
        </div>
      </form>

      <form
        class="bg-white shadow-md rounded-lg p-6 space-y-5 mb-6"
        @submit.prevent="guardarEmail"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Remitente y notificaciones
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Remitente From de cotizaciones y correos adicionales para avisos de
            aceptación/rechazo (Epic 6). La lista puede quedar vacía.
          </p>
        </div>

        <div
          v-if="emailFormError"
          class="bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ emailFormError }}</p>
        </div>
        <div
          v-if="emailFormSuccess"
          class="bg-green-50 border border-green-200 rounded-lg p-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ emailFormSuccess }}</p>
        </div>

        <label class="block">
          <span class="text-sm font-medium text-gray-700"
            >Correo remitente (From)</span
          >
          <input
            v-model="emailForm.emailRemitente"
            type="email"
            maxlength="120"
            placeholder="cotizaciones@ames.example"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :disabled="isBusy"
            @input="onEmailFormEdited"
          />
          <span class="mt-1 block text-xs text-gray-500"
            >Vacío = usar EMAIL_FROM del entorno. No es el email de contacto del
            branding.</span
          >
        </label>

        <div>
          <span class="text-sm font-medium text-gray-700"
            >Correos adicionales de notificación</span
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(addr, idx) in emailForm.correosNotificacion"
              :key="addr"
              class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
            >
              {{ addr }}
              <button
                type="button"
                class="text-gray-500 hover:text-red-600 disabled:opacity-50"
                :disabled="isBusy"
                :aria-label="`Quitar ${addr}`"
                @click="quitarNotificacion(idx)"
              >
                ×
              </button>
            </span>
            <span
              v-if="emailForm.correosNotificacion.length === 0"
              class="text-sm text-gray-400"
              >Ninguno (lista vacía)</span
            >
          </div>
          <div class="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              v-model="notifDraft"
              type="email"
              maxlength="120"
              placeholder="ops@ames.example"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @keydown.enter.prevent="agregarNotificacion"
            />
            <button
              type="button"
              class="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="isBusy"
              @click="agregarNotificacion"
            >
              Agregar
            </button>
          </div>
          <p v-if="notifDraftError" class="mt-1 text-sm text-red-700">
            {{ notifDraftError }}
          </p>
          <p class="mt-1 text-xs text-gray-500">Máx. 20 correos. Enter o Agregar.</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSavingEmail ? 'Guardando…' : 'Guardar email' }}
          </button>
        </div>
      </form>

      <form
        class="bg-white shadow rounded-lg p-6 space-y-4"
        @submit.prevent="onSaveVigenciaBancarios"
      >
        <div>
          <h2 class="text-lg font-medium text-gray-900">
            Vigencia y datos bancarios
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Días de vigencia al crear cotizaciones sin fecha explícita, y
            contenido de la página bancaria del PDF (el toggle sigue siendo por
            cotización).
          </p>
        </div>

        <div
          v-if="vbFormError"
          class="rounded-md bg-red-50 border border-red-200 px-4 py-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ vbFormError }}</p>
        </div>
        <div
          v-if="vbFormSuccess"
          class="rounded-md bg-green-50 border border-green-200 px-4 py-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ vbFormSuccess }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Vigencia default (días)</label
          >
          <input
            v-model.number="vbForm.vigenciaDefaultDias"
            type="number"
            min="1"
            max="365"
            step="1"
            class="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :disabled="isBusy"
            @input="onVbFormEdited"
          />
          <p class="mt-1 text-xs text-gray-500">Entero entre 1 y 365.</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700"
              >Titular</label
            >
            <input
              v-model="vbForm.titular"
              type="text"
              maxlength="200"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Banco</label>
            <input
              v-model="vbForm.banco"
              type="text"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >No. de cuenta</label
            >
            <input
              v-model="vbForm.cuenta"
              type="text"
              maxlength="40"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">CLABE</label>
            <input
              v-model="vbForm.clabe"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700"
              >Domicilio (opcional)</label
            >
            <input
              v-model="vbForm.domicilio"
              type="text"
              maxlength="500"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >RFC (opcional)</label
            >
            <input
              v-model="vbForm.rfc"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Email bancario (opcional)</label
            >
            <input
              v-model="vbForm.email"
              type="email"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onVbFormEdited"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSavingVb ? 'Guardando…' : 'Guardar vigencia y bancarios' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  deleteTenantLogo,
  getTenantConfig,
  getTenants,
  updateTenantBranding,
  updateTenantEmailConfig,
  updateTenantVigenciaBancarios,
  uploadTenantLogo,
} from '../../services/admin-api.service';
import type { Tenant, TenantConfigResponse } from '../../types/backend';
import { useAuthStore } from '../../store/auth';
import { API_BASE_URL } from '../../config/api';

const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const config = ref<TenantConfigResponse | null>(null);
const tenants = ref<Tenant[]>([]);

const form = reactive({
  razonSocial: '',
  rfc: '',
  domicilio: '',
  telefono: '',
  emailContacto: '',
  sitioWeb: '',
});

const emailForm = reactive({
  emailRemitente: '',
  correosNotificacion: [] as string[],
});
const notifDraft = ref('');
const notifDraftError = ref<string | null>(null);

const vbForm = reactive({
  vigenciaDefaultDias: 30,
  titular: '',
  banco: '',
  cuenta: '',
  clabe: '',
  domicilio: '',
  rfc: '',
  email: '',
});

const isSaving = ref(false);
const isSavingLogo = ref(false);
const isSavingEmail = ref(false);
const isSavingVb = ref(false);
const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);
const emailFormError = ref<string | null>(null);
const emailFormSuccess = ref<string | null>(null);
const vbFormError = ref<string | null>(null);
const vbFormSuccess = ref<string | null>(null);
const logoError = ref<string | null>(null);
const logoInputRef = ref<HTMLInputElement | null>(null);

const isBusy = computed(
  () =>
    isSaving.value ||
    isSavingLogo.value ||
    isSavingEmail.value ||
    isSavingVb.value,
);

const MAX_LOGO_BYTES = 1_000_000;
const ALLOWED_LOGO_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const tenantLabel = computed(() => {
  const tid = config.value?.tenantId || authStore.activeTenantId;
  if (!tid) return 'Sin administración seleccionada';
  const match = tenants.value.find((t) => t._id === tid);
  if (match) return `${match.nombre} (${match.clave})`;
  return tid;
});

/** Resuelve URL pública del logo (proxy /uploads en dev). */
const logoPreviewUrl = computed(() => {
  const path = config.value?.branding?.logoUrl;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (apiBase.startsWith('http')) return `${apiBase}${path}`;
  return path;
});

function fillBrandingFromConfig(cfg: TenantConfigResponse) {
  const b = cfg.branding || {};
  form.razonSocial = b.razonSocial || '';
  form.rfc = b.rfc || '';
  form.domicilio = b.domicilio || '';
  form.telefono = b.telefono || '';
  form.emailContacto = b.emailContacto || '';
  form.sitioWeb = b.sitioWeb || '';
}

function fillEmailFromConfig(cfg: TenantConfigResponse) {
  emailForm.emailRemitente = cfg.emailRemitente || '';
  emailForm.correosNotificacion = [...(cfg.correosNotificacion || [])];
}

function fillVbFromConfig(cfg: TenantConfigResponse) {
  vbForm.vigenciaDefaultDias =
    typeof cfg.vigenciaDefaultDias === 'number' ? cfg.vigenciaDefaultDias : 30;
  const b = cfg.bancarios || {};
  vbForm.titular = b.titular || '';
  vbForm.banco = b.banco || '';
  vbForm.cuenta = b.cuenta || '';
  vbForm.clabe = b.clabe || '';
  vbForm.domicilio = b.domicilio || '';
  vbForm.rfc = b.rfc || '';
  vbForm.email = b.email || '';
}

function fillFormFromConfig(cfg: TenantConfigResponse) {
  fillBrandingFromConfig(cfg);
  fillEmailFromConfig(cfg);
  fillVbFromConfig(cfg);
}

function onEmailFormEdited() {
  emailFormSuccess.value = null;
  notifDraftError.value = null;
}

function onVbFormEdited() {
  vbFormSuccess.value = null;
}

function extractError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const status = e?.response?.status;
  const raw = e?.response?.data?.message;
  const msg = Array.isArray(raw)
    ? raw.join('. ')
    : typeof raw === 'string'
      ? raw
      : '';

  if (status === 400) {
    return (
      msg ||
      'Datos inválidos o falta seleccionar administración (X-Tenant-Id).'
    );
  }
  if (status === 403) {
    return msg || 'No tiene permiso para esta operación.';
  }
  if (msg.trim()) return msg;
  return fallback;
}

async function cargar() {
  isLoading.value = true;
  error.value = null;
  config.value = null;
  formError.value = null;
  formSuccess.value = null;
  emailFormError.value = null;
  emailFormSuccess.value = null;
  vbFormError.value = null;
  vbFormSuccess.value = null;
  logoError.value = null;
  notifDraftError.value = null;

  const requestedTenantId = authStore.activeTenantId;
  if (!requestedTenantId) {
    error.value =
      'Seleccione una administración en el pie del menú para ver su configuración.';
    isLoading.value = false;
    return;
  }

  try {
    const [cfg, t] = await Promise.all([
      getTenantConfig(),
      getTenants().catch(() => [] as Tenant[]),
    ]);
    if (authStore.activeTenantId !== requestedTenantId) {
      return;
    }
    config.value = cfg;
    tenants.value = t;
    fillFormFromConfig(cfg);
  } catch (e) {
    if (authStore.activeTenantId !== requestedTenantId) {
      return;
    }
    error.value = extractError(e, 'No se pudo cargar la configuración');
  } finally {
    if (authStore.activeTenantId === requestedTenantId) {
      isLoading.value = false;
    }
  }
}

async function guardarBranding() {
  if (isBusy.value) return;
  formError.value = null;
  formSuccess.value = null;
  isSaving.value = true;
  try {
    const updated = await updateTenantBranding({
      razonSocial: form.razonSocial,
      rfc: form.rfc,
      domicilio: form.domicilio,
      telefono: form.telefono,
      emailContacto: form.emailContacto,
      sitioWeb: form.sitioWeb,
    });
    config.value = updated;
    fillBrandingFromConfig(updated);
    formSuccess.value = 'Branding guardado correctamente.';
  } catch (e) {
    formError.value = extractError(e, 'No se pudo guardar el branding');
  } finally {
    isSaving.value = false;
  }
}

async function onLogoSelected(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  logoError.value = null;
  formSuccess.value = null;

  const mime = (file.type || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_LOGO_TYPES.has(mime)) {
    logoError.value = 'Tipo de imagen no permitido (use PNG, JPEG o WebP).';
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }
  if (file.size > MAX_LOGO_BYTES) {
    logoError.value = 'El logo no puede superar 1MB.';
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }

  if (isBusy.value) {
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }

  isSavingLogo.value = true;
  try {
    const updated = await uploadTenantLogo(file);
    config.value = updated;
    formSuccess.value = 'Logo actualizado.';
  } catch (e) {
    logoError.value = extractError(e, 'No se pudo subir el logo');
  } finally {
    isSavingLogo.value = false;
    if (logoInputRef.value) logoInputRef.value.value = '';
  }
}

async function eliminarLogo() {
  if (isBusy.value) return;
  logoError.value = null;
  formSuccess.value = null;
  isSavingLogo.value = true;
  try {
    const updated = await deleteTenantLogo();
    config.value = updated;
    formSuccess.value = 'Logo eliminado.';
  } catch (e) {
    logoError.value = extractError(e, 'No se pudo eliminar el logo');
  } finally {
    isSavingLogo.value = false;
  }
}

async function guardarEmail() {
  if (isBusy.value) return;
  emailFormError.value = null;
  emailFormSuccess.value = null;
  notifDraftError.value = null;

  // Incorporar borrador pendiente (Enter/Agregar olvidado)
  if (notifDraft.value.trim()) {
    agregarNotificacion();
    if (notifDraftError.value) return;
  }

  isSavingEmail.value = true;
  try {
    const updated = await updateTenantEmailConfig({
      emailRemitente: emailForm.emailRemitente.trim().toLowerCase(),
      correosNotificacion: [...emailForm.correosNotificacion],
    });
    config.value = updated;
    fillEmailFromConfig(updated);
    emailFormSuccess.value = 'Configuración de email guardada.';
  } catch (e) {
    emailFormError.value = extractError(
      e,
      'No se pudo guardar la configuración de email',
    );
  } finally {
    isSavingEmail.value = false;
  }
}

async function onSaveVigenciaBancarios() {
  if (isBusy.value) return;
  vbFormError.value = null;
  vbFormSuccess.value = null;

  const days = Number(vbForm.vigenciaDefaultDias);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    vbFormError.value = 'La vigencia debe ser un entero entre 1 y 365.';
    return;
  }

  isSavingVb.value = true;
  try {
    const updated = await updateTenantVigenciaBancarios({
      vigenciaDefaultDias: days,
      bancarios: {
        titular: vbForm.titular.trim(),
        banco: vbForm.banco.trim(),
        cuenta: vbForm.cuenta.trim(),
        clabe: vbForm.clabe.trim(),
        domicilio: vbForm.domicilio.trim(),
        rfc: vbForm.rfc.trim(),
        email: vbForm.email.trim().toLowerCase(),
      },
    });
    config.value = updated;
    fillVbFromConfig(updated);
    vbFormSuccess.value = 'Vigencia y datos bancarios guardados.';
  } catch (e) {
    vbFormError.value = extractError(
      e,
      'No se pudo guardar vigencia/datos bancarios',
    );
  } finally {
    isSavingVb.value = false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function agregarNotificacion() {
  onEmailFormEdited();
  const raw = notifDraft.value.trim().toLowerCase();
  if (!raw) {
    notifDraftError.value = 'Escriba un correo para agregar.';
    return;
  }
  if (!EMAIL_RE.test(raw)) {
    notifDraftError.value = 'Correo inválido.';
    return;
  }
  if (emailForm.correosNotificacion.length >= 20) {
    notifDraftError.value = 'Máximo 20 correos.';
    return;
  }
  if (emailForm.correosNotificacion.includes(raw)) {
    notifDraftError.value = 'Ese correo ya está en la lista.';
    return;
  }
  emailForm.correosNotificacion.push(raw);
  notifDraft.value = '';
  notifDraftError.value = null;
}

function quitarNotificacion(idx: number) {
  onEmailFormEdited();
  emailForm.correosNotificacion.splice(idx, 1);
}

onMounted(() => {
  void cargar();
});
</script>
