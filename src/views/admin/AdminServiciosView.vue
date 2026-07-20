<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Lista de Servicios
      </h1>
      <button
        @click="abrirModalCrear"
        class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
      >
        + Agregar Servicio
      </button>
    </div>

    <div class="mb-4">
      <div
        class="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4"
      >
        <div class="flex-1 min-w-[180px]">
          <label
            for="filtro-nombre-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Buscar por nombre</label
          >
          <input
            id="filtro-nombre-servicio"
            v-model="filters.nombre"
            type="text"
            placeholder="Buscar por nombre..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>

        <div class="min-w-0 shrink">
          <p class="block text-xs font-medium text-gray-600 mb-1">Categoría</p>
          <div
            class="overflow-x-auto"
            role="tablist"
            aria-label="Categorías de servicio"
          >
            <div class="inline-grid grid-flow-col auto-cols-[2.75rem] gap-1">
              <button
                type="button"
                role="tab"
                :aria-selected="!filters.categoria"
                aria-label="Todas las categorías"
                title="Todas las categorías"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  !filters.categoria
                    ? 'bg-medical-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectCategoria('')"
              >
                Todas
              </button>
              <button
                v-for="opt in CATEGORIA_SERVICIO_OPTIONS"
                :key="opt.code"
                type="button"
                role="tab"
                :aria-selected="filters.categoria === opt.code"
                :aria-label="opt.label"
                :title="opt.label"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  filters.categoria === opt.code
                    ? 'bg-medical-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectCategoria(opt.code)"
              >
                {{ opt.code }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center pb-1 lg:pb-2 shrink-0">
          <ToggleSwitch
            id="ver-inactivos-servicios"
            v-model="verInactivos"
            @change="onVerInactivosChange"
          />
        </div>
      </div>
    </div>

    <div
      v-if="successMsg"
      class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMsg }}
    </div>

    <div
      v-if="actionError"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ actionError }}
    </div>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="bg-white shadow-md rounded-lg p-8 text-center">
      <p class="text-gray-500">Cargando servicios...</p>
    </div>

    <!-- Mensaje de error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Contenedor de servicios (tabla y tarjetas) -->
    <template v-else>
      <!-- Vista de tabla para pantallas grandes -->
      <div
        class="bg-white shadow-md rounded-lg overflow-hidden hidden lg:block"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="w-12 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  #
                </th>
                <th
                  class="w-32 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Servicio
                </th>
                <th
                  class="w-40 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Categoría
                </th>
                <th
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Descripción
                </th>
                <th
                  class="w-32 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Precio Unitario
                </th>
                <th
                  class="w-24 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="w-32 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="servicios.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  {{ emptyListMessage }}
                </td>
              </tr>
              <tr v-for="(servicio, index) in servicios" :key="servicio._id">
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ rowNumber(index) }}
                </td>
                <td class="px-3 lg:px-4 py-4 text-sm font-medium text-gray-900">
                  <div class="truncate">{{ servicio.nombre }}</div>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 text-sm text-gray-700"
                  :title="labelCategoriaServicio(servicio.categoria)"
                >
                  <div class="truncate">
                    {{ labelCategoriaServicio(servicio.categoria) }}
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-4 text-sm text-gray-500 relative group"
                  v-if="servicio.descripcion && servicio.descripcion.length > 0"
                >
                  <div class="line-clamp-4 w-full break-words">
                    {{ servicio.descripcion }}
                  </div>
                  <!-- Tooltip personalizado -->
                  <div
                    class="tooltip-descripcion absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                  >
                    <div class="whitespace-normal break-words">
                      {{ servicio.descripcion }}
                    </div>
                    <!-- Flecha del tooltip -->
                    <div
                      class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-4 text-sm text-gray-500"
                  v-else
                >
                  <div class="truncate">-</div>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  $ {{ servicio.precioUnitario.toFixed(2) }}
                  {{ servicio.moneda || 'MXN' }}
                </td>
                <td class="px-3 lg:px-4 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      isServicioActivo(servicio)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm font-medium"
                >
                  <div class="flex flex-col xl:flex-row gap-1 xl:gap-2">
                    <button
                      @click="abrirModalEditar(servicio)"
                      class="text-medical-blue-600 hover:text-medical-blue-900 text-left"
                    >
                      Editar
                    </button>
                    <button
                      v-if="isServicioActivo(servicio)"
                      @click="pedirDesactivar(servicio)"
                      class="text-red-600 hover:text-red-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Desactivar
                    </button>
                    <button
                      v-else
                      @click="reactivar(servicio)"
                      class="text-green-700 hover:text-green-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tabla compacta para pantallas medianas (md a lg) -->
      <div
        class="bg-white shadow-md rounded-lg overflow-hidden hidden md:block lg:hidden"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  #
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Categoría
                </th>
                <th
                  class="w-[330px] max-w-[330px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Descripción
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Precio
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="servicios.length === 0">
                <td colspan="7" class="px-3 py-4 text-center text-gray-500">
                  {{ emptyListMessage }}
                </td>
              </tr>
              <tr v-for="(servicio, index) in servicios" :key="servicio._id">
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                  {{ rowNumber(index) }}
                </td>
                <td class="px-3 py-4 text-xs font-medium text-gray-900">
                  <div class="truncate max-w-[120px]">
                    {{ servicio.nombre }}
                  </div>
                </td>
                <td class="px-3 py-4 text-xs text-gray-700">
                  <div class="truncate max-w-[100px]">
                    {{ labelCategoriaServicio(servicio.categoria) }}
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 py-4 text-xs text-gray-500 relative group"
                  v-if="servicio.descripcion && servicio.descripcion.length > 0"
                >
                  <div class="line-clamp-3 w-full break-words">
                    {{ servicio.descripcion }}
                  </div>
                  <!-- Tooltip personalizado -->
                  <div
                    class="tooltip-descripcion absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                  >
                    <div class="whitespace-normal break-words">
                      {{ servicio.descripcion }}
                    </div>
                    <div
                      class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 py-4 text-xs text-gray-500"
                  v-else
                >
                  <div class="truncate">-</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-900">
                  ${{ servicio.precioUnitario.toFixed(2) }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-1.5 py-0.5 text-xs font-medium rounded-full',
                      isServicioActivo(servicio)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs font-medium">
                  <div class="flex flex-col gap-1">
                    <button
                      @click="abrirModalEditar(servicio)"
                      class="text-medical-blue-600 hover:text-medical-blue-900 text-left"
                    >
                      Editar
                    </button>
                    <button
                      v-if="isServicioActivo(servicio)"
                      @click="pedirDesactivar(servicio)"
                      class="text-red-600 hover:text-red-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Desactivar
                    </button>
                    <button
                      v-else
                      @click="reactivar(servicio)"
                      class="text-green-700 hover:text-green-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tarjetas para pantallas pequeñas -->
      <div class="md:hidden space-y-4">
        <div
          v-if="servicios.length === 0"
          class="bg-white shadow-md rounded-lg p-6 text-center"
        >
          <p class="text-gray-500">{{ emptyListMessage }}</p>
        </div>
        <div
          v-for="(servicio, index) in servicios"
          :key="servicio._id"
          class="bg-white shadow-md rounded-lg p-4 space-y-3"
        >
          <!-- Encabezado de la tarjeta -->
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500 font-medium"
                  >#{{ rowNumber(index) }}</span
                >
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isServicioActivo(servicio)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ servicio.nombre }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ labelCategoriaServicio(servicio.categoria) }}
              </p>
            </div>
          </div>

          <!-- Descripción -->
          <div
            v-if="servicio.descripcion && servicio.descripcion.length > 0"
            class="text-sm text-gray-600"
          >
            <span class="font-medium text-gray-700 block mb-1"
              >Descripción:</span
            >
            <p class="text-gray-600 leading-relaxed">
              {{ servicio.descripcion }}
            </p>
          </div>

          <!-- Información adicional -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="font-medium text-gray-700">Precio:</span>
              <span class="ml-1 text-gray-900 font-semibold">
                $ {{ servicio.precioUnitario.toFixed(2) }}
                {{ servicio.moneda || 'MXN' }}
              </span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <button
              @click="abrirModalEditar(servicio)"
              class="w-full px-4 py-2 bg-medical-blue-50 text-medical-blue-600 rounded-md hover:bg-medical-blue-100 transition-colors font-medium text-sm"
            >
              Editar
            </button>
            <button
              v-if="isServicioActivo(servicio)"
              @click="pedirDesactivar(servicio)"
              class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
              :disabled="isMutating"
            >
              Desactivar
            </button>
            <button
              v-else
              @click="reactivar(servicio)"
              class="w-full px-4 py-2 bg-green-50 text-green-800 rounded-md hover:bg-green-100 transition-colors font-medium text-sm disabled:opacity-50"
              :disabled="isMutating"
            >
              Reactivar
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="pagination.totalPages > 1"
        class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white shadow-md rounded-lg px-4 py-3"
      >
        <p class="text-sm text-gray-600">
          Mostrando
          {{
            (pagination.page - 1) * pagination.limit +
            (servicios.length ? 1 : 0)
          }}–{{
            Math.min(
              pagination.page * pagination.limit,
              pagination.total,
            )
          }}
          de {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="pagination.page <= 1"
            @click="prevPage"
          >
            Anterior
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="pagination.page >= pagination.totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <!-- Modal para crear/editar servicio -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4 sm:mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {{ modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h2>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="guardarServicio" class="space-y-4">
            <!-- Nombre -->
            <div>
              <label
                for="nombre"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Servicio <span class="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Ej: Examen Médico Laboral"
                :disabled="isSubmitting"
              />
            </div>

            <!-- Categoría -->
            <div>
              <label
                for="categoria"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría <span class="text-red-500">*</span>
              </label>
              <select
                id="categoria"
                v-model="formulario.categoria"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting"
              >
                <option disabled value="">Selecciona una categoría</option>
                <option
                  v-for="opt in CATEGORIA_SERVICIO_OPTIONS"
                  :key="opt.code"
                  :value="opt.code"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Descripción -->
            <div>
              <label
                for="descripcion"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                v-model="formulario.descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                placeholder="Descripción detallada del servicio"
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <!-- Precio Unitario -->
            <div>
              <label
                for="precioUnitario"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio Unitario (MXN) <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-2">
                <span class="text-gray-500">$</span>
                <input
                  id="precioUnitario"
                  v-model.number="formulario.precioUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  placeholder="0.00"
                  :disabled="isSubmitting"
                />
                <span class="text-sm text-gray-600 font-medium">MXN</span>
              </div>
            </div>

            <!-- Estado Activo -->
            <div class="flex items-center">
              <input
                id="activo"
                v-model="formulario.activo"
                type="checkbox"
                class="h-4 w-4 text-medical-blue-600 focus:ring-medical-blue-500 border-gray-300 rounded"
                :disabled="isSubmitting"
              />
              <label for="activo" class="ml-2 block text-sm text-gray-700">
                Servicio activo
              </label>
            </div>

            <!-- Story 4.4: multi-tenant create — solo admin + modo crear -->
            <div
              v-if="!modoEdicion && isAdminSistema"
              class="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2"
            >
              <p class="text-sm font-medium text-gray-800">
                Crear en administración(es)
              </p>
              <p class="text-xs text-gray-500">
                Cada administración recibe un registro independiente. Las
                ediciones posteriores no se sincronizan.
              </p>
              <div
                v-for="t in tenantsDisponibles"
                :key="t._id"
                class="flex items-center gap-2"
              >
                <input
                  :id="`tenant-destino-${t._id}`"
                  v-model="tenantIdsDestino"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                  :value="t._id"
                  :disabled="isSubmitting"
                />
                <label
                  :for="`tenant-destino-${t._id}`"
                  class="text-sm text-gray-700"
                  >{{ t.nombre }}</label
                >
              </div>
            </div>

            <!-- Mensaje de error -->
            <div
              v-if="errorCrear"
              class="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p class="text-red-800 text-sm">{{ errorCrear }}</p>
            </div>

            <!-- Botones -->
            <div
              class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4"
            >
              <button
                type="button"
                @click="cerrarModal"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Guardando...</span>
                <span v-else
                  >{{ modoEdicion ? 'Actualizar' : 'Guardar' }} Servicio</span
                >
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para desactivar servicio -->
    <ConfirmationModal
      :show="mostrarConfirmDesactivar"
      title="Desactivar Servicio"
      :message="mensajeConfirmDesactivar"
      type="danger"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @confirm="ejecutarDesactivar"
      @cancel="mostrarConfirmDesactivar = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  getServicios,
  createServicio,
  createServicioMulti,
  updateServicio,
  deleteServicio,
  toggleServicioActivo,
  getTenants,
  type CreateServicioPayload,
  type UpdateServicioPayload,
  type AdminServiciosFilters,
} from '../../services/admin-api.service';
import type { Servicio, Tenant } from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { useAuthStore } from '../../store/auth';
import {
  CATEGORIA_SERVICIO_OPTIONS,
  labelCategoriaServicio,
  type CategoriaServicioCode,
} from '../../constants/categorias-servicio';

