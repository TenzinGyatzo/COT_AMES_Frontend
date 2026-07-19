/** Categorías fijas de servicio (FR-16 / Story 4.1). */
export const CATEGORIA_SERVICIO_CODES = [
  'MED',
  'SH',
  'CAP',
  'PC',
  'EAL',
  'RME',
  'VDP',
  'OTR',
] as const;

export type CategoriaServicioCode = (typeof CATEGORIA_SERVICIO_CODES)[number];

export const CATEGORIA_SERVICIO_OPTIONS: {
  code: CategoriaServicioCode;
  label: string;
}[] = [
  { code: 'MED', label: 'Médicos' },
  { code: 'SH', label: 'Seguridad e Higiene' },
  { code: 'CAP', label: 'Capacitación' },
  { code: 'PC', label: 'Protección Civil' },
  { code: 'EAL', label: 'Estudios de Ambiente Laboral' },
  { code: 'RME', label: 'Recarga y Mantenimiento de Extintores' },
  { code: 'VDP', label: 'Ventas de Productos' },
  { code: 'OTR', label: 'Otros' },
];

export function labelCategoriaServicio(
  code: string | undefined | null,
): string {
  if (!code) return '—';
  const opt = CATEGORIA_SERVICIO_OPTIONS.find((o) => o.code === code);
  return opt ? opt.label : code;
}
