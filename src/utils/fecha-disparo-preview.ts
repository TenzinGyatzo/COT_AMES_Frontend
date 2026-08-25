/**
 * Preview / elegibilidad FE — espejo de backend/.../fecha-disparo.calc.ts (Story 9.2).
 * Tras PUT, la UI debe preferir fechaDisparoUtc del servidor (AD-28).
 */
import { DateTime, type DurationLike } from 'luxon';
import type {
  PresetRelativoAniversario,
  PresetRelativoHoy,
  RecetaRecordatorio,
} from '../types/backend';

export const DEFAULT_TENANT_ZONE = 'America/Mexico_City';

/**
 * Hora UTC del disparo sobre el día civil del tenant.
 * 14:00 UTC = 08:00 en UTC-6 (CDMX) = 07:00 en UTC-7 (Pacífico en verano).
 * Espejo de backend/.../fecha-disparo.calc.ts
 */
export const HORA_DISPARO_UTC = 14;

export const PRESETS_RELATIVO_HOY = [
  '1_mes',
  '3_meses',
  '6_meses',
  '11_meses',
  '1_ano',
  '2_anos',
] as const satisfies readonly PresetRelativoHoy[];

export const PRESETS_RELATIVO_ANIVERSARIO = [
  '2_semanas_antes',
  '1_mes_antes',
  '2_meses_antes',
] as const satisfies readonly PresetRelativoAniversario[];

export const PRESET_LABELS_HOY: Record<PresetRelativoHoy, string> = {
  '1_mes': 'En 1 mes',
  '3_meses': 'En 3 meses',
  '6_meses': 'En 6 meses',
  '11_meses': 'En 11 meses',
  '1_ano': 'En 1 año',
  '2_anos': 'En 2 años',
};

export const PRESET_LABELS_ANIVERSARIO: Record<
  PresetRelativoAniversario,
  string
> = {
  '2_semanas_antes': '2 semanas antes',
  '1_mes_antes': '1 mes antes',
  '2_meses_antes': '2 meses antes',
};

const HOY_DURATIONS: Record<PresetRelativoHoy, DurationLike> = {
  '1_mes': { months: 1 },
  '3_meses': { months: 3 },
  '6_meses': { months: 6 },
  '11_meses': { months: 11 },
  '1_ano': { years: 1 },
  '2_anos': { years: 2 },
};

const ANIV_OFFSETS: Record<PresetRelativoAniversario, DurationLike> = {
  '2_semanas_antes': { weeks: 2 },
  '1_mes_antes': { months: 1 },
  '2_meses_antes': { months: 2 },
};

export type CalcPreviewOk = {
  ok: true;
  fechaDisparoUtc: Date;
  eligible: true;
};
export type CalcPreviewErr = {
  ok: false;
  code: 'invalid_receta' | 'not_future';
  message: string;
  eligible: false;
};
export type CalcPreviewResult = CalcPreviewOk | CalcPreviewErr;

export function resolveTenantZone(zonaHoraria?: string | null): string {
  if (typeof zonaHoraria === 'string' && zonaHoraria.trim()) {
    return zonaHoraria.trim();
  }
  return DEFAULT_TENANT_ZONE;
}

/**
 * Día civil en zona del tenant → 14:00 UTC de esa misma fecha (HORA_DISPARO_UTC).
 */
export function atHoraDisparoUtc(civilDayInTenantZone: DateTime): DateTime {
  return DateTime.fromObject(
    {
      year: civilDayInTenantZone.year,
      month: civilDayInTenantZone.month,
      day: civilDayInTenantZone.day,
      hour: HORA_DISPARO_UTC,
      minute: 0,
      second: 0,
      millisecond: 0,
    },
    { zone: 'utc' },
  );
}

