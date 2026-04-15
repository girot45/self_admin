<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <label v-if="label" class="text-sm text-color-muted">
        {{ label }}
      </label>
      <slot name="label">
        {{ label }}
      </slot>
      <slot name="extra"></slot>
    </div>

    <div class="flex items-center gap-2">
      <InputText
        v-if="type === 'text' || !type"
        v-model="modelValue"
        :placeholder="placeholder"
        :class="inputClass"
        :disabled="disabled"
        :pt="{ root: { class: 'w-full' } }"
      />

      <InputNumber
        v-else-if="type === 'number'"
        v-model="modelValue"
        :placeholder="placeholder"
        :useGrouping="useGrouping"
        :class="inputClass"
        :disabled="disabled"
        :pt="{ root: { class: 'w-full' } }"
      />

      <Textarea
        v-else-if="type === 'textarea'"
        v-model="modelValue"
        :placeholder="placeholder"
        :rows="rows || 3"
        :class="inputClass"
        :disabled="disabled"
        autoResize
        :pt="{ textarea: { class: 'w-full' } }"
      />
    </div>
  </div>
</template>

<script setup>
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number, null],
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  rows: {
    type: Number,
    default: 3,
  },
  useGrouping: {
    type: Boolean,
    default: true,
  },
  inputClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>
