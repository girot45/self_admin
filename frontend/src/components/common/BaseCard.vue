<template>
  <div class="p-4 rounded-lg custom-card-wrapper">
    <slot></slot>
  </div>
</template>

<script setup></script>

<style scoped>
.custom-card-wrapper {
  background: var(--p-card-background, var(--p-surface-ground));
  border-radius: var(--p-card-border-radius, 8px);
  padding: 1.5rem;
  box-shadow: var(
    --p-card-shadow,
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1)
  );
}
</style>