export function calcularFechaDisparoPreview(params: {
  receta: RecetaRecordatorio;
  zonaHoraria?: string | null;
  fechaCreacion?: Date | string | null;
  nowUtc?: Date;
}): CalcPreviewResult {
  const zone = resolveTenantZone(params.zonaHoraria);
  const now = DateTime.fromJSDate(params.nowUtc ?? new Date(), {
    zone: 'utc',
  }).setZone(zone);

  if (!now.isValid) {
    return {
      ok: false,
      eligible: false,
      code: 'invalid_receta',
      message: 'No se pudo calcular la fecha. Intenta de nuevo.',
    };
  }

  const { familia, preset, fechaExacta } = params.receta;
  let target: DateTime;

  if (familia === 'relativo_hoy') {
    if (
      !preset ||
      !(PRESETS_RELATIVO_HOY as readonly string[]).includes(preset)
    ) {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'Elige dentro de cuánto tiempo quieres el recordatorio.',
      };
    }
    target = now
      .plus(HOY_DURATIONS[preset as PresetRelativoHoy])
      .startOf('day');
  } else if (familia === 'relativo_aniversario') {
    if (
      !preset ||
      !(PRESETS_RELATIVO_ANIVERSARIO as readonly string[]).includes(preset)
    ) {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'Elige con cuánta anticipación quieres el recordatorio.',
      };
    }
    if (!params.fechaCreacion) {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'No se pudo calcular esa fecha. Intenta de nuevo.',
      };
    }
    const anchor = DateTime.fromJSDate(
      params.fechaCreacion instanceof Date
        ? params.fechaCreacion
        : new Date(params.fechaCreacion),
      { zone: 'utc' },
    ).setZone(zone);
    if (!anchor.isValid) {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'No se pudo calcular esa fecha. Intenta de nuevo.',
      };
    }
    const anniversary = anchor.plus({ years: 1 }).startOf('day');
    target = anniversary
      .minus(ANIV_OFFSETS[preset as PresetRelativoAniversario])
      .startOf('day');
  } else if (familia === 'fecha_exacta') {
    if (preset != null && String(preset).trim() !== '') {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'Elige un día específico o un plazo, no ambos.',
      };
    }
    if (fechaExacta == null || fechaExacta === '') {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'Elige el día en que quieres el recordatorio.',
      };
    }
    const parsed =
      fechaExacta instanceof Date
        ? DateTime.fromJSDate(fechaExacta, { zone: 'utc' }).setZone(zone)
        : DateTime.fromISO(String(fechaExacta).slice(0, 10), { zone });
    if (!parsed.isValid) {
      return {
        ok: false,
        eligible: false,
        code: 'invalid_receta',
        message: 'Esa fecha no es válida. Elige otro día.',
      };
    }
    target = parsed.startOf('day');
  } else {
    return {
      ok: false,
      eligible: false,
      code: 'invalid_receta',
      message: 'Elige cómo quieres recibir el recordatorio.',
    };
  }

  if (!target.isValid) {
    return {
      ok: false,
      eligible: false,
      code: 'invalid_receta',
      message: 'No se pudo calcular la fecha. Intenta de nuevo.',
    };
  }

  const disparoUtc = atHoraDisparoUtc(target);
  if (!disparoUtc.isValid) {
    return {
      ok: false,
      eligible: false,
      code: 'invalid_receta',
      message: 'No se pudo calcular la fecha. Intenta de nuevo.',
    };
  }

  if (disparoUtc.toMillis() <= now.toMillis()) {
    return {
      ok: false,
      eligible: false,
      code: 'not_future',
      message: 'Esa fecha ya pasó. Elige otra opción.',
    };
  }

  return {
    ok: true,
    eligible: true,
    fechaDisparoUtc: disparoUtc.toJSDate(),
  };
}

/** Label humano de receta para el bloque. */
export function resumenRecetaLabel(
  receta: RecetaRecordatorio,
  zonaHoraria?: string | null,
): string {
  if (receta.familia === 'relativo_hoy' && receta.preset) {
    const label =
      PRESET_LABELS_HOY[receta.preset as PresetRelativoHoy] ?? receta.preset;
    return label;
  }
  if (receta.familia === 'relativo_aniversario' && receta.preset) {
    const label =
      PRESET_LABELS_ANIVERSARIO[receta.preset as PresetRelativoAniversario] ??
      receta.preset;
    return `${label} de que esta cotización cumpla un año`;
  }
  if (receta.familia === 'fecha_exacta') {
    const d = fechaExactaToDateInput(receta.fechaExacta, zonaHoraria);
    return d ? `El día ${d}` : 'Un día específico';
  }
  return 'Recordatorio';
}

/**
 * Convierte `fechaExacta` persistida (Date UTC = 14:00 UTC del día civil, o ISO)
 * al valor `YYYY-MM-DD` del Reloj del tenant para inputs type="date".
 */
export function fechaExactaToDateInput(
  fechaExacta: string | Date | undefined | null,
  zonaHoraria?: string | null,
): string {
  if (fechaExacta == null || fechaExacta === '') return '';
  const zone = resolveTenantZone(zonaHoraria);
  if (typeof fechaExacta === 'string') {
    const trimmed = fechaExacta.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const dt = DateTime.fromISO(trimmed, { zone: 'utc' }).setZone(zone);
    return dt.isValid ? (dt.toISODate() ?? '') : trimmed.slice(0, 10);
  }
  const dt = DateTime.fromJSDate(fechaExacta, { zone: 'utc' }).setZone(zone);
  return dt.isValid ? (dt.toISODate() ?? '') : '';
}

export function formatFechaRecordatorioLarga(
  fecha: Date | string,
  zonaHoraria?: string | null,
): string {
  const zone = resolveTenantZone(zonaHoraria);
  const dt =
    fecha instanceof Date
      ? DateTime.fromJSDate(fecha, { zone: 'utc' }).setZone(zone)
      : DateTime.fromISO(String(fecha), { zone: 'utc' }).setZone(zone);
  if (!dt.isValid) return '—';
  return dt.setLocale('es-MX').toFormat("d 'de' MMMM 'de' yyyy");
}

export function formatDisparoEstimado(
  fecha: Date | string,
  zonaHoraria?: string | null,
): string {
  return `Recibirás el recordatorio el ${formatFechaRecordatorioLarga(fecha, zonaHoraria)}`;
}

export function formatResumenOperativo(
  fecha: Date | string,
  zonaHoraria?: string | null,
): string {
  return `Te recordaremos el ${formatFechaRecordatorioLarga(fecha, zonaHoraria)}`;
}

export function clienteDisplayName(nombre?: string | null): string {
  const t = typeof nombre === 'string' ? nombre.trim() : '';
  return t || 'este cliente';
}
