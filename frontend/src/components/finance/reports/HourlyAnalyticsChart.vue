<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
};

const chartData = computed(() => {
    // Assuming data is an array of objects, and we try to use 'amount' or 'total' for value.
    // For hourly data, we expect an array of 24 items, where index is the hour.
    // We will use the index as the hour label (00:00, 01:00, etc.)
    return props.data.map((item, index) => ({
        label: index.toString().padStart(2, '0') + ':00', // e.g., 01:00
        value: item.total || item.amount || 0, // Fallback to common property names
        rawItem: item
    }));
});

const maxValue = computed(() => {
    if (chartData.value.length === 0) return 1000;
    return Math.max(...chartData.value.map(d => d.value), 1000);
});
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border col-span-full">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Аналитика по часам</h3>
    
    <div v-if="chartData.length === 0" class="text-center text-gray-500 py-4">Нет данных для отображения по часам.</div>

    <div v-else class="flex flex-col gap-2">
      <div v-for="(item, index) in chartData" :key="index" class="flex items-center gap-3">
        <div class="text-xs w-12 text-right text-gray-600 shrink-0">{{ item.label }}</div>
        <div class="flex-grow h-6 rounded-full bg-gray-200 overflow-hidden shadow-inner">
          <div 
            class="bg-blue-500 h-full transition-all duration-500 flex items-center justify-end" 
            :style="{ width: `${(item.value / maxValue) * 100}%` }"
          >
            <span v-if="(item.value / maxValue) * 100 > 8" class="text-xs font-medium text-white px-1">{{ formatCurrency(item.value) }}</span>
          </div>
        </div>
        <div v-if="(item.value / maxValue) * 100 <= 8" class="text-xs w-16 text-left text-gray-800 shrink-0">{{ formatCurrency(item.value) }}</div>
      </div>
    </div>
  </div>
</template>