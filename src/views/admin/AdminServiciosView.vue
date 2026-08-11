<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Productos y servicios
      </h1>
      <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
        <router-link
          to="/admin/categorias"
          class="w-full sm:w-auto text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Gestionar categorías
        </router-link>
        <button
          type="button"
          @click="abrirModalCrear"
          class="w-full sm:w-auto px-4 py-2 bg-medical-green-500 text-white rounded-md hover:bg-medical-green-600 transition-colors font-medium"
        >
          + Agregar ítem
        </button>
      </div>
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
                :aria-selected="!filters.categoriaId"
                aria-label="Todas las categorías"
                title="Todas las categorías"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  !filters.categoriaId
                    ? 'bg-medical-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectCategoria('')"
              >
                Todas
              </button>
              <button
                v-for="cat in categorias"
                :key="cat._id"
                type="button"
                role="tab"
                :aria-selected="filters.categoriaId === cat._id"
                :aria-label="cat.nombre"
                :title="cat.nombre"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  filters.categoriaId === cat._id
                    ? 'bg-medical-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectCategoria(cat._id)"
              >
                {{ cat.codigo }}
              </button>
            </div>
          </div>
        </div>

        <div class="min-w-[140px] shrink-0">
          <label
            for="filtro-tipo-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Tipo</label
          >
          <select
            id="filtro-tipo-servicio"
            v-model="filters.tipo"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
            @change="onTipoFilterChange"
          >
            <option value="">Todos</option>
            <option value="servicio">Servicio</option>
            <option value="producto">Producto</option>
          </select>
        </div>

        <div class="min-w-[180px] shrink-0">
          <label
            for="filtro-orden-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Ordenar por</label
          >
          <select
            id="filtro-orden-servicio"
            v-model="filters.orden"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
            @change="onOrdenChange"
          >
            <option value="creacion">Orden de creación</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
          </select>
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
    <div
      v-if="!hasLoadedOnce"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">Cargando servicios...</p>
    </div>

    <!-- Contenedor de servicios (tabla y tarjetas) -->
    <template v-else>
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-800">{{ error }}</p>
      </div>
      <div class="relative">
        <ListLoadingOverlay v-if="isLoading" />
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
                  class="w-[200px] max-w-[200px] px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
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
                <td
                  class="w-[180px] max-w-[180px] px-3 lg:px-4 py-4 text-sm font-medium text-gray-900"
                >
                  <div class="flex items-start gap-1.5 flex-wrap">
                    <div class="break-words">{{ servicio.nombre }}</div>
                    <span
                      class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      :title="labelTipoDe(servicio.tipo)"
                    >
                      {{ codigoTipoDe(servicio.tipo) }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 text-sm text-gray-700"
                  :title="labelCategoriaDe(servicio.categoriaId)"
                >
                  <div class="truncate">
                    {{ codigoCategoriaDe(servicio.categoriaId) }}
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
                  {{ formatMoney(servicio.precioUnitario) }}
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
                  class="w-[160px] max-w-[160px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
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
                <td
                  class="w-[160px] max-w-[160px] px-3 py-4 text-xs font-medium text-gray-900"
                >
                  <div class="flex items-start gap-1.5 flex-wrap">
                    <div class="break-words">{{ servicio.nombre }}</div>
                    <span
                      class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      :title="labelTipoDe(servicio.tipo)"
                    >
                      {{ codigoTipoDe(servicio.tipo) }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-3 py-4 text-xs text-gray-700"
                  :title="labelCategoriaDe(servicio.categoriaId)"
                >
                  <div class="truncate max-w-[100px]">
                    {{ codigoCategoriaDe(servicio.categoriaId) }}
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
                  {{ formatMoney(servicio.precioUnitario) }}
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
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ servicio.nombre }}
                </h3>
                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                  :title="labelTipoDe(servicio.tipo)"
                >
                  {{ codigoTipoDe(servicio.tipo) }}
                </span>
              </div>
              <p
                class="text-sm text-gray-600 mt-1"
                :title="labelCategoriaDe(servicio.categoriaId)"
              >
                {{ codigoCategoriaDe(servicio.categoriaId) }}
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
                {{ formatMoney(servicio.precioUnitario) }}
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
              {{ modoEdicion ? 'Editar ítem' : 'Nuevo ítem' }}
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
                for="categoriaId"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría <span class="text-red-500">*</span>
              </label>
              <div
                v-if="categorias.length === 0 && !categoriaHuerfanaForm"
                class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                No hay categorías activas en esta administración.
                <router-link
                  to="/admin/categorias"
                  class="font-medium text-medical-blue-700 underline hover:text-medical-blue-900"
                >
                  Gestionar categorías
                </router-link>
              </div>
              <template v-else>
                <select
                  id="categoriaId"
                  v-model="formulario.categoriaId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  :disabled="isSubmitting"
                >
                  <option disabled value="">Selecciona una categoría</option>
                  <option
                    v-if="categoriaHuerfanaForm"
                    :value="categoriaHuerfanaForm.id"
                  >
                    {{ categoriaHuerfanaForm.label }}
                  </option>
                  <option
                    v-for="cat in categorias"
                    :key="cat._id"
                    :value="cat._id"
                  >
                    {{ cat.codigo }} — {{ cat.nombre }}
                  </option>
                </select>
                <p
                  v-if="categoriaHuerfanaForm"
                  class="mt-1 text-xs text-amber-800"
                >
                  La categoría actual no está activa o no aparece en el
                  catálogo. Elige una categoría activa para guardar.
                </p>
              </template>
            </div>

            <!-- Tipo (Story 6.1 / FR-58) -->
            <div>
              <label
                for="tipo"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                id="tipo"
                v-model="formulario.tipo"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :disabled="isSubmitting"
              >
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </div>

            <!-- Código opcional (Story 6.2 / FR-59 / UX-DR3) -->
            <div>
              <label
                for="codigo-item"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                {{ labelCodigoItem }}
              </label>
              <input
                id="codigo-item"
                v-model="formulario.codigo"
                type="text"
                maxlength="64"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :placeholder="
                  formulario.tipo === 'producto' ? 'Ej. SKU-001' : 'Opcional'
                "
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ ayudaCodigoItem }}
              </p>
            </div>

            <!-- Imagen producto (Story 8.1 / AD-23 / UX-DR3) -->
            <div v-if="formulario.tipo === 'producto'">
              <label
                for="imagen-producto"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Imagen (opcional)
              </label>
              <div class="flex flex-wrap items-start gap-3">
                <img
                  v-if="imagenPreviewUrl"
                  :src="imagenPreviewUrl"
                  alt="Vista previa"
                  class="h-16 w-16 rounded border border-gray-200 object-cover bg-gray-50"
                />
                <div class="min-w-0 flex-1 space-y-2">
                  <input
                    id="imagen-producto"
                    ref="imagenInputRef"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-medical-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-medical-blue-700 hover:file:bg-medical-blue-100"
                    :disabled="isSubmitting"
                    @change="onImagenSelected"
                  />
                  <p class="text-xs text-gray-500">
                    PNG, JPEG o WebP · máx. 1&nbsp;MB · se guarda como WebP
                  </p>
                  <button
                    v-if="modoEdicion && servicioEditando?.imagenUrl"
                    type="button"
                    class="text-xs font-medium text-red-600 hover:text-red-700"
                    :disabled="isSubmitting"
                    @click="eliminarImagenProducto"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
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
                Precio Unitario <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center space-x-2">
                <span class="text-gray-500">$</span>
                <input
                  id="precioUnitario"
                  v-model.number="formulario.precioUnitario"
                  type="number"
                  step="10"
                  min="0"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  placeholder="0.00"
                  :disabled="isSubmitting"
                />
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
                :disabled="
                  isSubmitting ||
                  (!modoEdicion && categorias.length === 0) ||
                  (modoEdicion &&
                    !!categoriaHuerfanaForm &&
                    categorias.length === 0)
                "
              >
                <span v-if="isSubmitting">Guardando...</span>
                <span v-else
                  >{{ modoEdicion ? 'Actualizar ítem' : 'Guardar ítem' }}</span
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
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  getServicios,
  createServicio,
  createServicioMulti,
  updateServicio,
  deleteServicio,
  toggleServicioActivo,
  uploadServicioImagen,
  deleteServicioImagen,
  getTenants,
  getCategoriasServicio,
  type CreateServicioPayload,
  type UpdateServicioPayload,
  type AdminServiciosFilters,
  type ServicioOrden,
} from '../../services/admin-api.service';
import type {
  CategoriaServicioCatalogo,
  Servicio,
  TipoItemCatalogo,
  Tenant,
} from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import ListLoadingOverlay from '../../components/base/ListLoadingOverlay.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { useAuthStore } from '../../store/auth';
import { API_BASE_URL } from '../../config/api';
import { formatMoney } from '../../utils/currency';
import { extractError } from '../../utils/extractError';
import {
  boolQuery,
  compactQuery,
  queryFlag,
  queryInt,
  queryString,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';

const MAX_IMAGEN_BYTES = 1_000_000;
const ALLOWED_IMAGEN_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

type ServicioFormState = Omit<CreateServicioPayload, 'categoriaId'> & {
  categoriaId: string;
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { activeTenantId } = storeToRefs(authStore);
const isAdminSistema = computed(() => authStore.isAdminSistema);

const ORDENES: ServicioOrden[] = ['creacion', 'nombre_asc', 'nombre_desc'];

const servicios = ref<Servicio[]>([]);
const categorias = ref<CategoriaServicioCatalogo[]>([]);
const categoriaById = computed(() => {
  const map = new Map<string, CategoriaServicioCatalogo>();
  for (const cat of categorias.value) {
    if (cat._id) map.set(cat._id, cat);
  }
  return map;
});
const isLoading = ref(false);
const hasLoadedOnce = ref(false);
const error = ref<string | null>(null);
const verInactivos = ref(false);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
let loadSeq = 0;
let categoriasLoadSeq = 0;
let filterTimeout: ReturnType<typeof setTimeout> | null = null;

const filters = ref<{
  nombre: string;
  categoriaId: string;
  tipo: '' | TipoItemCatalogo;
  orden: ServicioOrden;
  page: number;
  limit: number;
}>({
  nombre: '',
  categoriaId: '',
  tipo: '',
  orden: 'creacion',
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

function codigoCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '—';
  return categoriaById.value.get(categoriaId)?.codigo || '—';
}

function labelCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '';
  const cat = categoriaById.value.get(categoriaId);
  return cat?.nombre || '';
}

function codigoTipoDe(tipo?: TipoItemCatalogo): string {
  if (tipo === 'producto') return 'PROD';
  if (tipo === 'servicio') return 'SERV';
  return '—';
}

function labelTipoDe(tipo?: TipoItemCatalogo): string {
  if (tipo === 'producto') return 'Producto';
  if (tipo === 'servicio') return 'Servicio';
  return '';
}

const tieneFiltrosBusqueda = computed(
  () =>
    !!(
      filters.value.nombre?.trim() ||
      filters.value.categoriaId ||
      filters.value.tipo
    ),
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

const formulario = ref<ServicioFormState>({
  nombre: '',
  descripcion: '',
  precioUnitario: 0,
  categoriaId: '',
  tipo: 'servicio',
  codigo: '',
  moneda: 'MXN',
  activo: true,
});

/** Archivo pendiente de subir tras create (path canónico necesita _id). */
const imagenPendiente = ref<File | null>(null);
const imagenLocalPreview = ref<string | null>(null);
const imagenInputRef = ref<HTMLInputElement | null>(null);

function publicAssetPreviewUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (apiBase.startsWith('http')) return `${apiBase}${path}`;
  return path;
}

const imagenPreviewUrl = computed(() => {
  if (imagenLocalPreview.value) return imagenLocalPreview.value;
  if (formulario.value.tipo !== 'producto') return null;
  return publicAssetPreviewUrl(servicioEditando.value?.imagenUrl);
});

function clearImagenPendiente() {
  imagenPendiente.value = null;
  if (imagenLocalPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(imagenLocalPreview.value);
  }
  imagenLocalPreview.value = null;
  if (imagenInputRef.value) imagenInputRef.value.value = '';
}

function onImagenSelected(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const mime = (file.type.split(';')[0] ?? '').trim().toLowerCase();
  if (!ALLOWED_IMAGEN_TYPES.has(mime)) {
    errorCrear.value = 'Tipo de imagen no permitido (use PNG, JPEG o WebP)';
    clearImagenPendiente();
    return;
  }
  if (file.size > MAX_IMAGEN_BYTES) {
    errorCrear.value = 'La imagen no puede superar 1MB';
    clearImagenPendiente();
    return;
  }
  errorCrear.value = null;
  if (imagenLocalPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(imagenLocalPreview.value);
  }
  imagenPendiente.value = file;
  imagenLocalPreview.value = URL.createObjectURL(file);
}

async function eliminarImagenProducto() {
  const id = servicioEditando.value?._id;
  if (!id || !modoEdicion.value) return;
  isSubmitting.value = true;
  errorCrear.value = null;
  try {
    const updated = await deleteServicioImagen(id);
    servicioEditando.value = updated;
    clearImagenPendiente();
  } catch (err: unknown) {
    errorCrear.value = extractError(err, 'No fue posible eliminar la imagen');
  } finally {
    isSubmitting.value = false;
  }
}

const labelCodigoItem = computed(() =>
  formulario.value.tipo === 'producto'
    ? 'Código o SKU'
    : 'Código de Servicio',
);

const ayudaCodigoItem = computed(() =>
  formulario.value.tipo === 'producto'
    ? 'Identificador interno del producto. No puede repetirse en el catálogo.'
    : 'Identificador interno opcional. No puede repetirse en el catálogo.',
);

/** Categoría del form que no está en el lote activo cargado (inactiva / huérfana). */
const categoriaHuerfanaForm = computed(() => {
  const id = formulario.value.categoriaId?.trim();
  if (!id) return null;
  if (categorias.value.some((c) => c._id === id)) return null;
  return { id, label: 'Categoría no disponible (elige otra)' };
});

const tenantsDisponibles = ref<Tenant[]>([]);
const tenantIdsDestino = ref<string[]>([]);

const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = ref('');
const servicioADesactivar = ref<Servicio | null>(null);

/** true si la query traía `tipo` inválido/vacío y hay que limpiar la URL */
function applyQueryToState(): boolean {
  filters.value.nombre = queryString(route.query, 'nombre') ?? '';
  filters.value.categoriaId = queryString(route.query, 'categoriaId') ?? '';
  const tipo = queryString(route.query, 'tipo');
  const tipoValido = tipo === 'servicio' || tipo === 'producto';
  filters.value.tipo = tipoValido ? tipo : '';
  const orden = queryString(route.query, 'orden');
  filters.value.orden =
    orden && (ORDENES as readonly string[]).includes(orden)
      ? (orden as ServicioOrden)
      : 'creacion';
  filters.value.page = queryInt(route.query, 'page', 1);
  filters.value.limit = queryInt(route.query, 'limit', 20, { max: 100 });
  verInactivos.value = queryFlag(route.query, 'verInactivos');
  // `tipo` presente en URL pero no usable → sync para no dejar query sucia
  return tipo != null && tipo !== '' && !tipoValido;
}

async function syncQuery() {
  const next = compactQuery({
    nombre: filters.value.nombre?.trim() || undefined,
    categoriaId: filters.value.categoriaId || undefined,
    tipo: filters.value.tipo || undefined,
    orden:
      filters.value.orden !== 'creacion' ? filters.value.orden : undefined,
    page: (filters.value.page ?? 1) > 1 ? filters.value.page : undefined,
    limit:
      (filters.value.limit ?? 20) !== 20 ? filters.value.limit : undefined,
    verInactivos: boolQuery(verInactivos.value),
  });
  await router.replace({ query: next });
}

function resetFilters() {
  filters.value = {
    nombre: '',
    categoriaId: '',
    tipo: '',
    orden: 'creacion',
    page: 1,
    limit: 20,
  };
  verInactivos.value = false;
}

async function cargarCategorias() {
  const seq = ++categoriasLoadSeq;
  try {
    const res = await getCategoriasServicio({ limit: 100 });
    if (seq !== categoriasLoadSeq) return;
    categorias.value = res.data || [];
    // Si el filtro apunta a una categoría que ya no existe en el tenant, limpiarlo
    if (
      filters.value.categoriaId &&
      !categorias.value.some((c) => c._id === filters.value.categoriaId)
    ) {
      filters.value.categoriaId = '';
      // Sync inmediato: cargarServicios puede fallar después y dejar URL stale
      await syncQuery();
    }
  } catch (err: unknown) {
    if (seq !== categoriasLoadSeq) return;
    console.error('Error al cargar categorías:', err);
    categorias.value = [];
    if (filters.value.categoriaId) {
      filters.value.categoriaId = '';
      await syncQuery();
    }
    actionError.value = extractError(
      err,
      'No fue posible cargar las categorías',
    );
  }
}

const cargarServicios = async () => {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;

  try {
    let page = filters.value.page ?? 1;
    const limit = filters.value.limit ?? 20;
    const activeFilters: AdminServiciosFilters = {
      page,
      limit,
      orden: filters.value.orden,
    };
    if (filters.value.nombre?.trim()) {
      activeFilters.nombre = filters.value.nombre.trim();
    }
    if (filters.value.categoriaId) {
      activeFilters.categoriaId = filters.value.categoriaId;
    }
    if (filters.value.tipo) {
      activeFilters.tipo = filters.value.tipo;
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
    await syncQuery();
  } catch (err: any) {
    if (seq !== loadSeq) return;
    console.error('Error al cargar servicios:', err);
    error.value = extractError(err, 'No fue posible cargar los servicios');
  } finally {
    if (seq === loadSeq) {
      isLoading.value = false;
      hasLoadedOnce.value = true;
    }
  }
};

function clearFilterDebounce() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
}

function reloadFromFilters() {
  successMsg.value = null;
  actionError.value = null;
  void (async () => {
    await syncQuery();
    await cargarServicios();
  })();
}

function handleFilterChange() {
  clearFilterDebounce();
  filterTimeout = setTimeout(() => {
    filters.value.page = 1;
    reloadFromFilters();
  }, 500);
}

function onCategoriaChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function onTipoFilterChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function selectCategoria(categoriaId: string) {
  if (filters.value.categoriaId === categoriaId) return;
  filters.value.categoriaId = categoriaId;
  onCategoriaChange();
}

function onOrdenChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function onVerInactivosChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) - 1;
    reloadFromFilters();
  }
}