const authStore = useAuthStore();
const isAdminSistema = computed(() => authStore.isAdminSistema);

const servicios = ref<Servicio[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const verInactivos = ref(false);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
let loadSeq = 0;
let filterTimeout: ReturnType<typeof setTimeout> | null = null;

const filters = ref<{
  nombre: string;
  categoria: CategoriaServicioCode | '';
  page: number;
  limit: number;
}>({
  nombre: '',
  categoria: '',
  page: 1,
  limit: 20,
});

const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
});

function isServicioActivo(servicio: Servicio): boolean {
  return servicio.activo !== false;
}

const tieneFiltrosBusqueda = computed(
  () =>
    !!(filters.value.nombre?.trim() || filters.value.categoria),
);

const emptyListMessage = computed(() => {
  if (tieneFiltrosBusqueda.value)
    return 'No se encontraron servicios con esos filtros';
  if (verInactivos.value) return 'No hay servicios inactivos';
  return 'No hay servicios disponibles';
});

function rowNumber(index: number): number {
  return (pagination.value.page - 1) * pagination.value.limit + index + 1;
}

// Estado del modal
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const servicioEditando = ref<Servicio | null>(null);
const isSubmitting = ref(false);
const errorCrear = ref<string | null>(null);

const formulario = ref<CreateServicioPayload>({
  nombre: '',
  descripcion: '',
  precioUnitario: 0,
  categoria: '' as CategoriaServicioCode | '',
  moneda: 'MXN',
  activo: true,
});

