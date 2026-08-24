<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recordatorio-selector-title"
    >
      <div
        class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          @pointerdown="onBackdropPointerDown"
          @pointerup="onBackdropPointerUp"
          @pointercancel="onBackdropPointerCancel"
        />
        <span
          class="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
          >&#8203;</span
        >

        <div
          class="relative inline-block w-full transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:max-w-lg sm:align-middle"
        >
          <div class="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2
              id="recordatorio-selector-title"
              class="text-lg font-semibold text-gray-900"
            >
              {{ mode === 'edit' ? 'Cambiar fecha' : 'Programar recordatorio' }}
            </h2>
            <p class="mt-1 text-sm text-gray-600">
              Elige cuándo quieres que Aestimare te recuerde contactar a
              <strong>{{ clienteLabel }}</strong> para ofrecerle una nueva
              cotización.
            </p>
            <p class="mt-2 text-sm text-gray-500">
              Ese día enviaremos un correo a ti y a los destinatarios
              configurados para notificaciones. El cliente no será contactado
              automáticamente.
            </p>
          </div>

          <div class="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <h3 class="text-sm font-semibold text-gray-900">
              ¿Cuándo quieres recibir el recordatorio?
            </h3>
            <div
              role="radiogroup"
              aria-label="Opciones rápidas"
              class="flex flex-wrap gap-2"
            >
              <button
                v-for="p in presetsHoy"
                :key="p.id"
                type="button"
                role="radio"
                :data-preset-id="p.id"
                :aria-checked="familia === 'relativo_hoy' && preset === p.id"
                :class="[
                  'rounded-md border px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500',
                  familia === 'relativo_hoy' && preset === p.id
                    ? 'border-medical-blue-500 bg-medical-blue-50 text-medical-blue-800'
                    : 'border-gray-300 text-gray-800 hover:border-medical-blue-300',
                ]"
                @click="selectPreset(p.id)"
                @keydown="onPresetKeydown($event, p)"
              >
                {{ p.label }}
              </button>
            </div>

            <div>
              <button
                type="button"
                class="text-sm font-medium text-medical-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
                :aria-expanded="fechaExactaOpen"
                @click="fechaExactaOpen = !fechaExactaOpen"
              >
                Elegir una fecha exacta
              </button>
              <div v-show="fechaExactaOpen" class="mt-2">
                <label class="block text-xs font-medium text-gray-600">
                  Fecha exacta
                  <input
                    v-model="fechaExacta"
                    type="date"
                    :min="minFechaExacta"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-medical-blue-500 focus:ring-medical-blue-500"
                    @change="onFechaExactaChange"
                  />
                </label>
              </div>
            </div>

            <p
              class="text-sm text-gray-800"
              aria-live="polite"
              aria-atomic="true"
            >
              <template v-if="previewFecha">
                Recibirás el recordatorio el
                <strong>{{ previewFecha }}</strong>.
              </template>
              <template v-else>
                {{ previewFallback }}
              </template>
            </p>

            <p v-if="localError" class="text-sm text-red-700" role="alert">
              {{ localError }}
            </p>
          </div>

          <div
            class="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6"
          >
            <button
              type="button"
              class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              :disabled="saving"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <BaseButtonLoader
              type="button"
              variant="primary"
              size="sm"
              :loading="saving"
              :disabled="!canSave || saving"
              @click="onSave"
            >
              {{ mode === 'edit' ? 'Guardar fecha' : 'Programar recordatorio' }}
            </BaseButtonLoader>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import BaseButtonLoader from '../base/BaseButtonLoader.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import type { RecetaRecordatorio } from '../../types/backend';
import {
  PRESETS_RELATIVO_HOY,
  PRESET_LABELS_HOY,
  calcularFechaDisparoPreview,
  clienteDisplayName,
  fechaExactaToDateInput,
  formatFechaRecordatorioLarga,
} from '../../utils/fecha-disparo-preview';
import { DateTime } from 'luxon';

const props = defineProps<{
  open: boolean;
  mode?: 'create' | 'edit';
  zonaHoraria?: string | null;
  fechaCreacion?: string | Date | null;
  initialReceta?: RecetaRecordatorio | null;
  saving?: boolean;
  nombreCliente?: string | null;
  fechaDisparo?: string | Date | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [receta: RecetaRecordatorio];
}>();

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(
    () => {
      if (props.saving) return;
      emit('close');
    },
    () => props.open,
  );

const familia = ref<'relativo_hoy' | 'fecha_exacta'>('relativo_hoy');
const preset = ref<string>('1_mes');
const fechaExacta = ref('');
const fechaExactaOpen = ref(false);
const localError = ref('');

