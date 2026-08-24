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
              {{ mode === 'edit' ? 'Cambiar el aviso' : '¿Cuándo te avisamos?' }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Te mandamos un correo interno para que no se te olvide volver a
              cotizar. El cliente no recibe nada.
            </p>
          </div>

          <div class="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <!-- ≥ md: familias apiladas; < md: acordeón -->
            <div class="space-y-3 md:space-y-4">
              <section
                v-for="fam in familiasUi"
                :key="fam.id"
                class="rounded-lg border border-gray-200"
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-gray-900 md:cursor-default"
                  :aria-expanded="isFamOpen(fam.id)"
                  @click="toggleFam(fam.id)"
                >
                  <span>{{ fam.label }}</span>
                  <svg
                    class="h-4 w-4 text-gray-500 transition-transform md:hidden"
                    :class="isFamOpen(fam.id) ? 'rotate-180' : ''"
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
                  v-show="isFamOpen(fam.id)"
                  class="border-t border-gray-100 px-3 py-3"
                >
                  <p class="mb-2 text-xs leading-relaxed text-gray-500">
                    {{ fam.hint }}
                  </p>
                  <template v-if="fam.id !== 'fecha_exacta'">
                    <div
                      role="radiogroup"
                      :aria-label="fam.label"
                      class="flex flex-wrap gap-2"
                    >
                      <button
                        v-for="p in fam.presets"
                        :key="p.id"
                        type="button"
                        role="radio"
                        :data-preset-id="p.id"
                        :aria-checked="
                          familia === fam.id && preset === p.id
                        "
                        :aria-disabled="p.disabled || undefined"
                        :disabled="p.disabled"
                        :class="[
                          'rounded-md border px-3 py-1.5 text-sm transition-colors',
                          p.disabled
                            ? 'cursor-not-allowed border-gray-200 text-gray-400'
                            : familia === fam.id && preset === p.id
                              ? 'border-medical-blue-500 bg-medical-blue-50 text-medical-blue-800'
                              : 'border-gray-300 text-gray-800 hover:border-medical-blue-300',
                        ]"
                        @click="selectPreset(fam.id, p.id, p.disabled)"
                        @keydown="onPresetKeydown($event, fam, p)"
                      >
                        {{ p.label }}
                      </button>
                    </div>
                    <p
                      v-if="fam.id === 'relativo_aniversario' && hasNotFutureAniv"
                      class="mt-2 text-xs text-gray-600"
                    >
                      Esta opción ya no aplica: esa fecha ya pasó.
                    </p>
                    <p
                      v-for="p in fam.presets.filter((x) => x.disableReason)"
                      :key="'reason-' + p.id"
                      class="sr-only"
                    >
                      {{ p.label }}: {{ p.disableReason }}
                    </p>
                  </template>

                  <template v-else>
                    <button
                      type="button"
                      class="mb-2 text-sm font-medium text-medical-blue-700 hover:underline"
                      :aria-expanded="fechaExactaOpen"
                      @click="fechaExactaOpen = !fechaExactaOpen"
                    >
                      {{
                        fechaExactaOpen
                          ? 'Ocultar el calendario'
                          : 'Elegir un día'
                      }}
                    </button>
                    <div v-show="fechaExactaOpen" class="space-y-2">
                      <label class="block text-xs font-medium text-gray-600">
                        Día en que quieres el aviso
                        <input
                          v-model="fechaExacta"
                          type="date"
                          :min="minFechaExacta"
                          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-medical-blue-500 focus:ring-medical-blue-500"
                          @change="onFechaExactaChange"
                        />
                      </label>
                    </div>
                  </template>
                </div>
              </section>
            </div>

            <p
              class="text-recipe-preview text-gray-600"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ previewLine }}
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
              class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              Guardar aviso
            </BaseButtonLoader>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import BaseButtonLoader from '../base/BaseButtonLoader.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import type {
  FamiliaReceta,
  RecetaRecordatorio,
} from '../../types/backend';
import {
  PRESETS_RELATIVO_ANIVERSARIO,
  PRESETS_RELATIVO_HOY,
  PRESET_LABELS_ANIVERSARIO,
  PRESET_LABELS_HOY,
  calcularFechaDisparoPreview,
  fechaExactaToDateInput,
  formatDisparoEstimado,
} from '../../utils/fecha-disparo-preview';
import { DateTime } from 'luxon';

const props = defineProps<{
  open: boolean;
  mode?: 'create' | 'edit';
  zonaHoraria?: string | null;
  fechaCreacion?: string | Date | null;
  initialReceta?: RecetaRecordatorio | null;
  saving?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [receta: RecetaRecordatorio];
}>();

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(() => emit('close'), () => props.open);

const familia = ref<FamiliaReceta>('relativo_hoy');
const preset = ref<string>('1_mes');
const fechaExacta = ref('');
const fechaExactaOpen = ref(false);
const localError = ref('');
const accordionOpen = ref<Record<string, boolean>>({
  relativo_hoy: true,
  relativo_aniversario: false,
  fecha_exacta: false,
});

const isMdUp = ref(
  typeof window !== 'undefined'
    ? window.matchMedia('(min-width: 768px)').matches
    : true,
);

function syncMq() {
  isMdUp.value = window.matchMedia('(min-width: 768px)').matches;
}

