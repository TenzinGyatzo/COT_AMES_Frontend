import { computed, ref } from 'vue';
import type { RecordatorioDisparadoItem } from '../types/backend';
import {
  cerrarRecordatorioDisparado,
  getRecordatoriosDisparados,
} from '../services/admin-api.service';
import { extractError } from '../utils/extractError';

/** Story 10.3 — bandeja tenant de recordatorios disparados (AD-35). */
export function useRecordatoriosDisparados() {
  const items = ref<RecordatorioDisparadoItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  let fetchGeneration = 0;

  const disparadoByCotizacionId = computed(() => {
    const map = new Map<string, RecordatorioDisparadoItem>();
    for (const item of items.value) {
      map.set(item.cotizacionId, item);
    }
    return map;
  });

  async function fetchDisparados(): Promise<void> {
    const generation = ++fetchGeneration;
    items.value = [];
    loading.value = true;
    error.value = '';
    try {
      const res = await getRecordatoriosDisparados();
      if (generation !== fetchGeneration) return;
      items.value = res.items ?? [];
    } catch (e) {
      if (generation !== fetchGeneration) return;
      error.value = extractError(e, 'No se pudieron cargar los seguimientos pendientes');
      items.value = [];
    } finally {
      if (generation === fetchGeneration) {
        loading.value = false;
      }
    }
  }

  function resetDisparados(): void {
    fetchGeneration += 1;
    items.value = [];
    loading.value = false;
    error.value = '';
  }

  async function cerrar(recordatorioId: string): Promise<boolean> {
    try {
      await cerrarRecordatorioDisparado(recordatorioId);
      fetchGeneration += 1;
      items.value = items.value.filter((i) => i.recordatorioId !== recordatorioId);
      return true;
    } catch (e) {
      error.value = extractError(e, 'No se pudo marcar como atendido');
      return false;
    }
  }

  return {
    items,
    loading,
    error,
    disparadoByCotizacionId,
    fetchDisparados,
    resetDisparados,
    cerrar,
  };
}
