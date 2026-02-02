<script setup>
import BankCards from '@/components/finance/bank_cards/BankCards.vue';
import HistoryComponent from '@/components/finance/chart/HistoryComponent.vue';
import ActiveButtons from '@/components/finance/active_buttons/ActiveButtonsComponent.vue';
</script>

<template>
    payments
  <div>
    <div class="flex flex-row gap-5 mb-5">
      <BankCards class="grow" />
      <ActiveButtons />
    </div>

    <div class="flex-1 min-h-[300px]">
      <HistoryComponent />
    </div>
  </div>
</template>
