<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ maxTrabajadores === 1 ? 'Información del Trabajador' : 'Información de Trabajadores' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mt-1">
          {{ maxTrabajadores === 1 
            ? 'Proporciona la información del trabajador para continuar' 
            : `Agrega ${maxTrabajadores} trabajadores para continuar` }}
        </p>
      </div>

      <!-- Mensaje informativo -->
      <div v-if="mostrarMensajeInfo" class="px-6 py-3 bg-blue-50 border-b border-blue-200 relative">
        <button
          @click="mostrarMensajeInfo = false"
          class="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors"
          title="Ocultar mensaje"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div class="flex items-start gap-3 pr-6">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="font-medium text-blue-900 text-sm mb-1">
              Información requerida
            </h4>
            <p class="text-xs text-blue-800">
              <template v-if="maxTrabajadores === 1">
                Para aceptar esta cotización es necesario incluir la información del trabajador que será evaluado. 
                Al confirmar, la cotización será aceptada y se generará una orden de trabajo. Con esta información podremos gestionar su evaluación médica de manera adecuada.
              </template>
              <template v-else>
                Para aceptar esta cotización es necesario incluir la información de los trabajadores que serán evaluados. 
                Al confirmar, la cotización será aceptada y se generará una orden de trabajo. Con esta información podremos gestionar sus evaluaciones médicas de manera adecuada.
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-6 py-3 border-b border-gray-200 flex gap-2">
        <button
          @click="modo = 'manual'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            modo === 'manual'
              ? 'bg-medical-blue-100 text-medical-blue-700'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          {{ maxTrabajadores === 1 ? 'Agregar Trabajador' : 'Agregar Trabajadores' }}
        </button>
        <button
          @click="modo = 'excel'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            modo === 'excel'
              ? 'bg-medical-blue-100 text-medical-blue-700'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
        >
          Carga Masiva (Excel)
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">

        <!-- Modo Manual (Formulario + Lista combinados) -->
        <div v-if="modo === 'manual'" class="space-y-3">
          <!-- Versión generosa para un solo trabajador -->
          <template v-if="maxTrabajadores === 1 && trabajadores.length === 1 && trabajadores.length > 0">
            <div
              v-for="(trabajador, index) in trabajadores"
              :key="index"
              class="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              :class="{ 'ring-2 ring-medical-blue-300': indiceEditando === index }"
            >
              <!-- Header de la tarjeta -->
              <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div class="flex items-center gap-3">
                  <h4 class="text-lg font-semibold text-gray-900">
                    {{ trabajador.primerApellido }} {{ trabajador.segundoApellido ? trabajador.segundoApellido + ' ' : '' }}{{ trabajador.nombre }}
                  </h4>
                  <span v-if="trabajador.curp" class="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    CURP: {{ trabajador.curp }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="editarTrabajador(index)"
                    class="p-2 text-medical-blue-600 hover:bg-medical-blue-50 rounded-md transition-colors"
                    title="Editar trabajador"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="eliminarTrabajador(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar trabajador"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Contenido de la tarjeta -->
              <div class="px-6 py-5">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 text-sm">
                  <!-- Información Personal -->
                  <div class="space-y-3">
                    <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Información Personal</h5>
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Sexo:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ trabajador.sexo }}</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Fecha Nacimiento:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ formatDate(trabajador.fechaNacimiento) }}</span>
                      </div>
                    </div>
                    <div v-if="trabajador.estadoCivil" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Estado Civil:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ trabajador.estadoCivil }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Información Laboral -->
                  <div class="space-y-3">
                    <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Información Laboral</h5>
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Puesto:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ trabajador.puesto }}</span>
                      </div>
                    </div>
                    <div v-if="trabajador.fechaIngreso" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Fecha Ingreso:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ formatDate(trabajador.fechaIngreso) }}</span>
                      </div>
                    </div>
                    <div v-if="trabajador.escolaridad" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Escolaridad:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ trabajador.escolaridad }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Información de Contacto -->
                  <div class="space-y-3">
                    <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h5>
                    <div v-if="trabajador.telefono" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <span class="text-gray-500">Teléfono:</span>
                        <span class="ml-2 font-medium text-gray-900">{{ trabajador.telefono }}</span>
                      </div>
                    </div>
                    <div v-if="!trabajador.telefono" class="text-gray-400 text-xs italic">
                      Sin información de contacto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Versión compacta tipo tabla para múltiples trabajadores -->
          <template v-else-if="trabajadores.length > 0">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nacimiento</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(trabajador, index) in trabajadores"
                    :key="index"
                    class="hover:bg-gray-50 transition-colors"
                    :class="{ 'bg-medical-blue-50': indiceEditando === index }"
                  >
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div class="font-medium">
                        {{ trabajador.primerApellido }} {{ trabajador.segundoApellido ? trabajador.segundoApellido + ' ' : '' }}{{ trabajador.nombre }}
                      </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.puesto }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.sexo }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ formatDate(trabajador.fechaNacimiento) }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.telefono || '-' }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="editarTrabajador(index)"
                          class="p-1.5 text-medical-blue-600 hover:bg-medical-blue-50 rounded-md transition-colors"
                          title="Editar trabajador"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          @click="eliminarTrabajador(index)"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar trabajador"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Formulario para agregar/editar trabajador -->
          <div v-if="trabajadores.length < maxTrabajadores || indiceEditando !== null" class="border-2 border-dashed border-gray-300 rounded-lg p-4 max-w-2xl mx-auto">
            <h4 class="font-medium text-gray-900 mb-4">
              {{ indiceEditando !== null ? 'Editar Trabajador' : 'Agregar Nuevo Trabajador' }}
            </h4>
            <TrabajadorForm
              ref="trabajadorFormRef"
              v-model="trabajadorActual"
              :errors="erroresForm"
              :should-validate="shouldValidateForm"
              @update:model-value="handleTrabajadorUpdate"
              @update:errors="handleErroresUpdate"
              @validation-state="handleValidationState"
            />
            <div class="flex gap-3 mt-4">
              <button
                v-if="indiceEditando !== null"
                @click="cancelarEdicion"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                @click="indiceEditando !== null ? guardarEdicion() : agregarTrabajador()"
                :disabled="hasAttemptedSubmit && !isFormValid"
                class="flex-1 px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ indiceEditando !== null ? 'Guardar Cambios' : 'Agregar Trabajador' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="modo === 'excel'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Columna Izquierda: Zona de Carga (Drop Zone) -->
            <div
              class="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
              :class="[
                isDragging
                  ? 'border-medical-blue-500 bg-medical-blue-50'
                  : 'border-gray-300 hover:border-medical-blue-400 hover:bg-gray-50'
              ]"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".xlsx,.xls"
                @change="procesarArchivoExcel"
                class="hidden"
              />
              <div class="mb-4 p-4 rounded-full bg-blue-100 text-blue-600">
                <svg
                  class="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p class="text-lg font-medium text-gray-900 mb-1">
                Sube tu archivo Excel
              </p>
              <p class="text-sm text-gray-500 mb-4">
                Arrastra y suelta tu archivo aquí o haz clic para examinar
              </p>
              <button
                type="button"
                class="text-sm font-semibold text-medical-blue-600 hover:text-medical-blue-800"
              >
                Seleccionar archivo
              </button>
            </div>

            <!-- Columna Derecha: Instrucciones -->
            <div class="space-y-4">
               <div class="bg-blue-50 border border-blue-200 rounded-lg p-5 h-full">
                <h4 class="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instrucciones
                </h4>
                <ol class="list-decimal list-inside space-y-3 text-sm text-blue-800">
                  <li class="pl-2">
                    <span class="font-semibold">Descargue</span> la plantilla oficial para asegurar el formato correcto.
                  </li>
                  <li class="pl-2">
                    <span class="font-semibold">Llene</span> los datos de los trabajadores respetando las columnas.
                  </li>
                  <li class="pl-2">
                    <span class="font-semibold">Guarde</span> el archivo en su computadora.
                  </li>
                  <li class="pl-2">
                    <span class="font-semibold">Arrastre</span> el archivo al recuadro de la izquierda.
                  </li>
                </ol>
                
                <div class="mt-6 pt-4 border-t border-blue-200">
                   <button
                    @click.stop="descargarPlantilla"
                    class="w-full flex items-center justify-center px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar Plantilla Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="erroresExcel.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="font-medium text-red-900 mb-2">Errores encontrados:</h4>
            <ul class="space-y-1 text-sm text-red-800">
              <li
                v-for="(error, index) in erroresExcel"
                :key="index"
              >
                Fila {{ error.row }}, {{ error.field }}: {{ error.message }}
              </li>
            </ul>
          </div>

          <div v-if="trabajadoresExcel.length > 0" class="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h4 class="font-medium text-gray-900">
                Vista previa ({{ trabajadoresExcel.length }} trabajador{{ trabajadoresExcel.length > 1 ? 'es' : '' }})
              </h4>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nacimiento</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(trabajador, index) in trabajadoresExcel"
                    :key="index"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div class="font-medium">
                        {{ trabajador.primerApellido }} {{ trabajador.segundoApellido ? trabajador.segundoApellido + ' ' : '' }}{{ trabajador.nombre }}
                      </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.puesto }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.sexo }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ formatDate(trabajador.fechaNacimiento) }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {{ trabajador.telefono || '-' }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        @click="eliminarTrabajadorExcel(index)"
                        class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar trabajador"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                @click="confirmarExcel"
                :disabled="erroresExcel.length > 0"
                class="w-full px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Agregar {{ trabajadoresExcel.length }} trabajador{{ trabajadoresExcel.length > 1 ? 'es' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          <span :class="{ 'font-semibold text-green-600': trabajadores.length === maxTrabajadores }">
            {{ trabajadores.length }} de {{ maxTrabajadores }} trabajadores
          </span>
          <span v-if="trabajadores.length < maxTrabajadores" class="text-gray-500 ml-2">
            (Faltan {{ maxTrabajadores - trabajadores.length }})
          </span>
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="confirmar"
            :disabled="trabajadores.length !== maxTrabajadores"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Confirmar ({{ trabajadores.length }}/{{ maxTrabajadores }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CreateTrabajadorDto } from '../../types/backend';
import {
  generarPlantillaExcel,
  leerArchivoExcel,
  type ExcelValidationError,
} from '../../utils/excelHelper';
import TrabajadorForm from './TrabajadorForm.vue';

interface Props {
  mostrar: boolean;
  maxTrabajadores: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [trabajadores: CreateTrabajadorDto[]];
}>();

const modo = ref<'manual' | 'excel'>('manual');
const trabajadores = ref<CreateTrabajadorDto[]>([]);
const trabajadorActual = ref<CreateTrabajadorDto>(crearTrabajadorVacio());
const indiceEditando = ref<number | null>(null);
const trabajadoresExcel = ref<CreateTrabajadorDto[]>([]);
const erroresExcel = ref<ExcelValidationError[]>([]);
const erroresForm = ref<Record<string, string>>({});
const trabajadorFormRef = ref<InstanceType<typeof TrabajadorForm> | null>(null);
const shouldValidateForm = ref(false);
const isFormValid = ref(true); // Inicialmente true para permitir intentar avanzar
const hasAttemptedSubmit = ref(false); // Indica si se ha intentado avanzar
const mostrarMensajeInfo = ref(true); // Controla la visibilidad del mensaje informativo

// Funcionalidad Drag & Drop
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      procesarArchivo(file);
    } else {
      alert('Por favor, sube un archivo Excel válido (.xlsx o .xls)');
    }
  }
}

