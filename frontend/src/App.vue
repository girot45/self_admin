<script setup>
import { onMounted } from "vue";
import { useCrmStore } from "@/stores/crm";

const crmStore = useCrmStore();

onMounted(() => {
  crmStore.load();
});
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style scoped></style>
