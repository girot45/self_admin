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
    // We will sort by date and use the date as the label.
    const sortedData = [...props.data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sortedData.map(item => ({
        label: item.date ? item.date.substring(5) : 'N/A', // MM-DD format
        income: item.income || 0,
        expenses: item.expenses || 0,
        total: (item.income || 0) + (item.expenses || 0),
        rawItem: item
    }));
});

const maxValue = computed(() => {
    if (chartData.value.length === 0) return 1000;
    return Math.max(...chartData.value.map(d => d.total), 1000);
});
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border col-span-full">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Динамика доходов и расходов</h3>
    
    <div v-if="chartData.length === 0" class="text-center text-gray-500 py-4">Нет данных для отображения динамики.</div>

    <div v-else class="flex flex-col gap-2">
      <div v-for="(item, index) in chartData" :key="index" class="flex flex-col gap-1">
        <div class="flex justify-between text-xs mb-1">
          <span class="font-medium text-gray-600">{{ item.label }}</span>
          <span class="font-semibold text-gray-700">{{ formatCurrency(item.total) }}</span>
        </div>
        <div class="flex h-4 rounded-lg overflow-hidden shadow-inner border border-gray-300">
          <div 
            class="bg-green-400 text-xs text-white flex items-center justify-start transition-all duration-500" 
            :style="{ width: `${(item.income / maxValue) * 100}%` }"
            title="Доход"
          >
            <span v-if="(item.income / maxValue) * 100 > 5" class="font-medium px-1 text-xs">{{ formatCurrency(item.income) }}</span>
          </div>
          <div 
            class="bg-red-400 text-xs text-white flex items-center justify-end transition-all duration-500" 
            :style="{ width: `${(item.expenses / maxValue) * 100}%` }"
            title="Расход"
          >
            <span v-if="(item.expenses / maxValue) * 100 > 5" class="font-medium px-1 text-xs">{{ formatCurrency(item.expenses) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>