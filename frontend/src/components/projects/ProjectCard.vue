<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projects";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_SEVERITY,
  TASK_STATUS_LABELS,
} from "@/constants/projects";

const props = defineProps({ project: Object });
const emit = defineEmits(["edit"]);
const router = useRouter();
const store = useProjectStore();

const tasks = computed(() =>
  store.tasks.filter((t) => t.projectId === props.project.id),
);
const summary = computed(() => store.projectFinanceSummary(props.project.id));

const statusCounts = computed(() => {
  const counts = {};
  tasks.value.forEach((t) => {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  });
  return counts;
});

function openProject() {
  router.push(`/projects/${props.project.id}`);
}
</script>

<template>
  <Card
    class="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
    @click="openProject"
  >
    <!-- Цветная полоска сверху -->
    <template #header>
      <div
        class="h-1 w-full"
        :style="{ background: project.color ?? '#6B7280' }"
      />
    </template>

    <template #content>
      <div class="flex items-start justify-between mb-2">
        <span class="font-semibold text-base">{{ project.title }}</span>
        <Tag
          :value="PROJECT_STATUS_LABELS[project.status]"
          :severity="PROJECT_STATUS_SEVERITY[project.status]"
          class="text-xs"
        />
      </div>

      <p
        v-if="project.description"
        class="text-sm text-gray-500 mb-3 line-clamp-2"
      >
        {{ project.description }}
      </p>

      <!-- Бейджи задач по статусам -->
      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="(count, status) in statusCounts"
          :key="status"
          class="text-xs text-gray-400"
        >
          {{ count }} {{ TASK_STATUS_LABELS[status] }}
        </span>
        <span v-if="!tasks.length" class="text-xs text-gray-300"
          >Нет задач</span
        >
      </div>

      <!-- Финансы — только если есть привязанные транзакции -->
      <div
        v-if="summary.income || summary.expense"
        class="flex gap-3 text-xs mt-1"
      >
        <span v-if="summary.income" class="text-green-500"
          >+{{ summary.income }} ₽</span
        >
        <span v-if="summary.expense" class="text-red-500"
          >-{{ summary.expense }} ₽</span
        >
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-1">
        <Button
          icon="pi pi-pencil"
          text
          size="small"
          @click.stop="emit('edit', project)"
        />
      </div>
    </template>
  </Card>
</template>
