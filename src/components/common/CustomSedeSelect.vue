<template>
  <div class="relative w-full" v-click-outside="onClose">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:bg-white transition-all text-left text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:border-medical-blue-200"
      :class="[isOpen ? 'ring-2 ring-medical-blue-500 bg-white border-transparent' : '']"
    >
      <!-- Icono Izquierda -->
      <div class="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" :class="[modelValue ? 'text-medical-blue-600' : 'text-gray-400 group-hover:text-medical-blue-400']">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <!-- Texto Seleccionado -->
      <span v-if="selectedSede" class="block truncate">
        {{ selectedSede.ciudad }}
      </span>
      <span v-else class="block truncate text-gray-400">
        {{ placeholder }}
      </span>

      <!-- Icono Derecha (Chevron) -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-300 pointer-events-none text-gray-400" :class="[isOpen ? 'rotate-180 text-medical-blue-500' : '']">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div class="max-h-64 overflow-y-auto custom-scrollbar">
          <div
            v-for="sede in sedes"
            :key="sede._id"
            @click="selectSede(sede._id || '')"
            class="px-5 py-3.5 hover:bg-medical-blue-50 cursor-pointer transition-colors border-b last:border-0 border-gray-50 group flex items-center justify-between"
            :class="[modelValue === sede._id ? 'bg-medical-blue-50/50' : '']"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-medical-blue-100 group-hover:text-medical-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="font-bold text-gray-700 group-hover:text-medical-blue-700 transition-colors">
                {{ sede.ciudad }}
              </span>
            </div>
            <!-- Checkmark for selected -->
            <svg
              v-if="modelValue === sede._id"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-medical-blue-600 animate-in zoom-in duration-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Sede {
  _id?: string;
  ciudad: string;
}

const props = defineProps<{
  modelValue: string;
  sedes: Sede[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const isOpen = ref(false);

const selectedSede = computed(() => {
  return props.sedes.find((sede) => sede._id === props.modelValue);
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

const selectSede = (id: string) => {
  emit('update:modelValue', id);
  emit('change', id);
  isOpen.value = false;
};

const onClose = () => {
  isOpen.value = false;
};

// Directiva para cerrar al hacer click fuera
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
