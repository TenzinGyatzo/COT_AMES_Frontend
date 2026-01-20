<template>
  <div class="max-w-md mx-auto mt-0">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2 text-center">
        Crear cuenta de cliente
      </h2>
      <p class="text-sm text-gray-600 mb-6 text-center">
        Regístrate para acceder al portal de clientes
      </p>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Datos del usuario -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            Datos de acceso
          </h3>

          <div class="mb-4">
            <label
              for="nombre"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo <span class="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              v-model="formData.nombre"
              type="text"
              required
              minlength="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="Juan Pérez"
              :class="{ 'border-red-500': errors.nombre }"
            />
            <p v-if="errors.nombre" class="mt-1 text-xs text-red-600">
              {{ errors.nombre }}
            </p>
          </div>

          <div class="mb-4">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="usuario@empresa.com"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div class="mb-4">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="••••••••"
                :class="{ 'border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabindex="-1"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 1l22 22M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">
              {{ errors.password }}
            </p>
            <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <div class="mb-4">
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="••••••••"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabindex="-1"
              >
                <svg
                  v-if="showConfirmPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 1l22 22M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <div>
            <label
              for="telefono"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              v-model="formData.telefono"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
              placeholder="662 123 4567"
            />
          </div>
        </div>

        <!-- Opción: Crear nueva empresa o unirse a existente -->
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Empresa</h3>

          <div class="mb-4">
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="tipoRegistro"
                  value="nueva"
                  class="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700"
                  >Crear nueva empresa</span
                >
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  v-model="tipoRegistro"
                  value="existente"
                  class="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700"
                  >Unirse a empresa existente</span
                >
              </label>
            </div>
          </div>

          <!-- Campo para unirse a empresa existente -->
          <div v-if="tipoRegistro === 'existente'" class="mb-4">
            <label
              for="claveEmpresa"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Clave de la empresa <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-2">
              <input
                id="claveEmpresa"
                v-model="formData.claveEmpresa"
                type="text"
                required
                maxlength="8"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
                placeholder="A1B2C3D4"
                :class="{ 'border-red-500': errors.claveEmpresa }"
                @input="
                  formData.claveEmpresa = formData.claveEmpresa.toUpperCase()
                "
              />
              <button
                type="button"
                @click="buscarEmpresa"
                :disabled="
                  !formData.claveEmpresa || formData.claveEmpresa.length < 4
                "
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verificar
              </button>
            </div>
            <p v-if="errors.claveEmpresa" class="mt-1 text-xs text-red-600">
              {{ errors.claveEmpresa }}
            </p>
            <p
              v-if="empresaEncontrada"
              class="mt-2 text-sm text-green-700 font-medium"
            >
              ✓ Empresa encontrada: {{ empresaEncontrada.empresa }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              Solicita la clave a un usuario ya registrado en tu empresa o al
              administrador
            </p>
          </div>

          <!-- Campos para crear nueva empresa -->
          <div v-if="tipoRegistro === 'nueva'">
            <div class="mb-4">
              <label
                for="empresa"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la empresa <span class="text-red-500">*</span>
              </label>
              <input
                id="empresa"
                v-model="formData.empresa"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Empresa ABC S.A. de C.V."
                :class="{ 'border-red-500': errors.empresa }"
                @blur="verificarEmpresa"
              />
              <p v-if="errors.empresa" class="mt-1 text-xs text-red-600">
                {{ errors.empresa }}
              </p>
              <p
                v-if="empresaExistente && !errors.empresa"
                class="mt-2 text-sm text-orange-700 font-medium"
              >
                ⚠ Esta empresa ya está registrada. Usa la clave
                <strong>{{ empresaExistente.clave }}</strong> para unirte a la
                empresa existente.
              </p>
            </div>
            <div class="mb-4">
              <label
                for="rfc"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                RFC <span class="text-red-500">*</span>
              </label>
              <input
                id="rfc"
                v-model="formData.rfc"
                type="text"
                required
                maxlength="12"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
                placeholder="ABC123456789"
                :class="{ 'border-red-500': errors.rfc }"
                @input="
                  formData.rfc = formData.rfc.toUpperCase();
                  errors.rfc = '';
                "
                @blur="verificarRfc"
              />
              <p v-if="errors.rfc" class="mt-1 text-xs text-red-600">
                {{ errors.rfc }}
              </p>
              <p
                v-if="rfcExistente && !errors.rfc"
                class="mt-2 text-sm text-orange-700 font-medium"
              >
                ⚠ Este RFC ya está registrado para la empresa
                <strong>{{ rfcExistente.empresa }}</strong
                >. Usa la clave <strong>{{ rfcExistente.clave }}</strong> para
                unirte a la empresa existente.
              </p>
              <p
                v-else-if="!errors.rfc && !rfcExistente"
                class="mt-1 text-xs text-gray-500"
              >
                Registro Federal de Contribuyentes de la empresa (12 caracteres)
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Creando cuenta...</span>
          <span v-else>Crear cuenta</span>
        </button>
      </form>

      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm"
      >
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes una cuenta?
          <router-link
            :to="{ name: 'cliente-login' }"
            class="text-medical-blue-600 hover:text-medical-blue-700 font-medium"
          >
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import httpClient from '../services/http';

const router = useRouter();
const { registerCliente, isLoading, error } = useAuth();

const tipoRegistro = ref<'nueva' | 'existente'>('nueva');
const empresaEncontrada = ref<{ empresa?: string; rfc?: string } | null>(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const formData = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  telefono: '',
  empresa: '',
  rfc: '',
  claveEmpresa: '',
});

