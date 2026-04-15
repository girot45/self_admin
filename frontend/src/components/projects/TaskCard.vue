<script setup>
import { computed } from "vue";
import { useProjectStore } from "@/stores/projects";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_SEVERITY,
} from "@/constants/projects";

const props = defineProps({ task: Object });
const emit = defineEmits(["edit", "dragstart"]);
const store = useProjectStore();

const summary = computed(() => store.taskFinanceSummary(props.task.id));

const epic = computed(() =>
  props.task.epicId
    ? store.epics.find((e) => e.id === props.task.epicId)
    : null,
);
const subtasks = computed(() => store.subtasksByTask(props.task.id));
const doneSubtasks = computed(
  () => subtasks.value.filter((t) => t.status === "done").length,
);
const subtaskProgress = computed(() =>
  subtasks.value.length
    ? Math.round((doneSubtasks.value / subtasks.value.length) * 100)
    : 0,
);

function onDragStart(e) {
  e.dataTransfer.effectAllowed = "move";
  emit("dragstart", props.task.id);
}
</script>

<template>
  <div
    class="group bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm mb-2 cursor-grab active:cursor-grabbing border-l-4"
    :style="{
      borderLeftColor:
        task.priority === 'critical'
          ? '#EF4444'
          : task.priority === 'high'
            ? '#F59E0B'
            : task.priority === 'medium'
              ? '#3B82F6'
              : '#9CA3AF',
    }" draggable="true" @dragstart="onDragStart">
    <div class="flex items-center justify-between mb-1">
      <Tag :value="TASK_PRIORITY_LABELS[task.priority]" :severity="TASK_PRIORITY_SEVERITY[task.priority]"
        class="text-xs" />
      <span v-if="task.dueDate" class="text-xs text-gray-400">{{
        computed(() => {
          if (!task.dueDate) return '—'
          return new Date(task.dueDate).toLocaleDateString('ru-RU')
        })}}</span>
    </div>

    <p class="font-medium text-sm">{{ task.title }}</p>

    <div v-if="epic" class="flex items-center gap-1 mt-1">
      <span class="text-xs px-1.5 py-0.5 rounded font-medium truncate"
        :style="{ background: epic.color + '22', color: epic.color }">
        {{ epic.title }}
      </span>
    </div>

    <p v-if="task.description" class="text-xs text-gray-400 truncate mt-1">
      {{ task.description }}
    </p>

    <div v-if="subtasks.length" class="mt-2">
      <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span>Подзадачи</span>
        <span>{{ doneSubtasks }}/{{ subtasks.length }}</span>
      </div>
      <ProgressBar :value="subtaskProgress" class="h-1" />
    </div>

    <div class="flex items-center justify-between mt-2">
      <div v-if="task.financeIds.length" class="flex items-center gap-1">
        <i class="pi pi-wallet text-xs text-gray-400" />
        <span class="text-xs" :class="summary.balance >= 0 ? 'text-green-500' : 'text-red-500'">
          {{ summary.balance >= 0 ? "+" : "" }}{{ summary.balance }} ₽
        </span>
      </div>
      <span v-if="task.assignee" class="text-xs text-gray-400 ml-auto">{{
        task.assignee
        }}</span>
    </div>

    <div class="opacity-0 group-hover:opacity-100 flex gap-1 mt-2 transition-opacity">
      <Button icon="pi pi-pencil" text size="small" @click.stop="emit('edit', task)" />
      <Button icon="pi pi-trash" text size="small" severity="danger" @click.stop="store.deleteTask(task.id)" />
    </div>
  </div>
</template>