function stopResizeListener() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncMq);
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      stopResizeListener();
      return;
    }
    localError.value = '';
    const init = props.initialReceta;
    if (init) {
      familia.value = init.familia;
      preset.value = init.preset ?? '';
      if (init.familia === 'fecha_exacta') {
        fechaExactaOpen.value = true;
        fechaExacta.value = fechaExactaToDateInput(
          init.fechaExacta,
          props.zonaHoraria,
        );
      } else {
        fechaExacta.value = '';
        fechaExactaOpen.value = false;
      }
      accordionOpen.value = {
        relativo_hoy: init.familia === 'relativo_hoy',
        relativo_aniversario: init.familia === 'relativo_aniversario',
        fecha_exacta: init.familia === 'fecha_exacta',
      };
    } else {
      familia.value = 'relativo_hoy';
      preset.value = '1_mes';
      fechaExacta.value = '';
      fechaExactaOpen.value = false;
      accordionOpen.value = {
        relativo_hoy: true,
        relativo_aniversario: false,
        fecha_exacta: false,
      };
    }
    if (typeof window !== 'undefined') {
      syncMq();
      window.addEventListener('resize', syncMq);
    }
  },
);

onUnmounted(stopResizeListener);

function isFamOpen(id: string): boolean {
  if (isMdUp.value) return true;
  return !!accordionOpen.value[id];
}

function toggleFam(id: string) {
  if (isMdUp.value) return;
  accordionOpen.value = {
    ...accordionOpen.value,
    [id]: !accordionOpen.value[id],
  };
}

type PresetOpt = {
  id: string;
  label: string;
  disabled: boolean;
  disableReason?: string;
};

const anivPresets = computed((): PresetOpt[] =>
  PRESETS_RELATIVO_ANIVERSARIO.map((id) => {
    const calc = calcularFechaDisparoPreview({
      receta: { familia: 'relativo_aniversario', preset: id },
      zonaHoraria: props.zonaHoraria,
      fechaCreacion: props.fechaCreacion,
    });
    const notFuture = !calc.ok && calc.code === 'not_future';
    return {
      id,
      label: PRESET_LABELS_ANIVERSARIO[id],
      disabled: !calc.ok,
      disableReason: notFuture
        ? 'Esta opción ya no aplica: esa fecha ya pasó.'
        : undefined,
    };
  }),
);

const hasNotFutureAniv = computed(() =>
  anivPresets.value.some((p) => !!p.disableReason),
);

const familiasUi = computed(() => [
  {
    id: 'relativo_hoy' as const,
    label: 'Dentro de un tiempo',
    hint: 'Cuenta a partir de hoy. Si eliges 3 meses, te avisamos el mismo día dentro de 3 meses.',
    presets: PRESETS_RELATIVO_HOY.map((id) => ({
      id,
      label: PRESET_LABELS_HOY[id],
      disabled: false,
      disableReason: undefined,
    })) satisfies PresetOpt[],
  },
  {
    id: 'relativo_aniversario' as const,
    label: 'Antes de que cumpla un año',
    hint: 'Se cuenta desde el día en que se creó esta cotización. Te avisamos un poco antes de que cumpla un año.',
    presets: anivPresets.value,
  },
  {
    id: 'fecha_exacta' as const,
    label: 'Un día específico',
    hint: 'Elige el día exacto. El aviso llega ese día, por la mañana, según el horario de tu empresa.',
    presets: [] as PresetOpt[],
  },
]);

const currentReceta = computed((): RecetaRecordatorio => {
  if (familia.value === 'fecha_exacta') {
    return { familia: 'fecha_exacta', fechaExacta: fechaExacta.value };
  }
  return { familia: familia.value, preset: preset.value };
});

const previewCalc = computed(() =>
  calcularFechaDisparoPreview({
    receta: currentReceta.value,
    zonaHoraria: props.zonaHoraria,
    fechaCreacion: props.fechaCreacion,
  }),
);

const previewLine = computed(() => {
  if (familia.value === 'fecha_exacta' && !fechaExacta.value) {
    return 'Elige un día para ver cuándo te avisamos.';
  }
  if (previewCalc.value.ok) {
    return formatDisparoEstimado(
      previewCalc.value.fechaDisparoUtc,
      props.zonaHoraria,
    );
  }
  if (previewCalc.value.code === 'not_future') {
    return 'Esa fecha ya pasó. Elige otra opción.';
  }
  return 'Elige una opción para ver cuándo te avisamos.';
});

const canSave = computed(() => previewCalc.value.ok === true);

const minFechaExacta = computed(() => {
  const zone = props.zonaHoraria || 'America/Mexico_City';
  return DateTime.now().setZone(zone).plus({ days: 1 }).toISODate() ?? '';
});

function selectPreset(
  fam: FamiliaReceta,
  id: string,
  disabled?: boolean,
) {
  if (disabled) return;
  familia.value = fam;
  preset.value = id;
  localError.value = '';
}

function onFechaExactaChange() {
  familia.value = 'fecha_exacta';
  preset.value = '';
  localError.value = '';
}

function onPresetKeydown(
  event: KeyboardEvent,
  fam: { id: FamiliaReceta; presets: PresetOpt[] },
  p: PresetOpt,
) {
  if (p.disabled) return;
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const enabled = fam.presets.filter((x) => !x.disabled);
  const idx = enabled.findIndex((x) => x.id === p.id);
  if (idx < 0) return;
  const next =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? enabled[(idx + 1) % enabled.length]
      : enabled[(idx - 1 + enabled.length) % enabled.length];
  if (!next) return;
  selectPreset(fam.id, next.id);
  void nextTick(() => {
    const group = (event.currentTarget as HTMLElement | null)?.closest(
      '[role="radiogroup"]',
    );
    const el = group?.querySelector(
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
    emit('save', { familia: receta.familia, preset: receta.preset });
  }
}
</script>
