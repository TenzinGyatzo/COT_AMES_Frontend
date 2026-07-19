<template>
  <div class="border border-gray-300 rounded-md overflow-hidden bg-white">
    <div
      v-if="editor"
      class="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50"
      role="toolbar"
      aria-label="Formato de texto"
    >
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500 disabled:opacity-40"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('bold') }"
        :aria-pressed="editor.isActive('bold')"
        aria-label="Negrita"
        title="Negrita"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-bold">B</span>
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('italic') }"
        :aria-pressed="editor.isActive('italic')"
        aria-label="Cursiva"
        title="Cursiva"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="italic">I</span>
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('underline') }"
        :aria-pressed="editor.isActive('underline')"
        aria-label="Subrayado"
        title="Subrayado"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <span class="underline">U</span>
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('strike') }"
        :aria-pressed="editor.isActive('strike')"
        aria-label="Tachado"
        title="Tachado"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <span class="line-through">S</span>
      </button>
      <span class="w-px self-stretch bg-gray-300 mx-0.5" aria-hidden="true" />
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('bulletList') }"
        :aria-pressed="editor.isActive('bulletList')"
        aria-label="Lista con viñetas"
        title="Lista"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • Lista
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{ 'bg-medical-blue-100 border-medical-blue-400': editor.isActive('orderedList') }"
        :aria-pressed="editor.isActive('orderedList')"
        aria-label="Lista numerada"
        title="Lista numerada"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. Lista
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        aria-label="Aumentar sangría"
        title="Sangría +"
        @click="editor.chain().focus().sinkListItem('listItem').run()"
      >
        →
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        aria-label="Reducir sangría"
        title="Sangría −"
        @click="editor.chain().focus().liftListItem('listItem').run()"
      >
        ←
      </button>
      <span class="w-px self-stretch bg-gray-300 mx-0.5" aria-hidden="true" />
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{
          'bg-medical-blue-100 border-medical-blue-400': editor.isActive({ textAlign: 'left' }),
        }"
        :aria-pressed="editor.isActive({ textAlign: 'left' })"
        aria-label="Alinear a la izquierda"
        title="Izquierda"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        Izq
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{
          'bg-medical-blue-100 border-medical-blue-400': editor.isActive({ textAlign: 'center' }),
        }"
        :aria-pressed="editor.isActive({ textAlign: 'center' })"
        aria-label="Centrar"
        title="Centro"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        Cen
      </button>
      <button
        type="button"
        class="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
        :class="{
          'bg-medical-blue-100 border-medical-blue-400': editor.isActive({ textAlign: 'right' }),
        }"
        :aria-pressed="editor.isActive({ textAlign: 'right' })"
        aria-label="Alinear a la derecha"
        title="Derecha"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        Der
      </button>
    </div>
    <editor-content
      :editor="editor"
      class="plantilla-richtext prose prose-sm max-w-none px-3 py-2 min-h-[120px] focus-within:ring-2 focus-within:ring-inset focus-within:ring-medical-blue-500"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  tipTapContentFromCuerpo,
  type CuerpoRichtextForm,
} from './richtext-cuerpo';

const props = defineProps<{
  modelValue: CuerpoRichtextForm;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: CuerpoRichtextForm];
}>();

function emitCuerpo(ed: {
  getText: () => string;
  getJSON: () => Record<string, unknown>;
}) {
  emit('update:modelValue', {
    text: ed.getText(),
    doc: ed.getJSON() as Record<string, unknown>,
  });
}

const editor = useEditor({
  content: tipTapContentFromCuerpo(props.modelValue),
  extensions: [
    StarterKit.configure({
      // Underline + Link: dedicated Underline; Link off (paste XSS / no toolbar)
      underline: false,
      link: false,
      heading: false,
      codeBlock: false,
      code: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  editorProps: {
    attributes: {
      class: 'outline-none min-h-[100px]',
      'aria-label': 'Contenido de la sección',
    },
  },
  onCreate: ({ editor: ed }) => {
    // Garantiza cuerpo.doc en el modelo aunque no se edite (AC #2).
    emitCuerpo(ed);
  },
  onUpdate: ({ editor: ed }) => {
    emitCuerpo(ed);
  },
});

watch(
  () => props.modelValue,
  (next) => {
    if (!editor.value) return;
    const current = editor.value.getJSON();
    const nextDoc = next.doc;
    if (
      nextDoc &&
      typeof nextDoc === 'object' &&
      !Array.isArray(nextDoc) &&
      JSON.stringify(current) === JSON.stringify(nextDoc)
    ) {
      return;
    }
    // External reset (tipo change / load) — avoid loop when we emitted the update
    if (nextDoc && typeof nextDoc === 'object' && !Array.isArray(nextDoc)) {
      editor.value.commands.setContent(nextDoc, { emitUpdate: false });
    } else if (typeof next.text === 'string') {
      const plain = editor.value.getText();
      if (plain !== next.text) {
        editor.value.commands.setContent(tipTapContentFromCuerpo(next), {
          emitUpdate: false,
        });
      }
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.plantilla-richtext :deep(.ProseMirror) {
  min-height: 100px;
}
.plantilla-richtext :deep(.ProseMirror p) {
  margin: 0.35em 0;
}
.plantilla-richtext :deep(.ProseMirror ul),
.plantilla-richtext :deep(.ProseMirror ol) {
  padding-left: 1.25rem;
  margin: 0.35em 0;
}
</style>