const tenantsDisponibles = ref<Tenant[]>([]);
const tenantIdsDestino = ref<string[]>([]);

const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = ref('');
const servicioADesactivar = ref<Servicio | null>(null);

function extractError(err: any, fallback: string): string {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || fallback;
}

const cargarServicios = async () => {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;

  try {
    let page = filters.value.page ?? 1;
    const limit = filters.value.limit ?? 20;
    const activeFilters: AdminServiciosFilters = { page, limit };
    if (filters.value.nombre?.trim()) {
      activeFilters.nombre = filters.value.nombre.trim();
    }
    if (filters.value.categoria) {
      activeFilters.categoria = filters.value.categoria;
    }
    if (verInactivos.value) {
      activeFilters.activo = false;
    }

    let res = await getServicios(activeFilters);
    if (seq !== loadSeq) return;

    // Clamp: página vacía con total > 0 → última página
    if (
      res.data.length === 0 &&
      res.total > 0 &&
      res.page > res.totalPages
    ) {
      page = res.totalPages;
      filters.value.page = page;
      res = await getServicios({ ...activeFilters, page });
      if (seq !== loadSeq) return;
    }

    servicios.value = res.data;
    pagination.value = {
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
    filters.value.page = res.total === 0 ? 1 : res.page;
  } catch (err: any) {
    if (seq !== loadSeq) return;
    console.error('Error al cargar servicios:', err);
    error.value = extractError(err, 'No fue posible cargar los servicios');
  } finally {
    if (seq === loadSeq) isLoading.value = false;
  }
};

function clearFilterDebounce() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
}

