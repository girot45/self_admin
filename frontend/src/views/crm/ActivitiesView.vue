<script setup>
import { onMounted, ref } from "vue";
import { useCrmStore } from "@/stores/crm";
import { ACTIVITY_TYPES } from "@/constants/crm";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import ActivityDialog from "@/components/crm/ActivityDialog.vue";
import { useConfirm } from "primevue/useconfirm";

const crmStore = useCrmStore();
const confirm = useConfirm();
const filterType = ref("");
const showActivityDialog = ref(false);
const editingActivity = ref(null);

onMounted(() => {
  crmStore.load();
});

const filteredActivities = () => {
  return crmStore.activities.filter((activity) => {
    return filterType.value ? activity.type === filterType.value : true;
  });
};

function openCreateDialog() {
  editingActivity.value = null;
  showActivityDialog.value = true;
}

function openEditDialog(activity) {
  editingActivity.value = activity;
  showActivityDialog.value = true;
}

function handleActivitySaved() {
  crmStore.load();
}

function handleDeleteActivity(activity) {
  confirm.require({
    message: `Удалить активность "${activity.title}"?`,
    header: "Подтверждение удаления",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      crmStore.deleteActivity(activity.id);
    },
  });
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Активности</h1>
      <Button
        label="Создать активность"
        icon="pi pi-plus"
        @click="openCreateDialog()"
      />
    </div>

    <div class="mb-4">
      <Dropdown
        v-model="filterType"
        :options="activityTypeOptions"
        option-label="label"
        option-value="value"
        placeholder="Фильтр по типу"
        class="w-full md:w-64"
        :pt="{ root: { class: 'mt-2' } }"
      />
    </div>

    <DataTable
      :value="filteredActivities()"
      paginator
      :rows="10"
      dataKey="id"
      :pt="{ header: { class: 'text-lg' } }"
      class="mt-4"
      aria-label="Список активностей"
    >
      <Column field="type" header="Тип" sortable>
        <template #body="{ data }">
          <i :class="getActivityIcon(data.type)" class="text-lg mr-2"></i>
          <span>{{ getActivityTypeLabel(data.type) }}</span>
        </template>
      </Column>
      <Column field="title" header="Заголовок" sortable />
      <Column field="date" header="Дата" sortable>
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
      </Column>
      <Column field="dealId" header="Сделка">
        <template #body="{ data }">
          {{ getDealTitle(data.dealId) }}
        </template>
      </Column>
      <Column field="contactId" header="Контакт">
        <template #body="{ data }">
          {{ getContactName(data.contactId) }}
        </template>
      </Column>
      <Column field="isDone" header="Статус" sortable>
        <template #body="{ data }">
          <Checkbox
            :model-value="data.isDone"
            :binary="true"
            @change="crmStore.toggleActivityDone(data.id)"
          />
        </template>
      </Column>
      <Column header="Действия">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            text
            size="small"
            @click="openEditDialog(data)"
          />
          <Button
            icon="pi pi-trash"
            text
            size="small"
            severity="danger"
            @click="handleDeleteActivity(data)"
          />
        </template>
      </Column>
    </DataTable>

    <ActivityDialog
      v-model:visible="showActivityDialog"
      :activity="editingActivity"
      @saved="handleActivitySaved"
    />
  </div>
</template>

<script>
const ACTIVITY_TYPES_MAP = {
  [ACTIVITY_TYPES.CALL]: "Позвонить",
  [ACTIVITY_TYPES.MEETING]: "Встреча",
  [ACTIVITY_TYPES.EMAIL]: "Email",
  [ACTIVITY_TYPES.TASK]: "Задача",
};

function getActivityTypeLabel(type) {
  return ACTIVITY_TYPES_MAP[type] || type;
}

const ACTIVITY_TYPES_MAP_ICON = {
  [ACTIVITY_TYPES.CALL]: "pi pi-phone",
  [ACTIVITY_TYPES.MEETING]: "pi pi-video",
  [ACTIVITY_TYPES.EMAIL]: "pi pi-envelope",
  [ACTIVITY_TYPES.TASK]: "pi pi-tasks",
};

function getActivityIcon(type) {
  return ACTIVITY_TYPES_MAP_ICON[type] || "pi pi-bell";
}

function getDealTitle(dealId) {
  if (!dealId) return "-";
  const deal = crmStore.deals.find((d) => d.id === dealId);
  return deal?.title || "Неизвестно";
}

function getContactName(contactId) {
  if (!contactId) return "-";
  const contact = crmStore.contacts.find((c) => c.id === contactId);
  return contact?.name || "Неизвестно";
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const activityTypeOptions = [
  { label: "Все", value: "" },
  { label: "Позвонить", value: ACTIVITY_TYPES.CALL },
  { label: "Встреча", value: ACTIVITY_TYPES.MEETING },
  { label: "Email", value: ACTIVITY_TYPES.EMAIL },
  { label: "Задача", value: ACTIVITY_TYPES.TASK },
];
</script>
