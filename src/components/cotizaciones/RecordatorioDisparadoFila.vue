<template>
  <div
    class="rounded-lg border border-gray-200 border-l-4 border-l-reminder-border bg-white px-3 py-2.5 shadow-md"
  >
    <div
      class="flex flex-col flex-wrap gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
    >
      <div
        class="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3"
      >
        <div class="min-w-0 space-y-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <router-link
              v-if="cotizacionId"
              :to="{
                name: 'admin-cotizacion-detalle',
                params: { id: cotizacionId },
              }"
              class="rounded font-mono text-sm font-semibold text-medical-blue-600 hover:text-medical-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :aria-label="`Ver cotización original ${folioLabel}`"
              :title="`Ver cotización original ${folioLabel}`"
              @keydown.space.prevent="activarFolio"
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
              class="inline-block rounded-md border border-reminder-border bg-reminder-soft px-2 py-0.5 text-xs font-semibold text-reminder-text"
            >
              Pendiente
            </span>
          </div>
          <p class="text-sm leading-snug text-gray-800">
            <span class="text-gray-500">Cliente:</span>
            {{ clienteLabel }}
          </p>
        </div>

        <div v-if="hasContacto" class="min-w-0 space-y-0.5">
          <p v-if="contactoLabel" class="text-sm leading-snug text-gray-800">
            <span class="text-gray-500">Contacto:</span>
            {{ contactoLabel }}
          </p>
          <p
            v-if="telefonoLabel"
            class="flex min-w-0 flex-wrap items-baseline gap-1 text-sm leading-snug"
          >
            <span class="text-gray-500">Teléfono:</span>
            <a
              v-if="telHref"
              :href="telHref"
              class="rounded text-medical-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :aria-label="`Llamar a ${telefonoLabel}`"
              :title="telefonoLabel"
            >
              {{ telefonoLabel }}
            </a>
            <span v-else>{{ telefonoLabel }}</span>
          </p>
          <p
            v-if="emailLabel"
            class="flex min-w-0 items-baseline gap-1 text-sm leading-snug"
          >
            <span class="shrink-0 text-gray-500">Correo:</span>
            <a
              :href="mailtoHref"
              class="min-w-0 rounded text-medical-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :aria-label="`Enviar correo a ${emailLabel}`"
              :title="emailLabel"
            >
              <span class="block truncate">{{ emailLabel }}</span>
            </a>
          </p>
        </div>

        <div
          class="min-w-0 space-y-0.5"
          :class="hasContacto ? '' : 'lg:col-start-3'"
        >
          <p class="text-sm leading-snug text-gray-800">
            <span class="text-gray-500">Pendiente desde:</span>
            {{ fechaRecordatorioLabel }}
          </p>
          <p class="text-sm leading-snug text-gray-800">
            <span class="text-gray-500">Cotización original:</span>
            {{ fechaOriginalLabel }}
          </p>
        </div>
      </div>

      <div
        class="flex w-full shrink-0 flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end md:gap-2"
      >
        <button
          type="button"
          class="w-full whitespace-nowrap rounded-md bg-medical-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-medical-blue-700 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 disabled:opacity-50 md:w-auto"
          :disabled="busy"
          :aria-label="`Volver a cotizar ${folioLabel}`"
          @click="$emit('volverACotizar', item)"
        >
          Volver a cotizar
        </button>
        <button
          type="button"
          class="w-full whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 disabled:opacity-50 md:w-auto"
          :disabled="busy"
          :aria-label="`Marcar como atendido el seguimiento ${folioLabel}`"
          @click="$emit('cerrar', item)"
        >
          {{ busy ? 'Marcando…' : 'Marcar como atendido' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RecordatorioDisparadoItem } from '../../types/backend';
import { formatFechaRecordatorioLarga } from '../../utils/fecha-disparo-preview';

const props = withDefaults(
  defineProps<{
    item: RecordatorioDisparadoItem;
    busy?: boolean;
    zonaHoraria?: string | null;
  }>(),
  {
    busy: false,
    zonaHoraria: undefined,
  },
);

defineEmits<{
  volverACotizar: [item: RecordatorioDisparadoItem];
  cerrar: [item: RecordatorioDisparadoItem];
}>();

const folioLabel = computed(() => {
  const f = props.item.folio?.trim();
  return f || '—';
});

const cotizacionId = computed(() => props.item.cotizacionId?.trim() || '');

const clienteLabel = computed(() => {
  const id = props.item.identidad?.trim() || '';
  const contacto = props.item.nombreContacto?.trim() || '';
  if (id && id !== contacto) return id;
  return 'este cliente';
});

const contactoLabel = computed(() => props.item.nombreContacto?.trim() || '');
const telefonoLabel = computed(() => props.item.telefonoContacto?.trim() || '');
const emailLabel = computed(() => props.item.emailContacto?.trim() || '');

const hasContacto = computed(
  () => !!(contactoLabel.value || telefonoLabel.value || emailLabel.value),
);

const telHref = computed(() => {
  const digits = telefonoLabel.value.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
});

const mailtoHref = computed(() =>
  emailLabel.value ? `mailto:${encodeURI(emailLabel.value)}` : '',
);

function activarFolio(event: KeyboardEvent) {
  const el = event.currentTarget;
  if (el instanceof HTMLAnchorElement) el.click();
}

const fechaRecordatorioLabel = computed(() => {
  if (!props.item.fechaDisparo) return '—';
  return formatFechaRecordatorioLarga(
    props.item.fechaDisparo,
    props.zonaHoraria,
  );
});

const fechaOriginalLabel = computed(() => {
  if (!props.item.fechaCreacion) return '—';
  return formatFechaRecordatorioLarga(
    props.item.fechaCreacion,
    props.zonaHoraria,
  );
});
</script>
