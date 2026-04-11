<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useProjectStore } from "@/stores/projects";
import { useFinanceStore } from "@/stores/finance";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_SEVERITY,
} from "@/constants/projects";
import KanbanColumn from "@/components/projects/KanbanColumn.vue";
import TaskDialog from "@/components/projects/TaskDialog.vue";
import ProjectDialog from "@/components/projects/ProjectDialog.vue";
import EpicDialog from "@/components/projects/EpicDialog.vue";
import EpicCard from "@/components/projects/EpicCard.vue";
import ProjectFinancePanel from "@/components/projects/ProjectFinancePanel.vue";

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const store = useProjectStore();
const financeStore = useFinanceStore();

const activeTab = ref(0);
const taskDialogVisible = ref(false);
const projectDialogVisible = ref(false);
const editingTask = ref(null);
const draggingTaskId = ref(null);

const filterEpicId = ref(null);

const epicDialogVisible = ref(false);
const editingEpic = ref(null);
const selectedEpic = ref(null);

const project = computed(() =>
  store.projects.find((p) => p.id === route.params.id),
);
const projectTasks = computed(() =>
  store.tasks.filter((t) => t.projectId === route.params.id),
);
const projectEpics = computed(() => store.epicsByProject(route.params.id));
const summary = computed(() => store.projectFinanceSummary(route.params.id));

const linkedTransactions = computed(() => {
  try {
    const allIds = projectTasks.value.flatMap((t) => t.financeIds);
    return financeStore.transactions
      .filter((tr) => allIds.includes(tr.id))
      .map((tr) => ({
        ...tr,
        taskTitle: projectTasks.value.find((t) => t.financeIds.includes(tr.id))
          ?.title,
      }));
  } catch {
    return [];
  }
});

onMounted(() => {
  store.load();
  financeStore.load();
});

function openCreateTask(status) {
  editingTask.value = { _defaultStatus: status };
  taskDialogVisible.value = true;
}

function onDragStart(taskId) {
  draggingTaskId.value = taskId;
}

function onDrop(status, position) {
  if (!draggingTaskId.value) return;
  store.moveTask(draggingTaskId.value, status, position);
  draggingTaskId.value = null;
}

function confirmDelete() {
  confirm.require({
    message: "Удалить проект и все его задачи?",
    header: "Подтверждение",
    icon: "pi pi-trash",
    acceptSeverity: "danger",
    acceptLabel: "Удалить",
    rejectLabel: "Отмена",
    accept: () => {
      store.deleteProject(route.params.id);
      router.push("/projects");
    },
  });
}
</script>

