<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Primer Apellido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Primer Apellido <span class="text-red-500">*</span>
        </label>
        <input
          v-model="localTrabajador.primerApellido"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.primerApellido }"
          @input="actualizar"
        />
        <p v-if="errors.primerApellido" class="mt-1 text-sm text-red-600">
          {{ errors.primerApellido }}
        </p>
      </div>

      <!-- Segundo Apellido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Segundo Apellido
        </label>
        <input
          v-model="localTrabajador.segundoApellido"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          @input="actualizar"
        />
      </div>

      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nombre(s) <span class="text-red-500">*</span>
        </label>
        <input
          v-model="localTrabajador.nombre"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.nombre }"
          @input="actualizar"
        />
        <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">
          {{ errors.nombre }}
        </p>
      </div>

      <!-- Fecha de Nacimiento -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Nacimiento <span class="text-red-500">*</span>
        </label>
        <input
          v-model="localTrabajador.fechaNacimiento"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.fechaNacimiento }"
          @input="actualizar"
        />
        <p v-if="errors.fechaNacimiento" class="mt-1 text-sm text-red-600">
          {{ errors.fechaNacimiento }}
        </p>
      </div>

      <!-- Sexo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Sexo <span class="text-red-500">*</span>
        </label>
        <select
          v-model="localTrabajador.sexo"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.sexo }"
          @change="actualizar"
        >
          <option value="" disabled>Seleccionar</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
        <p v-if="errors.sexo" class="mt-1 text-sm text-red-600">
          {{ errors.sexo }}
        </p>
      </div>

      <!-- Escolaridad -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Escolaridad <span class="text-red-500">*</span>
        </label>
        <select
          v-model="localTrabajador.escolaridad"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.escolaridad }"
          @change="actualizar"
        >
          <option value="" disabled>Seleccionar</option>
          <option value="Primaria">Primaria</option>
          <option value="Secundaria">Secundaria</option>
          <option value="Preparatoria">Preparatoria</option>
          <option value="Licenciatura">Licenciatura</option>
          <option value="Maestría">Maestría</option>
          <option value="Doctorado">Doctorado</option>
          <option value="Nula">Nula</option>
        </select>
        <p v-if="errors.escolaridad" class="mt-1 text-sm text-red-600">
          {{ errors.escolaridad }}
        </p>
      </div>

      <!-- Puesto -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Puesto <span class="text-red-500">*</span>
        </label>
        <input
          v-model="localTrabajador.puesto"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.puesto }"
          @input="actualizar"
        />
        <p v-if="errors.puesto" class="mt-1 text-sm text-red-600">
          {{ errors.puesto }}
        </p>
      </div>

      <!-- Estado Civil -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Estado Civil <span class="text-red-500">*</span>
        </label>
        <select
          v-model="localTrabajador.estadoCivil"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.estadoCivil }"
          @change="actualizar"
        >
          <option value="" disabled>Seleccionar</option>
          <option value="Soltero/a">Soltero/a</option>
          <option value="Casado/a">Casado/a</option>
          <option value="Unión libre">Unión libre</option>
          <option value="Separado/a">Separado/a</option>
          <option value="Divorciado/a">Divorciado/a</option>
          <option value="Viudo/a">Viudo/a</option>
        </select>
        <p v-if="errors.estadoCivil" class="mt-1 text-sm text-red-600">
          {{ errors.estadoCivil }}
        </p>
      </div>

      <!-- Teléfono -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          v-model="localTrabajador.telefono"
          type="text"
          placeholder="6641234567"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.telefono }"
          @input="actualizar"
        />
        <p v-if="errors.telefono" class="mt-1 text-sm text-red-600">
          {{ errors.telefono }}
        </p>
      </div>

      <!-- Fecha de Ingreso -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Ingreso
        </label>
        <input
          v-model="localTrabajador.fechaIngreso"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          :class="{ 'border-red-500': errors.fechaIngreso }"
          @input="actualizar"
        />
        <p v-if="errors.fechaIngreso" class="mt-1 text-sm text-red-600">
          {{ errors.fechaIngreso }}
        </p>
      </div>

      <!-- CURP -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          CURP
        </label>
        <input
          v-model="localTrabajador.curp"
          type="text"
          placeholder="GALJ900115HDFRZN01"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
          :class="{ 'border-red-500': errors.curp }"
          @input="actualizar"
        />
        <p v-if="errors.curp" class="mt-1 text-sm text-red-600">
          {{ errors.curp }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { CreateTrabajadorDto } from '../../types/backend';

interface Props {
  modelValue: CreateTrabajadorDto;
  errors?: Record<string, string>;
  shouldValidate?: boolean; // Controla si se deben mostrar errores
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  shouldValidate: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: CreateTrabajadorDto];
  'update:errors': [errors: Record<string, string>];
  'validate': [errors: Record<string, string>];
  'validation-state': [isValid: boolean]; // Nuevo evento para el estado de validación
}>();