const clienteLabel = computed(() => clienteDisplayName(props.nombreCliente));

const presetsHoy = PRESETS_RELATIVO_HOY.map((id) => ({
  id,
  label: PRESET_LABELS_HOY[id],
}));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    localError.value = '';
    const init = props.initialReceta;
    if (init?.familia === 'fecha_exacta') {
      familia.value = 'fecha_exacta';
      preset.value = '';
      fechaExactaOpen.value = true;
      fechaExacta.value = fechaExactaToDateInput(
        init.fechaExacta,
        props.zonaHoraria,
      );
    } else if (init?.familia === 'relativo_hoy' && init.preset) {
      familia.value = 'relativo_hoy';
      preset.value = init.preset;
      fechaExacta.value = '';
      fechaExactaOpen.value = false;
    } else if (init?.familia === 'relativo_aniversario') {
      const fromPersistida = fechaExactaToDateInput(
        props.fechaDisparo,
        props.zonaHoraria,
      );
      const calc = calcularFechaDisparoPreview({
        receta: init,
        zonaHoraria: props.zonaHoraria,
        fechaCreacion: props.fechaCreacion,
      });
      const fromCalc = calc.ok
        ? fechaExactaToDateInput(calc.fechaDisparoUtc, props.zonaHoraria)
        : '';
      const exacta = fromPersistida || fromCalc;
      if (exacta) {
        familia.value = 'fecha_exacta';
        preset.value = '';
        fechaExactaOpen.value = true;
        fechaExacta.value = exacta;
      } else {
        familia.value = 'relativo_hoy';
        preset.value = '1_mes';
        fechaExacta.value = '';
        fechaExactaOpen.value = false;
      }
    } else {
      familia.value = 'relativo_hoy';
      preset.value = '1_mes';
      fechaExacta.value = '';
      fechaExactaOpen.value = false;
    }
  },
);

const currentReceta = computed((): RecetaRecordatorio => {
  if (familia.value === 'fecha_exacta') {
    return { familia: 'fecha_exacta', fechaExacta: fechaExacta.value };
  }
  return { familia: 'relativo_hoy', preset: preset.value };
});

const previewCalc = computed(() =>
  calcularFechaDisparoPreview({
    receta: currentReceta.value,
    zonaHoraria: props.zonaHoraria,
    fechaCreacion: props.fechaCreacion,
  }),
);

const previewFecha = computed(() => {
  if (!previewCalc.value.ok) return '';
  return formatFechaRecordatorioLarga(
    previewCalc.value.fechaDisparoUtc,
    props.zonaHoraria,
  );
});

const previewFallback = computed(() => {
  if (familia.value === 'fecha_exacta' && !fechaExacta.value) {
    return 'Elige una fecha para ver cuándo recibirás el recordatorio.';
  }
  if (!previewCalc.value.ok && previewCalc.value.code === 'not_future') {
    return 'Esa fecha ya pasó. Elige otra opción.';
  }
  return 'Elige una opción para ver cuándo recibirás el recordatorio.';
});

const canSave = computed(() => previewCalc.value.ok === true);

const minFechaExacta = computed(() => {
  const zone = props.zonaHoraria || 'America/Mexico_City';
  return DateTime.now().setZone(zone).plus({ days: 1 }).toISODate() ?? '';
});

function selectPreset(id: string) {
  familia.value = 'relativo_hoy';
  preset.value = id;
  fechaExactaOpen.value = false;
  fechaExacta.value = '';
  localError.value = '';
}

function onFechaExactaChange() {
  familia.value = 'fecha_exacta';
  preset.value = '';
  localError.value = '';
}

function onPresetKeydown(
  event: KeyboardEvent,
  p: { id: string },
) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const idx = presetsHoy.findIndex((x) => x.id === p.id);
  if (idx < 0) return;
  const next =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? presetsHoy[(idx + 1) % presetsHoy.length]
      : presetsHoy[(idx - 1 + presetsHoy.length) % presetsHoy.length];
  if (!next) return;
  selectPreset(next.id);
  void nextTick(() => {
    const el = document.querySelector(
      `[data-preset-id="${next.id}"]`,
    ) as HTMLElement | null;
    el?.focus();
  });
}

function onSave() {
  if (!previewCalc.value.ok) {
    localError.value =
      previewCalc.value.message ||
      'Esa fecha ya pasó. Elige otra opción.';
    return;
  }
  const receta = currentReceta.value;
  if (receta.familia === 'fecha_exacta') {
    emit('save', {
      familia: 'fecha_exacta',
      fechaExacta: String(receta.fechaExacta).slice(0, 10),
    });
  } else {
    emit('save', { familia: 'relativo_hoy', preset: receta.preset });
  }
}
</script>
