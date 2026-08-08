/**
 * Draft temporal para precargar AdminCotizadorView desde Repetir (one-shot).
 */

import { defineStore } from 'pinia';
import type {
  ModoPreciosRepetir,
  RepetirCotizacionPreviewDto,
} from '../services/admin-api.service';

export type CotizadorRepetirDraft = {
  sourceCotizacionId: string;
  sourceFolio: string;
  modoPrecios: ModoPreciosRepetir;
  /** Si true, tras crear desde el cotizador se cancela la fuente. */
  cancelarOriginal?: boolean;
  draft: RepetirCotizacionPreviewDto;
};

interface CotizadorDraftState {
  pending: CotizadorRepetirDraft | null;
}

export const useCotizadorDraftStore = defineStore('cotizadorDraft', {
  state: (): CotizadorDraftState => ({
    pending: null,
  }),

  actions: {
    setDraft(draft: CotizadorRepetirDraft): void {
      this.pending = draft;
    },

    /** Lee y limpia el draft (evita re-hidratar en refresh). */
    consumeDraft(): CotizadorRepetirDraft | null {
      const d = this.pending;
      this.pending = null;
      return d;
    },

    clearDraft(): void {
      this.pending = null;
    },
  },
});
