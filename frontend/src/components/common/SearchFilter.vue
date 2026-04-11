<template>
  <div class="search-filter">
    <div class="search-input-wrapper">
      <InputText
        v-model="localQuery"
        :placeholder="placeholder"
        :class="inputClass"
        :pt="{ root: { class: 'w-full' } }"
      />
      <Button
        v-if="localQuery"
        icon="pi pi-times"
        text
        rounded
        size="small"
        class="clear-btn"
        @click="clearSearch"
        aria-label="Clear search"
      />
      <i class="pi pi-search search-icon"></i>
    </div>
  </div>
</template>

<script setup>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Поиск..." },
  debounce: { type: Number, default: 300 },
  inputClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const localQuery = ref(props.modelValue);
let debounceTimer = null;

watch(localQuery, (newValue) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (props.debounce > 0) {
    debounceTimer = setTimeout(() => {
      emit("update:modelValue", newValue);
    }, props.debounce);
  } else {
    emit("update:modelValue", newValue);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localQuery.value) {
      localQuery.value = newValue;
    }
  },
);

function clearSearch() {
  localQuery.value = "";
  emit("update:modelValue", "");
}
</script>

<style scoped>
.search-filter {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1;
}

:deep(.p-inputtext) {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  padding: 0.25rem;
  min-height: auto;
}

@media (max-width: 640px) {
  .search-filter {
    width: 100%;
  }
}
</style>
