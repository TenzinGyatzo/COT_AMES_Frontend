<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton
      to="/admin/cotizaciones"
      class="mb-4"
      default-text="Volver a Cotizaciones"
    />

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      Detalle de Cotización
    </h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingCotizaciones && !cotizacionDetalle"
      message="Cargando detalle de la cotización..."
    />

    <div v-else-if="cotizacionDetalle" class="space-y-4 md:space-y-6">
      <!-- Estado destacado -->
      <div
        :class="getEstadoBannerClass(cotizacionDetalle.estado)"
        class="rounded-lg border-2 shadow-lg p-4 md:p-6"
      >
        <div
          class="flex items-center justify-between flex-col md:flex-row gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              :class="getEstadoIconClass(cotizacionDetalle.estado)"
              class="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="cotizacionDetalle.estado === 'vigente'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'aceptada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'vencida'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'rechazada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
              <p class="text-xs md:text-sm font-medium opacity-75 mb-1">
                Estado de la Cotización
              </p>
              <h3
                :class="getEstadoTextClass(cotizacionDetalle.estado)"
                class="text-xl md:text-2xl lg:text-3xl font-bold"
              >
                {{ getEstadoLabel(cotizacionDetalle.estado) }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Desde
                {{
                  formatDateTime(getEstadoTimestamp(cotizacionDetalle.estado))
                }}
              </p>
              <p
                v-if="provenanceLine"
                class="text-xs text-gray-500 mt-1 max-w-md"
                style="font-size: 0.75rem; font-weight: 400; line-height: 1.4"
              >
                {{ provenanceLine }}
              </p>
            </div>
          </div>
          <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
            <div class="text-left md:text-right">
              <p class="text-xs md:text-sm font-medium opacity-75 mb-1">
                Folio
              </p>
              <p class="text-base md:text-lg font-mono font-bold">
                {{ cotizacionDetalle.folio }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <template v-if="cotizacionDetalle.estado === 'vigente'">
                <BaseButtonLoader
                  type="button"
                  variant="primary"
                  size="sm"
                  :disabled="isProcessing"
                  :loading="isProcessing"
                  custom-class="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto justify-center"
                  @click="handleAceptar"
                >
                  Aceptar
                </BaseButtonLoader>
                <BaseButtonLoader
                  type="button"
                  variant="danger"
                  size="sm"
                  :disabled="isProcessing"
                  :loading="isProcessing"
                  custom-class="w-full sm:w-auto justify-center"
                  @click="handleRechazar"
                >
                  Rechazar
                </BaseButtonLoader>
              </template>
              <button
                v-if="puedeRepetir"
                type="button"
                class="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                :disabled="isProcessing"
                @click="abrirRepetir"
              >
                Repetir
              </button>
              <div class="relative">
                <button
                  type="button"
                  class="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  :disabled="isProcessing"
                  @click="showMasAcciones = !showMasAcciones"
                >
                  Más acciones
                  <span class="ml-1 text-gray-400">▾</span>
                </button>
                <div
                  v-if="showMasAcciones"
                  class="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <button
                    v-for="opt in otrosEstados"
                    :key="opt"
                    type="button"
                    class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="isProcessing"
                    @click="!isProcessing && pedirCambioEstado(opt)"
                  >
                    Marcar como {{ getEstadoLabel(opt) }}
                  </button>
                </div>
              </div>
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
              {{ cotizacionDetalle.folio }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Estado
            </label>
            <span
              :class="getEstadoBadgeClass(cotizacionDetalle.estado)"
              class="inline-block px-4 py-2 text-xs md:text-sm font-semibold rounded-lg"
            >
              {{ getEstadoLabel(cotizacionDetalle.estado) }}
            </span>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de creación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaCreacion) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de vencimiento
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaVencimiento) }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaAceptacion">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de aceptación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaAceptacion) }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaRechazo">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de rechazo
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaRechazo) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              PDF
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                @click="handlePreviewPDF"
                :disabled="isPdfBusy"
                class="inline-flex items-center px-4 py-2 border border-medical-blue-200 rounded-md shadow-sm text-sm font-medium text-medical-blue-700 bg-medical-blue-50 hover:bg-medical-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isPdfBusy ? '…' : 'Previsualizar' }}
              </button>
              <button
                type="button"
                @click="handleDownloadPDF"
                :disabled="isPdfBusy"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              Solicitante de la Cotización
            </label>
            <p
              class="text-sm md:text-base"
              :class="
                getUsuarioClienteNombre()
                  ? 'text-gray-900'
                  : 'text-gray-500 italic'
              "
            >
              {{ getUsuarioClienteNombre() || 'Sin solicitante' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Correo del solicitante
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{
                getUsuarioClienteEmail() ||
                cotizacionDetalle.emailContacto ||
                '-'
              }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Teléfono del solicitante
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteTelefono() || '-' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Persona(s) a evaluar – nombre(s)
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getPersonasAEvaluar() || '-' }}
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

      <!-- Mensaje de éxito -->
      <div
        v-if="successMessage"
        class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <!-- Items de la cotización -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Servicios Cotizados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Cantidad
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Precio Unitario
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(item, index) in cotizacionDetalle.items"
                :key="index"
                class="hover:bg-gray-50 border-b border-gray-100"
              >
                <td class="px-3 py-2 text-sm text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-center">
                  {{ item.cantidad }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-right">
                  ${{
                    item.precioUnitarioSnapshot.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
                <td
                  class="px-3 py-2 text-sm text-gray-900 text-right font-medium"
                >
                  ${{
                    item.subtotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900"
                >
                  Subtotal:
                </td>
                <td class="px-3 py-2 text-right font-semibold text-gray-900">
                  ${{
                    cotizacionDetalle.total.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
              <tr class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  IVA:
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  ${{
                    iva.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-bold text-gray-900"
                >
                  Total:
                </td>
                <td
                  class="px-3 py-2 text-right font-bold text-lg text-gray-900"
                >
                  ${{
                    totalConIva.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- PDF -->
      <div
        v-if="cotizacionDetalle.pdfUrl"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Documento PDF
        </h2>
        <a
          :href="cotizacionDetalle.pdfUrl"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm"
        >
          <svg
            class="w-4 h-4 mr-2"
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
          Ver PDF
        </a>
      </div>
    </div>

    <div
      v-if="!isLoadingCotizaciones && !cotizacionDetalle"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">
        No se pudo cargar la información de la cotización
      </p>
    </div>

    <!-- Modal de confirmación para rechazo (banner) -->
    <ConfirmationModal
      :show="showConfirmRechazo"
      title="¿Rechazar cotización?"
      message="¿Está seguro de rechazar esta cotización? No se enviará notificación por correo."
      type="danger"
      confirm-text="Sí, rechazar"
      cancel-text="Cancelar"
      @confirm="confirmarRechazo"
      @cancel="showConfirmRechazo = false"
    />

    <!-- Confirmación Más acciones (Story 6.10) -->
    <ConfirmationModal
      :show="showConfirmEstado"
      :title="confirmEstadoTitle"
      :message="confirmEstadoMessage"
      type="warning"
      confirm-text="Sí, cambiar"
      cancel-text="Cancelar"
      @confirm="confirmarCambioEstado"
      @cancel="cancelarCambioEstado"
    />

    <!-- Story 6.12 — elegir modo de precios -->
    <div
      v-if="showRepetirModo"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-modo-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        @click="cerrarRepetir"
      ></div>
      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3
          id="repetir-modo-title"
          class="text-lg font-semibold text-gray-900"
        >
          Repetir cotización
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Elija cómo calcular los precios de la nueva cotización. Se creará con
          folio nuevo y estado vigente; podrá editarla o enviarla después.
        </p>
        <div class="mt-5 flex flex-col gap-2">
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="confirmarRepetirModo('originales')"
          >
            Precios originales
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="confirmarRepetirModo('actualizados')"
          >
            Precios actualizados
          </button>
          <button
            type="button"
            class="mt-1 w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            :disabled="isProcessing"
            @click="cerrarRepetir"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Story 6.12 — resolver warnings (excluir / sustituir) -->
    <div
      v-if="showRepetirWarnings"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-warnings-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        @click="cerrarRepetir"
      ></div>
      <div
        class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3
          id="repetir-warnings-title"
          class="text-lg font-semibold text-gray-900"
        >
          Servicios que requieren atención
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Omita o sustituya cada servicio antes de confirmar. Debe quedar al
          menos un ítem.
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="w in repetirWarnings"
            :key="`${w.index}-${w.servicioId}`"
            class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm"
          >
            <p class="font-medium text-gray-900">
              Ítem {{ w.index + 1 }} —
              {{ nombreItemFuente(w.servicioId) || w.servicioId }}
            </p>
            <p class="text-amber-800 mt-0.5">
              {{
                w.motivo === 'inactivo'
                  ? 'Servicio inactivo en el catálogo'
                  : 'Servicio no encontrado en el catálogo'
              }}
            </p>
            <label class="mt-2 flex items-center gap-2 text-gray-700">
              <input
                v-model="omitirIds[w.servicioId]"
                type="checkbox"
                class="rounded border-gray-300"
                @change="onOmitirChange(w.servicioId)"
              />
              Omitir este ítem
            </label>
            <div v-if="!omitirIds[w.servicioId]" class="mt-2">
              <label class="block text-xs text-gray-500 mb-1"
                >Sustituir por servicio activo</label
              >
              <select
                v-model="sustitucionesMap[w.servicioId]"
                class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">— Seleccionar —</option>
                <option
                  v-for="s in serviciosActivos"
                  :key="s._id"
                  :value="s._id"
                >
                  {{ s.nombre }}
                </option>
              </select>
            </div>
          </li>
        </ul>
        <div class="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            :disabled="isProcessing"
            @click="cerrarRepetir"
          >
            Cancelar
          </button>
          <BaseButtonLoader
            type="button"
            variant="primary"
            size="sm"
            :disabled="isProcessing || !puedeConfirmarWarnings"
            :loading="isProcessing"
            @click="confirmarRepetirConResoluciones"
          >
            Confirmar repetición
          </BaseButtonLoader>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import {
  downloadCotizacionPDF,
  previewCotizacionPDF,
} from '../../utils/pdfHelper';
import type { Servicio } from '../../types/backend';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../../components/base/BaseButtonLoader.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';

const route = useRoute();
const router = useRouter();
const {
  cotizacionDetalle,
  isLoadingCotizaciones,
  error,
  obtenerCotizacionAdmin,
  limpiarCotizacionDetalle,
} = useAdmin();

const isPdfBusy = ref(false);

// Computed para calcular el IVA (16% del subtotal)
const iva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total * 0.16;
});

// Computed para calcular el total con IVA
const totalConIva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total + iva.value;
});

const ESTADOS = ['vigente', 'vencida', 'aceptada', 'rechazada'] as const;
type EstadoCotizacion = (typeof ESTADOS)[number];
let flashTimer: ReturnType<typeof setTimeout> | null = null;

const otrosEstados = computed(() => {
  const actual = cotizacionDetalle.value?.estado;
  return ESTADOS.filter((e) => e !== actual);
});

const provenanceLine = computed(() => {
  const c = cotizacionDetalle.value;
  if (!c?.estadoOrigen) return null;
  const whenAt = c.estadoOrigenAt || getEstadoTimestamp(c.estado);
  if (c.estadoOrigen === 'magic_link') {
    return `Respondido por el cliente · enlace público · ${formatDateTime(whenAt)}`;
  }
  if (c.estadoOrigen === 'usuario') {
    const nombre = c.estadoCambiadoPorNombre?.trim() || 'Usuario AMES';
    return `Marcado por ${nombre} · ${formatDateTime(whenAt)}`;
  }
  if (c.estadoOrigen === 'cron') {
    return `Vencida automáticamente · ${formatDateOnly(whenAt)}`;
  }
  return null;
});

async function cargarDetallePorRuta() {
  const cotizacionId = route.params.id as string;
  if (!cotizacionId) return;
  try {
    await obtenerCotizacionAdmin(cotizacionId);
  } catch (err) {
    console.error('Error al cargar cotización:', err);
  }
}

// Cargar cotización al montar; re-cargar si cambia :id (p. ej. tras Repetir)
onMounted(() => {
  void cargarDetallePorRuta();
});

watch(
  () => route.params.id,
  (next, prev) => {
    if (next && next !== prev) {
      void cargarDetallePorRuta();
    }
  },
);

// Limpiar detalle al desmontar
onUnmounted(() => {
  if (flashTimer != null) {
    clearTimeout(flashTimer);
    flashTimer = null;
  }
  limpiarCotizacionDetalle();
});

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

function getClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return cliente.empresa || '';
  }
  // Fallback para cotizaciones guest
  if ((cotizacionDetalle.value as any).nombreEmpresa) {
    return (cotizacionDetalle.value as any).nombreEmpresa;
  }
  return '';
}

function getClienteId(): string | null {
  if (!cotizacionDetalle.value) return null;
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null && cliente._id) {
    return cliente._id;
  }
  if (typeof cliente === 'string') {
    return cliente;
  }
  return null;
}

function getClienteRfc(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return (cliente as any).rfc || '';
  }
  return '';
}

function getUsuarioClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.nombreContacto?.trim() || '';
}

function getUsuarioClienteEmail(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.emailContacto || '';
}

function getUsuarioClienteTelefono(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.telefonoContacto || '';
}

function getPersonasAEvaluar(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.personasAEvaluar || '';
}

function getServicioNombre(item: any): string {
  const servicio = item.servicioId;
  if (typeof servicio === 'object' && servicio !== null) {
    return (servicio as Servicio).nombre || '';
  }
  return item.nombreServicioSnapshot || 'Servicio desconocido';
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    vencida: 'Vencida',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
  };
  return labels[estado] || estado;
}

function getEstadoBannerClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-50 border-green-300',
    vencida: 'bg-gray-50 border-gray-300',
    aceptada: 'bg-blue-50 border-blue-300',
    rechazada: 'bg-red-50 border-red-300',
  };
  return classes[estado] || 'bg-gray-50 border-gray-300';
}

function getEstadoIconClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-600',
    vencida: 'bg-gray-100 text-gray-600',
    aceptada: 'bg-blue-100 text-blue-600',
    rechazada: 'bg-red-100 text-red-600',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
}

function getEstadoTextClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'text-green-700',
    vencida: 'text-gray-700',
    aceptada: 'text-blue-700',
    rechazada: 'text-red-700',
  };
  return classes[estado] || 'text-gray-700';
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    vencida: 'bg-gray-100 text-gray-800',
    aceptada: 'bg-blue-100 text-blue-800',
    rechazada: 'bg-red-100 text-red-800',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getEstadoTimestamp(estado: string): Date | string | undefined {
  if (!cotizacionDetalle.value) return undefined;

  switch (estado) {
    case 'vigente':
      return (
        cotizacionDetalle.value.fechaEstadoVigente ||
        cotizacionDetalle.value.fechaCreacion
      );
    case 'vencida':
      return cotizacionDetalle.value.fechaEstadoVencida;
    case 'aceptada':
      return (
        cotizacionDetalle.value.fechaEstadoAceptada ||
        cotizacionDetalle.value.fechaAceptacion
      );
    case 'rechazada':
      return (
        cotizacionDetalle.value.fechaEstadoRechazada ||
        cotizacionDetalle.value.fechaRechazo
      );
    default:
      return cotizacionDetalle.value.fechaCreacion;
  }
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Solo fecha (microcopy cron EXPERIENCE / AC4). */
function formatDateOnly(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function handleDownloadPDF(): Promise<void> {
  if (!cotizacionDetalle.value || isPdfBusy.value) return;
  try {
    isPdfBusy.value = true;
    await downloadCotizacionPDF(cotizacionDetalle.value);
  } finally {
    isPdfBusy.value = false;
  }
}

async function handlePreviewPDF(): Promise<void> {
  if (!cotizacionDetalle.value || isPdfBusy.value) return;
  try {
    isPdfBusy.value = true;
    await previewCotizacionPDF(cotizacionDetalle.value);
  } finally {
    isPdfBusy.value = false;
  }
}

// Logic for Acceptance/Rejection + Más acciones (Story 6.10) + Repetir (6.12)
import {
  aceptarCotizacionAdmin,
  rechazarCotizacionAdmin,
  cambiarEstadoCotizacion,
  repetirCotizacion,
  getServicios,
  type ModoPreciosRepetir,
  type RepetirCotizacionWarning,
} from '../../services/admin-api.service';

const isProcessing = ref(false);
const showConfirmRechazo = ref(false);
const showMasAcciones = ref(false);
const showConfirmEstado = ref(false);
const estadoPendiente = ref<EstadoCotizacion | null>(null);
const successMessage = ref<string | null>(null);

const ESTADOS_REPETIBLES: EstadoCotizacion[] = [
  'vigente',
  'vencida',
  'aceptada',
  'rechazada',
];
const puedeRepetir = computed(() => {
  const e = cotizacionDetalle.value?.estado;
  return !!e && ESTADOS_REPETIBLES.includes(e as EstadoCotizacion);
});

const showRepetirModo = ref(false);
const showRepetirWarnings = ref(false);
const repetirModo = ref<ModoPreciosRepetir | null>(null);
const repetirWarnings = ref<RepetirCotizacionWarning[]>([]);
const omitirIds = reactive<Record<string, boolean>>({});
const sustitucionesMap = reactive<Record<string, string>>({});
const serviciosActivos = ref<Servicio[]>([]);

const puedeConfirmarWarnings = computed(() => {
  if (!repetirWarnings.value.length) return false;
  const todosResueltos = repetirWarnings.value.every((w) => {
    if (omitirIds[w.servicioId]) return true;
    return !!sustitucionesMap[w.servicioId];
  });
  if (!todosResueltos) return false;

  // No confirmar si omitir dejaría 0 ítems (mismo criterio BE).
  const items = cotizacionDetalle.value?.items || [];
  const warningIds = new Set(repetirWarnings.value.map((w) => w.servicioId));
  const omitIds = new Set(
    repetirWarnings.value
      .filter((w) => omitirIds[w.servicioId])
      .map((w) => w.servicioId),
  );
  let restantes = 0;
  for (const it of items) {
    const sid = itemServicioId(it.servicioId);
    if (!sid) continue;
    if (omitIds.has(sid)) continue;
    if (warningIds.has(sid) && !sustitucionesMap[sid]) continue;
    restantes += 1;
  }
  return restantes >= 1;
});

function itemServicioId(
  servicioId: string | Servicio | undefined,
): string {
  if (!servicioId) return '';
  if (typeof servicioId === 'string') return servicioId;
  return String((servicioId as Servicio)._id || '');
}

function nombreItemFuente(servicioId: string): string {
  const items = cotizacionDetalle.value?.items || [];
  const hit = items.find((it) => itemServicioId(it.servicioId) === servicioId);
  return hit?.nombreServicioSnapshot || '';
}

function parseRepetirWarnings(err: unknown): RepetirCotizacionWarning[] | null {
  const data = (err as { response?: { data?: any } })?.response?.data;
  if (!data) return null;
  if (Array.isArray(data.warnings)) return data.warnings;
  if (data.message && Array.isArray(data.message.warnings)) {
    return data.message.warnings;
  }
  return null;
}

function abrirRepetir() {
  if (isProcessing.value || !puedeRepetir.value) return;
  showMasAcciones.value = false;
  repetirWarnings.value = [];
  repetirModo.value = null;
  Object.keys(omitirIds).forEach((k) => delete omitirIds[k]);
  Object.keys(sustitucionesMap).forEach((k) => delete sustitucionesMap[k]);
  showRepetirModo.value = true;
}

function cerrarRepetir() {
  if (isProcessing.value) return;
  showRepetirModo.value = false;
  showRepetirWarnings.value = false;
  repetirModo.value = null;
  repetirWarnings.value = [];
  Object.keys(omitirIds).forEach((k) => delete omitirIds[k]);
  Object.keys(sustitucionesMap).forEach((k) => delete sustitucionesMap[k]);
}

function onOmitirChange(servicioId: string) {
  if (omitirIds[servicioId]) {
    sustitucionesMap[servicioId] = '';
  }
}

async function loadServiciosActivos() {
  try {
    const res = await getServicios({ activo: true, page: 1, limit: 100 });
    serviciosActivos.value = res.data || [];
  } catch (e) {
    console.error('Error al cargar servicios para sustituir:', e);
    serviciosActivos.value = [];
  }
}

async function ejecutarRepetir(payload: {
  modoPrecios: ModoPreciosRepetir;
  omitirServicioIds?: string[];
  sustituciones?: Array<{ fromServicioId: string; toServicioId: string }>;
}) {
  if (!cotizacionDetalle.value || isProcessing.value) return;
  isProcessing.value = true;
  successMessage.value = null;
  const fuenteId = cotizacionDetalle.value._id;
  try {
    const nueva = await repetirCotizacion(fuenteId, payload);
    showRepetirModo.value = false;
    showRepetirWarnings.value = false;
    await router.push({
      name: 'admin-cotizacion-detalle',
      params: { id: nueva._id },
    });
  } catch (error) {
    const warnings = parseRepetirWarnings(error);
    if (warnings?.length) {
      // Liberar UI antes de cargar catálogo para que Cancelar responda.
      isProcessing.value = false;
      repetirModo.value = payload.modoPrecios;
      repetirWarnings.value = warnings;
      for (const w of warnings) {
        if (omitirIds[w.servicioId] === undefined) {
          omitirIds[w.servicioId] = false;
        }
        if (sustitucionesMap[w.servicioId] === undefined) {
          sustitucionesMap[w.servicioId] = '';
        }
      }
      showRepetirModo.value = false;
      showRepetirWarnings.value = true;
      await loadServiciosActivos();
      return;
    }
    console.error('Error al repetir cotización:', error);
    alert('Ocurrió un error al repetir la cotización.');
  } finally {
    isProcessing.value = false;
  }
}

async function confirmarRepetirModo(modo: ModoPreciosRepetir) {
  repetirModo.value = modo;
  await ejecutarRepetir({ modoPrecios: modo });
}

async function confirmarRepetirConResoluciones() {
  if (!repetirModo.value || !puedeConfirmarWarnings.value) return;
  const omitirServicioIds = repetirWarnings.value
    .filter((w) => omitirIds[w.servicioId])
    .map((w) => w.servicioId);
  const sustituciones = repetirWarnings.value
    .filter((w) => !omitirIds[w.servicioId] && sustitucionesMap[w.servicioId])
    .map((w) => ({
      fromServicioId: w.servicioId,
      toServicioId: sustitucionesMap[w.servicioId],
    }));
  await ejecutarRepetir({
    modoPrecios: repetirModo.value,
    omitirServicioIds,
    sustituciones,
  });
}

const confirmEstadoTitle = computed(() =>
  estadoPendiente.value
    ? `¿Marcar como ${getEstadoLabel(estadoPendiente.value)}?`
    : '¿Cambiar estado?',
);
const confirmEstadoMessage = computed(() => {
  if (estadoPendiente.value === 'vigente') {
    return 'Se marcará como vigente y se extenderá la fecha de vencimiento según la vigencia del tenant. No se enviará notificación por correo.';
  }
  return 'Se actualizará el estado de la cotización. No se enviará notificación por correo.';
});

function flashSuccess(msg: string) {
  successMessage.value = msg;
  if (flashTimer != null) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    successMessage.value = null;
    flashTimer = null;
  }, 5000);
}

