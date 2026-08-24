<template>
  <div
    class="rounded-md border border-l-4 border-reminder-border bg-reminder-soft/40 p-3 md:p-4"
  >
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <router-link
            v-if="item.cotizacionId"
            :to="{
              name: 'admin-cotizacion-detalle',
              params: { id: item.cotizacionId },
            }"
            class="font-mono text-sm font-semibold text-medical-blue-700 hover:text-medical-blue-900"
          >
            {{ folioLabel }}
          </router-link>
          <span
            v-else
            class="font-mono text-sm font-semibold text-gray-900"
          >
            {{ folioLabel }}
          </span>
          <span
            class="inline-block rounded-md border border-reminder-border bg-reminder-soft px-2.5 py-0.5 text-xs font-semibold text-reminder-text"
          >
            Por atender
          </span>
        </div>
        <p class="text-sm text-gray-800">
          <span class="text-gray-500">Cliente:</span>
          {{ identidadLabel }}
        </p>
        <p class="text-recipe-preview text-gray-600">
          {{ item.recetaResumen }}
          <span v-if="fechaLabel" class="text-reminder-muted">
            · {{ fechaLabel }}
          </span>
        </p>
      </div>

      <div
        class="flex shrink-0 flex-col gap-2 md:flex-row md:items-center"
      >
        <button
          type="button"
          class="rounded-md bg-medical-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-medical-blue-700 disabled:opacity-50"
          :disabled="busy"
          :aria-label="`Repetir cotización ${folioLabel}`"
          @click="$emit('repetir', item)"
        >
          Repetir
        </button>
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          :disabled="busy"
          :aria-label="`Marcar como atendido el recordatorio ${folioLabel}`"
          @click="$emit('cerrar', item)"
        >
          {{ busy ? 'Quitando…' : 'Ya lo atendí' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RecordatorioDisparadoItem } from '../../types/backend';

const props = withDefaults(
  defineProps<{
    item: RecordatorioDisparadoItem;
    busy?: boolean;
    variant?: 'card' | 'compact';
  }>(),
  {
    busy: false,
    variant: 'card',
  },
);

defineEmits<{
  repetir: [item: RecordatorioDisparadoItem];
  cerrar: [item: RecordatorioDisparadoItem];
}>();

const folioLabel = computed(() => {
  const f = props.item.folio?.trim();
  return f || '—';
});

const identidadLabel = computed(() => {
  const id = props.item.identidad?.trim();
  return id || '—';
});

const fechaLabel = computed(() => {
  const raw = props.item.fechaDisparo;
  if (!raw) return '';
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});
</script>
