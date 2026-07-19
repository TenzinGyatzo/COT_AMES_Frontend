import type { JSONContent } from '@tiptap/core';

export type CuerpoRichtextForm = {
  text: string;
  doc?: Record<string, unknown>;
};

/** TipTap content: prefer `doc`; legacy seeds only have plain `text`. */
export function tipTapContentFromCuerpo(cuerpo: CuerpoRichtextForm): JSONContent {
  if (cuerpo.doc && typeof cuerpo.doc === 'object' && !Array.isArray(cuerpo.doc)) {
    return cuerpo.doc as JSONContent;
  }
  const text = cuerpo.text ?? '';
  if (!text.trim()) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  // Always wrap as text nodes — never pass a raw string (TipTap would parse HTML).
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

/** Doc TipTap vacío (párrafo sin texto) — coherente con `text: ''`. */
export function emptyTipTapDoc(): Record<string, unknown> {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}
