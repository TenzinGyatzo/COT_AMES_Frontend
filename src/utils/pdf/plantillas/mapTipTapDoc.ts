/**
 * TipTap JSON (editor 5.3) → pdfmake Content (Story 6.7).
 * Paridad: StarterKit (−heading/−code/−link) + Underline + TextAlign.
 */

export type PdfContent = Record<string, unknown> | string;

type TipTapNode = {
  type?: string;
  text?: string;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

function applyMarks(
  text: string,
  marks?: TipTapNode['marks'],
): Record<string, unknown> {
  const out: Record<string, unknown> = { text };
  if (!marks?.length) return out;

  const decorations: string[] = [];
  for (const m of marks) {
    switch (m?.type) {
      case 'bold':
        out.bold = true;
        break;
      case 'italic':
        out.italics = true;
        break;
      case 'underline':
        decorations.push('underline');
        break;
      case 'strike':
        decorations.push('lineThrough');
        break;
      default:
        break;
    }
  }
  if (decorations.length === 1) out.decoration = decorations[0];
  else if (decorations.length > 1) out.decoration = decorations;
  return out;
}

function mapInline(nodes?: TipTapNode[]): Array<string | Record<string, unknown>> {
  if (!nodes?.length) return [''];
  const parts: Array<string | Record<string, unknown>> = [];
  for (const n of nodes) {
    if (!n) continue;
    if (n.type === 'text') {
      parts.push(applyMarks(n.text ?? '', n.marks));
      continue;
    }
    if (n.type === 'hardBreak') {
      parts.push({ text: '\n' });
      continue;
    }
    // Nodos inline desconocidos → texto plano de hijos
    if (n.content?.length) {
      parts.push(...mapInline(n.content));
    } else if (typeof n.text === 'string') {
      parts.push(n.text);
    }
  }
  return parts.length ? parts : [''];
}

function alignmentOf(node: TipTapNode): string | undefined {
  const a = node.attrs?.textAlign;
  if (a === 'left' || a === 'center' || a === 'right') return a;
  return undefined;
}

function mapListItems(
  nodes: TipTapNode[] | undefined,
): Array<{ stack: PdfContent[] }> {
  return (nodes || [])
    .filter((li): li is TipTapNode => !!li && typeof li === 'object')
    .map((li) => ({
      stack: (li.content || []).flatMap(mapBlock),
    }));
}

function mapBlock(node: TipTapNode | null | undefined): PdfContent[] {
  if (!node || typeof node !== 'object') return [];
  const type = node.type || '';
  switch (type) {
    case 'paragraph': {
      const item: Record<string, unknown> = {
        text: mapInline(node.content),
        margin: [0, 0, 0, 6],
      };
      const align = alignmentOf(node);
      if (align) item.alignment = align;
      return [item];
    }
    case 'blockquote': {
      return [
        {
          stack: (node.content || []).flatMap(mapBlock),
          margin: [12, 4, 0, 8],
          color: '#4B5563',
        },
      ];
    }
    case 'bulletList': {
      return [
        {
          ul: mapListItems(node.content),
          margin: [0, 0, 0, 8],
        },
      ];
    }
    case 'orderedList': {
      return [
        {
          ol: mapListItems(node.content),
          margin: [0, 0, 0, 8],
        },
      ];
    }
    case 'listItem':
      return (node.content || []).flatMap(mapBlock);
    case 'hardBreak':
      return [{ text: '\n' }];
    case 'horizontalRule':
      // LETTER content width ≈ 612 − 80 margins
      return [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.75,
              lineColor: '#9CA3AF',
            },
          ],
          margin: [0, 8, 0, 8],
        },
      ];
    case 'doc':
      return (node.content || []).flatMap(mapBlock);
    default:
      // Desconocido: aplanar hijos o texto
      if (node.content?.length) return node.content.flatMap(mapBlock);
      if (typeof node.text === 'string' && node.text) {
        return [{ text: node.text, margin: [0, 0, 0, 6] }];
      }
      return [];
  }
}

/** Mapea un documento TipTap (`type: 'doc'`) a content pdfmake. */
export function mapTipTapDoc(doc: unknown): PdfContent[] {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return [];
  return mapBlock(doc as TipTapNode);
}