function handleFilterChange() {
  clearFilterDebounce();
  filterTimeout = setTimeout(() => {
    filters.value.page = 1;
    successMsg.value = null;
    actionError.value = null;
    void cargarServicios();
  }, 500);
}

function onCategoriaChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  successMsg.value = null;
  actionError.value = null;
  void cargarServicios();
}

function selectCategoria(code: CategoriaServicioCode | '') {
  if (filters.value.categoria === code) return;
  filters.value.categoria = code;
  onCategoriaChange();
}

function onVerInactivosChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  successMsg.value = null;
  actionError.value = null;
  void cargarServicios();
}

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) - 1;
    void cargarServicios();
  }
}

function nextPage() {
  if ((filters.value.page ?? 1) < (pagination.value.totalPages ?? 1)) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) + 1;
    void cargarServicios();
  }
}

/**
 * Abre el modal para crear una nueva servicio
 */
const abrirModalCrear = () => {
  modoEdicion.value = false;
  servicioEditando.value = null;
  formulario.value = {
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    categoria: '' as CategoriaServicioCode | '',
    moneda: 'MXN',
    activo: true,
  };
  // Default: solo el tenant activo del sidebar
  const active = authStore.activeTenantId;
  tenantIdsDestino.value = active ? [active] : [];
  errorCrear.value = null;
  mostrarModal.value = true;
};

