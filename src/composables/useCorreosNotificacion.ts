import { ref } from 'vue';
import { getTenantConfig } from '../services/admin-api.service';

let cachedCorreos: string[] | null = null;
let loadPromise: Promise<string[]> | null = null;

async function fetchCorreosNotificacion(): Promise<string[]> {
  if (cachedCorreos) return cachedCorreos;
  if (!loadPromise) {
    loadPromise = getTenantConfig()
      .then((cfg) => {
        cachedCorreos = (cfg.correosNotificacion ?? [])
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean);
        return cachedCorreos;
      })
      .catch(() => {
        cachedCorreos = [];
        return [];
      });
  }
  return loadPromise;
}

export function useCorreosNotificacion() {
  const correosNotificacion = ref<string[]>(cachedCorreos ?? []);

  async function loadCorreosNotificacion(): Promise<string[]> {
    const list = await fetchCorreosNotificacion();
    correosNotificacion.value = list;
    return list;
  }

  return { correosNotificacion, loadCorreosNotificacion };
}
