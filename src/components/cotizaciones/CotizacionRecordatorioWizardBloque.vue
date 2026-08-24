<template>
  <section
    class="mb-6 rounded-2xl border border-gray-200 bg-gray-50"
    data-testid="wizard-bloque-recordatorio"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      :aria-expanded="expanded"
      aria-controls="wizard-recordatorio-panel"
      @click="expanded = !expanded"
    >
      <div>
        <h3 class="text-sm font-bold text-gray-900">
          Recordatorio para volver a cotizar
        </h3>
        <p class="text-xs text-gray-500">
          Opcional. Programa una fecha para que Aestimare te recuerde contactar
          a {{ clienteLabel }}. El cliente no será contactado automáticamente.
        </p>
      </div>
      <svg
        class="h-5 w-5 shrink-0 text-gray-500 transition-transform"
        :class="expanded ? 'rotate-180' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-show="expanded"
      id="wizard-recordatorio-panel"
      class="border-t border-gray-200 px-4 py-4"
    >
      <p
        v-if="zonaWarn"
        class="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900"
        role="status"
      >
        {{ zonaWarn }}
      </p>

      <template v-if="draftReceta">
        <p class="text-sm font-medium text-gray-900">
          {{ resumenReceta }}
        </p>
        <p class="text-recipe-preview mt-1 text-gray-600" aria-live="polite">
          {{ previewLine }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white"
            @click="selectorOpen = true"
          >
            Cambiar fecha
          </button>
          <button
            type="button"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-white"
            @click="clearDraft"
          >
            Quitar
          </button>
        </div>
      </template>

      <template v-else>
        <p class="mb-3 text-sm text-gray-600">
          Si quieres, programa un recordatorio al guardar. No hace falta entrar
          después al detalle.
        </p>
        <button
          type="button"
          class="rounded-md border border-medical-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-medical-blue-800 hover:bg-medical-blue-50"
          @click="selectorOpen = true"
        >
          Programar recordatorio
        </button>
      </template>
    </div>

    <RecordatorioRecetaSelector
      :open="selectorOpen"
      mode="create"
      :zona-horaria="zonaHoraria"
      :fecha-creacion="fechaCreacionPreview"
      :initial-receta="draftReceta"
      :nombre-cliente="nombreCliente"
      @close="selectorOpen = false"
      @save="onSaveReceta"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import RecordatorioRecetaSelector from './RecordatorioRecetaSelector.vue';
import { getTenantConfig } from '../../services/admin-api.service';
import type { RecetaRecordatorio } from '../../types/backend';
import {
  clienteDisplayName,
  formatDisparoEstimado,
  resumenRecetaLabel,
  calcularFechaDisparoPreview,
} from '../../utils/fecha-disparo-preview';

const draftReceta = defineModel<RecetaRecordatorio | null>({
  default: null,
});

const props = defineProps<{
  nombreCliente?: string | null;
}>();

const expanded = ref(false);
const selectorOpen = ref(false);
const zonaHoraria = ref<string | undefined>(undefined);
const zonaWarn = ref('');

const clienteLabel = computed(() => clienteDisplayName(props.nombreCliente));

/** Ancla preview aniversario ≈ fechaCreacion al crear (AD-29). */
const fechaCreacionPreview = ref<Date>(new Date());

const resumenReceta = computed(() =>
  draftReceta.value
    ? resumenRecetaLabel(draftReceta.value, zonaHoraria.value)
    : '',
);

const previewLine = computed(() => {
  if (!draftReceta.value) return '';
  const calc = calcularFechaDisparoPreview({
    receta: draftReceta.value,
    zonaHoraria: zonaHoraria.value,
    fechaCreacion: fechaCreacionPreview.value,
  });
  if (calc.ok) {
    return formatDisparoEstimado(calc.fechaDisparoUtc, zonaHoraria.value);
  }
  if (calc.code === 'not_future') {
    return 'Esa fecha ya pasó. Elige otra opción.';
  }
  return calc.message || 'Elige una opción para ver cuándo recibirás el recordatorio.';
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

function onSaveReceta(receta: RecetaRecordatorio) {
  draftReceta.value = receta;
  selectorOpen.value = false;
}

function clearDraft() {
  draftReceta.value = null;
}

onMounted(() => {
  fechaCreacionPreview.value = new Date();
  void loadZona();
});

watch(expanded, (isOpen) => {
  if (!isOpen) selectorOpen.value = false;
});
</script>
