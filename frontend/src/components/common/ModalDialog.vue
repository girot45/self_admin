<template>
  <Dialog
    v-model:visible="isOpen"
    :header="title"
    :modal="modal"
    :closable="closable"
    :closeOnEscape="closeOnEscape"
    :dismissableMask="dismissableMask"
    :draggable="draggable"
    :style="dialogStyle"
    :class="dialogClass"
    :aria-label="title"
    @update:visible="onVisibilityChange"
  >
    <template #default>
      <slot></slot>
    </template>

    <template #footer>
      <slot name="footer">
        <div class="flex gap-2 justify-end">
          <Button
            :label="cancelLabel"
            :severity="cancelSeverity"
            outlined
            @click="onCancel"
          />
          <Button
            :label="confirmLabel"
            :severity="confirmSeverity"
            :disabled="confirmDisabled"
            @click="onConfirm"
          />
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  modal: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  dismissableMask: { type: Boolean, default: false },
  draggable: { type: Boolean, default: false },
  size: { type: String, default: "md" },
  cancelLabel: { type: String, default: "Отмена" },
  cancelSeverity: { type: String, default: "secondary" },
  confirmLabel: { type: String, default: "Сохранить" },
  confirmSeverity: { type: String, default: "primary" },
  confirmDisabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "cancel", "confirm"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const dialogStyle = computed(() => {
  const sizeMap = {
    sm: "400px",
    md: "480px",
    lg: "640px",
    xl: "800px",
  };
  return { width: sizeMap[props.size] ?? sizeMap.md };
});

const dialogClass = "modal-dialog";

function onVisibilityChange(visible) {
  emit("update:modelValue", visible);
}

function onCancel() {
  emit("cancel");
  isOpen.value = false;
}

function onConfirm() {
  emit("confirm");
}
</script>

<style scoped>
.modal-dialog {
  margin: 1rem;
}

@media (max-width: 640px) {
  .modal-dialog {
    width: 95vw !important;
  }
}
</style>
