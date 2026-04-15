<template>
  <div class="p-4 rounded-lg custom-card-wrapper">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="mb-3 min-h-[1.375rem]">
          <p class="text-base">
            <slot name="label">
              {{ label }}
            </slot>
          </p>
        </div>

        <div>
          <div class="text-2xl font-bold text-color" :class="valueTextClass">
            <slot name="value">
              {{ value }}
            </slot>
          </div>
          <div class="mt-1">
            <slot name="trend">
              <Tag
                v-if="showTrend"
                :value="`${trend > 0 ? '▲' : '▼'} ${Math.abs(trend)}% ${trendLabel}`"
                :severity="trend > 0 ? 'success' : 'danger'"
                rounded
                size="small"
              />
            </slot>
          </div>
        </div>
      </div>

      <div
        class="ml-4 flex-shrink-0 justify-self-center self-center icon-wrapper"
        :class="iconColorClass"
      >
        <i :class="icon" :style="{ fontSize: iconSize }"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  value: {
    type: [String, Number],
    default: "",
  },
  valueTextClass: {
    type: String,
    default: "",
  },
  trend: {
    type: Number,
    default: 0,
  },
  trendLabel: {
    type: String,
    default: "",
  },
  showTrend: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: "",
  },
  iconColor: {
    type: String,
    default: "",
  },
  iconSize: {
    type: String,
    default: "2.5rem",
  },
});

defineEmits(["click"]);

const iconColorClass = computed(() => ({
  teal: props.iconColor === "teal",
  green: props.iconColor === "green",
  blue: props.iconColor === "blue",
  gray: props.iconColor === "gray",
  orange: props.iconColor === "orange",
  purple: props.iconColor === "purple",
  pink: props.iconColor === "pink",
  indigo: props.iconColor === "indigo",
}));
</script>

<style scoped>
.custom-card-wrapper {
  background: var(--p-card-background, var(--p-surface-ground));
  border-radius: var(--p-card-border-radius, 8px);
  padding: 1.25rem 1.5rem;
  box-shadow: var(
    --p-card-shadow,
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1)
  );
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.teal {
  color: #01696f;
}

.icon-wrapper.green {
  color: var(--p-green-600);
}

.icon-wrapper.blue {
  color: var(--p-blue-600);
}

.icon-wrapper.gray {
  color: var(--p-gray-600);
}

.icon-wrapper.orange {
  color: var(--p-orange-500);
}

.icon-wrapper.purple {
  color: var(--p-purple-600);
}

.icon-wrapper.pink {
  color: var(--p-pink-600);
}

.icon-wrapper.indigo {
  color: var(--p-indigo-600);
}

.icon-wrapper-yellow {
  color: var(--p-yellow-500);
}

.icon-wrapper-amber {
  color: var(--p-amber-600);
}

.icon-wrapper-lime {
  color: var(--p-lime-600);
}

.icon-wrapper-red {
  color: var(--p-red-600);
}

.icon-wrapper-error {
  color: var(--p-red-600);
}

.icon-wrapper-warn {
  color: var(--p-orange-600);
}
</style>
