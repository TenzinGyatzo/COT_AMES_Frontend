<template>
  <div
    class="rounded-lg border border-gray-200 bg-gray-50 p-4"
    data-testid="bloque-recordatorio"
  >
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
      v-if="successKind"
      class="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700"
      role="status"
    >
      <template v-if="successKind === 'eliminado'">
        Recordatorio eliminado.
      </template>
      <template v-else>
        Recordatorio
        {{ successKind === 'actualizado' ? 'actualizado' : 'programado' }}
        para el
        <strong>{{ successFecha }}</strong>.
      </template>
    </div>

    <div v-if="loading" class="py-4 text-sm text-gray-500">Cargando…</div>

    <template v-else-if="loadError" />

    <template v-else-if="showAtendido">
      <h2 class="text-base font-semibold text-gray-900 md:text-lg">
        Seguimiento atendido
      </h2>
      <p class="mt-1 text-sm text-gray-600">
        Ya marcaste este seguimiento como atendido. La cotización original no
        fue modificada.
      </p>
    </template>

    <template v-else-if="blockedPostDisparo">
      <h2 class="text-base font-semibold text-gray-900 md:text-lg">
        Seguimiento pendiente
      </h2>
      <p class="mt-1 text-sm text-gray-600">
        La fecha de este recordatorio ya llegó. Continúa en
        <strong>Dashboard</strong>, en «Seguimientos pendientes».
      </p>
    </template>

    <template v-else-if="showProgramado">
      <h2 class="text-base font-semibold text-gray-900 md:text-lg">
        Recordatorio programado
      </h2>
      <p class="mt-1 text-sm text-gray-700">
        Te recordaremos contactar a
        <strong>{{ clienteLabel }}</strong> el
        <strong>{{ fechaProgramada }}</strong>. Ese día enviaremos un correo a
        ti y a los destinatarios configurados para notificaciones.
      </p>
      <p class="mt-2 text-sm text-gray-500">
        Aestimare no enviará ningún mensaje al cliente.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500 disabled:opacity-50"
          :disabled="busy"
          @click="openSelector('edit')"
        >
          Cambiar fecha
        </button>
        <BaseButtonLoader
          type="button"
          variant="secondary"
          size="sm"
          :loading="cancelling"
          :disabled="busy"
          @click="confirmEliminarOpen = true"
        >
          Eliminar recordatorio
        </BaseButtonLoader>
      </div>
    </template>

    <template v-else>
      <h2 class="text-base font-semibold text-gray-900 md:text-lg">
        ¿Este cliente podría necesitar una nueva cotización más adelante?
      </h2>
      <p class="mt-1 text-sm text-gray-700">
        Programa una fecha para que Aestimare te recuerde contactar a
        <strong>{{ clienteLabel }}</strong>. Ese día enviaremos un correo a ti
        y a los destinatarios configurados para notificaciones. Después podrás
        crear una nueva cotización a partir de esta.
      </p>
      <p class="mt-2 text-sm text-gray-500">
        Aestimare no enviará ningún mensaje al cliente.
      </p>
      <div class="mt-3">
        <BaseButtonLoader
          type="button"
          variant="primary"
          size="sm"
          :disabled="busy"
          @click="openSelector('create')"
        >
          Programar recordatorio
        </BaseButtonLoader>
      </div>
    </template>

    <RecordatorioRecetaSelector
      :open="selectorOpen"
      :mode="selectorMode"
      :zona-horaria="zonaHoraria"
      :fecha-creacion="fechaCreacion"
      :initial-receta="showProgramado ? recordatorio?.receta : null"
      :saving="saving"
      :nombre-cliente="props.nombreCliente"
      :fecha-disparo="recordatorio?.fechaDisparoUtc"
      @close="selectorOpen = false"
      @save="onSave"
    />

    <ConfirmationModal
      :show="confirmEliminarOpen"
      title="¿Eliminar este recordatorio?"
      message="Dejará de estar programado. La cotización original no será modificada."
      confirm-text="Eliminar recordatorio"
      cancel-text="Cancelar"
      type="warning"
      :loading="cancelling"
      @confirm="onCancelar"
      @cancel="confirmEliminarOpen = false"
      @dismiss="confirmEliminarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseButtonLoader from '../base/BaseButtonLoader.vue';
import ConfirmationModal from '../common/ConfirmationModal.vue';
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
  clienteDisplayName,
  formatFechaRecordatorioLarga,
} from '../../utils/fecha-disparo-preview';

const props = defineProps<{
  cotizacionId: string;
  fechaCreacion?: string | Date | null;
  nombreCliente?: string | null;
}>();

const loading = ref(true);
const busy = ref(false);
const saving = ref(false);
const cancelling = ref(false);
const loadError = ref('');
const zonaWarn = ref('');
const actionError = ref('');
const successKind = ref<'programado' | 'actualizado' | 'eliminado' | ''>('');
const successFecha = ref('');
const recordatorio = ref<RecordatorioRecotizacion | null>(null);
const zonaHoraria = ref<string | undefined>(undefined);
const selectorOpen = ref(false);
const selectorMode = ref<'create' | 'edit'>('create');
const confirmEliminarOpen = ref(false);

const clienteLabel = computed(() => clienteDisplayName(props.nombreCliente));

const blockedPostDisparo = computed(() => {
  const r = recordatorio.value;
  if (!r) return false;
  if (r.estado === 'cerrado' || r.estado === 'cancelado') return false;
  if (r.everDisparado === true) return true;
  return r.estado === 'disparado';
});

const showAtendido = computed(() => recordatorio.value?.estado === 'cerrado');

const showProgramado = computed(
  () =>
    !!recordatorio.value &&
    recordatorio.value.estado === 'programado' &&
    !blockedPostDisparo.value,
);

const fechaProgramada = computed(() => {
  if (!recordatorio.value?.fechaDisparoUtc) return '';
  return formatFechaRecordatorioLarga(
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
      loadError.value = extractError(err, 'No se pudo cargar el recordatorio');
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
  successKind.value = '';
  selectorMode.value = mode;
  selectorOpen.value = true;
}

async function onSave(receta: RecetaRecordatorio) {
  const wasEdit = selectorMode.value === 'edit';
  saving.value = true;
  busy.value = true;
  actionError.value = '';
  successKind.value = '';
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
    successFecha.value = recordatorio.value?.fechaDisparoUtc
      ? formatFechaRecordatorioLarga(
          recordatorio.value.fechaDisparoUtc,
          zonaHoraria.value,
        )
      : '';
    successKind.value = wasEdit ? 'actualizado' : 'programado';
  } catch (err) {
    selectorOpen.value = false;
    actionError.value = extractError(
      err,
      'No se pudo guardar el recordatorio',
    );
  } finally {
    saving.value = false;
    busy.value = false;
  }
}

async function onCancelar() {
  cancelling.value = true;
  busy.value = true;
  actionError.value = '';
  successKind.value = '';
  try {
    await deleteRecordatorioCotizacion(props.cotizacionId);
    recordatorio.value = null;
    confirmEliminarOpen.value = false;
    successKind.value = 'eliminado';
  } catch (err) {
    actionError.value = extractError(
      err,
      'No se pudo eliminar el recordatorio',
    );
  } finally {
    cancelling.value = false;
    busy.value = false;
  }
}
</script>