const errors = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  claveEmpresa: '',
  rfc: '',
  empresa: '',
});

const rfcExistente = ref<{ empresa?: string; clave?: string } | null>(null);
const empresaExistente = ref<{ rfc?: string; clave?: string } | null>(null);

// Limpiar empresa encontrada cuando cambia el tipo de registro
watch(tipoRegistro, () => {
  empresaEncontrada.value = null;
  formData.value.claveEmpresa = '';
  errors.value.claveEmpresa = '';
  errors.value.rfc = '';
  errors.value.empresa = '';
  rfcExistente.value = null;
  empresaExistente.value = null;
});

// Función para buscar empresa por clave
const buscarEmpresa = async () => {
  if (!formData.value.claveEmpresa || formData.value.claveEmpresa.length < 4) {
    return;
  }

  try {
    const response = await httpClient.get(
      `/auth/cliente/buscar-empresa/${formData.value.claveEmpresa.toUpperCase()}`,
    );
    empresaEncontrada.value = response.data;
    errors.value.claveEmpresa = '';
  } catch (err: any) {
    empresaEncontrada.value = null;
    errors.value.claveEmpresa =
      err.response?.data?.message || 'Empresa no encontrada con esta clave';
  }
};

// Función para verificar si el RFC ya está registrado
const verificarRfc = async () => {
  const rfc = formData.value.rfc.trim();
  if (!rfc || rfc.length !== 12) {
    rfcExistente.value = null;
    return;
  }

  try {
    const response = await httpClient.get(
      `/auth/cliente/verificar-rfc/${rfc.toUpperCase()}`,
    );
    if (response.data.existe) {
      rfcExistente.value = {
        empresa: response.data.empresa,
        clave: response.data.clave,
      };
      errors.value.rfc = 'Este RFC ya está registrado';
    } else {
      rfcExistente.value = null;
      errors.value.rfc = '';
    }
  } catch (err: any) {
    rfcExistente.value = null;
    // No mostramos error si falla la verificación, solo si el RFC está duplicado
  }
};

