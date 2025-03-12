<template>
  <Card :pt="{
      root: 'mb-5 w-full',
    }">
    <template #header>
      <p class="text-4xl ps-8" v-bind="$attrs">Счета</p>
    </template>
    <template #content>
      <div class="flex gap-14 flex-wrap w-full">
        <StatCard moneyValue="124421" bgcolour="bg-red-600"    class="w-60" />
        <StatCard moneyValue="124421" bgcolour="bg-green-400"  class="w-60" />
        <StatCard moneyValue="124421" bgcolour="bg-amber-500"  class="w-60" />
        <StatCard moneyValue="124421" bgcolour="bg-indigo-600" class="w-60" />
      </div>
    </template>
  </Card>

  <ChartComponent class="mb-0"/>
</template>

<script setup>
import StatCard from "./HelloWorld.vue";
import ChartComponent from "./finance/chart/ChartComponent.vue";
</script>
