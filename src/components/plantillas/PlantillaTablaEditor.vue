<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2">
      <label class="block text-xs text-gray-600">Encabezados</label>
      <div class="flex gap-2">
        <button
          type="button"
          class="text-xs text-medical-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
          @click="agregarColumna"
        >
          + Columna
        </button>
        <button
          type="button"
          class="text-xs text-red-600 hover:underline disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
          :disabled="modelValue.encabezados.length <= 1"
          @click="quitarColumna"
        >
          − Columna
        </button>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <input
        v-for="(_h, hIdx) in modelValue.encabezados"
        :key="`h-${hIdx}`"
        :value="modelValue.encabezados[hIdx]"
        type="text"
        :placeholder="`Columna ${hIdx + 1}`"
        class="min-w-[100px] flex-1 rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        @input="
          setEncabezado(hIdx, ($event.target as HTMLInputElement).value)
        "
      />
    </div>
    <div
      v-for="(fila, fIdx) in modelValue.filas"
      :key="`f-${fIdx}`"
      class="flex flex-wrap gap-2 items-center"
    >
      <input
        v-for="(_cell, cIdx) in fila"
        :key="`c-${fIdx}-${cIdx}`"
        :value="modelValue.filas[fIdx][cIdx]"
        type="text"
        :placeholder="modelValue.encabezados[cIdx] || `Celda ${cIdx + 1}`"
        class="min-w-[100px] flex-1 rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        @input="
          setCelda(fIdx, cIdx, ($event.target as HTMLInputElement).value)
        "
      />
      <button
        type="button"
        class="text-xs text-red-600 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
        aria-label="Quitar fila"
        @click="quitarFila(fIdx)"
      >
        ×
      </button>
    </div>
    <button
      type="button"
      class="text-xs text-medical-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-medical-blue-500 rounded"
      @click="agregarFila"
    >
      + Fila
    </button>
  </div>
</template>

<script setup lang="ts">
export type TablaSeccionValue = {
  encabezados: string[];
  filas: string[][];
};

const props = defineProps<{
  modelValue: TablaSeccionValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: TablaSeccionValue];
}>();

function emitNext(next: TablaSeccionValue) {
  emit('update:modelValue', next);
}

function setEncabezado(hIdx: number, value: string) {
  const encabezados = [...props.modelValue.encabezados];
  encabezados[hIdx] = value;
  emitNext({ ...props.modelValue, encabezados });
}

function setCelda(fIdx: number, cIdx: number, value: string) {
  const filas = props.modelValue.filas.map((r) => [...r]);
  filas[fIdx][cIdx] = value;
  emitNext({ ...props.modelValue, filas });
}

function agregarColumna() {
  const encabezados = [
    ...props.modelValue.encabezados,
    `Columna ${props.modelValue.encabezados.length + 1}`,
  ];
  const filas = props.modelValue.filas.map((f) => [...f, '']);
  emitNext({ encabezados, filas });
}

function quitarColumna() {
  if (props.modelValue.encabezados.length <= 1) return;
  const encabezados = props.modelValue.encabezados.slice(0, -1);
  const filas = props.modelValue.filas.map((f) => f.slice(0, encabezados.length));
  emitNext({ encabezados, filas });
}

function agregarFila() {
  emitNext({
    ...props.modelValue,
    filas: [
      ...props.modelValue.filas,
      props.modelValue.encabezados.map(() => ''),
    ],
  });
}

function quitarFila(fIdx: number) {
  const filas = props.modelValue.filas.filter((_, i) => i !== fIdx);
  emitNext({ ...props.modelValue, filas });
}
</script>