// Función para verificar si el nombre de empresa ya está registrado
const verificarEmpresa = async () => {
  const empresa = formData.value.empresa.trim();
  if (!empresa || empresa.length < 3) {
    empresaExistente.value = null;
    return;
  }

  try {
    const response = await httpClient.get(
      `/auth/cliente/verificar-empresa/${encodeURIComponent(empresa)}`,
    );
    if (response.data.existe) {
      empresaExistente.value = {
        rfc: response.data.rfc,
        clave: response.data.clave,
      };
      errors.value.empresa = 'Esta empresa ya está registrada';
    } else {
      empresaExistente.value = null;
      errors.value.empresa = '';
    }
  } catch (err: any) {
    empresaExistente.value = null;
    // No mostramos error si falla la verificación, solo si la empresa está duplicada
  }
};

function validateForm(): boolean {
  errors.value = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    claveEmpresa: '',
    rfc: '',
    empresa: '',
  };
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

  // Validar contraseña
  if (formData.value.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres';
    isValid = false;
  }

  // Validar confirmación de contraseña
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden';
    isValid = false;
  }

  // Validar clave de empresa si se está uniendo a una existente
  if (tipoRegistro.value === 'existente') {
    if (
      !formData.value.claveEmpresa ||
      formData.value.claveEmpresa.trim().length < 4
    ) {
      errors.value.claveEmpresa = 'Debe ingresar una clave válida';
      isValid = false;
    } else if (!empresaEncontrada.value) {
      errors.value.claveEmpresa = 'Debe verificar la clave antes de continuar';
      isValid = false;
    }
  } else {
    // Validar nombre de empresa si se está creando nueva empresa
    if (!formData.value.empresa || formData.value.empresa.trim().length < 3) {
      errors.value.empresa = 'El nombre de la empresa es obligatorio';
      isValid = false;
    } else if (empresaExistente.value) {
      errors.value.empresa = 'Esta empresa ya está registrada';
      isValid = false;
    }

    // Validar RFC si se está creando nueva empresa
    const rfc = formData.value.rfc.trim();
    if (!rfc) {
      errors.value.rfc = 'El RFC es obligatorio';
      isValid = false;
    } else if (rfc.length !== 12) {
      errors.value.rfc = 'El RFC debe tener exactamente 12 caracteres';
      isValid = false;
    } else if (rfcExistente.value) {
      errors.value.rfc = 'Este RFC ya está registrado';
      isValid = false;
    } else {
      // Validar formato básico del RFC mexicano
      // Persona moral: 3 letras + 6 dígitos + 3 caracteres alfanuméricos
      // Persona física: 4 letras + 6 dígitos + 2 caracteres alfanuméricos
      const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/;
      if (!rfcRegex.test(rfc)) {
        errors.value.rfc = 'El formato del RFC no es válido';
        isValid = false;
      }
    }
  }

  return isValid;
}

const handleSubmit = async () => {
  // Limpiar errores previos
  errors.value = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    claveEmpresa: '',
    rfc: '',
    empresa: '',
  };

  // Verificar RFC y empresa antes de validar
  if (tipoRegistro.value === 'nueva') {
    await verificarRfc();
    await verificarEmpresa();
  }

  // Validar formulario
  if (!validateForm()) {
    return;
  }

  try {
    // Preparar datos para el registro
    const registerData: any = {
      email: formData.value.email,
      password: formData.value.password,
      nombre: formData.value.nombre,
    };

    // El teléfono siempre va en el usuario cliente, independientemente del tipo de registro
    if (formData.value.telefono) {
      registerData.telefono = formData.value.telefono;
    }

    // Si se está uniendo a empresa existente, agregar la clave
    if (tipoRegistro.value === 'existente' && formData.value.claveEmpresa) {
      registerData.claveEmpresa = formData.value.claveEmpresa.toUpperCase();
    } else {
      // Si es nueva empresa, agregar datos de la empresa
      if (formData.value.empresa) {
        registerData.empresa = formData.value.empresa;
      }
      if (formData.value.rfc) {
        registerData.rfc = formData.value.rfc.toUpperCase();
      }
    }

    // Registrar y hacer login automático
    await registerCliente(registerData);

    // Si el registro es exitoso, redirigir al portal cliente
    router.push('/cliente');
  } catch (err) {
    // El error ya está manejado en el store/composable
    console.error('Error al registrar:', err);
  }
};
</script>