<template>
  <div v-if="project">
    <!-- Хедер -->
    <div class="flex items-center gap-3 mb-6">
      <Button icon="pi pi-arrow-left" text @click="router.back()" />
      <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: project.color ?? '#6B7280' }" />
      <h1 class="text-2xl font-bold flex-1">{{ project.title }}</h1>
      <Button icon="pi pi-pencil" text @click="projectDialogVisible = true" />
      <Button icon="pi pi-trash" text severity="danger" @click="confirmDelete" />
    </div>

    <!-- Табы -->
    <TabView v-model:activeIndex="activeTab">
      <!-- Вкладка: Доска -->
      <TabPanel header="Доска">
        <div class="flex items-center gap-2 mb-4">
          <label class="text-sm text-gray-500">Эпик:</label>
          <Select v-model="filterEpicId" :options="[{ id: null, title: 'Все задачи' }, ...projectEpics]"
            optionLabel="title" optionValue="id" class="w-48" placeholder="Выберите эпик" />
        </div>
        <div class="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn v-for="status in TASK_STATUSES" :key="status" :status="status" :project-id="project.id"
            :filter-epic-id="filterEpicId" @drag-start="onDragStart" @drop="onDrop" @create-task="openCreateTask"
            @edit-task="
              (task) => {
                editingTask = task;
                taskDialogVisible = true;
              }
            " />
        </div>
      </TabPanel>

      <!-- Вкладка: Эпики -->
      <TabPanel header="Эпики">
        <div class="flex justify-end mb-4">
          <Button label="Новый эпик" icon="pi pi-plus" @click="
            editingEpic = null;
          epicDialogVisible = true;
          " />
        </div>

        <div v-if="projectEpics.length" class="flex flex-col gap-2">
          <EpicCard v-for="epic in projectEpics" :key="epic.id" :epic="epic" @click="selectedEpic = epic" @edit="
            editingEpic = epic;
          epicDialogVisible = true;
          " @delete="store.deleteEpic(epic.id); if (selectedEpic?.id === epic.id) selectedEpic = null" />
        </div>

        <p v-else class="text-center text-gray-400 py-12">Эпиков пока нет</p>

        <!-- Задачи выбранного эпика -->
        <div v-if="selectedEpic" class="mt-6">
          <h3 class="font-semibold mb-3">
            Задачи эпика: {{ selectedEpic.title }}
          </h3>
          <DataTable :value="store.tasksByEpic(selectedEpic.id)"
            :paginator="store.tasksByEpic(selectedEpic.id).length > 10" :rows="10">
            <Column field="title" header="Задача" />
            <Column header="Статус">
              <template #body="{ data }">
                <Tag :value="TASK_STATUS_LABELS[data.status]" />
              </template>
            </Column>
            <Column header="Приоритет">
              <template #body="{ data }">
                <Tag :value="TASK_PRIORITY_LABELS[data.priority]" :severity="TASK_PRIORITY_SEVERITY[data.priority]" />
              </template>
            </Column>
            <Column header="Подзадачи">
              <template #body="{ data }">
                {{ store.subtasksByTask(data.id).length }}
              </template>
            </Column>
          </DataTable>
        </div>

        <EpicDialog v-model:visible="epicDialogVisible" :epic="editingEpic" :project-id="project.id" />
      </TabPanel>

      <!-- Вкладка: Список -->
      <TabPanel header="Список">
        <DataTable :value="projectTasks" :paginator="true" :rows="10" removableSort>
          <Column field="title" header="Задача" sortable />
          <Column header="Статус">
            <template #body="{ data }">
              <Tag :value="TASK_STATUS_LABELS[data.status]" />
            </template>
          </Column>
          <Column header="Приоритет">
            <template #body="{ data }">
              <Tag :value="TASK_PRIORITY_LABELS[data.priority]" :severity="TASK_PRIORITY_SEVERITY[data.priority]" />
            </template>
          </Column>
          <Column field="assignee" header="Исполнитель" />
          <Column field="dueDate" header="Дедлайн" sortable />
          <Column header="Действия">
            <template #body="{ data }">
              <Button icon="pi pi-pencil" text size="small" @click="
                editingTask = data;
              taskDialogVisible = true;
              " />
              <Button icon="pi pi-trash" text size="small" severity="danger" @click="store.deleteTask(data.id)" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Вкладка: Финансы проекта -->
      <TabPanel header="Финансы проекта">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <template #content>
              <p class="text-sm text-gray-500">Доходы</p>
              <p class="text-2xl font-bold text-green-500">
                +{{ summary.income }} ₽
              </p>
            </template>
          </Card>
          <Card>
            <template #content>
              <p class="text-sm text-gray-500">Расходы</p>
              <p class="text-2xl font-bold text-red-500">
                -{{ summary.expense }} ₽
              </p>
            </template>
          </Card>
          <Card>
            <template #content>
              <p class="text-sm text-gray-500">Баланс</p>
              <p class="text-2xl font-bold" :class="summary.balance >= 0 ? 'text-green-500' : 'text-red-500'
                ">
                {{ summary.balance }} ₽
              </p>
            </template>
          </Card>
        </div>

        <Accordion :value="['project', 'tasks']">
          <AccordionPanel value="project">
            <AccordionHeader>Операции проекта</AccordionHeader>
            <AccordionContent>
              <ProjectFinancePanel :project-id="project.id" />
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="tasks">
            <AccordionHeader>Операции из задач</AccordionHeader>
            <AccordionContent>
              <DataTable :value="linkedTransactions" :paginator="linkedTransactions.length > 10" :rows="10">
                <Column field="taskTitle" header="Задача">
                  <template #body="{ data }">
                    <Tag :value="data.taskTitle" icon="pi pi-th-large" severity="secondary" class="text-xs" />
                  </template>
                </Column>
                <Column field="description" header="Описание" />
                <Column field="amount" header="Сумма" />
                <Column header="Тип">
                  <template #body="{ data }">
                    <Tag :value="data.type === 'income' ? 'Доход' : 'Расход'"
                      :severity="data.type === 'income' ? 'success' : 'danger'" />
                  </template>
                </Column>
                <Column field="date" header="Дата" />
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </TabPanel>
    </TabView>
  </div>

  <TaskDialog v-model:visible="taskDialogVisible" :task="editingTask" :project-id="route.params.id" />
  <ProjectDialog v-model:visible="projectDialogVisible" :project="project" />
</template>
