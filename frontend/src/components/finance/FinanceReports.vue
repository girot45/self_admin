<script setup>
import { ref, computed, onMounted } from "vue";

// заглушка FiltersPanel
import FiltersPanel from "./reports/FiltersPanel.vue";
import SummaryCards from "./reports/SummaryCards.vue";

// фильтры
const filters = ref({
  dateFrom: null,
  dateTo: null,
  incomeCategories: [],
  expenseCategories: [],
  expenseTypes: [],
});

// тестовые данные
const rawData = ref([
  {
    id: 1,
    type: "income",
    amount: 50000,
    date: "2026-02-02T14:30",
    category: "Зарплата",
    expenseType: null,
  },
  {
    id: 2,
    type: "expense",
    amount: 1200,
    date: "2026-02-02T21:15",
    category: "Еда",
    expenseType: "impulse",
  },
]);

// фильтры
function applyFilters(data, filters) {
  return data.filter((item) => {
    const date = new Date(item.date);

    if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && date > new Date(filters.dateTo)) return false;

    if (item.type === "income" && filters.incomeCategories?.length && !filters.incomeCategories.includes(item.category))
      return false;

    if (item.type === "expense" && filters.expenseCategories?.length && !filters.expenseCategories.includes(item.category))
      return false;

    if (item.type === "expense" && filters.expenseTypes?.length && !filters.expenseTypes.includes(item.expenseType))
      return false;

    return true;
  });
}

// расчёт аналитики
function calculateAnalytics(rawData, filters) {
  const data = applyFilters(rawData, filters);

  const summary = { totalIncome: 0, totalExpenses: 0, balance: 0 };
  let mandatory = 0;
  let impulse = 0;

  data.forEach((item) => {
    if (item.type === "income") summary.totalIncome += item.amount;
    if (item.type === "expense") {
      summary.totalExpenses += item.amount;
      if (item.expenseType === "mandatory") mandatory += item.amount;
      if (item.expenseType === "impulse") impulse += item.amount;
    }
  });

  summary.balance = summary.totalIncome - summary.totalExpenses;

  return {
    summary,
    dynamics: [], // сюда потом можно добавить графики
    byCategory: [],
    byWeekday: [],
    byHour: [],
    mandatoryVsImpulse: { mandatory, impulse },
  };
}

// вычисляемая аналитика
const refreshKey = ref(0);

const analytics = computed(() => {
  refreshKey.value; // Trigger re-evaluation
  return calculateAnalytics(rawData.value, filters.value);
});

function refreshReports() {
  refreshKey.value++;
  console.log("Reports refreshed with current filters.");
}

onMounted(() => {
  refreshReports();
});
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <!-- фильтры -->
    <div class="flex justify-end">
      <button
        @click="refreshReports"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150"
      >
        Refresh Reports
      </button>
    </div>
    <FiltersPanel v-model="filters" />

    <!-- карточки с доходом, расходами, балансом -->
    <SummaryCards v-if="analytics" :data="analytics.summary" />

    <!-- графики -->
    <div v-if="analytics">
      <ExpensesDynamicsChart :data="analytics.dynamics" />
      <CategoryDistributionChart :data="analytics.byCategory" />
      <MandatoryVsImpulseChart :data="analytics.mandatoryVsImpulse" />
      <WeekdayAnalyticsChart :data="analytics.byWeekday" />
      <HourlyAnalyticsChart :data="analytics.byHour" />
    </div>
  </div>
</template>
