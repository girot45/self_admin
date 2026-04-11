<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ mandatory: 0, impulse: 0 }),
  },
});

const mandatoryValue = computed(() => props.data.mandatory || 0);
const impulseValue = computed(() => props.data.impulse || 0);

const total = computed(() => mandatoryValue.value + impulseValue.value);

const mandatoryPercentage = computed(() => total.value > 0 ? ((mandatoryValue.value / total.value) * 100).toFixed(1) : 0);
const impulsePercentage = computed(() => total.value > 0 ? ((impulseValue.value / total.value) * 100).toFixed(1) : 0);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
};
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border col-span-full">
    <h3 class="text-lg font-semibold mb-3 text-gray-800">Обязательные vs Импульсивные расходы</h3>
    
    <div v-if="total > 0" class="flex h-8 rounded-lg overflow-hidden mb-2 shadow-inner">
      <div 
        class="bg-red-500 text-xs text-white flex items-center justify-center transition-all duration-500" 
        :style="{ width: `${mandatoryPercentage}%` }"
        title="Обязательные расходы"
      >
        <span v-if="mandatoryPercentage > 5" class="font-medium px-1">{{ mandatoryPercentage }}%</span>
      </div>
      <div 
        class="bg-yellow-500 text-xs text-white flex items-center justify-center transition-all duration-500" 
        :style="{ width: `${impulsePercentage}%` }"
        title="Импульсивные расходы"
      >
        <span v-if="impulsePercentage > 5" class="font-medium px-1">{{ impulsePercentage }}%</span>
      </div>
    </div>

    <div class="flex justify-around text-sm mt-2">
      <div class="flex flex-col items-center">
        <span class="text-red-600 font-bold">{{ formatCurrency(mandatoryValue) }}</span>
        <span class="text-xs text-gray-600">Обязательные</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-yellow-600 font-bold">{{ formatCurrency(impulseValue) }}</span>
        <span class="text-xs text-gray-600">Импульсивные</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-800 font-bold">{{ formatCurrency(total) }}</span>
        <span class="text-xs text-gray-600">Всего</span>
      </div>
    </div>
  </div>
</template>