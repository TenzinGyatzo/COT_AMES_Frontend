/**
 * Composable para manejo de la lógica del perfil del cliente
 * Encapsula la interacción con el store del perfil del cliente
 * Expone métodos y datos de forma reactiva para usar en componentes
 */

import { storeToRefs } from 'pinia';
import { useClientePerfilStore } from '../store/cliente-perfil';
import type { UpdateMiPerfilPayload } from '../types/backend';

export function useClientePerfil() {
  const clientePerfilStore = useClientePerfilStore();
  const { data, isLoading, error } = storeToRefs(clientePerfilStore);

  /**
   * Carga el perfil del cliente autenticado
   */
  const fetchMiPerfil = async (): Promise<void> => {
    await clientePerfilStore.fetchMiPerfil();
  };

  /**
   * Actualiza el perfil del cliente autenticado
   * @param payload - Datos a actualizar (nombre, email, telefono)
   */
  const updateMiPerfil = async (
    payload: UpdateMiPerfilPayload,
  ): Promise<void> => {
    await clientePerfilStore.updateMiPerfil(payload);
  };

  return {
    // Datos reactivos
    data,
    isLoading,
    error,
    // Métodos
    fetchMiPerfil,
    updateMiPerfil,
  };
}
