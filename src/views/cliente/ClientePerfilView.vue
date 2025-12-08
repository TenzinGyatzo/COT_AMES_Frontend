<template>
  <section class="p-5">
    <BasePageHeader
      title="Mi perfil"
      description="Aquí podrás ver y editar tus datos de contacto y los de la empresa."
      align="left"
    />

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div
      v-if="successMessage"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {{ successMessage }}
    </div>

    <BaseSectionLoader v-if="isLoading && !data" message="Cargando perfil..." />

    <BaseEmptyState
      v-else-if="!data && !isLoading && !error"
      title="No se pudo cargar el perfil"
      description="Hubo un problema al cargar tu información. Por favor, intenta recargar la página."
      size="md"
    />

    <div
      v-else-if="data"
      class="rounded-lg border border-gray-200 bg-white shadow-md p-6"
    >
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Columna izquierda: Información de la Empresa -->
          <div>
            <h2
              class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
            >
              Información de la Empresa
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  :value="data.cliente.empresa || 'No especificado'"
                  type="text"
                  class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border bg-gray-50 text-gray-600"
                  disabled
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  :value="data.cliente.rfc"
                  type="text"
                  class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border bg-gray-50 text-gray-600 uppercase"
                  disabled
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Clave
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    :value="data.cliente.clave || 'No disponible'"
                    type="text"
                    readonly
                    class="flex-1 rounded-md border-gray-300 text-sm px-3 py-2 border bg-gray-50 text-gray-900 font-mono font-semibold"
                  />
                  <button
                    v-if="data.cliente.clave"
                    type="button"
                    @click="copiarClave"
                    class="px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors text-sm font-medium"
                    title="Copiar clave"
                  >
                    Copiar
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Comparte esta clave con otros miembros de tu empresa para que
                  puedan unirse
                </p>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Información del Usuario -->
          <div>
            <h2
              class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200"
            >
              Información del Usuario
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  v-model="formData.nombre"
                  type="text"
                  class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isSaving"
                  required
                  minlength="2"
                />
                <p v-if="errors.nombre" class="mt-1 text-xs text-red-600">
                  {{ errors.nombre }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isSaving"
                  required
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">
                  {{ errors.email }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  v-model="formData.telefono"
                  type="tel"
                  class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isSaving"
                  placeholder="Ej: +52 662 123 4567"
                />
                <p v-if="errors.telefono" class="mt-1 text-xs text-red-600">
                  {{ errors.telefono }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div
          class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200"
        >
          <BaseButtonLoader
            type="button"
            variant="secondary"
            :disabled="isSaving"
            :loading="false"
            @click="resetForm"
          >
            Cancelar
          </BaseButtonLoader>
          <BaseButtonLoader
            type="submit"
            variant="primary"
            :disabled="!hasChanges"
            :loading="isSaving"
          >
            Guardar cambios
          </BaseButtonLoader>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useClientePerfil } from '../../composables/useClientePerfil';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../../components/base/BaseButtonLoader.vue';
import BaseEmptyState from '../../components/base/BaseEmptyState.vue';
import BasePageHeader from '../../components/base/BasePageHeader.vue';

const { data, isLoading, error, fetchMiPerfil, updateMiPerfil } =
  useClientePerfil();

// Estado del formulario
const formData = ref({
  nombre: '',
  email: '',
  telefono: '',
});

// Estado original para comparar cambios
const originalData = ref({
  nombre: '',
  email: '',
  telefono: '',
});

// Estado de guardado
const isSaving = ref(false);

// Mensaje de éxito
const successMessage = ref<string | null>(null);

// Función para copiar la clave al portapapeles
const copiarClave = async () => {
  if (data.value?.cliente.clave) {
    try {
      await navigator.clipboard.writeText(data.value.cliente.clave);
      successMessage.value = 'Clave copiada al portapapeles';
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const input = document.createElement('input');
      input.value = data.value.cliente.clave;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      successMessage.value = 'Clave copiada al portapapeles';
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    }
  }
};

// Errores de validación
const errors = ref({
  nombre: '',
  email: '',
  telefono: '',
});

// Computed para verificar si hay cambios
const hasChanges = computed(() => {
  if (!data.value) return false;
  return (
    formData.value.nombre !== originalData.value.nombre ||
    formData.value.email !== originalData.value.email ||
    formData.value.telefono !== originalData.value.telefono
  );
});

// Inicializar formulario con datos del perfil
function initializeForm() {
  if (data.value) {
    formData.value = {
      nombre: data.value.usuario.nombre || '',
      email: data.value.usuario.email || '',
      telefono: data.value.usuario.telefono || '',
    };
    originalData.value = { ...formData.value };
  }
}

// Resetear formulario a valores originales
function resetForm() {
  if (data.value) {
    formData.value = { ...originalData.value };
    errors.value = { nombre: '', email: '', telefono: '' };
  }
}

// Validar formulario
function validateForm(): boolean {
  errors.value = { nombre: '', email: '', telefono: '' };
  let isValid = true;

  // Validar nombre
  if (formData.value.nombre.trim().length < 2) {
    errors.value.nombre = 'El nombre debe tener al menos 2 caracteres';
    isValid = false;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    errors.value.email = 'Ingrese un correo electrónico válido';
    isValid = false;
  }

  return isValid;
}

// Manejar envío del formulario
async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  errors.value = { nombre: '', email: '', telefono: '' };
  successMessage.value = null;

  try {
    // Construir payload solo con campos que cambiaron
    const payload: any = {};
    if (formData.value.nombre !== originalData.value.nombre) {
      payload.nombre = formData.value.nombre;
    }
    if (formData.value.email !== originalData.value.email) {
      payload.email = formData.value.email;
    }
    if (formData.value.telefono !== originalData.value.telefono) {
      payload.telefono = formData.value.telefono || undefined;
    }

    // Solo actualizar si hay cambios
    if (Object.keys(payload).length > 0) {
      await updateMiPerfil(payload);
      // Actualizar datos originales después de guardar
      originalData.value = { ...formData.value };
      successMessage.value = 'Perfil actualizado exitosamente.';
      setTimeout(() => {
        successMessage.value = null;
      }, 5000);
    } else {
      successMessage.value = 'No hay cambios para guardar.';
      setTimeout(() => {
        successMessage.value = null;
      }, 3000);
    }
  } catch (err: any) {
    // El error ya se maneja en el store
    console.error('Error al actualizar perfil:', err);
  } finally {
    isSaving.value = false;
  }
}

// Cargar perfil al montar el componente
onMounted(async () => {
  try {
    await fetchMiPerfil();
    initializeForm();
  } catch (err) {
    console.error('Error al cargar perfil:', err);
  }
});

// Reinicializar formulario cuando cambien los datos
watch(data, () => {
  if (data.value) {
    initializeForm();
  }
});
</script>
