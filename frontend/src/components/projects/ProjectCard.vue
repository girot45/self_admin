<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projects";
import { useCrmStore } from "@/stores/crm";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_SEVERITY,
  TASK_STATUS_LABELS,
} from "@/constants/projects";

const props = defineProps({ project: Object });
const emit = defineEmits(["edit"]);
const router = useRouter();
const store = useProjectStore();
const crmStore = useCrmStore();

const tasks = computed(() =>
  store.tasks.filter((t) => t.projectId === props.project.id),
);
const summary = computed(() => store.projectFinanceSummary(props.project.id));

const relatedDeals = computed(() => {
  return crmStore.deals.filter((d) => d.projectId === props.project.id);
});

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

function getDealSeverity(stage) {
  const severity = {
    new: "info",
    in_progress: "warn",
    negotiations: "primary",
    invoice_sent: "secondary",
    won: "success",
    lost: "danger",
  };
  return severity[stage] || "secondary";
}

function formatDealStage(stage) {
  const stages = {
    new: "Новая",
    in_progress: "В работе",
    negotiations: "Переговоры",
    invoice_sent: "Счёт",
    won: "Выиграна",
    lost: "Проиграна",
  };
  return stages[stage] || stage;
}

function openDealDialog() {
  emit("edit", props.project);
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
        class="flex gap-3 text-xs mt-1 mb-3"
      >
        <span v-if="summary.income" class="text-green-500"
          >+{{ summary.income }} ₽</span
        >
        <span v-if="summary.expense" class="text-red-500"
          >-{{ summary.expense }} ₽</span
        >
      </div>

      <!-- CRM-сделки -->
      <div v-if="relatedDeals.length > 0" class="mb-3">
        <div class="text-xs text-gray-400 mb-1">
          CRM-сделки ({{ relatedDeals.length }})
        </div>
        <div class="flex flex-wrap gap-1">
          <Badge
            v-for="deal in relatedDeals.slice(0, 3)"
            :key="deal.id"
            :value="formatDealStage(deal.stage)"
            :severity="getDealSeverity(deal.stage)"
            class="text-xs"
          />
          <Badge
            v-if="relatedDeals.length > 3"
            :value="`+${relatedDeals.length - 3}`"
            severity="secondary"
            class="text-xs"
          />
        </div>
      </div>

      <Button
        label="Добавить сделку"
        icon="pi pi-plus"
        text
        size="small"
        @click="openDealDialog"
        v-if="relatedDeals.length === 0"
        class="mb-3"
      />
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
