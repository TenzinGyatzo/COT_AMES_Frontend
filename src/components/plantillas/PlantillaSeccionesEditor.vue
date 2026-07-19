<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-gray-800">Secciones</h3>
      <button
        type="button"
        class="text-sm text-medical-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
        @click="agregarSeccion"
      >
        + Agregar sección
      </button>
    </div>

    <div
      role="tablist"
      aria-label="Secciones de la plantilla"
      class="flex flex-wrap gap-1 border-b border-gray-200 pb-px"
      @keydown="onTablistKeydown"
    >
      <button
        v-for="(sec, idx) in modelValue"
        :id="tabId(sec.id)"
        :key="sec.id"
        type="button"
        role="tab"
        class="px-3 py-1.5 text-sm rounded-t-md border border-b-0 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 max-w-[10rem] truncate"
        :class="
          idx === activeIndex
            ? 'bg-white border-gray-300 text-medical-blue-700 font-medium -mb-px z-10'
            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
        "
        :aria-selected="idx === activeIndex"
        :aria-controls="panelId(sec.id)"
        :tabindex="idx === activeIndex ? 0 : -1"
        @click="activeIndex = idx"
      >
        {{ tabLabel(sec, idx) }}
      </button>
    </div>

    <div
      v-if="active"
      :id="panelId(active.id)"
      role="tabpanel"
      :aria-labelledby="tabId(active.id)"
      class="border border-gray-200 rounded-md p-3 space-y-3"
    >
      <div class="flex flex-wrap gap-2 items-end">
        <div class="flex-1 min-w-[120px]">
          <label :for="`tipo-${active.id}`" class="block text-xs text-gray-600 mb-1"
            >Tipo</label
          >
          <select
            :id="`tipo-${active.id}`"
            :value="active.tipo"
            class="w-full rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @change="cambiarTipo(($event.target as HTMLSelectElement).value)"
          >
            <option value="richtext">Texto</option>
            <option value="tabla">Tabla</option>
          </select>
        </div>
        <div class="flex-[2] min-w-[140px]">
          <label
            :for="`titulo-${active.id}`"
            class="block text-xs text-gray-600 mb-1"
            >Título (opcional)</label
          >
          <input
            :id="`titulo-${active.id}`"
            :value="active.titulo ?? ''"
            type="text"
            class="w-full rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="
              patchActive({
                titulo: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </div>
        <button
          type="button"
          class="text-xs text-red-600 hover:underline pb-1 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
          :disabled="modelValue.length <= 1"
          @click="quitarSeccion"
        >
          Quitar sección
        </button>
      </div>

      <PlantillaRichtextEditor
        v-if="active.tipo === 'richtext'"
        :key="active.id"
        :model-value="active.cuerpo"
        @update:model-value="(cuerpo) => patchActive({ cuerpo })"
      />
      <PlantillaTablaEditor
        v-else
        :model-value="{
          encabezados: active.encabezados,
          filas: active.filas,
        }"
        @update:model-value="
          (t) => patchActive({ encabezados: t.encabezados, filas: t.filas })
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SeccionPlantilla } from '../../types/backend';
import PlantillaRichtextEditor from './PlantillaRichtextEditor.vue';
import PlantillaTablaEditor from './PlantillaTablaEditor.vue';

const props = defineProps<{
  modelValue: SeccionPlantilla[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SeccionPlantilla[]];
}>();

const activeIndex = ref(0);

const active = computed(() => props.modelValue[activeIndex.value] ?? null);

watch(
  () => props.modelValue.length,
  (len) => {
    if (activeIndex.value >= len) {
      activeIndex.value = Math.max(0, len - 1);
    }
  },
);

function newSeccionId(): string {
  return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function tabId(id: string) {
  return `plantilla-tab-${id}`;
}

function panelId(id: string) {
  return `plantilla-panel-${id}`;
}

function tabLabel(sec: SeccionPlantilla, idx: number): string {
  const t = sec.titulo?.trim();
  if (t) return t;
  return `Sección ${idx + 1}`;
}

function emitAll(next: SeccionPlantilla[]) {
  emit('update:modelValue', next);
}

function patchActive(partial: Record<string, unknown>) {
  const idx = activeIndex.value;
  const cur = props.modelValue[idx];
  if (!cur) return;
  const next = props.modelValue.map((s, i) =>
    i === idx ? ({ ...cur, ...partial } as SeccionPlantilla) : s,
  );
  emitAll(next);
}

function seccionRichtextBlank(): SeccionPlantilla {
  return {
    id: newSeccionId(),
    tipo: 'richtext',
    titulo: '',
    cuerpo: {
      text: '',
      doc: { type: 'doc', content: [{ type: 'paragraph' }] },
    },
  };
}

function agregarSeccion() {
  const next = [...props.modelValue, seccionRichtextBlank()];
  emitAll(next);
  activeIndex.value = next.length - 1;
}

function quitarSeccion() {
  if (props.modelValue.length <= 1) return;
  const idx = activeIndex.value;
  const next = props.modelValue.filter((_, i) => i !== idx);
  emitAll(next);
  activeIndex.value = Math.min(idx, next.length - 1);
}

function cambiarTipo(tipo: string) {
  const cur = active.value;
  if (!cur) return;
  const idx = activeIndex.value;
  let nextSec: SeccionPlantilla;
  if (tipo === 'tabla') {
    nextSec = {
      id: cur.id,
      tipo: 'tabla',
      titulo: cur.titulo ?? '',
      encabezados: ['Columna 1', 'Columna 2'],
      filas: [['', '']],
    };
  } else {
    nextSec = {
      id: cur.id,
      tipo: 'richtext',
      titulo: cur.titulo ?? '',
      cuerpo: { text: '', doc: { type: 'doc', content: [{ type: 'paragraph' }] } },
    };
  }
  emitAll(
    props.modelValue.map((s, i) => (i === idx ? nextSec : s)),
  );
}

function onTablistKeydown(e: KeyboardEvent) {
  const len = props.modelValue.length;
  if (!len) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    activeIndex.value = (activeIndex.value + delta + len) % len;
    const id = props.modelValue[activeIndex.value]?.id;
    if (id) {
      document.getElementById(tabId(id))?.focus();
    }
  } else if (e.key === 'Home') {
    e.preventDefault();
    activeIndex.value = 0;
    const id = props.modelValue[0]?.id;
    if (id) document.getElementById(tabId(id))?.focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    activeIndex.value = len - 1;
    const id = props.modelValue[len - 1]?.id;
    if (id) document.getElementById(tabId(id))?.focus();
  }
}
</script>
