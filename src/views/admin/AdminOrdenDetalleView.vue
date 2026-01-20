<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton to="/admin/ordenes" class="mb-4" default-text="Volver a Órdenes de Trabajo"/>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      Detalle de Orden de Trabajo
    </h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Mensaje de éxito -->
    <div
      v-if="successMessage"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {{ successMessage }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingOrdenes && !ordenDetalle"
      message="Cargando detalle de la orden de trabajo..."
    />

    <div v-else-if="ordenDetalle" class="space-y-4 md:space-y-6">
      <!-- Estado destacado -->
      <div
        :class="getEstadoBannerClass(ordenDetalle.estado)"
        class="rounded-lg border-2 shadow-lg p-4 sm:p-5 md:p-6"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div
              :class="getEstadoIconClass(ordenDetalle.estado)"
              class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="ordenDetalle.estado === 'pendiente'"
                class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="ordenDetalle.estado === 'en_proceso'"
                class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <svg
                v-else-if="ordenDetalle.estado === 'completada'"
                class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="ordenDetalle.estado === 'cancelada'"
                class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-medium opacity-75 mb-1">Estado de la Orden</p>
              <h3
                :class="getEstadoTextClass(ordenDetalle.estado)"
                class="text-xl sm:text-2xl md:text-3xl font-bold"
              >
                {{ getEstadoLabel(ordenDetalle.estado) }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Desde {{ formatDateTime(getEstadoTimestamp(ordenDetalle.estado)) }}
              </p>
            </div>
          </div>
          <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
            <div class="text-left md:text-right">
              <p class="text-xs sm:text-sm font-medium opacity-75 mb-1">Folio</p>
              <p class="text-base sm:text-lg font-mono font-bold">
                {{ ordenDetalle.folio }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Información General -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información General
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Folio
            </label>
            <p
              class="text-sm md:text-base text-gray-900 font-mono font-semibold"
            >
              {{ ordenDetalle.folio }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Estado
            </label>
            <span
              :class="getEstadoBadgeClass(ordenDetalle.estado)"
              class="inline-block px-4 py-2 text-xs md:text-sm font-semibold rounded-lg"
            >
              {{ getEstadoLabel(ordenDetalle.estado) }}
            </span>
          </div>

          <div v-if="getSedeNombre()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Sede
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getSedeNombre() }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de creación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(ordenDetalle.fechaCreacion) }}
            </p>
          </div>

          <div v-if="ordenDetalle.fechaInicio">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de inicio
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(ordenDetalle.fechaInicio) }}
            </p>
          </div>

          <div v-if="ordenDetalle.fechaCompletacion">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de completación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(ordenDetalle.fechaCompletacion) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Descargar
            </label>
            <button
              type="button"
              @click="handleDownloadPDF"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors"
            >
              <svg
                class="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Descargar PDF
            </button>
          </div>

          <div v-if="ordenDetalle.cotizacionId">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Cotización Asociada
            </label>
            <router-link
              :to="{
                name: 'admin-cotizacion-detalle',
                params: { id: ordenDetalle.cotizacionId },
              }"
              class="inline-flex items-center text-sm md:text-base text-medical-blue-600 hover:text-medical-blue-900 font-medium font-mono"
            >
              {{ ordenDetalle.cotizacion?.folio || ordenDetalle.cotizacionId }}
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Información del Cliente -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información del Cliente
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div v-if="getClienteNombre()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Empresa
            </label>
            <p class="text-sm md:text-base text-gray-900 font-medium">
              {{ getClienteNombre() }}
            </p>
          </div>

          <div v-if="getClienteRfc()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              RFC
            </label>
            <p class="text-sm md:text-base text-gray-900 font-mono uppercase">
              {{ getClienteRfc() }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Nombre del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteNombre() || '-' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Correo del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteEmail() || '-' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Teléfono del cliente/usuario
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteTelefono() || '-' }}
            </p>
          </div>

          <div v-if="getClienteId()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Cliente
            </label>
            <router-link
              :to="{
                name: 'admin-cliente-detalle',
                params: { id: getClienteId()! },
              }"
              class="inline-flex items-center text-sm md:text-base text-medical-blue-600 hover:text-medical-blue-900 font-medium"
            >
              Ver detalle del cliente
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Servicios contratados -->
      <div
        v-if="ordenDetalle.cotizacion?.items && ordenDetalle.cotizacion.items.length > 0"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Servicios Contratados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
                >
                  Servicio
                </th>
                <th
                  class="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descripción
                </th>
                <th
                  class="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(item, index) in ordenDetalle.cotizacion.items"
                :key="index"
              >
                <td class="px-4 py-2 text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-4 py-2 text-gray-600">
                  {{ getServicioDescripcion(item) || '-' }}
                </td>
                <td class="px-4 py-2 text-center text-gray-600">
                  {{ item.cantidad }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Trabajadores -->
      <div
        v-if="ordenDetalle.trabajadores && ordenDetalle.trabajadores.length > 0"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Trabajadores ({{ ordenDetalle.trabajadores.length }})
          </h2>
        </div>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div
            v-for="(trabajador, index) in ordenDetalle.trabajadores"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Nombre Completo
                  </label>
                  <p class="text-sm font-medium text-gray-900">
                    {{ trabajador.nombre }}
                    {{ trabajador.primerApellido }}
                    {{ trabajador.segundoApellido || '' }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Puesto
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.puesto }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ formatOnlyDate(trabajador.fechaNacimiento) }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Sexo
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.sexo }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Escolaridad
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ trabajador.escolaridad }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Estado Civil
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ trabajador.estadoCivil }}
                  </p>
                </div>
                <div v-if="trabajador.fechaIngreso">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Fecha de Ingreso a la Empresa
                  </label>
                  <p class="text-sm text-gray-900">
                    {{ formatOnlyDate(trabajador.fechaIngreso) }}
                  </p>
                </div>
                <div v-if="trabajador.telefono">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    Teléfono
                  </label>
                  <p class="text-sm text-gray-900">{{ trabajador.telefono }}</p>
                </div>
                <div v-if="trabajador.curp">
                  <label class="block text-xs font-medium text-gray-500 mb-1">
                    CURP
                  </label>
                  <p class="text-sm text-gray-900 font-mono uppercase">
                    {{ trabajador.curp }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div
        v-else
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <div v-if="ordenDetalle.trabajadores?.length === 1" class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Trabajador
            <span class="text-xs italic text-gray-500 ml-2">No se registró al momento de crear la orden.</span>
          </h2>
        </div>
        <div v-else class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Trabajadores
            <span class="text-xs italic text-gray-500 ml-2">No se registraron al momento de crear la orden.</span>
          </h2>
        </div>

        <div class="space-y-4">
          <div
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 grid grid-cols-1 gap-4">
                <div>
                  <p class="text-sm text-gray-900">
                    Solicitar información directamente al cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      
      <!-- Estado y Observaciones (Combinado) -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h2
            class="text-lg md:text-xl font-semibold text-gray-800"
          >
            Estado y Observaciones
          </h2>
          <div
            v-if="hayCambiosSinGuardar"
            class="flex items-center gap-2 text-xs text-amber-600"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Cambios sin guardar</span>
          </div>
        </div>

        <form @submit.prevent="handleUpdateEstado">
          <!-- Selección de Estado (Arriba) -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Estado
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                @click="formEstado = 'pendiente'"
                :class="[
                  'px-3 py-2.5 rounded-lg border-2 font-medium text-xs transition-all',
                  formEstado === 'pendiente'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
                ]"
              >
                <div class="flex flex-col items-center">
                  <span class="text-sm font-semibold">Pendiente</span>
                  <span class="text-xs mt-0.5 opacity-75">Sin iniciar</span>
                </div>
              </button>

              <button
                type="button"
                @click="formEstado = 'en_proceso'"
                :class="[
                  'px-3 py-2.5 rounded-lg border-2 font-medium text-xs transition-all',
                  formEstado === 'en_proceso'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                ]"
              >
                <div class="flex flex-col items-center">
                  <span class="text-sm font-semibold">En Proceso</span>
                  <span class="text-xs mt-0.5 opacity-75">Trabajando</span>
                </div>
              </button>

              <button
                type="button"
                @click="formEstado = 'completada'"
                :class="[
                  'px-3 py-2.5 rounded-lg border-2 font-medium text-xs transition-all',
                  formEstado === 'completada'
                    ? 'bg-green-50 border-green-500 text-green-700 shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                ]"
              >
                <div class="flex flex-col items-center">
                  <span class="text-sm font-semibold">Completada</span>
                  <span class="text-xs mt-0.5 opacity-75">Finalizada</span>
                </div>
              </button>

              <button
                type="button"
                @click="formEstado = 'cancelada'"
                :class="[
                  'px-3 py-2.5 rounded-lg border-2 font-medium text-xs transition-all',
                  formEstado === 'cancelada'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50'
                ]"
              >
                <div class="flex flex-col items-center">
                  <span class="text-sm font-semibold">Cancelada</span>
                  <span class="text-xs mt-0.5 opacity-75">Anulada</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Observaciones: Izquierda (Agregar) y Derecha (Guardadas) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Agregar Nueva Observación (Izquierda - 1/2 del espacio) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Agregar Observación
              </label>
              <textarea
                v-model="nuevaObservacion"
                rows="2"
                class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 resize-none"
                placeholder="Escribe una nueva observación..."
              />
              <button
                type="button"
                @click="agregarObservacion"
                :disabled="!nuevaObservacion.trim() || isUpdatingOrden"
                class="mt-2 px-3 py-1.5 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>

            <!-- Bitácora de Observaciones (Derecha - 1/2 del espacio) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bitácora de Observaciones
              </label>
              <div
                v-if="getObservacionesArray().length > 0"
                class="space-y-1.5 max-h-80 overflow-y-auto border border-gray-200 rounded-md p-1.5 bg-gray-50"
              >
                <div
                  v-for="(obs, index) in getObservacionesArray()"
                  :key="index"
                  class="flex items-start justify-between gap-1 p-1.5 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-900 whitespace-pre-wrap break-words leading-tight">
                      {{ obs.texto }}
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5 leading-tight">
                      {{ formatDateTime(obs.timestamp) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="eliminarObservacion(index)"
                    class="flex-shrink-0 p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar observación"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
              <div
                v-else
                class="text-xs text-gray-500 italic p-3 text-center border border-gray-200 rounded-md bg-gray-50"
              >
                No hay observaciones
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4 pt-3 border-t border-gray-200">
            <button
              type="submit"
              :disabled="isUpdatingOrden"
              class="px-5 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isUpdatingOrden"
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span v-if="isUpdatingOrden">Guardando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-else-if="!isLoadingOrdenes"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">
        No se pudo cargar la información de la orden de trabajo
      </p>
    </div>

    <!-- Modal de confirmación para cambios sin guardar -->
    <div
      v-if="showConfirmDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showConfirmDialog = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          ¿Guardar cambios?
        </h3>
        <p class="text-gray-700 mb-6">
          Tienes cambios sin guardar. ¿Deseas guardarlos antes de salir o
          descartarlos?
        </p>
        <div class="flex gap-3 justify-end">
          <button
            type="button"
            @click="descartarCambios"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Descartar
          </button>
          <button
            type="button"
            @click="guardarYSalir"
            :disabled="isUpdatingOrden"
            class="px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isUpdatingOrden">Guardando...</span>
            <span v-else>Guardar y Salir</span>
          </button>
          <button
            type="button"
            @click="showConfirmDialog = false"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import { downloadOrdenTrabajoPDF } from '../../utils/pdfHelper';
import type { UsuarioCliente } from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';

const route = useRoute();
const {
  ordenDetalle,
  isLoadingOrdenes,
  isUpdatingOrden,
  error,
  obtenerOrdenAdmin,
  actualizarOrdenEstado,
  limpiarOrdenDetalle,
} = useAdmin();

const successMessage = ref<string | null>(null);
const formEstado = ref<string>('');
const observacionesArray = ref<Array<{ texto: string; timestamp: Date }>>([]);
const nuevaObservacion = ref<string>('');
const showConfirmDialog = ref(false);
const pendingNavigation = ref<(() => void) | null>(null);

// Valores originales para comparar cambios
const estadoOriginal = ref<string>('');
const observacionesOriginales = ref<Array<{ texto: string; timestamp: Date }>>([]);

// Función para normalizar observaciones
function normalizarObservaciones(observaciones: any): Array<{ texto: string; timestamp: Date }> {
  if (Array.isArray(observaciones)) {
    return observaciones.map((obs: any) => ({
      texto: obs.texto || obs,
      timestamp: obs.timestamp ? new Date(obs.timestamp) : new Date(),
    }));
  } else if (typeof observaciones === 'string' && observaciones.trim()) {
    return [
      {
        texto: observaciones,
        timestamp: new Date(),
      },
    ];
  }
  return [];
}

// Sincronizar formulario con ordenDetalle cuando cambie
watch(
  ordenDetalle,
  (newVal) => {
    if (newVal) {
      formEstado.value = newVal.estado;
      observacionesArray.value = normalizarObservaciones(newVal.observaciones);
      
      // Guardar valores originales para comparar cambios
      estadoOriginal.value = newVal.estado;
      observacionesOriginales.value = normalizarObservaciones(newVal.observaciones);
    }
  },
  { immediate: true },
);

// Función para comparar arrays de observaciones
function compararObservaciones(
  obs1: Array<{ texto: string; timestamp: Date }>,
  obs2: Array<{ texto: string; timestamp: Date }>
): boolean {
  if (obs1.length !== obs2.length) return true;
  
  for (let i = 0; i < obs1.length; i++) {
    const obs1Item = obs1[i];
    const obs2Item = obs2[i];
    if (!obs1Item || !obs2Item) return true;
    if (obs1Item.texto !== obs2Item.texto) return true;
  }
  
  return false;
}

// Detectar si hay cambios sin guardar
const hayCambiosSinGuardar = computed(() => {
  if (!ordenDetalle.value) return false;
  
  // Comparar estado
  const estadoCambiado = formEstado.value !== estadoOriginal.value;
  
  // Comparar observaciones
  const obsCambiadas = compararObservaciones(
    observacionesArray.value,
    observacionesOriginales.value
  );
  
  return estadoCambiado || obsCambiadas;
});

// Cargar orden al montar el componente
onMounted(async () => {
  const ordenId = route.params.id as string;
  if (ordenId) {
    try {
      await obtenerOrdenAdmin(ordenId);
    } catch (err) {
      // El error ya se maneja en el store
      console.error('Error al cargar orden:', err);
    }
  }
});

// Guard de navegación para prevenir salida con cambios sin guardar
onBeforeRouteLeave((_to, _from, next) => {
  if (hayCambiosSinGuardar.value && !showConfirmDialog.value) {
    showConfirmDialog.value = true;
    pendingNavigation.value = () => next();
    return false;
  }
  next();
});

// Limpiar detalle al desmontar
onUnmounted(() => {
  limpiarOrdenDetalle();
});

function agregarObservacion() {
  if (!nuevaObservacion.value.trim()) return;

  observacionesArray.value.push({
    texto: nuevaObservacion.value.trim(),
    timestamp: new Date(),
  });

  nuevaObservacion.value = '';
}

function eliminarObservacion(index: number) {
  observacionesArray.value.splice(index, 1);
}

function getObservacionesArray(): Array<{ texto: string; timestamp: Date }> {
  return observacionesArray.value;
}

async function handleUpdateEstado() {
  successMessage.value = null;

  try {
    const payload: any = {};

    if (formEstado.value !== ordenDetalle.value?.estado) {
      payload.estado = formEstado.value;
    }

    // Siempre enviar el array completo de observaciones
    payload.observaciones = observacionesArray.value.map((obs) => ({
      texto: obs.texto,
      timestamp: obs.timestamp,
    }));

    await actualizarOrdenEstado(ordenDetalle.value!.id, payload);

    // Recargar el detalle para mostrar el nuevo estado
    await obtenerOrdenAdmin(ordenDetalle.value!.id);

    // Actualizar valores originales después de guardar
    estadoOriginal.value = formEstado.value;
    observacionesOriginales.value = [...observacionesArray.value];

    successMessage.value = 'Estado y observaciones actualizados exitosamente.';
    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  } catch (err) {
    // El error ya se maneja en el store
    console.error('Error al actualizar estado:', err);
  }
}

async function guardarYSalir() {
  try {
    await handleUpdateEstado();
    
    // Esperar un momento para asegurar que el estado se actualizó
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    showConfirmDialog.value = false;
    if (pendingNavigation.value) {
      pendingNavigation.value();
      pendingNavigation.value = null;
    }
  } catch (err) {
    console.error('Error al guardar antes de salir:', err);
    // No cerrar el diálogo si hay error
  }
}

function descartarCambios() {
  // Restaurar valores originales
  if (ordenDetalle.value) {
    formEstado.value = estadoOriginal.value;
    observacionesArray.value = [...observacionesOriginales.value];
    nuevaObservacion.value = '';
  }
  
  showConfirmDialog.value = false;
  if (pendingNavigation.value) {
    pendingNavigation.value();
    pendingNavigation.value = null;
  }
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatOnlyDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getClienteNombre(): string {
  if (!ordenDetalle.value?.cliente) return '';
  return ordenDetalle.value.cliente.empresa || '';
}

function getClienteRfc(): string {
  if (!ordenDetalle.value?.cliente) return '';
  // El tipo OrdenTrabajoDetalleDto.cliente no incluye rfc, pero puede venir del backend
  return (ordenDetalle.value.cliente as any).rfc || '';
}

function getClienteId(): string | null {
  if (!ordenDetalle.value) return null;
  const cliente = ordenDetalle.value.cliente;
  if (cliente && cliente._id) {
    return cliente._id;
  }
  if (typeof ordenDetalle.value.clienteId === 'string') {
    return ordenDetalle.value.clienteId;
  }
  return null;
}

function getSedeNombre(): string {
  if (!ordenDetalle.value?.sede) return '';
  return ordenDetalle.value.sede.ciudad || ordenDetalle.value.sede.clave || '';
}

function getUsuarioClienteNombre(): string {
  if (!ordenDetalle.value?.usuarioCliente) return '';
  return (ordenDetalle.value.usuarioCliente as UsuarioCliente).nombre || '';
}

function getUsuarioClienteEmail(): string {
  if (!ordenDetalle.value?.usuarioCliente) return '';
  return (ordenDetalle.value.usuarioCliente as UsuarioCliente).email || '';
}

function getUsuarioClienteTelefono(): string {
  if (!ordenDetalle.value?.usuarioCliente) return '';
  return ordenDetalle.value.usuarioCliente.telefono || '';
}

function getServicioNombre(item: any): string {
  return item.nombreServicioSnapshot || 'Servicio no disponible';
}

function getServicioDescripcion(item: any): string {
  return item.descripcionServicioSnapshot || '';
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
}

function getEstadoBannerClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-50 border-yellow-300',
    en_proceso: 'bg-blue-50 border-blue-300',
    completada: 'bg-green-50 border-green-300',
    cancelada: 'bg-red-50 border-red-300',
  };
  return classes[estado] || 'bg-gray-50 border-gray-300';
}

function getEstadoIconClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-600',
    en_proceso: 'bg-blue-100 text-blue-600',
    completada: 'bg-green-100 text-green-600',
    cancelada: 'bg-red-100 text-red-600',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
}

function getEstadoTextClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'text-yellow-700',
    en_proceso: 'text-blue-700',
    completada: 'text-green-700',
    cancelada: 'text-red-700',
  };
  return classes[estado] || 'text-gray-700';
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getEstadoTimestamp(estado: string): Date | string | undefined {
  if (!ordenDetalle.value) return undefined;
  
  switch (estado) {
    case 'pendiente':
      return ordenDetalle.value.fechaEstadoPendiente || ordenDetalle.value.fechaCreacion;
    case 'en_proceso':
      return ordenDetalle.value.fechaEstadoEnProceso || ordenDetalle.value.fechaInicio;
    case 'completada':
      return ordenDetalle.value.fechaEstadoCompletada || ordenDetalle.value.fechaCompletacion;
    case 'cancelada':
      return ordenDetalle.value.fechaEstadoCancelada || ordenDetalle.value.updatedAt || ordenDetalle.value.fechaCreacion;
    default:
      return ordenDetalle.value.fechaCreacion;
  }
}

async function handleDownloadPDF(): Promise<void> {
  if (!ordenDetalle.value) return;
  await downloadOrdenTrabajoPDF(ordenDetalle.value);
}
</script>