// Wrapper para input change normal
function procesarArchivoExcel(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    procesarArchivo(file);
  }
}

// Lógica principal de procesamiento (separada/refactorizada)
async function procesarArchivo(file: File) {
  erroresExcel.value = [];
  trabajadoresExcel.value = [];
  
  try {
    const { trabajadores: trabajadoresLeidos, errores } = await leerArchivoExcel(file);
    
    if (errores.length > 0) {
      erroresExcel.value = errores;
    }
    
    if (trabajadoresLeidos.length > 0) {
      trabajadoresExcel.value = trabajadoresLeidos;
    }

    // Validar que no haya errores de formato antes de validar cantidad
    if (errores.length === 0 && trabajadoresLeidos.length > 0) {
      // Validar cantidad exacta requerida (incluyendo trabajadores ya agregados manualmente)
      const totalTrabajadores = trabajadores.value.length + trabajadoresLeidos.length;
      
      if (totalTrabajadores > props.maxTrabajadores) {
        erroresExcel.value.push({
          row: 0,
          field: 'cantidad',
          message: `Se requieren exactamente ${props.maxTrabajadores} trabajador${props.maxTrabajadores > 1 ? 'es' : ''}. El total excedería el límite. Ya tienes ${trabajadores.value.length} trabajador${trabajadores.value.length !== 1 ? 'es' : ''} agregado${trabajadores.value.length !== 1 ? 's' : ''}.`,
        });
      } else if (totalTrabajadores < props.maxTrabajadores) {
        erroresExcel.value.push({
          row: 0,
          field: 'cantidad',
          message: `Se requieren exactamente ${props.maxTrabajadores} trabajador${props.maxTrabajadores > 1 ? 'es' : ''}. Faltan ${props.maxTrabajadores - totalTrabajadores} trabajador${props.maxTrabajadores - totalTrabajadores > 1 ? 'es' : ''}.`,
        });
      }
    }
  } catch (error) {
    console.error('Error al procesar Excel:', error);
    erroresExcel.value = [{
       row: 0,
       field: 'archivo',
       message: 'Error al procesar el archivo Excel. Asegúrese de que el formato sea correcto.',
    }];
  }
}


