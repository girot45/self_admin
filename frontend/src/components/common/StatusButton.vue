<template>
  <Button
    :label="label"
    :outlined="outlined"
    :severity="outlined ? 'secondary' : severity"
    :class="{ 'active-state': active && !outlined }"
    @click="$emit('click')"
  >
    <template #icon="slotProps">
      <i :class="icon" :class="slotProps.class"></i>
    </template>
  </Button>
</template>

<script setup>
import Button from "primevue/button";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  severity: {
    type: String,
    default: "secondary",
  },
  icon: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "medium",
  },
});

defineEmits(["click"]);
</script>

<style scoped>
.active-state {
  background: var(--p-primary-color, #01696f);
  color: var(--p-primary-inverse-color, #ffffff);
  border-color: var(--p-primary-color, #01696f);
}
</style>
