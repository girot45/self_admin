<template>
  <div class="chart-card-frame">
    <div v-if="header" class="chart-card-header">
      <slot name="header">
        {{ header }}
      </slot>
    </div>

    <div class="chart-card-content pt-3">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  header: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.chart-card-frame {
  background: var(--p-card-background, var(--p-surface-ground));
  border-radius: var(--p-card-border-radius, 8px);
  box-shadow: var(
    --p-card-shadow,
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1)
  );
  padding: 1.5rem;
}

.chart-card-header {
  font-size: 0.9375rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--p-text-muted-color, var(--p-text-color-secondary));
  margin-bottom: 0.75rem;
}

.chart-card-content {
  min-height: 300px;
}
</style>
