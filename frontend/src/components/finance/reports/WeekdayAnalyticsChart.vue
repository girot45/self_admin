<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
};

const chartData = computed(() => {
    // We expect an array of 7 items (0-6). If the array is sparse, we fill in missing days.
    const dataMap = new Map();
    props.data.forEach(item => {
        // Assuming item has 'dayIndex' (0-6) and 'totalAmount' or similar
        const dayIndex = item.dayIndex !== undefined ? item.dayIndex : item.day; // Try to find day index
        const value = item.total || item.amount || 0;
        if (dayIndex >= 0 && dayIndex < 7) {
            dataMap.set(dayIndex, { label: WEEKDAYS[dayIndex], value: value, rawItem: item });
        }
    });

    const result = [];
    for (let i = 0; i < 7; i++) {
        if (dataMap.has(i)) {
            result.push(dataMap.get(i));
        } else {
            result.push({ label: WEEKDAYS[i], value: 0, rawItem: {} });
        }
    }
    return result;
});

const maxValue = computed(() => {
    if (chartData.value.length === 0) return 1000;
    return Math.max(...chartData.value.map(d => d.value), 1000);
});
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border col-span-full">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Аналитика по дням недели</h3>
    
    <div v-if="chartData.length === 0" class="text-center text-gray-500 py-4">Нет данных для отображения по дням недели.</div>

    <div v-else class="flex flex-col gap-2">
      <div v-for="(item, index) in chartData" :key="index" class="flex items-center gap-3">
        <div class="text-xs w-8 text-right text-gray-600 shrink-0">{{ item.label }}</div>
        <div class="flex-grow h-6 rounded-full bg-gray-200 overflow-hidden shadow-inner">
          <div 
            class="bg-green-500 h-full transition-all duration-500 flex items-center justify-end" 
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