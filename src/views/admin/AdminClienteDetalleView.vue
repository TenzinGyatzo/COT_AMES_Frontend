<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton to="/admin/clientes" class="mb-4" />

    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
        Detalle del Cliente
      </h1>
      <div v-if="clienteDetalle" class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="abrirEditar"
        >
          Editar
        </button>
        <button
          v-if="clienteDetalle.activo !== false"
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
          :disabled="isMutating"
          @click="pedirDesactivar"
        >
          Desactivar
        </button>
        <button
          v-else
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 border border-green-200 text-green-800 bg-green-50 rounded-md hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
          :disabled="isMutating"
          @click="reactivar"
        >
          Reactivar
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div
      v-if="actionError"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ actionError }}
    </div>

    <div
      v-if="successMsg"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMsg }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingClientes && !clienteDetalle"
      message="Cargando cliente..."
    />

    <div v-else-if="clienteDetalle" class="space-y-4 md:space-y-6">
      <!-- Empresa -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200"
        >
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Información de la Empresa
          </h2>
          <span
            v-if="clienteDetalle.activo !== false"
            class="mt-2 md:mt-0 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
          >
            Activo
          </span>
          <span
            v-else
            class="mt-2 md:mt-0 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
          >
            Inactivo
          </span>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Empresa
            </label>
            <p class="text-sm md:text-base text-gray-900 font-medium">
              {{ clienteDetalle.empresa || '—' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Razón Social
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ clienteDetalle.razonSocial || '—' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              RFC
            </label>
            <p class="text-sm md:text-base text-gray-900 font-mono uppercase">
              {{ clienteDetalle.rfc || '—' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              ID del Cliente
            </label>
            <p class="text-xs text-gray-500 font-mono break-all">
              {{ clienteDetalle._id || '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Contactos (Story 3.4) -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-200"
        >
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Contactos
          </h2>
          <div class="flex flex-wrap items-center gap-3">
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="verInactivosContactos"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                :disabled="isLoadingContactos"
                @change="onVerInactivosContactosChange"
              />
              Ver inactivos
            </label>
            <button
              type="button"
              class="inline-flex items-center justify-center px-3 py-1.5 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 text-sm font-medium"
              @click="abrirNuevoContacto"
            >
              Agregar contacto
            </button>
          </div>
        </div>

        <BaseSectionLoader
          v-if="isLoadingContactos"
          message="Cargando contactos..."
        />

        <div v-else-if="contactos.length === 0" class="py-8 text-center">
          <p class="text-sm text-gray-500 mb-4">{{ emptyContactosMessage }}</p>
          <button
            v-if="!verInactivosContactos"
            type="button"
            class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 text-sm font-medium"
            @click="abrirNuevoContacto"
          >
            Agregar contacto
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Nombre
                </th>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Correo
                </th>
                <th
                  class="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Teléfono
                </th>
                <th
                  class="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Cargo
                </th>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="(c, idx) in contactos" :key="c._id || `contacto-${idx}`">
                <td class="px-3 py-3 font-medium text-gray-900">
                  {{ c.nombre }}
                </td>
                <td class="px-3 py-3 text-gray-600 break-all">
                  {{ c.correo || '—' }}
                </td>
                <td class="hidden md:table-cell px-3 py-3 text-gray-600">
                  {{ c.telefono || '—' }}
                </td>
                <td class="hidden lg:table-cell px-3 py-3 text-gray-600">
                  {{ c.cargo || '—' }}
                </td>
                <td class="px-3 py-3">
                  <span
                    v-if="c.activo !== false"
                    class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Activo
                  </span>
                  <span
                    v-else
                    class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                  >
                    Inactivo
                  </span>
                </td>
                <td class="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    class="text-medical-blue-700 hover:underline text-xs font-medium mr-2"
                    @click="abrirEditarContacto(c)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="c.activo !== false"
                    type="button"
                    class="text-red-700 hover:underline text-xs font-medium disabled:opacity-50"
                    :disabled="isMutatingContacto"
                    @click="pedirDesactivarContacto(c)"
                  >
                    Desactivar
                  </button>
                  <button
                    v-else
                    type="button"
                    class="text-green-800 hover:underline text-xs font-medium disabled:opacity-50"
                    :disabled="isMutatingContacto"
                    @click="reactivarContacto(c)"
                  >
                    Reactivar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!isLoadingContactos && contactosPagination.totalPages > 1"
          class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p class="text-sm text-gray-600">
            Página {{ contactosPagination.page }} de
            {{ contactosPagination.totalPages }} ({{ contactosPagination.total }}
            en total)
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
              :disabled="contactosPage <= 1 || isLoadingContactos"
              @click="prevContactosPage"
            >
              Anterior
            </button>
            <button
              type="button"
              class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
              :disabled="
                contactosPage >= contactosPagination.totalPages ||
                isLoadingContactos
              "
              @click="nextContactosPage"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!isLoadingClientes"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">No se pudo cargar la información del cliente</p>
    </div>

    <!-- Modal editar cliente -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
        @pointerdown.stop
      >
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">Editar cliente</h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              :disabled="isSubmitting"
              @click="cerrarModal"
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
          <form class="space-y-4" @submit.prevent="guardar">
            <div>
              <label
                for="detalle-cliente-empresa"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Empresa <span class="text-red-500">*</span></label
              >
              <input
                id="detalle-cliente-empresa"
                v-model="formulario.empresa"
                type="text"
                required
                maxlength="200"
                placeholder="Nombre comercial"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting"
              />
            </div>
            <div>
              <label
                for="detalle-cliente-razon-social"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Razón Social</label
              >
              <input
                id="detalle-cliente-razon-social"
                v-model="formulario.razonSocial"
                type="text"
                maxlength="300"
                placeholder="Ej. Servicios Industriales del Pacífico"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-xs text-gray-500">Opcional</p>
            </div>
            <div>
              <label
                for="detalle-cliente-rfc"
                class="block text-sm font-medium text-gray-700 mb-1"
                >RFC</label
              >
              <input
                id="detalle-cliente-rfc"
                v-model="formulario.rfc"
                type="text"
                maxlength="20"
                placeholder="Ej. ABC010101AB1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-xs text-gray-500">
                Opcional. Si se captura, debe ser único en esta administración.
              </p>
            </div>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm"
                :disabled="isSubmitting"
                @click="cerrarModal"
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

    <!-- Modal contacto -->
    <div
      v-if="mostrarModalContacto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @pointerdown="onContactoBackdropPointerDown"
      @pointerup="onContactoBackdropPointerUp"
      @pointercancel="onContactoBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        @pointerdown.stop
      >
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              {{
                modoEdicionContacto ? 'Editar contacto' : 'Nuevo contacto'
              }}
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              :disabled="isSubmittingContacto"
              @click="cerrarModalContacto"
            >
              ✕
            </button>
          </div>
          <div
            v-if="formErrorContacto"
            class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ formErrorContacto }}
          </div>
          <form class="space-y-4" @submit.prevent="guardarContacto">
            <div>
              <label
                for="contacto-nombre"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                id="contacto-nombre"
                v-model="formularioContacto.nombre"
                type="text"
                required
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmittingContacto"
              />
            </div>
            <div>
              <label
                for="contacto-correo"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo
              </label>
              <input
                id="contacto-correo"
                v-model="formularioContacto.correo"
                type="text"
                inputmode="email"
                autocomplete="email"
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmittingContacto"
              />
              <p class="mt-1 text-xs text-gray-500">Opcional.</p>
            </div>
            <div>
              <label
                for="contacto-telefono"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono
              </label>
              <input
                id="contacto-telefono"
                v-model="formularioContacto.telefono"
                type="text"
                maxlength="40"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmittingContacto"
              />
            </div>
            <div>
              <label
                for="contacto-cargo"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Cargo
              </label>
              <input
                id="contacto-cargo"
                v-model="formularioContacto.cargo"
                type="text"
                maxlength="120"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmittingContacto"
              />
            </div>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm"
                :disabled="isSubmittingContacto"
                @click="cerrarModalContacto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-medical-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                :disabled="isSubmittingContacto"
              >
                {{ isSubmittingContacto ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <ConfirmationModal
      :show="mostrarConfirmDesactivar"
      title="Desactivar cliente"
      :message="mensajeConfirmDesactivar"
      type="danger"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @confirm="ejecutarDesactivar"
      @cancel="mostrarConfirmDesactivar = false"
    />

    <ConfirmationModal
      :show="mostrarConfirmDesactivarContacto"
      title="Desactivar contacto"
      :message="mensajeConfirmDesactivarContacto"
      type="danger"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @confirm="ejecutarDesactivarContacto"
      @cancel="mostrarConfirmDesactivarContacto = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import {
  updateCliente,
  deleteCliente,
  toggleClienteActivo,
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
  toggleContactoActivo,
} from '../../services/admin-api.service';
import type { Contacto } from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';

const route = useRoute();
const {
  clienteDetalle,
  isLoadingClientes,
  error,
  obtenerCliente,
  limpiarClienteDetalle,
} = useAdmin();

const mostrarModal = ref(false);
const isSubmitting = ref(false);
const isMutating = ref(false);
const formError = ref<string | null>(null);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const formulario = ref({ empresa: '', razonSocial: '', rfc: '' });
const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = computed(() => {
  const nombre = clienteDetalle.value?.empresa || 'este cliente';
  return `¿Desactivar «${nombre}»? No aparecerá al crear cotizaciones; el histórico se conserva.`;
});

const {
  onBackdropPointerDown,
  onBackdropPointerUp,
  onBackdropPointerCancel,
} = useModalDismiss(() => {
  if (!isSubmitting.value) cerrarModal();
}, mostrarModal);

/* ——— Contactos ——— */
const contactos = ref<Contacto[]>([]);
const contactosPagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
});
const contactosPage = ref(1);
const verInactivosContactos = ref(false);
const isLoadingContactos = ref(false);
let contactosReqSeq = 0;
const isMutatingContacto = ref(false);
const isSubmittingContacto = ref(false);
const mostrarModalContacto = ref(false);
const modoEdicionContacto = ref(false);
const contactoEditandoId = ref<string | null>(null);
const formErrorContacto = ref<string | null>(null);
const formularioContacto = ref({
  nombre: '',
  correo: '',
  telefono: '',
  cargo: '',
});
const mostrarConfirmDesactivarContacto = ref(false);
const contactoADesactivar = ref<Contacto | null>(null);
const mensajeConfirmDesactivarContacto = computed(() => {
  const nombre = contactoADesactivar.value?.nombre || 'este contacto';
  return `¿Desactivar «${nombre}»? No aparecerá al crear cotizaciones; puede reactivarse después.`;
});

const emptyContactosMessage = computed(() =>
  verInactivosContactos.value
    ? 'No hay contactos inactivos'
    : 'Aún no hay contactos. Agrega el primero.',
);

const {
  onBackdropPointerDown: onContactoBackdropPointerDown,
  onBackdropPointerUp: onContactoBackdropPointerUp,
  onBackdropPointerCancel: onContactoBackdropPointerCancel,
} = useModalDismiss(() => {
  if (!isSubmittingContacto.value) cerrarModalContacto();
}, mostrarModalContacto);

function extractError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string | string[] } };
  };
  const raw = e?.response?.data?.message;
  const msg = Array.isArray(raw)
    ? raw.join('. ')
    : typeof raw === 'string'
      ? raw
      : '';
  return msg.trim() || fallback;
}