async function reloadDetalleAfterMutation(id: string): Promise<boolean> {
  try {
    await obtenerCotizacionAdmin(id);
    return true;
  } catch (reloadErr) {
    console.error('Estado persistido; fallo al recargar detalle:', reloadErr);
    return false;
  }
}

async function handleAceptar() {
  if (!cotizacionDetalle.value || isProcessing.value) return;

  showMasAcciones.value = false;
  isProcessing.value = true;
  successMessage.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await aceptarCotizacionAdmin(id, {});
    const reloaded = await reloadDetalleAfterMutation(id);
    flashSuccess(
      reloaded
        ? 'Estado actualizado a Aceptada.'
        : 'Estado actualizado a Aceptada. Recarga la página para ver el detalle.',
    );
  } catch (error) {
    console.error('Error al aceptar cotización:', error);
    alert('Ocurrió un error al aceptar la cotización.');
  } finally {
    isProcessing.value = false;
  }
}

async function handleRechazar() {
  if (!cotizacionDetalle.value) return;
  showConfirmRechazo.value = true;
}

async function confirmarRechazo() {
  if (!cotizacionDetalle.value || isProcessing.value) return;
  showConfirmRechazo.value = false;

  isProcessing.value = true;
  successMessage.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await rechazarCotizacionAdmin(id);
    const reloaded = await reloadDetalleAfterMutation(id);
    flashSuccess(
      reloaded
        ? 'Estado actualizado a Rechazada.'
        : 'Estado actualizado a Rechazada. Recarga la página para ver el detalle.',
    );
  } catch (error) {
    console.error('Error al rechazar cotización:', error);
    alert('Ocurrió un error al rechazar la cotización.');
  } finally {
    isProcessing.value = false;
  }
}

function pedirCambioEstado(estado: EstadoCotizacion) {
  if (isProcessing.value) return;
  showMasAcciones.value = false;
  estadoPendiente.value = estado;
  showConfirmEstado.value = true;
}

function cancelarCambioEstado() {
  showConfirmEstado.value = false;
  estadoPendiente.value = null;
}

async function confirmarCambioEstado() {
  if (!cotizacionDetalle.value || !estadoPendiente.value || isProcessing.value) {
    return;
  }
  const destino = estadoPendiente.value;
  showConfirmEstado.value = false;
  estadoPendiente.value = null;

  isProcessing.value = true;
  successMessage.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await cambiarEstadoCotizacion(id, destino);
    const reloaded = await reloadDetalleAfterMutation(id);
    const label = getEstadoLabel(destino);
    flashSuccess(
      reloaded
        ? `Estado actualizado a ${label}.`
        : `Estado actualizado a ${label}. Recarga la página para ver el detalle.`,
    );
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert('Ocurrió un error al cambiar el estado.');
  } finally {
    isProcessing.value = false;
  }
}
</script>