function nextPage() {
  if ((filters.value.page ?? 1) < (pagination.value.totalPages ?? 1)) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) + 1;
    reloadFromFilters();
  }
}

/**
 * Abre el modal para crear una nueva servicio
 */
const abrirModalCrear = () => {
  modoEdicion.value = false;
  servicioEditando.value = null;
  clearImagenPendiente();
  formulario.value = {
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    categoriaId: '',
    tipo: 'servicio',
    codigo: '',
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
  clearImagenPendiente();
  const tipoValido =
    servicio.tipo === 'producto' || servicio.tipo === 'servicio';
  formulario.value = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario,
    categoriaId: servicio.categoriaId || '',
    tipo: tipoValido ? servicio.tipo : 'servicio',
    codigo: servicio.codigo || '',
    moneda: 'MXN',
    activo: servicio.activo !== undefined ? servicio.activo : true,
  };
  errorCrear.value = tipoValido
    ? null
    : 'Este ítem no tenía un tipo válido; se guardará como Servicio salvo que elijas otro.';
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
  clearImagenPendiente();
  formulario.value = {
    nombre: '',
    descripcion: '',
    precioUnitario: 0,
    categoriaId: '',
    tipo: 'servicio',
    codigo: '',
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
  if (!formulario.value.categoriaId) {
    errorCrear.value =
      categorias.value.length === 0
        ? 'Crea al menos una categoría antes de agregar servicios'
        : 'Debe seleccionar una categoría';
    return;
  }
  const categoriaEnCatalogo = categorias.value.some(
    (c) => c._id === formulario.value.categoriaId,
  );
  if (!modoEdicion.value && !categoriaEnCatalogo) {
    errorCrear.value =
      categorias.value.length === 0
        ? 'Crea al menos una categoría antes de agregar servicios'
        : 'Debe seleccionar una categoría activa del catálogo';
    return;
  }
  if (modoEdicion.value && !categoriaEnCatalogo) {
    errorCrear.value =
      'La categoría actual no está disponible. Elige una categoría activa';
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
    const codigoTrim = formulario.value.codigo?.trim() || '';
    const fileToUpload =
      formulario.value.tipo === 'producto' ? imagenPendiente.value : null;

    if (modoEdicion.value) {
      const id = servicioEditando.value!._id!;
      const payload: UpdateServicioPayload = {
        nombre,
        descripcion: formulario.value.descripcion?.trim() || '',
        precioUnitario: formulario.value.precioUnitario,
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        codigo: codigoTrim,
        moneda: 'MXN',
        activo: formulario.value.activo,
      };
      await updateServicio(id, payload);
      if (fileToUpload) {
        await uploadServicioImagen(id, fileToUpload);
      }
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
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        ...(codigoTrim ? { codigo: codigoTrim } : {}),
        moneda: 'MXN',
        activo: formulario.value.activo,
        tenantIds: ids,
      });
      // Imagen solo en el ítem del tenant activo (mismo listado); no multi-upload
      if (fileToUpload) {
        const activeId = authStore.activeTenantId;
        const target =
          result.created.find((c) => String(c.tenantId) === String(activeId)) ||
          result.created[0];
        if (target?._id) {
          await uploadServicioImagen(target._id, fileToUpload);
        }
      }
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
      const created = await createServicio({
        nombre,
        descripcion: formulario.value.descripcion?.trim() || undefined,
        precioUnitario: formulario.value.precioUnitario,
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        ...(codigoTrim ? { codigo: codigoTrim } : {}),
        moneda: 'MXN',
        activo: formulario.value.activo,
      });
      if (fileToUpload && created._id) {
        await uploadServicioImagen(created._id, fileToUpload);
      }
      successMsg.value = 'Servicio creado.';
    }
    cerrarModal();
    await cargarServicios();
  } catch (err: unknown) {
    console.error('Error al guardar servicio:', err);
    errorCrear.value = extractError(
      err,
      'No fue posible guardar el servicio',
    );
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

watch(
  () => formulario.value.tipo,
  (tipo) => {
    if (tipo !== 'producto') clearImagenPendiente();
  },
);

watch(activeTenantId, () => {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
  resetFilters();
  hasLoadedOnce.value = false;
  categorias.value = [];
  if (mostrarModal.value) cerrarModal();
  mostrarConfirmDesactivar.value = false;
  servicioADesactivar.value = null;
  successMsg.value = null;
  actionError.value = null;
  void (async () => {
    await syncQuery();
    await cargarCategorias();
    await cargarServicios();
  })();
});

// Cargar datos al montar el componente
onMounted(async () => {
  if (shouldResetListQueryForTenant(activeTenantId.value)) {
    resetFilters();
  } else {
    const tipoQuerySucia = applyQueryToState();
    if (tipoQuerySucia) {
      await syncQuery();
    }
  }
  await cargarCategorias();
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
