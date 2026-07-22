<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enviar-correo-title"
      @click.stop
    >
      <div
        class="bg-gradient-to-r from-medical-blue-50 to-white px-6 py-5 border-b border-gray-100 flex items-center justify-between"
      >
        <div>
          <h3
            id="enviar-correo-title"
            class="text-lg font-bold text-gray-900"
          >
            Enviar por correo
          </h3>
          <p v-if="folio" class="text-xs text-gray-500 mt-0.5 font-mono">
            {{ folio }}
          </p>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
          :disabled="sending"
          @click="emit('close')"
        >
          <span class="sr-only">Cerrar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div
          v-if="success"
          class="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-green-600 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <p class="text-sm font-bold">Correo enviado</p>
            <p class="text-xs text-green-700/80">
              Se envió la cotización con PDF y enlace de respuesta.
            </p>
          </div>
        </div>

        <div
          v-else-if="sending"
          class="flex items-start gap-3 p-4 bg-medical-blue-50 rounded-xl border border-medical-blue-100 text-medical-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-medical-blue-600 mt-0.5 animate-spin shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div>
            <p class="text-sm font-bold">Enviando correo…</p>
            <p class="text-xs text-medical-blue-700/80">
              Generando PDF y enviando a los destinatarios.
            </p>
          </div>
        </div>

        <div
          v-else-if="error"
          class="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100 text-red-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-red-600 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p class="text-sm font-bold">No se pudo enviar el correo</p>
            <p class="text-xs text-red-700/90">{{ error }}</p>
            <p class="text-xs text-red-600/80 mt-1">
              Corrige destinatarios y reintenta.
            </p>
          </div>
        </div>

        <template v-if="!success">
          <EmailChipsInput
            v-model="para"
            label="Para"
            input-id="detalle-enviar-para"
            variant="para"
            placeholder="correo@empresa.com"
            :disabled="sending"
            hint="Al menos un destinatario Para (máx. 20)."
          />
          <EmailChipsInput
            v-model="cc"
            label="CC"
            input-id="detalle-enviar-cc"
            variant="cc"
            placeholder="opcional@empresa.com"
            :exclude="para"
            :disabled="sending || para.length === 0"
          />
        </template>

        <div class="flex gap-3 pt-1">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 disabled:opacity-50"
            :disabled="sending"
            @click="emit('close')"
          >
            {{ success ? 'Cerrar' : 'Cancelar' }}
          </button>
          <button
            v-if="!success"
            type="button"
            class="flex-1 py-2.5 rounded-xl bg-medical-blue-600 text-white text-sm font-bold hover:bg-medical-blue-700 disabled:opacity-50"
            :disabled="!canSend"
            @click="onConfirm"
          >
            {{ sending ? 'Enviando…' : error ? 'Reintentar envío' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import EmailChipsInput from '../cotizador/EmailChipsInput.vue';

const MAX_DESTINATARIOS = 20;

const props = withDefaults(
  defineProps<{
    open: boolean;
    folio?: string;
    initialEmailsPara?: string[];
    initialEmailsCc?: string[];
    sending?: boolean;
    success?: boolean;
    error?: string | null;
  }>(),
  {
    folio: '',
    initialEmailsPara: () => [],
    initialEmailsCc: () => [],
    sending: false,
    success: false,
    error: null,
  },
);

const emit = defineEmits<{
  close: [];
  send: [payload: { emailsPara: string[]; emailsCc: string[] }];
}>();

const para = ref<string[]>([]);
const cc = ref<string[]>([]);

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(
    () => {
      if (!props.sending) emit('close');
    },
    () => props.open,
  );

watch(
  () =>
    [
      props.open,
      props.initialEmailsPara,
      props.initialEmailsCc,
    ] as const,
  ([isOpen]) => {
    if (!isOpen) return;
    para.value = [...(props.initialEmailsPara || [])].slice(
      0,
      MAX_DESTINATARIOS,
    );
    cc.value = [...(props.initialEmailsCc || [])]
      .filter((e) => !para.value.includes(e))
      .slice(0, MAX_DESTINATARIOS);
  },
  { immediate: true },
);

const canSend = computed(
  () =>
    !props.sending &&
    para.value.length > 0 &&
    para.value.length <= MAX_DESTINATARIOS,
);

function onConfirm() {
  if (!canSend.value) return;
  emit('send', {
    emailsPara: [...para.value],
    emailsCc: cc.value
      .filter((e) => !para.value.includes(e))
      .slice(0, MAX_DESTINATARIOS),
  });
}
</script>
