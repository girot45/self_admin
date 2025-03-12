<template>
    <Card >
        <template #header>
            <p class="text-4xl ps-8" v-bind="$attrs">Счета</p>
        </template>
        <template #content>
            <div class="flex gap-14 flex-wrap ">
                <BankCard moneyValue="124421" bgcolour="bg-red-600" class="w-60" />
                <BankCard moneyValue="124421" bgcolour="bg-green-400" class="w-60" />
                <BankCard moneyValue="124421" bgcolour="bg-amber-500" class="w-60" />
                <BankCard moneyValue="124421" bgcolour="bg-indigo-600" class="w-60" />
            </div>
        </template>
    </Card>
</template>

<script setup>
import BankCard from './src/BankCard.vue';
</script>