const localTrabajador = ref<CreateTrabajadorDto>({ ...props.modelValue });
const erroresLocales = ref<Record<string, string>>({});
const erroresSilenciosos = ref<Record<string, string>>({}); // Errores para validación silenciosa

watch(
  () => props.modelValue,
  (nuevoValor) => {
    localTrabajador.value = { ...nuevoValor };
    // Validar silenciosamente cuando cambia el modelo
    validarSilenciosamente();
    // Si shouldValidate está activado, también mostrar errores
    if (props.shouldValidate) {
      validarTodosLosCampos();
    }
  },
  { deep: true },
);

watch(
  () => props.shouldValidate,
  (nuevoValor) => {
    if (nuevoValor) {
      validarTodosLosCampos();
    } else {
      // Limpiar errores cuando shouldValidate es false
      erroresLocales.value = {};
      emit('update:errors', {});
    }
  },
);

watch(
  () => props.errors,
  (nuevosErrores) => {
    erroresLocales.value = { ...nuevosErrores };
  },
  { deep: true, immediate: true },
);

function validarFechaISO(fecha: string | undefined): boolean {
  if (!fecha || fecha.trim() === '') return false;
  
  // El input type="date" siempre devuelve formato ISO 8601 (YYYY-MM-DD)
  // Validar formato estricto: exactamente 4 dígitos para año, 2 para mes, 2 para día
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(fecha)) {
    return false;
  }
  
  // Validar que sea una fecha válida
  const partes = fecha.split('-');
  if (partes.length !== 3) return false;
  
  // Validar que cada parte tenga la longitud correcta (año: 4 dígitos, mes: 2, día: 2)
  // Esto previene años con dígitos extra como 20245
  if (!partes[0] || !partes[1] || !partes[2]) return false;
  if (partes[0].length !== 4 || partes[1].length !== 2 || partes[2].length !== 2) {
    return false;
  }
  
  const año = parseInt(partes[0] || '0', 10);
  const mes = parseInt(partes[1] || '0', 10);
  const dia = parseInt(partes[2] || '0', 10);
  
  // Validar rangos válidos
  if (isNaN(año) || año < 1900 || año > 2100) return false;
  if (isNaN(mes) || mes < 1 || mes > 12) return false;
  if (isNaN(dia) || dia < 1 || dia > 31) return false;
  
  // Crear objeto Date y validar que la fecha sea válida
  // Usar mes - 1 porque Date usa índice 0-11 para meses
  const fechaObj = new Date(año, mes - 1, dia);
  
  // Verificar que la fecha creada coincide con los valores ingresados
  // Esto detecta fechas inválidas como 2024-02-30 (febrero no tiene 30 días)
  // También detecta años con dígitos extra como 20245
  if (
    fechaObj.getFullYear() !== año ||
    fechaObj.getMonth() + 1 !== mes ||
    fechaObj.getDate() !== dia
  ) {
    return false;
  }
  
  return true;
}

// La función validarFecha ya no se usa directamente
// Todo se maneja en validarSilenciosamente() y validarTodosLosCampos()

