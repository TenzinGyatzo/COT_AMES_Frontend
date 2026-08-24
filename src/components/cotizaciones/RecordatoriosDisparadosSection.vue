<template>
  <section
    :id="sectionId"
    class="scroll-mt-6"
    aria-labelledby="recordatorios-disparados-heading"
  >
    <div class="mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <h2
          id="recordatorios-disparados-heading"
          class="text-lg font-semibold text-gray-800"
        >
          Seguimientos pendientes
        </h2>
        <span
          v-if="items.length > 0"
          class="shrink-0 whitespace-nowrap rounded-full bg-reminder-soft px-2.5 py-0.5 text-xs font-semibold text-reminder-text"
        >
          {{ items.length }}
        </span>
      </div>
      <p class="mt-0.5 text-sm text-gray-500">
        Recordatorios cuya fecha programada ya llegó.
      </p>
    </div>

    <div
      v-if="successMessage"
      class="mb-3 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
      role="status"
    >
      {{ successMessage }}
    </div>

    <div
      v-if="error"
      class="mb-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="loading && items.length === 0"
      message="Cargando seguimientos pendientes..."
    />

    <div
      v-else-if="items.length === 0 && !error"
      class="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500"
    >
      No hay seguimientos pendientes.
    </div>

    <ul v-else class="space-y-2" role="list">
      <li v-for="item in items" :key="item.recordatorioId">
        <RecordatorioDisparadoFila
          :item="item"
          :busy="closingId === item.recordatorioId"
          :zona-horaria="zonaHoraria"
          @volver-a-cotizar="onVolverACotizar"
          @cerrar="pedirCerrar"
        />
      </li>
    </ul>

    <ConfirmationModal
      :show="!!pendingCerrar"
      title="¿Marcar este seguimiento como atendido?"
      message="Dejará de aparecer entre tus seguimientos pendientes. La cotización original no será modificada."
      confirm-text="Marcar como atendido"
      cancel-text="Cancelar"
      type="warning"
      :loading="!!closingId"
      @confirm="confirmarCerrar"
      @cancel="pendingCerrar = null"
      @dismiss="pendingCerrar = null"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { RecordatorioDisparadoItem } from '../../types/backend';
import { getTenantConfig } from '../../services/admin-api.service';
import BaseSectionLoader from '../base/BaseSectionLoader.vue';
import ConfirmationModal from '../common/ConfirmationModal.vue';
import RecordatorioDisparadoFila from './RecordatorioDisparadoFila.vue';

const props = withDefaults(
  defineProps<{
    items: RecordatorioDisparadoItem[];
    loading?: boolean;
    error?: string;
    closingId?: string | null;
    sectionId?: string;
  }>(),
  {
    loading: false,
    error: '',
    closingId: null,
    sectionId: 'recordatorios-disparados',
  },
);

const emit = defineEmits<{
  cerrar: [item: RecordatorioDisparadoItem];
}>();

const router = useRouter();
const pendingCerrar = ref<RecordatorioDisparadoItem | null>(null);
const successMessage = ref('');
const zonaHoraria = ref<string | undefined>(undefined);

async function loadZona() {
  try {
    const cfg = await getTenantConfig();
    zonaHoraria.value = cfg.zonaHoraria;
  } catch {
    zonaHoraria.value = undefined;
  }
}

function onVolverACotizar(item: RecordatorioDisparadoItem) {
  void router.push({
    name: 'admin-cotizacion-detalle',
    params: { id: item.cotizacionId },
    query: { volverACotizar: '1' },
  });
}

function pedirCerrar(item: RecordatorioDisparadoItem) {
  pendingCerrar.value = item;
}

function confirmarCerrar() {
  const item = pendingCerrar.value;
  if (!item) return;
  emit('cerrar', item);
}

onMounted(() => {
  void loadZona();
});

watch(
  () => props.loading,
  (loading, wasLoading) => {
    if (wasLoading && !loading) void loadZona();
  },
);

watch(
  () => props.items,
  (items) => {
    const pendingId = pendingCerrar.value?.recordatorioId;
    if (pendingId && !items.some((i) => i.recordatorioId === pendingId)) {
      pendingCerrar.value = null;
    }
  },
);

watch(
  () => props.closingId,
  (id, prev) => {
    if (!prev || id) return;
    const stillThere = props.items.some((i) => i.recordatorioId === prev);
    if (pendingCerrar.value?.recordatorioId === prev) {
      pendingCerrar.value = null;
    }
    if (!stillThere) {
      successMessage.value = 'Seguimiento marcado como atendido.';
    }
  },
);
</script>