function abrirEditar() {
  if (!clienteDetalle.value) return;
  formulario.value = {
    empresa: clienteDetalle.value.empresa || '',
    razonSocial: clienteDetalle.value.razonSocial || '',
    rfc: clienteDetalle.value.rfc || '',
  };
  formError.value = null;
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
  formError.value = null;
}

function pedirDesactivar() {
  mostrarConfirmDesactivar.value = true;
}

async function ejecutarDesactivar() {
  const id = clienteDetalle.value?._id;
  mostrarConfirmDesactivar.value = false;
  if (!id || isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deleteCliente(id);
    successMsg.value = 'Cliente desactivado.';
    await obtenerCliente(id);
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo desactivar');
  } finally {
    isMutating.value = false;
  }
}

async function reactivar() {
  const id = clienteDetalle.value?._id;
  if (!id || isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await toggleClienteActivo(id);
    successMsg.value = 'Cliente reactivado.';
    await obtenerCliente(id);
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo reactivar');
  } finally {
    isMutating.value = false;
  }
}

async function guardar() {
  const id = clienteDetalle.value?._id;
  if (!id) return;
  const empresa = formulario.value.empresa.trim();
  if (!empresa) {
    formError.value = 'Debe proporcionar el nombre de la empresa';
    return;
  }
  isSubmitting.value = true;
  formError.value = null;
  try {
    await updateCliente(id, {
      empresa,
      razonSocial: formulario.value.razonSocial.trim(),
      rfc: formulario.value.rfc.trim().toUpperCase(),
    });
    successMsg.value = 'Cliente actualizado.';
    cerrarModal();
    await obtenerCliente(id);
  } catch (e) {
    formError.value = extractError(e, 'No se pudo actualizar el cliente');
  } finally {
    isSubmitting.value = false;
  }
}

