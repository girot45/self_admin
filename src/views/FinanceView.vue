<script setup>
import BankCards from '../components/finance/bank_cards/BankCards.vue';
import ChartComponent from '../components/finance/chart/ChartComponent.vue';
import ActiveButtons from '../components/finance/active_buttons/ActiveButtonsComponent.vue';
</script>

<template>
    <div class="h-fit">
        <div class="flex flex-row gap-5 mb-5">
            <BankCards class="grow " />
            <ActiveButtons class="self-stretch" />

        </div>

        <ChartComponent />
    </div>
</template>
