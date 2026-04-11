<script setup>
import SummaryCard from "./SummaryCard.vue";

defineProps({
  data: {
    type: Object,
    required: true,
    /*
      {
        totalIncome: number,
        totalExpenses: number,
        balance: number
      }
    */
  },
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <SummaryCard
      title="Доход"
      :value="data.totalIncome"
      type="income"
    />

    <SummaryCard
      title="Расходы"
      :value="data.totalExpenses"
      type="expense"
    />

    <SummaryCard
      title="Баланс"
      :value="data.balance"
      type="balance"
    />
  </div>
</template>
