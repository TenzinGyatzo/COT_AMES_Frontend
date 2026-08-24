<template>
  <section
    :id="sectionId"
    class="scroll-mt-6"
    aria-labelledby="recordatorios-disparados-heading"
  >
    <div class="mb-4 flex items-center justify-between gap-2">
      <div>
        <h2
          id="recordatorios-disparados-heading"
          class="text-lg font-semibold text-gray-800"
        >
          Pendientes de recotizar
        </h2>
        <p class="mt-0.5 text-sm text-gray-500">
          Avisos que ya te llegaron. Repite la cotización o márcala como
          atendida.
        </p>
      </div>
      <span
        v-if="items.length > 0"
        class="rounded-full bg-reminder-soft px-2.5 py-0.5 text-xs font-semibold text-reminder-text"
      >
        {{ items.length }}
      </span>
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
      message="Cargando pendientes de recotizar..."
    />

    <div
      v-else-if="items.length === 0 && !error"
      class="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500"
    >
      No hay cotizaciones pendientes de recotizar.
    </div>

    <ul v-else class="space-y-3" role="list">
      <li v-for="item in items" :key="item.recordatorioId">
        <RecordatorioDisparadoFila
          :item="item"
          :busy="closingId === item.recordatorioId"
          variant="card"
          @repetir="onRepetir"
          @cerrar="(row) => $emit('cerrar', row)"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { RecordatorioDisparadoItem } from '../../types/backend';
import BaseSectionLoader from '../base/BaseSectionLoader.vue';
import RecordatorioDisparadoFila from './RecordatorioDisparadoFila.vue';

withDefaults(
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

defineEmits<{
  cerrar: [item: RecordatorioDisparadoItem];
}>();

const router = useRouter();

function onRepetir(item: RecordatorioDisparadoItem) {
  void router.push({
    name: 'admin-cotizacion-detalle',
    params: { id: item.cotizacionId },
  });
}
</script>
