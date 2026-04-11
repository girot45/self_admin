<script setup>
import { computed } from "vue";
import { useProjectStore } from "@/stores/projects";
import { EPIC_STATUS_LABELS, EPIC_STATUS_SEVERITY } from "@/constants/projects";

const props = defineProps({ epic: Object });
defineEmits(["edit", "delete"]);
const store = useProjectStore();

const progress = computed(() => store.epicProgress(props.epic.id));
const taskCount = computed(() => store.tasksByEpic(props.epic.id).length);
</script>

<template>
  <div
    class="rounded-lg p-3 mb-3 border-l-4 bg-white dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
    :style="{ borderLeftColor: epic.color }">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" :style="{ color: epic.color }">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span class="font-semibold">{{ epic.title }}</span>
      </div>
      <div class="flex items-center gap-1">
        <Tag :value="EPIC_STATUS_LABELS[epic.status]" :severity="EPIC_STATUS_SEVERITY[epic.status]" size="small" />
        <Button icon="pi pi-pencil" text size="small" @click.stop="$emit('edit', epic)" />
        <Button icon="pi pi-trash" text size="small" severity="danger" @click.stop="$emit('delete', epic)" />
      </div>
    </div>

    <div>
      <span class="text-xs text-gray-400">{{ taskCount }} задач · {{ progress }}% выполнено</span>
      <ProgressBar :value="progress" class="h-1 mt-1" />
    </div>

    <div v-if="epic.startDate || epic.dueDate" class="mt-2 text-xs text-gray-400">
      <span v-if="epic.startDate">{{ epic.startDate }}</span>
      <span v-if="epic.startDate && epic.dueDate"> → </span>
      <span v-if="epic.dueDate">{{ epic.dueDate }}</span>
    </div>
  </div>
</template>
