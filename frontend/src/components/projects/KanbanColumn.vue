<script setup>
import { computed } from "vue";
import { useProjectStore } from "@/stores/projects";
import { TASK_STATUS_LABELS } from "@/constants/projects";
import TaskCard from "./TaskCard.vue";

const props = defineProps({
  status: String,
  projectId: String,
  filterEpicId: { type: String, default: null },
});
const emit = defineEmits(["drag-start", "drop", "create-task", "edit-task"]);
const store = useProjectStore();

const tasks = computed(() => {
  let result = store.tasksByStatus(props.projectId, props.status);
  if (props.filterEpicId !== null) {
    result = result.filter((t) => t.epicId === props.filterEpicId);
  }
  return result.filter((t) => !t.parentTaskId);
});

function onDragOver(e) {
  e.preventDefault();
}
function onDrop(e) {
  e.preventDefault();
  emit("drop", props.status, tasks.value.length);
}
</script>

<template>
  <div
    class="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 min-h-64"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="font-medium text-sm">{{ TASK_STATUS_LABELS[status] }}</span>
      <div class="flex items-center gap-1">
        <Badge :value="tasks.length" severity="secondary" />
        <Button
          icon="pi pi-plus"
          text
          size="small"
          @click="emit('create-task', status)"
        />
      </div>
    </div>

    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @dragstart="emit('drag-start', task.id)"
      @edit="emit('edit-task', task)"
    />

    <p v-if="!tasks.length" class="text-xs text-gray-400 text-center py-6">
      Нет задач
    </p>
  </div>
</template>
