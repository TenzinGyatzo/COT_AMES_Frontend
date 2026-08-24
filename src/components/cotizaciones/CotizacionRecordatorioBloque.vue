<template>
  <div
    class="rounded-lg border border-gray-200 bg-gray-50 p-4"
    data-testid="bloque-recordatorio"
  >
    <div class="mb-3 flex items-start justify-between gap-2">
      <div>
        <h2 class="text-base font-semibold text-gray-900 md:text-lg">
          Recordatorio para recotizar
        </h2>
        <p class="mt-0.5 text-xs text-gray-500">
          Te avisamos por correo interno para que no se te olvide volver a
          cotizar. El cliente no recibe nada.
        </p>
      </div>
    </div>

    <div
      v-if="loadError"
      class="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {{ loadError }}
    </div>
    <div
      v-if="zonaWarn"
      class="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900"
      role="status"
    >
      {{ zonaWarn }}
    </div>
    <div
      v-if="actionError"
      class="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {{ actionError }}
    </div>
    <div
      v-if="successMessage"
      class="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700"
    >
      {{ successMessage }}
    </div>

    <div v-if="loading" class="py-4 text-sm text-gray-500">Cargando…</div>

    <template v-else-if="loadError">
      <!-- Sin CTA: un GET fallido no debe ofrecer Programar (riesgo de sobrescribir). -->
    </template>

    <template v-else-if="blockedPostDisparo">
      <p class="text-sm text-gray-600">
        Esta cotización ya tiene un aviso pendiente. Lo encuentras en Inicio, en
        «Pendientes de recotizar».
      </p>
    </template>

    <template v-else-if="showProgramado">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <span
            class="inline-block rounded-md border border-info-border bg-info-soft px-2.5 py-1 text-xs font-semibold text-info-text"
          >
            Programado
          </span>
          <p class="text-sm font-medium text-gray-900">
            {{ resumenOperativo }}
          </p>
          <p class="text-recipe-preview text-gray-600">
            {{ resumenReceta }}
          </p>
          <p class="text-recipe-preview text-gray-600">
            Recibirás un correo interno ese día.
          </p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white disabled:opacity-50"
            :disabled="busy"
            @click="openSelector('edit')"
          >
            Editar
          </button>
          <BaseButtonLoader
            type="button"
            variant="secondary"
            size="sm"
            :loading="cancelling"
            :disabled="busy"
            @click="onCancelar"
          >
            Quitar
          </BaseButtonLoader>
        </div>
      </div>
    </template>

    <template v-else>
      <BaseButtonLoader
        type="button"
        variant="primary"
        size="sm"
        :disabled="busy"
        @click="openSelector('create')"
      >
        Programar aviso
      </BaseButtonLoader>
    </template>

    <RecordatorioRecetaSelector
      :open="selectorOpen"
      :mode="selectorMode"
      :zona-horaria="zonaHoraria"
      :fecha-creacion="fechaCreacion"
      :initial-receta="showProgramado ? recordatorio?.receta : null"
      :saving="saving"
      @close="selectorOpen = false"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseButtonLoader from '../base/BaseButtonLoader.vue';
import RecordatorioRecetaSelector from './RecordatorioRecetaSelector.vue';
import {
  deleteRecordatorioCotizacion,
  getRecordatorioCotizacion,
  getTenantConfig,
  upsertRecordatorioCotizacion,
} from '../../services/admin-api.service';
import type {
  RecetaRecordatorio,
  RecordatorioRecotizacion,
} from '../../types/backend';
import { extractError } from '../../utils/extractError';
import {
  formatResumenOperativo,
  resumenRecetaLabel,
} from '../../utils/fecha-disparo-preview';

const props = defineProps<{
  cotizacionId: string;
  fechaCreacion?: string | Date | null;
}>();

const loading = ref(true);
const busy = ref(false);
const saving = ref(false);
const cancelling = ref(false);
const loadError = ref('');
const zonaWarn = ref('');
const actionError = ref('');
const successMessage = ref('');
const recordatorio = ref<RecordatorioRecotizacion | null>(null);
const zonaHoraria = ref<string | undefined>(undefined);
const selectorOpen = ref(false);
const selectorMode = ref<'create' | 'edit'>('create');

const blockedPostDisparo = computed(() => {
  const r = recordatorio.value;
  if (!r) return false;
  if (r.everDisparado === true) return true;
  return r.estado === 'disparado' || r.estado === 'cerrado';
});

const showProgramado = computed(
  () =>
    !!recordatorio.value &&
    recordatorio.value.estado === 'programado' &&
    !blockedPostDisparo.value,
);

const resumenReceta = computed(() =>
  recordatorio.value
    ? resumenRecetaLabel(recordatorio.value.receta, zonaHoraria.value)
    : '',
);

const resumenOperativo = computed(() => {
  if (!recordatorio.value?.fechaDisparoUtc) return '';
  return formatResumenOperativo(
    recordatorio.value.fechaDisparoUtc,
    zonaHoraria.value,
  );
});

async function loadZona() {
  try {
    const cfg = await getTenantConfig();
    zonaHoraria.value = cfg.zonaHoraria;
    zonaWarn.value = '';
  } catch {
    zonaHoraria.value = undefined;
    zonaWarn.value =
      'No se pudo cargar el horario de tu empresa. Usaremos el de Ciudad de México.';
  }
}

async function loadRecordatorio() {
  loading.value = true;
  loadError.value = '';
  try {
    recordatorio.value = await getRecordatorioCotizacion(props.cotizacionId);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) {
      recordatorio.value = null;
    } else {
      loadError.value = extractError(err, 'No se pudo cargar el aviso');
      recordatorio.value = null;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadZona(), loadRecordatorio()]);
});

watch(
  () => props.cotizacionId,
  async () => {
    selectorOpen.value = false;
    await loadRecordatorio();
  },
);

function openSelector(mode: 'create' | 'edit') {
  actionError.value = '';
  successMessage.value = '';
  selectorMode.value = mode;
  selectorOpen.value = true;
}

async function onSave(receta: RecetaRecordatorio) {
  saving.value = true;
  busy.value = true;
  actionError.value = '';
  successMessage.value = '';
  try {
    const body =
      receta.familia === 'fecha_exacta'
        ? {
            receta: {
              familia: 'fecha_exacta' as const,
              fechaExacta: String(receta.fechaExacta).slice(0, 10),
            },
          }
        : {
            receta: {
              familia: receta.familia,
              preset: receta.preset,
            },
          };
    recordatorio.value = await upsertRecordatorioCotizacion(
      props.cotizacionId,
      body,
    );
    selectorOpen.value = false;
    successMessage.value = 'Aviso programado.';
  } catch (err) {
    actionError.value = extractError(err, 'No se pudo guardar el aviso');
  } finally {
    saving.value = false;
    busy.value = false;
  }
}

async function onCancelar() {
  cancelling.value = true;
  busy.value = true;
  actionError.value = '';
  successMessage.value = '';
  try {
    await deleteRecordatorioCotizacion(props.cotizacionId);
    // Tras cancelar sin disparo: UI vuelve a CTA (tratar como ausente).
    recordatorio.value = null;
    successMessage.value = 'Aviso cancelado.';
  } catch (err) {
    actionError.value = extractError(
      err,
      'No se pudo quitar el aviso',
    );
  } finally {
    cancelling.value = false;
    busy.value = false;
  }
}
</script>
