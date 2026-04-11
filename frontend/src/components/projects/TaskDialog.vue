<script setup>
import { ref, computed, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useProjectStore } from "@/stores/projects";
import TaskFinancePanel from "./TaskFinancePanel.vue";

const props = defineProps({
  task: Object,
  projectId: String,
});
const visible = defineModel("visible", { default: false });

const toast = useToast();
const store = useProjectStore();

const isEdit = ref(false);
const savedTaskId = ref(null);

const form = ref({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  dueDate: null,
  epicId: null,
  parentTaskId: null,
});
const errors = ref({ title: false });

const statusOptions = [
  { label: "К выполнению", value: "todo" },
  { label: "В работе", value: "in_progress" },
  { label: "На проверке", value: "review" },
  { label: "Готово", value: "done" },
];
const priorityOptions = [
  { label: "Низкий", value: "low" },
  { label: "Средний", value: "medium" },
  { label: "Высокий", value: "high" },
  { label: "Критический", value: "critical" },
];

const projectEpics = computed(() => store.epicsByProject(props.projectId));
const subtasks = computed(() =>
  savedTaskId.value ? store.subtasksByTask(savedTaskId.value) : [],
);
const newSubtaskTitle = ref("");

function addSubtask() {
  if (!newSubtaskTitle.value.trim()) return;
  store.createTask(props.projectId, {
    title: newSubtaskTitle.value.trim(),
    parentTaskId: savedTaskId.value,
    epicId: null,
    status: "todo",
    priority: "medium",
  });
  newSubtaskTitle.value = "";
}

watch(
  () => props.task,
  (task) => {
    if (task && task.id) {
      isEdit.value = true;
      savedTaskId.value = task.id;
      form.value = {
        title: task.title,
        description: task.description ?? "",
        status: task.status ?? "todo",
        priority: task.priority ?? "medium",
        assignee: task.assignee ?? "",
        dueDate: task.dueDate ?? null,
        epicId: task.epicId ?? null,
        parentTaskId: task.parentTaskId ?? null,
      };
    } else {
      isEdit.value = false;
      savedTaskId.value = null;
      form.value = {
        title: "",
        description: "",
        assignee: "",
        dueDate: null,
        status: task?._defaultStatus ?? "todo",
        priority: "medium",
        epicId: null,
        parentTaskId: task?.parentTaskId ?? null,
      };
    }
  },
);

function submit() {
  errors.value.title = !form.value.title.trim();
  if (errors.value.title) return;

  if (isEdit.value) {
    store.updateTask(savedTaskId.value, { ...form.value });
    toast.add({ severity: "success", summary: "Сохранено", life: 2000 });
  } else {
    const task = store.createTask(props.projectId, { ...form.value });
    savedTaskId.value = task.id;
    isEdit.value = true;
    toast.add({ severity: "success", summary: "Задача создана", life: 2000 });
  }
}

function close() {
  visible.value = false;
}
</script>

<template>
  <Dialog v-model:visible="visible" :header="isEdit ? 'Редактировать задачу' : 'Новая задача'" modal
    class="w-full max-w-lg">
    <TabView>
      <TabPanel header="Основное">
        <div class="flex flex-col gap-3">
          <div>
            <InputText v-model="form.title" placeholder="Название задачи" class="w-full" />
            <small v-if="errors.title" class="text-red-500">Название обязательно</small>
          </div>
          <Textarea v-model="form.description" rows="3" placeholder="Описание" class="w-full" />
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Статус</label>
              <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value"
                class="w-full" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Приоритет</label>
              <Select v-model="form.priority" :options="priorityOptions" optionLabel="label" optionValue="value"
                class="w-full" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Исполнитель</label>
              <InputText v-model="form.assignee" class="w-full" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Дедлайн</label>
              <DatePicker v-model="form.dueDate" class="w-full" dateFormat="dd.mm.yy" />
            </div>
            <div v-if="!form.parentTaskId" class="col-span-2">
              <label class="text-xs text-gray-500 mb-1 block">Эпик</label>
              <Select v-model="form.epicId" :options="[{ id: null, title: 'Без эпика' }, ...projectEpics]"
                optionLabel="title" optionValue="id" class="w-full" placeholder="Выбрать эпик" />
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Финансы" :disabled="!savedTaskId">
        <TaskFinancePanel v-if="savedTaskId" :task-id="savedTaskId" />
      </TabPanel>

      <TabPanel header="Подзадачи" :disabled="!!task?.parentTaskId || !savedTaskId">
        <div v-if="savedTaskId">
          <div v-for="sub in subtasks" :key="sub.id" class="flex items-center gap-2 p-2 border-b">
            <Checkbox :binary="false" :modelValue="sub.status === 'done'" @update:modelValue="
              store.updateTask(sub.id, { status: $event ? 'done' : 'todo' })
              " />
            <span :class="sub.status === 'done' ? 'line-through text-gray-400' : ''">
              {{ sub.title }}
            </span>
            <Button icon="pi pi-trash" text size="small" severity="danger" class="ml-auto"
              @click="store.deleteTask(sub.id)" />
          </div>

          <div class="flex gap-2 mt-3">
            <InputText v-model="newSubtaskTitle" placeholder="Название подзадачи" class="flex-1" />
            <Button icon="pi pi-plus" @click="addSubtask" :disabled="!newSubtaskTitle.trim()" />
          </div>

          <p v-if="!subtasks.length" class="text-sm text-gray-400 text-center py-4">
            Нет подзадач
          </p>
        </div>
      </TabPanel>
    </TabView>

    <template #footer>
      <Button label="Отмена" text @click="close" />
      <Button :label="isEdit ? 'Сохранить' : 'Создать'" @click="submit" />
    </template>
  </Dialog>
</template>