/**
 * Abre el modal para editar un servicio existente
 */
const abrirModalEditar = (servicio: Servicio) => {
  modoEdicion.value = true;
  servicioEditando.value = servicio;
  formulario.value = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario,
    categoria: (servicio.categoria || '') as CategoriaServicioCode | '',
    moneda: 'MXN',
    activo: servicio.activo !== undefined ? servicio.activo : true,
  };
  errorCrear.value = null;
  mostrarModal.value = true;
};

/**
 * Cierra el modal y resetea el formulario
 */
const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  servicioEditando.value = null;
  errorCrear.value = null;
  formulario.value = {
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    categoria: '' as CategoriaServicioCode | '',
    moneda: 'MXN',
    activo: true,
  };
};

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(cerrarModal, mostrarModal);

/**
 * Guarda un servicio (crear o actualizar)
 */
const guardarServicio = async () => {
  const nombre = formulario.value.nombre.trim();
  if (!nombre) {
    errorCrear.value = 'Debe proporcionar el nombre del servicio';
    return;
  }
  if (!formulario.value.categoria) {
    errorCrear.value = 'Debe seleccionar una categoría';
    return;
  }
  if (modoEdicion.value && !servicioEditando.value?._id) {
    errorCrear.value =
      'No se puede actualizar: falta el identificador del servicio';
    return;
  }
  isSubmitting.value = true;
  errorCrear.value = null;

  try {
    if (modoEdicion.value) {
      const payload: UpdateServicioPayload = {
        nombre,
        descripcion: formulario.value.descripcion?.trim() || '',
        precioUnitario: formulario.value.precioUnitario,
        categoria: formulario.value.categoria,
        moneda: 'MXN',
        activo: formulario.value.activo,
      };
      await updateServicio(servicioEditando.value!._id!, payload);
    } else if (isAdminSistema.value) {
      const ids = [...new Set(tenantIdsDestino.value.filter(Boolean))];
      if (ids.length < 1) {
        errorCrear.value =
          'Selecciona al menos una administración destino';
        return;
      }
      const result = await createServicioMulti({
        nombre,
        descripcion: formulario.value.descripcion?.trim() || undefined,
        precioUnitario: formulario.value.precioUnitario,
        categoria: formulario.value.categoria,
        moneda: 'MXN',
        activo: formulario.value.activo,
        tenantIds: ids,
      });
      const nombres = ids
        .map(
          (id) =>
            tenantsDisponibles.value.find((t) => t._id === id)?.nombre || id,
        )
        .join(' y ');
      successMsg.value =
        result.created.length > 1
          ? `Servicio creado en ${nombres}. El listado muestra la administración activa.`
          : 'Servicio creado.';
    } else {
      await createServicio({
        nombre,
        descripcion: formulario.value.descripcion?.trim() || undefined,
        precioUnitario: formulario.value.precioUnitario,
        categoria: formulario.value.categoria,
        moneda: 'MXN',
        activo: formulario.value.activo,
      });
      successMsg.value = 'Servicio creado.';
    }
    cerrarModal();
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al guardar servicio:', err);
    const msg = err.response?.data?.message;
    errorCrear.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'No fue posible guardar el servicio';
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Desactiva (soft delete) o reactiva un servicio
 */
const pedirDesactivar = (servicio: Servicio) => {
  if (!servicio._id) return;
  servicioADesactivar.value = servicio;
  mensajeConfirmDesactivar.value = `¿Desactivar el servicio "${servicio.nombre}"?\n\nDejará de aparecer en el cotizador. Las cotizaciones históricas conservan su información. Puedes reactivarlo desde "Ver inactivos".`;
  mostrarConfirmDesactivar.value = true;
};

const ejecutarDesactivar = async () => {
  if (isMutating.value) {
    actionError.value =
      'Hay otra operación en curso. Espera un momento e intenta de nuevo.';
    return;
  }
  const id = servicioADesactivar.value?._id;
  if (!id) {
    mostrarConfirmDesactivar.value = false;
    return;
  }
  mostrarConfirmDesactivar.value = false;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deleteServicio(id);
    successMsg.value = 'Servicio desactivado.';
    // Optimista: quitar de listado activos antes del reload
    servicios.value = servicios.value.filter((s) => s._id !== id);
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al desactivar servicio:', err);
    successMsg.value = null;
    actionError.value = extractError(err, 'No se pudo desactivar el servicio');
  } finally {
    isMutating.value = false;
    servicioADesactivar.value = null;
  }
};

const reactivar = async (servicio: Servicio) => {
  if (!servicio._id || isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await toggleServicioActivo(servicio._id);
    successMsg.value = 'Servicio reactivado.';
    // Optimista: quitar de listado inactivos para no permitir segundo toggle
    servicios.value = servicios.value.filter((s) => s._id !== servicio._id);
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al reactivar servicio:', err);
    successMsg.value = null;
    actionError.value = extractError(err, 'No se pudo reactivar el servicio');
  } finally {
    isMutating.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarServicios();
  if (authStore.isAdminSistema) {
    try {
      const tenants = await getTenants();
      tenantsDisponibles.value = tenants.filter(
        (t) => t.activo !== false && t._id,
      );
    } catch (err) {
      console.error('Error al cargar tenants:', err);
      actionError.value = extractError(
        err,
        'No se pudieron cargar las administraciones destino',
      );
    }
  }
});

onUnmounted(() => {
  clearFilterDebounce();
});
</script>

<style scoped>
/* Scrollbar más sutil y casi invisible */
.scrollbar-hide::-webkit-scrollbar {
  height: 3px;
}
.scrollbar-hide::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-hide::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.scrollbar-hide::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Para Firefox */
.scrollbar-hide {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

/* Mejoras de responsividad para tablas */
@media (max-width: 1023px) {
  table {
    font-size: 0.875rem;
  }
}

/* Mejorar el comportamiento de line-clamp */
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ocultar tooltips a partir de 1406px de ancho */
@media (min-width: 1406px) {
  .tooltip-descripcion {
    display: none !important;
  }
}
</style>
