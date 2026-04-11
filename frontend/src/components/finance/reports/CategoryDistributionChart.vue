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
    // We will focus on expenses distribution for this chart.
    // Assuming data structure is [{ category: string, totalExpenses: number, totalIncome: number }]
    const expensesData = props.data
        .map(item => ({
            category: item.category || 'Неизвестная категория',
            expenses: item.totalExpenses || item.amount || 0, // Assuming 'amount' if 'totalExpenses' is missing, based on FinanceReports.vue logic
            income: item.totalIncome || 0,
            rawItem: item
        }))
        .filter(item => item.expenses > 0) // Only show categories with expenses
        .sort((a, b) => b.expenses - a.expenses);

    const totalExpenses = expensesData.reduce((sum, item) => sum + item.expenses, 0);

    return expensesData.map(item => ({
        ...item,
        percentage: totalExpenses > 0 ? ((item.expenses / totalExpenses) * 100).toFixed(1) : 0
    }));
});

const totalExpensesValue = computed(() => chartData.value.reduce((sum, item) => sum + item.expenses, 0));
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border col-span-full">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Распределение расходов по категориям</h3>
    
    <div v-if="chartData.length === 0" class="text-center text-gray-500 py-4">Нет данных о расходах по категориям.</div>

    <div v-else class="flex flex-col gap-3">
      <div class="text-sm font-medium text-gray-700 mb-1">
        Всего расходов в категориях: <span class="font-bold text-red-600">{{ formatCurrency(totalExpensesValue) }}</span>
      </div>
      <div v-for="item in chartData" :key="item.category" class="flex flex-col gap-1">
        <div class="flex justify-between text-sm">
          <span class="font-medium text-gray-800">{{ item.category }}</span>
          <span class="font-semibold">{{ formatCurrency(item.expenses) }} ({{ item.percentage }}%)</span>
        </div>
        <div class="h-2 rounded-full bg-gray-200 overflow-hidden shadow-inner">
          <div 
            class="bg-red-500 h-full transition-all duration-500" 
            :style="{ width: `${item.percentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>