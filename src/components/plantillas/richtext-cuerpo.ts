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

/**
 * Plain text derivado de `cuerpo.doc` — debe coincidir con
 * `backend/src/plantillas/utils/tiptap-plain-text.ts` (validación BE).
 * No usar `editor.getText()`: con listas TipTap inserta saltos extra.
 */
const TEXTBLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'codeBlock',
  'blockquote',
]);

function collectInlineText(node: Record<string, unknown>): string {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (node.type === 'hardBreak') {
    return '\n';
  }
  const content = node.content;
  if (!Array.isArray(content)) return '';
  return content
    .map((child) =>
      child && typeof child === 'object'
        ? collectInlineText(child as Record<string, unknown>)
        : '',
    )
    .join('');
}

export function plainTextFromTipTapDoc(doc: unknown): string {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return '';
  }

  const blocks: string[] = [];

  function walk(node: Record<string, unknown>) {
    const type = node.type;
    if (typeof type === 'string' && TEXTBLOCK_TYPES.has(type)) {
      blocks.push(collectInlineText(node));
      return;
    }
    const content = node.content;
    if (!Array.isArray(content)) return;
    for (const child of content) {
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        walk(child as Record<string, unknown>);
      }
    }
  }

  walk(doc as Record<string, unknown>);
  return blocks.join('\n\n');
}

/** Par `{ text, doc }` coherente para persistir / validar en BE. */
export function cuerpoFromDoc(doc: Record<string, unknown>): CuerpoRichtextForm {
  return {
    doc,
    text: plainTextFromTipTapDoc(doc),
  };
}

/** Resuelve doc (legacy solo-text o doc existente) y deriva `text` alineado al BE. */
export function buildCuerpoPayload(cuerpo: CuerpoRichtextForm): CuerpoRichtextForm & {
  doc: Record<string, unknown>;
} {
  const doc =
    cuerpo.doc &&
    typeof cuerpo.doc === 'object' &&
    !Array.isArray(cuerpo.doc)
      ? cuerpo.doc
      : (tipTapContentFromCuerpo({ text: cuerpo.text ?? '' }) as Record<string, unknown>);
  return cuerpoFromDoc(doc) as CuerpoRichtextForm & { doc: Record<string, unknown> };
}
