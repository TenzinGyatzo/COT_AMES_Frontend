<template>
  <div class="max-w-6xl mx-auto p-5 animate-in fade-in duration-700">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
        Cotizador
      </h1>
      <p class="mt-2 text-gray-500 text-lg">
        Identidad flexible e ítems del catálogo — solicitante y envío opcionales.
      </p>
    </div>

    <!-- PASO 1: Identidad (siempre habilitado) -->
    <div
      class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 bg-medical-blue-100 text-medical-blue-700"
        >
          1
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">Identidad</h2>
          <p class="text-sm text-gray-500">
            Cliente y solicitante opcionales. Puedes guardar sin solicitante.
          </p>
        </div>
      </div>

      <!-- CRM -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div class="space-y-1.5">
          <label for="clienteCrm" class="text-sm font-bold text-gray-700 ml-1"
            >Cliente CRM (opcional)</label
          >
          <select
            id="clienteCrm"
            v-model="clienteId"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
            @change="onClienteChange"
          >
            <option value="">— Sin cliente —</option>
            <option
              v-for="c in clientes"
              :key="c._id"
              :value="c._id"
            >
              {{ c.empresa }}
            </option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label for="contactoCrm" class="text-sm font-bold text-gray-700 ml-1"
            >Contacto / Solicitante CRM (opcional)</label
          >
          <div class="flex gap-2">
            <select
              id="contactoCrm"
              v-model="contactoId"
              :disabled="!clienteId"
              class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm disabled:opacity-50"
              @change="onContactoChange"
            >
              <option value="">— Sin solicitante —</option>
              <option
                v-for="ct in contactos"
                :key="ct._id"
                :value="ct._id"
              >
                {{ ct.nombre }}
              </option>
            </select>
            <button
              type="button"
              :disabled="!clienteId"
              class="px-3 py-2 text-sm font-bold rounded-xl border border-medical-blue-200 text-medical-blue-700 bg-medical-blue-50 hover:bg-medical-blue-100 disabled:opacity-40"
              @click="mostrarAltaContacto = true"
            >
              + Contacto
            </button>
          </div>
          <p
            v-if="clienteId && contactos.length === 0 && !loadingContactos"
            class="text-xs text-gray-500 ml-1"
          >
            Sin contactos activos.
            <button
              type="button"
              class="underline text-medical-blue-600"
              @click="mostrarAltaContacto = true"
            >
              Agregar al vuelo
            </button>
          </p>
        </div>
      </div>

      <p
        v-if="!tieneSolicitante"
        class="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2"
      >
        Sin solicitante — la cotización se puede guardar igual.
      </p>

      <!-- Guest / ad hoc / override -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label for="empresa" class="text-sm font-bold text-gray-700 ml-1"
            >Nombre de la Empresa</label
          >
          <input
            id="empresa"
            v-model="datosCliente.empresa"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
            placeholder="Opcional (guest o override)"
          />
        </div>
        <div class="space-y-1.5">
          <label
            for="nombreContacto"
            class="text-sm font-bold text-gray-700 ml-1"
            >Solicitante de la Cotización</label
          >
          <input
            id="nombreContacto"
            v-model="datosCliente.nombreContacto"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
            placeholder="Opcional"
          />
        </div>
        <div class="space-y-1.5">
          <label for="correo" class="text-sm font-bold text-gray-700 ml-1"
            >Correo Electrónico</label
          >
          <input
            id="correo"
            v-model="datosCliente.correo"
            type="email"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
            placeholder="correo@empresa.com"
          />
        </div>
        <div class="space-y-1.5">
          <label for="telefono" class="text-sm font-bold text-gray-700 ml-1"
            >Teléfono de Contacto</label
          >
          <input
            id="telefono"
            v-model="datosCliente.telefono"
            type="tel"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
            placeholder="Opcional"
          />
        </div>
        <div class="space-y-1.5 col-span-1 md:col-span-2">
          <label
            for="personasAEvaluar"
            class="text-sm font-bold text-gray-700 ml-1"
            >Persona(s) a evaluar – nombre(s)</label
          >
          <textarea
            id="personasAEvaluar"
            v-model="datosCliente.personasAEvaluar"
            rows="2"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm resize-y"
            placeholder="Opcional"
          />
        </div>
      </div>
    </div>

    <!-- PASO 2: Servicios -->
    <div class="mb-10 transition-all duration-700 opacity-100">
      <TablaServiciosCotizador
        :servicios-seleccionados="serviciosSeleccionados"
        :cantidades-por-servicio="cantidadesPorServicio"
        :item-overrides="itemOverrides"
        :is-loading="isLoadingServicios"
        @abrir-modal="abrirModal"
        @actualizar-cantidad="actualizarCantidad"
        @eliminar-servicio="eliminarServicio"
        @actualizar-override="onActualizarOverride"
      />
    </div>

    <!-- PASO 3: Opciones + guardar (requiere ≥1 servicio) -->
    <div
      class="transition-all duration-700"
      :class="[
        serviciosSeleccionados.length === 0
          ? 'opacity-40 grayscale pointer-events-none blur-[1px]'
          : 'opacity-100',
      ]"
    >
      <div
        class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      >
        <h2 class="text-lg font-bold text-gray-800 mb-4">Opciones</h2>
        <div class="mb-4">
          <label
            for="fechaVencimiento"
            class="block text-sm font-bold text-gray-700 mb-1.5 ml-1"
          >
            Fecha de vencimiento
          </label>
          <input
            id="fechaVencimiento"
            v-model="fechaVencimiento"
            type="date"
            class="w-full max-w-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
          />
          <p class="text-xs text-gray-500 mt-1 ml-1">
            Precargada desde la vigencia default del tenant; puedes ajustarla.
          </p>
        </div>
        <!-- Plantillas PDF (Story 6.5) -->
        <div class="mb-6">
          <h3 class="text-sm font-bold text-gray-800 mb-2">
            Plantillas adicionales
          </h3>
          <p class="text-xs text-gray-500 mb-3">
            Opcional. El orden de las seleccionadas define el orden de páginas
            tras el cuerpo del PDF.
          </p>
          <div
            v-if="isLoadingPlantillas"
            class="text-sm text-gray-500 py-2"
          >
            Cargando plantillas…
          </div>
          <div
            v-else-if="errorPlantillas"
            class="text-sm text-red-700 py-2 rounded-xl border border-red-200 bg-red-50 px-3"
            role="alert"
          >
            {{ errorPlantillas }}
          </div>
          <div
            v-else-if="plantillasDisponibles.length === 0"
            class="text-sm text-gray-500 py-2 rounded-xl border border-dashed border-gray-200 px-3"
          >
            No hay plantillas activas. Puedes continuar sin plantillas.
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="p in plantillasDisponibles"
              :key="p._id"
              class="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-gray-200 bg-white"
            >
              <label class="flex items-center gap-2 flex-1 min-w-[12rem] cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                  :checked="isPlantillaSeleccionada(p._id || '')"
                  @change="togglePlantillaSeleccion(p)"
                />
                <span class="text-sm font-medium text-gray-800">{{
                  p.nombre
                }}</span>
              </label>
              <template v-if="isPlantillaSeleccionada(p._id || '')">
                <button
                  type="button"
                  class="px-2 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  :disabled="plantillaOrderIndex(p._id || '') <= 0"
                  title="Subir"
                  @click="moverPlantilla(p._id || '', -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="px-2 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  :disabled="
                    plantillaOrderIndex(p._id || '') >=
                    plantillasSeleccionadasIds.length - 1
                  "
                  title="Bajar"
                  @click="moverPlantilla(p._id || '', 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 text-xs font-bold rounded-xl bg-medical-blue-50 text-medical-blue-700 hover:bg-medical-blue-100"
                  @click="abrirPersonalizar(p)"
                >
                  Personalizar
                </button>
              </template>
            </li>
          </ul>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="p-4 bg-medical-blue-50/50 rounded-2xl border border-medical-blue-100"
            :class="{ 'opacity-60': !bancariosUtiles }"
          >
            <label
              class="flex items-center group"
              :class="
                bancariosUtiles ? 'cursor-pointer' : 'cursor-not-allowed'
              "
            >
              <div class="relative">
                <input
                  type="checkbox"
                  v-model="incluirDatosBancarios"
                  :disabled="!bancariosUtiles"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue-600 peer-disabled:opacity-50"
                ></div>
              </div>
              <div class="ml-4">
                <span
                  class="block text-sm font-bold text-gray-800 group-hover:text-medical-blue-700 transition-colors"
                >
                  Incluir datos bancarios en el PDF
                </span>
                <span class="text-xs text-medical-blue-600/70">
                  {{
                    bancariosUtiles
                      ? 'Página bancaria independiente de las plantillas.'
                      : 'Configura datos bancarios del tenant (CLABE o banco+cuenta) para habilitar.'
                  }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Destinatarios Para/CC (Story 6.6) -->
        <div class="mt-6 space-y-4">
          <h3 class="text-sm font-bold text-gray-800">Destinatarios del correo</h3>
          <p class="text-xs text-gray-500">
            Opcional. Puedes guardar la cotización sin destinatarios ni envío.
          </p>
          <EmailChipsInput
            v-model="emailsPara"
            label="Para"
            input-id="emails-para"
            variant="para"
            :exclude="emailsCc"
            hint="Quienes reciben el PDF y el enlace. Enter agrega un correo."
          />
          <EmailChipsInput
            v-model="emailsCc"
            label="CC"
            input-id="emails-cc"
            variant="cc"
            :exclude="emailsPara"
            hint="Copia a otros correos (manual o desde contactos del cliente)."
          />
          <div
            v-if="contactosParaChecklist.length > 0"
            class="rounded-xl border border-gray-200 bg-white p-3 space-y-2"
          >
            <p class="text-xs font-bold text-gray-700">
              Otros contactos del cliente (CC)
            </p>
            <label
              v-for="c in contactosParaChecklist"
              :key="c._id"
              class="flex items-center gap-2 text-sm text-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                class="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                :checked="isContactoEnCc(c)"
                @change="toggleContactoCc(c)"
              />
              <span>
                {{ c.nombre }}
                <span class="text-gray-500">({{ c.correo }})</span>
              </span>
            </label>
          </div>
          <div
            class="p-4 bg-medical-blue-50/50 rounded-2xl border border-medical-blue-100"
            :class="{ 'opacity-60': !hasParaDestinatarios }"
          >
            <label
              class="flex items-center group"
              :class="
                hasParaDestinatarios ? 'cursor-pointer' : 'cursor-not-allowed'
              "
            >
              <div class="relative">
                <input
                  type="checkbox"
                  v-model="enviarEmail"
                  :disabled="!hasParaDestinatarios"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-blue-600 peer-disabled:opacity-50"
                ></div>
              </div>
              <div class="ml-4">
                <span
                  class="block text-sm font-bold text-gray-800 group-hover:text-medical-blue-700 transition-colors"
                >
                  Enviar cotización por correo
                </span>
                <span
                  v-if="hasParaDestinatarios"
                  class="text-xs text-medical-blue-600/70"
                >
                  Para: {{ emailsPara.join(', ')
                  }}{{
                    emailsCc.length
                      ? ` · CC: ${emailsCc.join(', ')}`
                      : ''
                  }}
                </span>
                <span v-else class="text-xs text-gray-500 italic">
                  Agrega al menos un correo en Para para habilitar el envío
                  (opcional — puedes guardar sin enviar).
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3"
      >
        <p class="font-medium">{{ error }}</p>
      </div>

      <div class="flex flex-col items-center">
        <button
          type="button"
          @click="crearCotizacion"
          :disabled="isCreating || !!ultimaRespuesta"
          class="group relative px-12 py-4 bg-medical-blue-600 text-white rounded-2xl hover:bg-medical-blue-700 active:scale-95 transition-all font-extrabold text-xl shadow-2xl shadow-medical-blue-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span v-if="isCreating" class="flex items-center gap-3">
            Procesando...
          </span>
          <span v-else>Generar Cotización</span>
        </button>

        <div v-if="mensajeValidacion" class="mt-4">
          <div
            class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200 shadow-sm"
          >
            {{ mensajeValidacion }}
          </div>
        </div>
      </div>
    </div>

    <ModalSeleccionServicios
      :is-open="modalAbierto"
      :is-loading="isLoadingServicios"
      :servicios-ya-seleccionados="cantidadesPorServicio"
      @close="cerrarModalServicios"
      @agregar-servicios="agregarServiciosSeleccionados"
    />

    <ModalCotizacionCreada
      :cotizacion="ultimaRespuesta"
      :mostrar-mensaje-email="true"
      :email-enviado="emailSendOk"
      :email-sending="isSendingEmail"
      :email-error="emailSendError"
      :initial-emails-para="emailsPara"
      :initial-emails-cc="emailsCc"
      :is-resend-busy="isResendingEmail"
      @close="cerrarModal"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetalles"
      @reintentar="reintentarEnvioCorreo"
    />

    <ConfirmationModal
      :show="showSyncModal"
      title="¿Actualizar el catálogo de servicios?"
      :message="syncModalMessage"
      confirm-text="Sí, actualizar catálogo"
      cancel-text="No, solo esta cotización"
      type="warning"
      :separate-dismiss="true"
      @confirm="resolverSyncModal('sync')"
      @cancel="resolverSyncModal('no-sync')"
      @dismiss="onSyncModalDismiss"
    />

    <ConfirmationModal
      :show="showDiscardSyncModal"
      title="¿Descartar cambios?"
      message="Hay cambios inline pendientes. Si descartas, no se creará la cotización."
      confirm-text="Descartar cambios"
      cancel-text="Seguir editando"
      type="danger"
      @confirm="confirmarDescartarSync"
      @cancel="cancelarDescartarSync"
    />

    <!-- Personalizar plantilla (snapshot) Story 6.5 -->
    <div
      v-if="showPersonalizarModal"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40"
      @pointerdown="onPersonalizarBackdropPointerDown"
      @pointerup="onPersonalizarBackdropPointerUp"
      @pointercancel="onPersonalizarBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-personalizar-plantilla"
        @pointerdown.stop
      >
        <div class="px-5 py-4 border-b border-gray-200">
          <h2
            id="titulo-personalizar-plantilla"
            class="text-lg font-semibold text-gray-900"
          >
            Personalizar: {{ personalizarNombre }}
          </h2>
          <p
            class="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
          >
            Esta edición aplica solo a esta cotización.
          </p>
        </div>
        <div class="px-5 py-4 space-y-4">
          <p v-if="errorPersonalizar" class="text-sm text-red-600">
            {{ errorPersonalizar }}
          </p>
          <PlantillaSeccionesEditor v-model="personalizarDraft" />
          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              v-model="guardarTambienEnMaestra"
              type="checkbox"
              class="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
            />
            Guardar también en plantilla
          </label>
          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100"
          >
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              :disabled="guardandoPersonalizar"
              @click="cerrarPersonalizar"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-medical-blue-600 text-white rounded-xl font-bold hover:bg-medical-blue-500 disabled:opacity-50"
              :disabled="guardandoPersonalizar"
              @click="guardarPersonalizar"
            >
              {{
                guardandoPersonalizar ? 'Guardando…' : 'Guardar y cerrar'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alta contacto al vuelo -->
    <div
      v-if="mostrarAltaContacto"
      class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
      @click.self="cerrarAltaContacto"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Nuevo contacto</h3>
        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700">Nombre *</label>
          <input
            v-model="nuevoContacto.nombre"
            type="text"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl"
            placeholder="Nombre obligatorio"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700">Correo</label>
          <input
            v-model="nuevoContacto.correo"
            type="email"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl"
            placeholder="Opcional"
          />
        </div>
        <p v-if="errorAltaContacto" class="text-sm text-red-600">
          {{ errorAltaContacto }}
        </p>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border text-sm font-bold"
            @click="cerrarAltaContacto"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-medical-blue-600 text-white text-sm font-bold disabled:opacity-50"
            :disabled="guardandoContacto"
            @click="crearContactoAlVuelo"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import ModalSeleccionServicios from '../../components/common/ModalSeleccionServicios.vue';
import ModalCotizacionCreada from '../../components/common/ModalCotizacionCreada.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import TablaServiciosCotizador from '../../components/cotizador/TablaServiciosCotizador.vue';
import type { ItemOverrideFields } from '../../components/cotizador/TablaServiciosCotizador.vue';
import PlantillaSeccionesEditor from '../../components/plantillas/PlantillaSeccionesEditor.vue';
import EmailChipsInput from '../../components/cotizador/EmailChipsInput.vue';
import { useCotizador } from '../../composables/useCotizador';
import { useModalDismiss } from '../../composables/useModalDismiss';
import type {
  Cliente,
  Contacto,
  Plantilla,
  SeccionPlantilla,
  Servicio,
} from '../../types/backend';
import {
  createAdminCotizacion,
  createContacto,
  enviarCorreoCotizacion,
  getClientes,
  getContactos,
  getCotizacionAdminById,
  getPlantillas,
  getTenantConfig,
  updatePlantilla,
  updateServicio,
} from '../../services/admin-api.service';
import { generateCotizacionPdfBlob } from '../../utils/pdfHelper';
import { hasBancariosUtiles } from '../../utils/bancarios.util';
import type { CotizacionDetalleDto } from '../../types/backend';

const router = useRouter();

const {
  servicios,
  cantidadesPorServicio,
  error,
  cargarServicios,
  actualizarCantidad,
  resetSelection,
} = useCotizador();

const serviciosDisponibles = ref<Servicio[]>([]);
const isLoadingServicios = ref(false);
const modalAbierto = ref(false);

/** Valores editables por ítem (no mutan el catálogo en memoria). */
const itemOverrides = ref<Record<string, ItemOverrideFields>>({});
/** Baseline del catálogo al seleccionar — dirty de sync vs esto. */
const catalogBaseline = ref<Record<string, ItemOverrideFields>>({});
const showSyncModal = ref(false);
const showDiscardSyncModal = ref(false);
const syncModalMessage = ref('');
type SyncModalChoice = 'sync' | 'no-sync' | 'abort';
let syncModalResolve: ((choice: SyncModalChoice) => void) | null = null;

const clientes = ref<Cliente[]>([]);
const contactos = ref<Contacto[]>([]);
const clienteId = ref('');
const contactoId = ref('');
const loadingContactos = ref(false);
let contactosSeq = 0;

const datosCliente = ref({
  empresa: '',
  nombreContacto: '',
  correo: '',
  telefono: '',
  personasAEvaluar: '',
});
/** YYYY-MM-DD local — siempre se envía en create (Story 6.3). */
const fechaVencimiento = ref('');
let vigenciaDefaultDias = 30;
/** true si el usuario cambió el picker (no precargas programáticas). */
let fechaVencimientoManual = false;
let suppressFechaVencimientoWatch = false;
const enviarEmail = ref(false);
/** Story 6.6 — destinatarios de correo (≠ solicitante emailContacto). */
const emailsPara = ref<string[]>([]);
const emailsCc = ref<string[]>([]);
/** Story 6.8 — resultado real del envío (no el toggle). */
const emailSendOk = ref(false);
const emailSendError = ref<string | null>(null);
/** Create→send en curso (evita «Sin notificación» mid-flight). */
const isSendingEmail = ref(false);
const isResendingEmail = ref(false);
const incluirDatosBancarios = ref(false);
/** Story 6.5 — bancarios útiles en tenant config. */
const bancariosUtiles = ref(false);
const plantillasDisponibles = ref<Plantilla[]>([]);
const isLoadingPlantillas = ref(false);
const errorPlantillas = ref('');
/** Orden = páginas tras el cuerpo. */
const plantillasSeleccionadasIds = ref<string[]>([]);
const plantillaSnapshots = ref<
  Record<string, { nombre: string; secciones: SeccionPlantilla[] }>
>({});
const showPersonalizarModal = ref(false);
const personalizarId = ref('');
const personalizarNombre = ref('');
const personalizarDraft = ref<SeccionPlantilla[]>([]);
const guardarTambienEnMaestra = ref(false);
const errorPersonalizar = ref('');
const guardandoPersonalizar = ref(false);
const mensajeValidacion = ref('');
const isCreating = ref(false);
const ultimaRespuesta = ref<any>(null);

const mostrarAltaContacto = ref(false);
const guardandoContacto = ref(false);
const errorAltaContacto = ref('');
const nuevoContacto = ref({ nombre: '', correo: '' });

const tieneSolicitante = computed(
  () => !!datosCliente.value.nombreContacto.trim(),
);

function clampVigenciaDias(n: number): number {
  if (!Number.isFinite(n)) return 30;
  return Math.min(365, Math.max(1, Math.trunc(n)));
}

function toLocalDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysLocal(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function precargarFechaVencimiento() {
  const dias = clampVigenciaDias(vigenciaDefaultDias);
  suppressFechaVencimientoWatch = true;
  fechaVencimiento.value = toLocalDateInputValue(
    addDaysLocal(new Date(), dias),
  );
  suppressFechaVencimientoWatch = false;
}

/** Date-only local → ISO (fin del día local) para el BE. */
function fechaVencimientoToIso(yyyyMmDd: string): string | undefined {
  const parts = yyyyMmDd.split('-').map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return undefined;
  }
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return undefined;
  }
  return d.toISOString();
}

const cargarVigenciaDefault = async () => {
  try {
    const cfg = await getTenantConfig();
    vigenciaDefaultDias = clampVigenciaDias(
      typeof cfg.vigenciaDefaultDias === 'number'
        ? cfg.vigenciaDefaultDias
        : 30,
    );
    bancariosUtiles.value = hasBancariosUtiles(cfg.bancarios);
    if (!bancariosUtiles.value) {
      incluirDatosBancarios.value = false;
    }
  } catch {
    vigenciaDefaultDias = 30;
    bancariosUtiles.value = false;
    incluirDatosBancarios.value = false;
  }
  // No pisar una fecha que el usuario ya ajustó mientras cargaba la config.
  if (!fechaVencimientoManual) {
    precargarFechaVencimiento();
  }
};

function deepCloneSecciones(secciones: SeccionPlantilla[]): SeccionPlantilla[] {
  return JSON.parse(JSON.stringify(secciones)) as SeccionPlantilla[];
}

const cargarPlantillasDisponibles = async () => {
  isLoadingPlantillas.value = true;
  errorPlantillas.value = '';
  try {
    const all: Plantilla[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await getPlantillas({
        activo: true,
        page,
        limit: 100,
      });
      all.push(...res.data);
      totalPages = res.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
    plantillasDisponibles.value = all;
  } catch {
    plantillasDisponibles.value = [];
    errorPlantillas.value =
      'No se pudieron cargar las plantillas. Puedes continuar sin ellas o recargar la página.';
  } finally {
    isLoadingPlantillas.value = false;
  }
};

function isPlantillaSeleccionada(id: string): boolean {
  return plantillasSeleccionadasIds.value.includes(id);
}

function plantillaOrderIndex(id: string): number {
  return plantillasSeleccionadasIds.value.indexOf(id);
}

function togglePlantillaSeleccion(p: Plantilla) {
  const id = p._id;
  if (!id) return;
  const idx = plantillasSeleccionadasIds.value.indexOf(id);
  if (idx >= 0) {
    plantillasSeleccionadasIds.value = plantillasSeleccionadasIds.value.filter(
      (x) => x !== id,
    );
    const next = { ...plantillaSnapshots.value };
    delete next[id];
    plantillaSnapshots.value = next;
    return;
  }
  plantillasSeleccionadasIds.value = [
    ...plantillasSeleccionadasIds.value,
    id,
  ];
  if (!plantillaSnapshots.value[id]) {
    plantillaSnapshots.value = {
      ...plantillaSnapshots.value,
      [id]: {
        nombre: p.nombre,
        secciones: deepCloneSecciones(p.secciones || []),
      },
    };
  }
}

function moverPlantilla(id: string, delta: number) {
  const arr = [...plantillasSeleccionadasIds.value];
  const i = arr.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  plantillasSeleccionadasIds.value = arr;
}

function abrirPersonalizar(p: Plantilla) {
  const id = p._id;
  if (!id) return;
  if (!isPlantillaSeleccionada(id)) togglePlantillaSeleccion(p);
  const snap =
    plantillaSnapshots.value[id] ||
    ({
      nombre: p.nombre,
      secciones: deepCloneSecciones(p.secciones || []),
    } as const);
  personalizarId.value = id;
  personalizarNombre.value = snap.nombre;
  personalizarDraft.value = deepCloneSecciones(snap.secciones);
  guardarTambienEnMaestra.value = false;
  errorPersonalizar.value = '';
  showPersonalizarModal.value = true;
}

function cerrarPersonalizar() {
  showPersonalizarModal.value = false;
  personalizarId.value = '';
  personalizarDraft.value = [];
  errorPersonalizar.value = '';
  guardandoPersonalizar.value = false;
}

const {
  onBackdropPointerDown: onPersonalizarBackdropPointerDown,
  onBackdropPointerUp: onPersonalizarBackdropPointerUp,
  onBackdropPointerCancel: onPersonalizarBackdropPointerCancel,
} = useModalDismiss(cerrarPersonalizar, showPersonalizarModal);

async function guardarPersonalizar() {
  const id = personalizarId.value;
  if (!id) return;
  const secciones = deepCloneSecciones(personalizarDraft.value);
  plantillaSnapshots.value = {
    ...plantillaSnapshots.value,
    [id]: {
      nombre: personalizarNombre.value,
      secciones,
    },
  };

  if (guardarTambienEnMaestra.value) {
    guardandoPersonalizar.value = true;
    errorPersonalizar.value = '';
    try {
      await updatePlantilla(id, { secciones });
      const local = plantillasDisponibles.value.find((x) => x._id === id);
      if (local) {
        local.secciones = deepCloneSecciones(secciones);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      errorPersonalizar.value = Array.isArray(msg)
        ? `Snapshot local guardado para esta cotización, pero no se pudo actualizar la plantilla maestra: ${msg.join(', ')}`
        : msg ||
          'Snapshot local guardado para esta cotización, pero no se pudo actualizar la plantilla maestra.';
      guardandoPersonalizar.value = false;
      return;
    } finally {
      guardandoPersonalizar.value = false;
    }
  }

  cerrarPersonalizar();
}

onMounted(async () => {
  // Precarga inmediata con fallback 30; se recalcula al llegar la config.
  precargarFechaVencimiento();
  await Promise.all([
    cargarServiciosDisponibles(),
    cargarClientes(),
    cargarVigenciaDefault(),
    cargarPlantillasDisponibles(),
  ]);
});

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hasParaDestinatarios = computed(() => emailsPara.value.length > 0);

const contactosParaChecklist = computed(() =>
  contactos.value.filter((c) => {
    const correo = (c.correo || '').trim();
    if (!correo || !isValidEmail(correo)) return false;
    if (c._id && c._id === contactoId.value) return false;
    // Ya en Para → no mostrar fila no-op (Story 6.6)
    if (emailsPara.value.includes(normalizeEmail(correo))) return false;
    return true;
  }),
);

function ensureInPara(correo: string) {
  const e = normalizeEmail(correo);
  if (!e || !isValidEmail(e)) return;
  if (emailsPara.value.includes(e)) return;
  if (emailsPara.value.length >= 20) return;
  emailsCc.value = emailsCc.value.filter((x) => x !== e);
  emailsPara.value = [...emailsPara.value, e];
}

function isContactoEnCc(c: Contacto): boolean {
  const e = normalizeEmail(c.correo || '');
  return !!e && emailsCc.value.includes(e);
}

function toggleContactoCc(c: Contacto) {
  const e = normalizeEmail(c.correo || '');
  if (!e || !isValidEmail(e)) return;
  if (emailsPara.value.includes(e)) return;
  if (emailsCc.value.includes(e)) {
    emailsCc.value = emailsCc.value.filter((x) => x !== e);
  } else {
    if (emailsCc.value.length >= 20) return;
    emailsCc.value = [...emailsCc.value, e];
  }
}

watch(emailsPara, (para) => {
  if (para.length === 0) {
    enviarEmail.value = false;
  }
  // Quitar de CC cualquier correo que haya pasado a Para
  if (emailsCc.value.some((e) => para.includes(e))) {
    emailsCc.value = emailsCc.value.filter((e) => !para.includes(e));
  }
});

// Preferido 6.3: si el usuario limpia el picker, re-aplicar default del tenant.
watch(fechaVencimiento, (v) => {
  if (suppressFechaVencimientoWatch) return;
  if (!v) {
    fechaVencimientoManual = false;
    precargarFechaVencimiento();
    return;
  }
  fechaVencimientoManual = true;
});

const serviciosSeleccionados = computed(() =>
  serviciosDisponibles.value.filter(
    (servicio) => (cantidadesPorServicio.value[servicio._id || ''] || 0) > 0,
  ),
);

watch(
  cantidadesPorServicio,
  () => {
    const tieneServicios = Object.values(cantidadesPorServicio.value).some(
      (cantidad) => cantidad > 0,
    );
    if (tieneServicios && mensajeValidacion.value.includes('servicio')) {
      mensajeValidacion.value = '';
    }
  },
  { deep: true },
);

const cargarClientes = async () => {
  try {
    const res = await getClientes({ activo: true, page: 1, limit: 100 });
    clientes.value = res.data || [];
  } catch {
    clientes.value = [];
  }
};

const cargarContactos = async (id: string) => {
  const seq = ++contactosSeq;
  loadingContactos.value = true;
  try {
    const res = await getContactos(id, { activo: true, page: 1, limit: 100 });
    if (seq !== contactosSeq) return;
    contactos.value = res.data || [];
  } catch {
    if (seq !== contactosSeq) return;
    contactos.value = [];
  } finally {
    if (seq === contactosSeq) loadingContactos.value = false;
  }
};

const onClienteChange = async () => {
  contactoId.value = '';
  contactos.value = [];
  datosCliente.value.nombreContacto = '';
  datosCliente.value.correo = '';
  datosCliente.value.telefono = '';
  enviarEmail.value = false;
  emailsPara.value = [];
  emailsCc.value = [];
  if (!clienteId.value) {
    datosCliente.value.empresa = '';
    return;
  }
  const c = clientes.value.find((x) => x._id === clienteId.value);
  datosCliente.value.empresa = c?.empresa || '';
  await cargarContactos(clienteId.value);
};

const onContactoChange = () => {
  if (!contactoId.value) {
    datosCliente.value.nombreContacto = '';
    datosCliente.value.correo = '';
    datosCliente.value.telefono = '';
    return;
  }
  const ct = contactos.value.find((x) => x._id === contactoId.value);
  if (!ct) return;
  datosCliente.value.nombreContacto = ct.nombre || '';
  datosCliente.value.correo = ct.correo || '';
  datosCliente.value.telefono = ct.telefono || '';
  if (ct.correo && isValidEmail(ct.correo.trim())) {
    ensureInPara(ct.correo);
  }
};

const cerrarAltaContacto = () => {
  mostrarAltaContacto.value = false;
  errorAltaContacto.value = '';
  nuevoContacto.value = { nombre: '', correo: '' };
};

const crearContactoAlVuelo = async () => {
  errorAltaContacto.value = '';
  const nombre = nuevoContacto.value.nombre.trim();
  if (!nombre) {
    errorAltaContacto.value = 'El nombre es obligatorio';
    return;
  }
  if (!clienteId.value) return;
  guardandoContacto.value = true;
  try {
    const created = await createContacto(clienteId.value, {
      nombre,
      correo: nuevoContacto.value.correo.trim() || undefined,
    });
    await cargarContactos(clienteId.value);
    contactoId.value = created._id || '';
    onContactoChange();
    cerrarAltaContacto();
  } catch (err: any) {
    errorAltaContacto.value =
      err.response?.data?.message || 'No se pudo crear el contacto';
  } finally {
    guardandoContacto.value = false;
  }
};

const cargarServiciosDisponibles = async () => {
  isLoadingServicios.value = true;
  try {
    await cargarServicios();
    serviciosDisponibles.value = [...servicios.value];
  } catch {
    serviciosDisponibles.value = [];
  } finally {
    isLoadingServicios.value = false;
  }
};

const abrirModal = async () => {
  if (serviciosDisponibles.value.length === 0 && !isLoadingServicios.value) {
    await cargarServiciosDisponibles();
  }
  modalAbierto.value = true;
};

const cerrarModalServicios = () => {
  modalAbierto.value = false;
};

function baselineFromServicio(s: Servicio): ItemOverrideFields {
  return {
    nombre: s.nombre,
    descripcion: s.descripcion || '',
    precioUnitario: s.precioUnitario ?? 0,
  };
}

function ensureItemOverride(s: Servicio) {
  if (!s._id) return;
  if (!itemOverrides.value[s._id]) {
    const base = baselineFromServicio(s);
    itemOverrides.value[s._id] = { ...base };
    catalogBaseline.value[s._id] = { ...base };
  }
}

function onActualizarOverride(
  id: string,
  field: keyof ItemOverrideFields,
  value: string | number,
) {
  const current =
    itemOverrides.value[id] ||
    baselineFromServicio(
      serviciosDisponibles.value.find((x) => x._id === id) ||
        ({ nombre: '', precioUnitario: 0 } as Servicio),
    );
  itemOverrides.value = {
    ...itemOverrides.value,
    [id]: { ...current, [field]: value },
  };
}

type DirtySync = {
  servicioId: string;
  label: string;
  campos: string[];
  patch: {
    nombre?: string;
    descripcion?: string;
    precioUnitario?: number;
  };
};

function collectDirtySync(): DirtySync[] {
  const dirty: DirtySync[] = [];
  for (const [servicioId, cantidad] of Object.entries(
    cantidadesPorServicio.value,
  )) {
    if (cantidad <= 0) continue;
    const svc = serviciosDisponibles.value.find((x) => x._id === servicioId);
    // No abrir sync de inactivos (create BE sigue rechazando).
    if (svc?.activo === false) continue;
    const o = itemOverrides.value[servicioId];
    const b = catalogBaseline.value[servicioId];
    if (!o || !b) continue;
    const campos: string[] = [];
    const patch: DirtySync['patch'] = {};
    if (o.nombre.trim() !== b.nombre.trim()) {
      campos.push('nombre');
      patch.nombre = o.nombre.trim();
    }
    if ((o.descripcion || '').trim() !== (b.descripcion || '').trim()) {
      campos.push('descripción');
      patch.descripcion = (o.descripcion || '').trim();
    }
    if (Number(o.precioUnitario) !== Number(b.precioUnitario)) {
      campos.push('precio');
      patch.precioUnitario = Number(o.precioUnitario);
    }
    if (campos.length) {
      dirty.push({
        servicioId,
        label: o.nombre.trim() || b.nombre,
        campos,
        patch,
      });
    }
  }
  return dirty;
}

function askSyncModal(dirty: DirtySync[]): Promise<SyncModalChoice> {
  const lines = dirty.map((d) => `• ${d.label}: ${d.campos.join(', ')}`);
  syncModalMessage.value = [
    'Hubo cambios inline en uno o más ítems. ¿Deseas actualizar el catálogo de servicios del tenant con esos valores?',
    '',
    ...lines,
    '',
    'Si eliges No, solo esta cotización guardará los valores editados.',
  ].join('\n');
  showSyncModal.value = true;
  return new Promise((resolve) => {
    syncModalResolve = resolve;
  });
}

function resolverSyncModal(choice: SyncModalChoice) {
  showSyncModal.value = false;
  showDiscardSyncModal.value = false;
  const resolve = syncModalResolve;
  syncModalResolve = null;
  resolve?.(choice);
}

/** Esc/backdrop: hay cambios inline → minimodal Descartar / Seguir editando. */
function onSyncModalDismiss() {
  if (showDiscardSyncModal.value) return;
  showDiscardSyncModal.value = true;
}

function confirmarDescartarSync() {
  showDiscardSyncModal.value = false;
  resolverSyncModal('abort');
}

function cancelarDescartarSync() {
  showDiscardSyncModal.value = false;
}

const agregarServiciosSeleccionados = (
  serviciosParaAgregar: Record<string, number>,
  serviciosDelModal: Servicio[] = [],
) => {
  for (const s of serviciosDelModal) {
    if (!s._id) continue;
    if (!serviciosDisponibles.value.some((x) => x._id === s._id)) {
      serviciosDisponibles.value.push(s);
    }
    ensureItemOverride(s);
  }
  Object.entries(serviciosParaAgregar).forEach(([servicioId, cantidad]) => {
    const s = serviciosDisponibles.value.find((x) => x._id === servicioId);
    if (s) ensureItemOverride(s);
    actualizarCantidad(servicioId, cantidad);
  });
};

const eliminarServicio = (servicioId: string) => {
  actualizarCantidad(servicioId, 0);
  const nextOverrides = { ...itemOverrides.value };
  const nextBaseline = { ...catalogBaseline.value };
  delete nextOverrides[servicioId];
  delete nextBaseline[servicioId];
  itemOverrides.value = nextOverrides;
  catalogBaseline.value = nextBaseline;
};

const crearCotizacion = async () => {
  if (ultimaRespuesta.value || isCreating.value || syncModalResolve) return;
  mensajeValidacion.value = '';
  error.value = null;

  const nombre = datosCliente.value.nombreContacto.trim();
  const correo = datosCliente.value.correo.trim();
  const telefono = datosCliente.value.telefono.trim();

  if (correo && !isValidEmail(correo)) {
    mensajeValidacion.value = 'Correo inválido';
    return;
  }

  if ((correo || telefono) && !nombre && !clienteId.value) {
    mensajeValidacion.value =
      'Indica el nombre del solicitante si capturas correo o teléfono';
    return;
  }

  // CRM: teléfono sin nombre no está exento (solo email legacy)
  if (clienteId.value && telefono && !nombre && !correo) {
    mensajeValidacion.value =
      'Indica el nombre del solicitante si capturas teléfono';
    return;
  }

  const tieneServicios = Object.values(cantidadesPorServicio.value).some(
    (cantidad) => cantidad > 0,
  );
  if (!tieneServicios) {
    mensajeValidacion.value =
      'Selecciona al menos un servicio para continuar';
    return;
  }

  for (const s of serviciosSeleccionados.value) {
    ensureItemOverride(s);
    if (s.activo === false) {
      mensajeValidacion.value =
        'Hay servicios inactivos en la cotización. Quítalos para continuar.';
      return;
    }
    const o = s._id ? itemOverrides.value[s._id] : undefined;
    if (o && !o.nombre.trim()) {
      mensajeValidacion.value =
        'Cada servicio debe tener un nombre (no puede quedar vacío).';
      return;
    }
  }

  if (!fechaVencimiento.value) {
    precargarFechaVencimiento();
  }
  const fechaIso = fechaVencimientoToIso(fechaVencimiento.value);
  if (!fechaIso) {
    mensajeValidacion.value = 'Indica una fecha de vencimiento válida';
    return;
  }

  const dirty = collectDirtySync();
  let doSync = false;
  if (dirty.length > 0) {
    const choice = await askSyncModal(dirty);
    if (choice === 'abort') return;
    doSync = choice === 'sync';
  }

  const items = Object.entries(cantidadesPorServicio.value)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([servicioId, cantidad]) => {
      const o = itemOverrides.value[servicioId];
      const item: {
        servicioId: string;
        cantidad: number;
        nombre?: string;
        descripcion?: string;
        precioUnitario?: number;
      } = { servicioId, cantidad };
      if (o) {
        item.nombre = o.nombre.trim();
        item.descripcion = (o.descripcion || '').trim();
        item.precioUnitario = Number(o.precioUnitario);
      }
      return item;
    });

  const incluirBancarios =
    bancariosUtiles.value && incluirDatosBancarios.value;

  const para = [...emailsPara.value];
  const cc = emailsCc.value.filter((e) => !para.includes(e));
  const doEnviar = enviarEmail.value && para.length > 0;

  const payload: Parameters<typeof createAdminCotizacion>[0] = {
    items,
    moneda: 'MXN',
    fechaVencimiento: fechaIso,
    enviarEmail: doEnviar,
    incluirDatosBancarios: incluirBancarios,
    emailsPara: para,
    emailsCc: cc,
  };
  if (clienteId.value) payload.clienteId = clienteId.value;
  if (datosCliente.value.empresa.trim()) {
    payload.nombreEmpresa = datosCliente.value.empresa.trim();
  }
  if (nombre) payload.nombreContacto = nombre;
  if (correo) payload.emailContacto = correo;
  if (telefono) payload.telefonoContacto = telefono;
  if (datosCliente.value.personasAEvaluar.trim()) {
    payload.personasAEvaluar = datosCliente.value.personasAEvaluar.trim();
  }
  if (plantillasSeleccionadasIds.value.length > 0) {
    payload.plantillas = plantillasSeleccionadasIds.value.map((id) => {
      const snap = plantillaSnapshots.value[id];
      const item: {
        plantillaId: string;
        nombre?: string;
        secciones?: SeccionPlantilla[];
      } = { plantillaId: id };
      if (snap) {
        item.nombre = snap.nombre;
        item.secciones = snap.secciones;
      }
      return item;
    });
  }

  isCreating.value = true;
  emailSendOk.value = false;
  emailSendError.value = null;
  isSendingEmail.value = false;
  try {
    const response = await createAdminCotizacion(payload);
    ultimaRespuesta.value = response;
    mensajeValidacion.value = '';

    if (doSync && dirty.length > 0) {
      let synced = 0;
      try {
        for (const d of dirty) {
          await updateServicio(d.servicioId, d.patch);
          synced += 1;
          const o = itemOverrides.value[d.servicioId];
          if (o) {
            catalogBaseline.value[d.servicioId] = { ...o };
          }
          const svc = serviciosDisponibles.value.find(
            (x) => x._id === d.servicioId,
          );
          if (svc && o) {
            svc.nombre = o.nombre.trim();
            svc.descripcion = o.descripcion.trim() || undefined;
            svc.precioUnitario = Number(o.precioUnitario);
          }
        }
      } catch (syncErr: any) {
        const msg = syncErr.response?.data?.message;
        const detail = Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'error desconocido';
        const failed = dirty[synced];
        error.value = failed
          ? `Cotización creada. Catálogo actualizado parcialmente (${synced}/${dirty.length}). Falló «${failed.label}»: ${detail}`
          : `Cotización creada, pero no se pudo actualizar el catálogo: ${detail}`;
      }
    }

    // Story 6.8: create ≠ send. PDF FE → multipart enviar-correo.
    if (doEnviar) {
      const id = response._id || (response as any).id;
      if (!id) {
        emailSendError.value =
          'Cotización creada, pero falta el id para enviar el correo.';
      } else {
        isSendingEmail.value = true;
        try {
          const detalle = await loadDetalleForSend(String(id), response);
          const blob = await generateCotizacionPdfBlob(detalle);
          await enviarCorreoCotizacion(String(id), blob, {
            emailsPara: para,
            emailsCc: cc,
          });
          emailSendOk.value = true;
          emailSendError.value = null;
        } catch (sendErr: any) {
          const msg = sendErr.response?.data?.message;
          emailSendOk.value = false;
          emailSendError.value = Array.isArray(msg)
            ? msg.join(', ')
            : msg ||
              'No se pudo enviar el correo. Puedes corregir destinatarios y reintentar.';
        } finally {
          isSendingEmail.value = false;
        }
      }
    }
  } catch (err: any) {
    const msg = err.response?.data?.message;
    error.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'Error al crear la cotización. Por favor intenta de nuevo.';
  } finally {
    isCreating.value = false;
    isSendingEmail.value = false;
  }
};

async function loadDetalleForSend(
  id: string,
  fallback: CotizacionDetalleDto,
): Promise<CotizacionDetalleDto> {
  try {
    return await getCotizacionAdminById(id);
  } catch {
    return fallback;
  }
}

async function reintentarEnvioCorreo(payload: {
  emailsPara: string[];
  emailsCc: string[];
}) {
  if (!ultimaRespuesta.value || isResendingEmail.value) return;
  const id = ultimaRespuesta.value._id || (ultimaRespuesta.value as any).id;
  if (!id) {
    emailSendOk.value = false;
    emailSendError.value =
      'No se puede reenviar: falta el identificador de la cotización.';
    return;
  }
  if (!payload.emailsPara.length) return;

  isResendingEmail.value = true;
  // Mantener emailSendError para no desmontar chips / UI de reintento.
  emailsPara.value = [...payload.emailsPara];
  emailsCc.value = [...payload.emailsCc];
  try {
    const detalle = await loadDetalleForSend(
      String(id),
      ultimaRespuesta.value as CotizacionDetalleDto,
    );
    const blob = await generateCotizacionPdfBlob(detalle);
    await enviarCorreoCotizacion(String(id), blob, {
      emailsPara: payload.emailsPara,
      emailsCc: payload.emailsCc,
    });
    emailSendOk.value = true;
    emailSendError.value = null;
  } catch (sendErr: any) {
    const msg = sendErr.response?.data?.message;
    emailSendOk.value = false;
    emailSendError.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg ||
        'No se pudo enviar el correo. Puedes corregir destinatarios y reintentar.';
  } finally {
    isResendingEmail.value = false;
  }
}

const cerrarModal = () => {
  ultimaRespuesta.value = null;
  resetSelection();
  itemOverrides.value = {};
  catalogBaseline.value = {};
  datosCliente.value = {
    empresa: '',
    nombreContacto: '',
    correo: '',
    telefono: '',
    personasAEvaluar: '',
  };
  clienteId.value = '';
  contactoId.value = '';
  contactos.value = [];
  enviarEmail.value = false;
  emailsPara.value = [];
  emailsCc.value = [];
  emailSendOk.value = false;
  emailSendError.value = null;
  isSendingEmail.value = false;
  isResendingEmail.value = false;
  incluirDatosBancarios.value = false;
  plantillasSeleccionadasIds.value = [];
  plantillaSnapshots.value = {};
  showPersonalizarModal.value = false;
  mensajeValidacion.value = '';
  serviciosDisponibles.value = [];
  precargarFechaVencimiento();
};

const verCotizaciones = () => {
  const needsReset = !!ultimaRespuesta.value;
  ultimaRespuesta.value = null;
  if (needsReset) cerrarModal();
  router.push({ name: 'admin-cotizaciones' });
};

const verDetalles = () => {
  if (!ultimaRespuesta.value) return;
  const cotizacionId = ultimaRespuesta.value._id || ultimaRespuesta.value.id;
  if (cotizacionId) {
    const id = String(cotizacionId);
    cerrarModal();
    router.push({ name: 'admin-cotizacion-detalle', params: { id } });
  }
};
</script>