function crearTrabajadorVacio(): CreateTrabajadorDto {
  return {
    primerApellido: '',
    segundoApellido: '',
    nombre: '',
    fechaNacimiento: '',
    sexo: '',
    escolaridad: '',
    puesto: '',
    fechaIngreso: '',
    telefono: '',
    estadoCivil: '',
    curp: '',
  };
}

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

// Manejar actualización del trabajador desde el formulario
function handleTrabajadorUpdate(nuevoTrabajador: CreateTrabajadorDto) {
  trabajadorActual.value = nuevoTrabajador;
  // Validar campos requeridos cuando cambian (solo campos que el formulario no valida)
  validarCamposRequeridos(nuevoTrabajador);
}

// Manejar actualización de errores desde el formulario
function handleValidationState(isValid: boolean) {
  // Actualizar el estado de validación del formulario
  isFormValid.value = isValid;
}

function handleErroresUpdate(nuevosErrores: Record<string, string>) {
  // El formulario ya valida fechas y campos básicos, así que respetamos sus errores
  // Solo agregamos validaciones adicionales para campos que el formulario no valida directamente
  const erroresCombinados = { ...nuevosErrores };
  
  // Validar campos requeridos que el formulario no valida directamente
  // (sexo, escolaridad, estadoCivil, teléfono, CURP)
  const trabajador = trabajadorActual.value;
  
  // Validar sexo (requerido)
  if (!trabajador.sexo || trabajador.sexo.trim() === '') {
    erroresCombinados.sexo = 'El sexo es requerido';
  } else {
    delete erroresCombinados.sexo;
  }
  
  // Validar escolaridad (requerida)
  if (!trabajador.escolaridad || trabajador.escolaridad.trim() === '') {
    erroresCombinados.escolaridad = 'La escolaridad es requerida';
  } else {
    delete erroresCombinados.escolaridad;
  }
  
  // Validar estado civil (requerido)
  if (!trabajador.estadoCivil || trabajador.estadoCivil.trim() === '') {
    erroresCombinados.estadoCivil = 'El estado civil es requerido';
  } else {
    delete erroresCombinados.estadoCivil;
  }
  
  // Validar teléfono (opcional)
  if (trabajador.telefono && trabajador.telefono.trim() !== '') {
    const telefonoRegex = /^\+?[0-9]\d{3,14}$/;
    if (!telefonoRegex.test(trabajador.telefono)) {
      erroresCombinados.telefono = 'Formato de teléfono inválido';
    } else {
      delete erroresCombinados.telefono;
    }
  } else {
    delete erroresCombinados.telefono;
  }
  
  // Validar CURP (opcional)
  if (trabajador.curp && trabajador.curp.trim() !== '') {
    const curpRegex = /^[A-Za-z0-9\s\-_.\/#]{4,30}$/;
    if (!curpRegex.test(trabajador.curp)) {
      erroresCombinados.curp = 'Formato de CURP inválido';
    } else {
      delete erroresCombinados.curp;
    }
  } else {
    delete erroresCombinados.curp;
  }
  
  erroresForm.value = erroresCombinados;
}

// Validar solo campos requeridos sin sobrescribir errores existentes
function validarCamposRequeridos(
  trabajador: CreateTrabajadorDto,
  errores: Record<string, string> = erroresForm.value,
): void {
  // Solo agregar errores si el campo está vacío/inválido y no hay error ya establecido
  if (!trabajador.primerApellido.trim() && !errores.primerApellido) {
    errores.primerApellido = 'El primer apellido es requerido';
  } else if (trabajador.primerApellido.trim() && errores.primerApellido === 'El primer apellido es requerido') {
    delete errores.primerApellido;
  }
  
  if (!trabajador.nombre.trim() && !errores.nombre) {
    errores.nombre = 'El nombre es requerido';
  } else if (trabajador.nombre.trim() && errores.nombre === 'El nombre es requerido') {
    delete errores.nombre;
  }
  
  // Validar fecha de nacimiento (requerida)
  if (!trabajador.fechaNacimiento || trabajador.fechaNacimiento.trim() === '') {
    if (!errores.fechaNacimiento) {
      errores.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }
  } else if (!validarFechaISO(trabajador.fechaNacimiento)) {
    if (!errores.fechaNacimiento || errores.fechaNacimiento === 'La fecha de nacimiento es requerida') {
      errores.fechaNacimiento = 'La fecha de nacimiento debe tener un formato válido (DD/MM/AAAA)';
    }
  } else {
    delete errores.fechaNacimiento;
  }
  
  if (!trabajador.puesto.trim() && !errores.puesto) {
    errores.puesto = 'El puesto es requerido';
  } else if (trabajador.puesto.trim() && errores.puesto === 'El puesto es requerido') {
    delete errores.puesto;
  }
  
  // Validar sexo (requerido)
  if (!trabajador.sexo || trabajador.sexo.trim() === '') {
    if (!errores.sexo) {
      errores.sexo = 'El sexo es requerido';
    }
  } else {
    delete errores.sexo;
  }
  
  // Validar escolaridad (requerida)
  if (!trabajador.escolaridad || trabajador.escolaridad.trim() === '') {
    if (!errores.escolaridad) {
      errores.escolaridad = 'La escolaridad es requerida';
    }
  } else {
    delete errores.escolaridad;
  }
  
  // Validar estado civil (requerido)
  if (!trabajador.estadoCivil || trabajador.estadoCivil.trim() === '') {
    if (!errores.estadoCivil) {
      errores.estadoCivil = 'El estado civil es requerido';
    }
  } else {
    delete errores.estadoCivil;
  }
  
  // Validar fecha de ingreso (opcional pero si se proporciona debe ser válida)
  if (trabajador.fechaIngreso && trabajador.fechaIngreso.trim() !== '') {
    if (!validarFechaISO(trabajador.fechaIngreso)) {
      if (!errores.fechaIngreso) {
        errores.fechaIngreso = 'La fecha de ingreso debe tener un formato válido (DD/MM/AAAA)';
      }
    } else {
      delete errores.fechaIngreso;
    }
  } else {
    delete errores.fechaIngreso;
  }
  
  // Validar teléfono (opcional)
  if (trabajador.telefono && trabajador.telefono.trim() !== '') {
    const telefonoRegex = /^\+?[0-9]\d{3,14}$/;
    if (!telefonoRegex.test(trabajador.telefono)) {
      if (!errores.telefono) {
        errores.telefono = 'Formato de teléfono inválido';
      }
    } else {
      delete errores.telefono;
    }
  } else {
    delete errores.telefono;
  }
  
  // Validar CURP (opcional)
  if (trabajador.curp && trabajador.curp.trim() !== '') {
    const curpRegex = /^[A-Za-z0-9\s\-_.\/#]{4,30}$/;
    if (!curpRegex.test(trabajador.curp)) {
      if (!errores.curp) {
        errores.curp = 'Formato de CURP inválido';
      }
    } else {
      delete errores.curp;
    }
  } else {
    delete errores.curp;
  }
}

function validarTrabajador(trabajador: CreateTrabajadorDto): boolean {
  // Usar la función de validación que respeta los errores existentes
  const errores: Record<string, string> = {};
  validarCamposRequeridos(trabajador, errores);
  erroresForm.value = errores;
  
  return Object.keys(erroresForm.value).length === 0;
}

function agregarTrabajador() {
  // Marcar que se ha intentado avanzar
  hasAttemptedSubmit.value = true;
  
  // Activar validación para mostrar errores
  shouldValidateForm.value = true;
  
  // Validar usando el formulario
  if (trabajadorFormRef.value) {
    trabajadorFormRef.value.validate();
  }
  
  // Validar antes de agregar
  if (!validarTrabajador(trabajadorActual.value)) {
    // Los errores ya están en erroresForm.value
    return;
  }

  // Verificar que no haya errores pendientes
  if (Object.keys(erroresForm.value).length > 0) {
    return;
  }
  
  // Desactivar validación después de agregar exitosamente
  shouldValidateForm.value = false;
  hasAttemptedSubmit.value = false; // Resetear para el siguiente trabajador
  trabajadores.value.push({ ...trabajadorActual.value });
  trabajadorActual.value = crearTrabajadorVacio();
  erroresForm.value = {};
  isFormValid.value = true; // Resetear estado de validación
}

function editarTrabajador(index: number) {
  const trabajador = trabajadores.value[index];
  if (!trabajador) return;
  
  indiceEditando.value = index;
  erroresForm.value = {}; // Limpiar errores anteriores
  shouldValidateForm.value = false; // Desactivar validación al editar
  hasAttemptedSubmit.value = false; // Resetear intento de submit
  isFormValid.value = true; // Asumir válido al cargar datos existentes
  
  // Crear una copia completa del trabajador
  trabajadorActual.value = {
    primerApellido: trabajador.primerApellido,
    segundoApellido: trabajador.segundoApellido,
    nombre: trabajador.nombre,
    fechaNacimiento: trabajador.fechaNacimiento,
    sexo: trabajador.sexo,
    escolaridad: trabajador.escolaridad,
    puesto: trabajador.puesto,
    fechaIngreso: trabajador.fechaIngreso,
    telefono: trabajador.telefono,
    estadoCivil: trabajador.estadoCivil,
    curp: trabajador.curp,
  };
  
  // Esperar a que Vue renderice el formulario antes de hacer scroll y validar
  setTimeout(() => {
    // Validar inmediatamente las fechas del trabajador cargado
    if (trabajadorActual.value.fechaNacimiento) {
      if (!validarFechaISO(trabajadorActual.value.fechaNacimiento)) {
        erroresForm.value.fechaNacimiento = 'La fecha de nacimiento debe tener un formato válido (DD/MM/AAAA)';
      }
    }
    if (trabajadorActual.value.fechaIngreso) {
      if (!validarFechaISO(trabajadorActual.value.fechaIngreso)) {
        erroresForm.value.fechaIngreso = 'La fecha de ingreso debe tener un formato válido (DD/MM/AAAA)';
      }
    }
    
    // Scroll al formulario después de que se renderice
    const formElement = document.querySelector('.border-2.border-dashed');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 150);
}

function guardarEdicion() {
  if (indiceEditando.value === null) return;
  
  // Marcar que se ha intentado avanzar
  hasAttemptedSubmit.value = true;
  
  // Activar validación para mostrar errores
  shouldValidateForm.value = true;
  
  // Validar usando el formulario
  if (trabajadorFormRef.value) {
    trabajadorFormRef.value.validate();
  }
  
  // Validar antes de guardar
  if (!validarTrabajador(trabajadorActual.value)) {
    // Los errores ya están en erroresForm.value
    return;
  }

  // Verificar que no haya errores pendientes
  if (Object.keys(erroresForm.value).length > 0) {
    return;
  }
  
  // Desactivar validación después de guardar exitosamente
  shouldValidateForm.value = false;
  hasAttemptedSubmit.value = false; // Resetear para el siguiente trabajador

  trabajadores.value[indiceEditando.value] = { ...trabajadorActual.value };
  cancelarEdicion();
}

function cancelarEdicion() {
  indiceEditando.value = null;
  trabajadorActual.value = crearTrabajadorVacio();
  erroresForm.value = {};
  shouldValidateForm.value = false; // Desactivar validación al cancelar
  hasAttemptedSubmit.value = false; // Resetear intento de submit
  isFormValid.value = true; // Resetear estado de validación
}

function eliminarTrabajador(index: number) {
  if (indiceEditando.value === index) {
    cancelarEdicion();
  }
  trabajadores.value.splice(index, 1);
}

async function descargarPlantilla() {
  await generarPlantillaExcel();
}



function eliminarTrabajadorExcel(index: number) {
  trabajadoresExcel.value.splice(index, 1);
  // Limpiar errores relacionados con la fila eliminada si es necesario
  erroresExcel.value = erroresExcel.value.filter(
    (error) => error.row !== index + 2, // +2 porque el índice empieza en 0 y hay header
  );
  // Ajustar números de fila de los errores restantes
  erroresExcel.value = erroresExcel.value.map((error) => {
    if (error.row > index + 2) {
      return { ...error, row: error.row - 1 };
    }
    return error;
  });
  
  // Validar cantidad exacta después de eliminar
  const totalTrabajadores =
    trabajadores.value.length + trabajadoresExcel.value.length;
  if (totalTrabajadores === props.maxTrabajadores) {
    // Si se alcanza la cantidad exacta, eliminar el error de cantidad
    erroresExcel.value = erroresExcel.value.filter(
      (error) => error.field !== 'cantidad',
    );
  } else if (totalTrabajadores < props.maxTrabajadores) {
    // Actualizar el mensaje de error si falta cantidad
    const errorCantidad = erroresExcel.value.find((e) => e.field === 'cantidad');
    if (errorCantidad) {
      errorCantidad.message = `Se requieren exactamente ${props.maxTrabajadores} trabajador${props.maxTrabajadores > 1 ? 'es' : ''}. Faltan ${props.maxTrabajadores - totalTrabajadores} trabajador${props.maxTrabajadores - totalTrabajadores > 1 ? 'es' : ''}.`;
    }
  }
}

// Función para limpiar campos opcionales vacíos antes de enviar
function limpiarTrabajador(trabajador: CreateTrabajadorDto): CreateTrabajadorDto {
  const limpio: CreateTrabajadorDto = {
    primerApellido: trabajador.primerApellido,
    nombre: trabajador.nombre,
    fechaNacimiento: trabajador.fechaNacimiento,
    sexo: trabajador.sexo,
    escolaridad: trabajador.escolaridad,
    puesto: trabajador.puesto,
    estadoCivil: trabajador.estadoCivil,
  };

  // Solo incluir campos opcionales si tienen valor
  if (trabajador.segundoApellido && trabajador.segundoApellido.trim() !== '') {
    limpio.segundoApellido = trabajador.segundoApellido;
  }
  if (trabajador.fechaIngreso && trabajador.fechaIngreso.trim() !== '') {
    limpio.fechaIngreso = trabajador.fechaIngreso;
  }
  if (trabajador.telefono && trabajador.telefono.trim() !== '') {
    limpio.telefono = trabajador.telefono;
  }
  if (trabajador.curp && trabajador.curp.trim() !== '') {
    limpio.curp = trabajador.curp;
  }

  return limpio;
}

function confirmarExcel() {
  if (erroresExcel.value.length > 0) return;
  if (trabajadoresExcel.value.length === 0) return;

  // Validar cantidad exacta requerida
  const totalTrabajadores =
    trabajadores.value.length + trabajadoresExcel.value.length;
  if (totalTrabajadores !== props.maxTrabajadores) {
    erroresExcel.value = [
      {
        row: 0,
        field: 'cantidad',
        message: `Se requieren exactamente ${props.maxTrabajadores} trabajador${props.maxTrabajadores > 1 ? 'es' : ''}. El total actual es ${totalTrabajadores}.`,
      },
    ];
    return;
  }

  // Limpiar trabajadores de Excel antes de agregarlos
  const trabajadoresExcelLimpios = trabajadoresExcel.value.map(limpiarTrabajador);
  trabajadores.value.push(...trabajadoresExcelLimpios);
  trabajadoresExcel.value = [];
  erroresExcel.value = [];
  modo.value = 'manual';
  
  // Nota: No emitimos 'confirm' aquí porque el usuario aún puede agregar más trabajadores manualmente
  // El usuario debe hacer clic en "Confirmar" del footer para finalizar
}

function formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    const fecha = new Date(date);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
}

function confirmar() {
  // Validar que se hayan agregado exactamente el número requerido de trabajadores
  if (trabajadores.value.length !== props.maxTrabajadores) {
    alert(`Debe agregar exactamente ${props.maxTrabajadores} trabajador${props.maxTrabajadores > 1 ? 'es' : ''} para continuar.`);
    return;
  }

  console.log('Confirmando trabajadores:', trabajadores.value.length, trabajadores.value);
  // Limpiar trabajadores antes de emitir (eliminar campos opcionales vacíos)
  const trabajadoresLimpios = trabajadores.value.map(limpiarTrabajador);
  // Emitir el evento con los trabajadores limpios
  emit('confirm', trabajadoresLimpios);
}

// Resetear cuando se cierra el modal
watch(
  () => props.mostrar,
  (nuevoValor, valorAnterior) => {
    // Solo resetear si el modal se está cerrando (de true a false)
    // y no si se está abriendo (de false a true)
    if (!nuevoValor && valorAnterior) {
      // Usar setTimeout para asegurar que el evento 'confirm' se procese primero
      setTimeout(() => {
        trabajadores.value = [];
        trabajadorActual.value = crearTrabajadorVacio();
        indiceEditando.value = null;
        trabajadoresExcel.value = [];
        erroresExcel.value = [];
        erroresForm.value = {};
        modo.value = 'manual';
        shouldValidateForm.value = false; // Desactivar validación al cerrar
        hasAttemptedSubmit.value = false; // Resetear intento de submit
        isFormValid.value = true; // Resetear estado de validación
        mostrarMensajeInfo.value = true; // Mostrar mensaje informativo al abrir de nuevo
      }, 100);
    }
  },
);
</script>

