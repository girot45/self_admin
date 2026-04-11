<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: String,
  value: Number,
  type: String,
});

const formattedValue = computed(() => {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(props.value || 0);
});

const valueClass = computed(() => {
  if (props.type === "income") return "text-green-600";
  if (props.type === "expense") return "text-red-600";
  if (props.type === "balance") return props.value >= 0 ? "text-green-600" : "text-red-600";
  return "text-gray-800";
});
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow border">
    <div class="text-sm text-gray-500">{{ title }}</div>
    <div class="text-2xl font-semibold" :class="valueClass">{{ formattedValue }}</div>
  </div>
</template>