// Función para validar silenciosamente (sin mostrar errores, solo para estado del botón)
function validarSilenciosamente() {
  erroresSilenciosos.value = {};
  
  // Validar campos requeridos de texto
  if (!localTrabajador.value.primerApellido.trim()) {
    erroresSilenciosos.value.primerApellido = 'El primer apellido es requerido';
  }
  if (!localTrabajador.value.nombre.trim()) {
    erroresSilenciosos.value.nombre = 'El nombre es requerido';
  }
  if (!localTrabajador.value.puesto.trim()) {
    erroresSilenciosos.value.puesto = 'El puesto es requerido';
  }
  
  // Validar selects
  if (!localTrabajador.value.sexo || localTrabajador.value.sexo.trim() === '') {
    erroresSilenciosos.value.sexo = 'El sexo es requerido';
  }
  if (!localTrabajador.value.escolaridad || localTrabajador.value.escolaridad.trim() === '') {
    erroresSilenciosos.value.escolaridad = 'La escolaridad es requerida';
  }
  if (!localTrabajador.value.estadoCivil || localTrabajador.value.estadoCivil.trim() === '') {
    erroresSilenciosos.value.estadoCivil = 'El estado civil es requerido';
  }
  
  // Validar fecha de nacimiento (requerida)
  if (!localTrabajador.value.fechaNacimiento || !validarFechaISO(localTrabajador.value.fechaNacimiento)) {
    erroresSilenciosos.value.fechaNacimiento = 'La fecha de nacimiento es requerida';
  }
  
  // Validar fecha de ingreso (opcional, solo si tiene valor)
  if (localTrabajador.value.fechaIngreso && !validarFechaISO(localTrabajador.value.fechaIngreso)) {
    erroresSilenciosos.value.fechaIngreso = 'La fecha debe tener un formato válido';
  }
  
  // Validar teléfono (opcional, solo si tiene valor)
  if (localTrabajador.value.telefono && localTrabajador.value.telefono.trim() !== '') {
    const telefonoRegex = /^\+?[0-9]\d{3,14}$/;
    if (!telefonoRegex.test(localTrabajador.value.telefono)) {
      erroresSilenciosos.value.telefono = 'Formato de teléfono inválido';
    }
  }
  
  // Validar CURP (opcional, solo si tiene valor)
  if (localTrabajador.value.curp && localTrabajador.value.curp.trim() !== '') {
    const curpRegex = /^[A-Za-z0-9\s\-_.\/#]{4,30}$/;
    if (!curpRegex.test(localTrabajador.value.curp)) {
      erroresSilenciosos.value.curp = 'Formato de CURP inválido';
    }
  }
  
  // Emitir estado de validación (true si no hay errores)
  const isValid = Object.keys(erroresSilenciosos.value).length === 0;
  emit('validation-state', isValid);
}

// Función para validar todos los campos y mostrar errores
function validarTodosLosCampos() {
  // Copiar errores silenciosos a errores locales para mostrarlos
  erroresLocales.value = { ...erroresSilenciosos.value };
  
  // Emitir errores actualizados
  emit('update:errors', erroresLocales.value);
  emit('validate', erroresLocales.value);
}

function actualizar() {
  // Actualizar el modelo
  emit('update:modelValue', { ...localTrabajador.value });
  
  // Validar silenciosamente para habilitar/deshabilitar el botón
  validarSilenciosamente();
  
  // Si shouldValidate está activado, también validar y mostrar errores
  if (props.shouldValidate) {
    validarTodosLosCampos();
  }
}

// Las funciones individuales de validación ya no se usan directamente
// Todo se maneja en validarSilenciosamente() y validarTodosLosCampos()

// Computed para combinar errores locales y props
const errors = computed(() => {
  // Solo mostrar errores si shouldValidate es true
  if (!props.shouldValidate) {
    return {};
  }
  return {
    ...erroresLocales.value,
    ...props.errors,
  };
});

// Exponer función de validación para que el padre pueda llamarla
defineExpose({
  validate: validarTodosLosCampos,
});
</script>