function limpiarContactosLocal() {
  contactos.value = [];
  contactosPagination.value = {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };
  contactosPage.value = 1;
  verInactivosContactos.value = false;
  contactosReqSeq += 1;
  isLoadingContactos.value = false;
  cerrarModalContacto();
  mostrarConfirmDesactivarContacto.value = false;
  contactoADesactivar.value = null;
}

async function loadContactos() {
  const clienteId = clienteDetalle.value?._id || (route.params.id as string);
  if (!clienteId) return;
  const reqId = ++contactosReqSeq;
  isLoadingContactos.value = true;
  try {
    const res = await getContactos(clienteId, {
      page: contactosPage.value,
      limit: 20,
      ...(verInactivosContactos.value ? { activo: false } : {}),
    });
    if (reqId !== contactosReqSeq) return;

    // Clamp página huérfana
    if (
      res.data.length === 0 &&
      res.total > 0 &&
      res.page > res.totalPages
    ) {
      contactosPage.value = Math.max(1, res.totalPages);
      const res2 = await getContactos(clienteId, {
        page: contactosPage.value,
        limit: 20,
        ...(verInactivosContactos.value ? { activo: false } : {}),
      });
      if (reqId !== contactosReqSeq) return;
      contactos.value = res2.data;
      contactosPagination.value = {
        total: res2.total,
        page: res2.page,
        limit: res2.limit,
        totalPages: res2.totalPages,
      };
    } else {
      contactos.value = res.data;
      contactosPagination.value = {
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      };
      contactosPage.value = res.page;
    }
  } catch (e) {
    if (reqId !== contactosReqSeq) return;
    actionError.value = extractError(e, 'No se pudieron cargar los contactos');
    contactos.value = [];
    contactosPagination.value = {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    contactosPage.value = 1;
  } finally {
    if (reqId === contactosReqSeq) {
      isLoadingContactos.value = false;
    }
  }
}

function onVerInactivosContactosChange() {
  contactosPage.value = 1;
  void loadContactos();
}

function prevContactosPage() {
  if (contactosPage.value > 1) {
    contactosPage.value -= 1;
    void loadContactos();
  }
}

function nextContactosPage() {
  if (contactosPage.value < contactosPagination.value.totalPages) {
    contactosPage.value += 1;
    void loadContactos();
  }
}

function abrirNuevoContacto() {
  modoEdicionContacto.value = false;
  contactoEditandoId.value = null;
  formularioContacto.value = {
    nombre: '',
    correo: '',
    telefono: '',
    cargo: '',
  };
  formErrorContacto.value = null;
  mostrarModalContacto.value = true;
}

function abrirEditarContacto(c: Contacto) {
  modoEdicionContacto.value = true;
  contactoEditandoId.value = c._id || null;
  formularioContacto.value = {
    nombre: c.nombre || '',
    correo: c.correo || '',
    telefono: c.telefono || '',
    cargo: c.cargo || '',
  };
  formErrorContacto.value = null;
  mostrarModalContacto.value = true;
}

function cerrarModalContacto() {
  mostrarModalContacto.value = false;
  formErrorContacto.value = null;
  isSubmittingContacto.value = false;
}

async function guardarContacto() {
  const clienteId = clienteDetalle.value?._id;
  if (!clienteId) {
    formErrorContacto.value =
      'No hay cliente cargado. Cierra el modal e inténtalo de nuevo.';
    return;
  }
  const nombre = formularioContacto.value.nombre.trim();
  if (!nombre) {
    formErrorContacto.value = 'Debe proporcionar el nombre del contacto';
    return;
  }
  if (modoEdicionContacto.value && !contactoEditandoId.value) {
    formErrorContacto.value = 'No se pudo identificar el contacto a editar.';
    return;
  }
  isSubmittingContacto.value = true;
  formErrorContacto.value = null;
  try {
    const correo = formularioContacto.value.correo.trim();
    const telefono = formularioContacto.value.telefono.trim();
    const cargo = formularioContacto.value.cargo.trim();
    if (modoEdicionContacto.value && contactoEditandoId.value) {
      await updateContacto(clienteId, contactoEditandoId.value, {
        nombre,
        correo: correo || null,
        telefono: telefono || null,
        cargo: cargo || null,
      });
      successMsg.value = 'Contacto actualizado.';
    } else {
      await createContacto(clienteId, {
        nombre,
        ...(correo ? { correo } : {}),
        ...(telefono ? { telefono } : {}),
        ...(cargo ? { cargo } : {}),
      });
      successMsg.value = 'Contacto creado.';
      contactosPage.value = 1;
      verInactivosContactos.value = false;
    }
    actionError.value = null;
    cerrarModalContacto();
    await loadContactos();
  } catch (e) {
    formErrorContacto.value = extractError(e, 'No se pudo guardar el contacto');
  } finally {
    isSubmittingContacto.value = false;
  }
}

function pedirDesactivarContacto(c: Contacto) {
  contactoADesactivar.value = c;
  mostrarConfirmDesactivarContacto.value = true;
}

async function ejecutarDesactivarContacto() {
  const clienteId = clienteDetalle.value?._id;
  const id = contactoADesactivar.value?._id;
  mostrarConfirmDesactivarContacto.value = false;
  if (!clienteId || !id || isMutatingContacto.value) return;
  isMutatingContacto.value = true;
  actionError.value = null;
  try {
    await deleteContacto(clienteId, id);
    successMsg.value = 'Contacto desactivado.';
    await loadContactos();
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo desactivar el contacto');
  } finally {
    isMutatingContacto.value = false;
  }
}

async function reactivarContacto(c: Contacto) {
  const clienteId = clienteDetalle.value?._id;
  const id = c._id;
  if (!clienteId || !id || isMutatingContacto.value) return;
  isMutatingContacto.value = true;
  actionError.value = null;
  try {
    await toggleContactoActivo(clienteId, id);
    successMsg.value = 'Contacto reactivado.';
    await loadContactos();
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo reactivar el contacto');
  } finally {
    isMutatingContacto.value = false;
  }
}

async function cargarCliente(clienteId: string) {
  try {
    await obtenerCliente(clienteId);
    await loadContactos();
  } catch (err) {
    console.error('Error al cargar cliente:', err);
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string' && id) {
      limpiarClienteDetalle();
      limpiarContactosLocal();
      successMsg.value = null;
      actionError.value = null;
      void cargarCliente(id);
    }
  },
);

onMounted(async () => {
  const clienteId = route.params.id as string;
  if (clienteId) {
    await cargarCliente(clienteId);
  }
});

onUnmounted(() => {
  limpiarClienteDetalle();
});
</script>
