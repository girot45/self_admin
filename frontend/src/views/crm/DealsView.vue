<script setup>
import { onMounted, ref } from "vue";
import { useCrmStore } from "@/stores/crm";
import { useProjectStore } from "@/stores/projects";
import { DEAL_STAGES } from "@/constants/crm";
import { useConfirm } from "primevue/useconfirm";
import KanbanColumn from "@/components/projects/KanbanColumn.vue";
import DealDialog from "@/components/crm/DealDialog.vue";

const crmStore = useCrmStore();
const projectStore = useProjectStore();
const confirm = useConfirm();

const showDealDialog = ref(false);
const editingDeal = ref(null);

onMounted(() => {
  crmStore.load();
});

const contacts = () => {
  return crmStore.contacts;
};

const dealsByStage = (stage) => {
  return crmStore.dealsByStage(stage);
};

const handleDrop = (dealId, newStage, newPosition) => {
  crmStore.moveDeal(dealId, newStage);
};

function openCreateDialog() {
  editingDeal.value = null;
  showDealDialog.value = true;
}

function openCreateDialogForStage(stage) {
  editingDeal.value = null;
  showDealDialog.value = true;
}

function openEditDialog(deal) {
  editingDeal.value = deal;
  showDealDialog.value = true;
}

function handleDealSaved() {
  crmStore.load();
}

function handleDeleteDeal(deal) {
  confirm.require({
    message: `Удалить сделку "${deal.title}"?`,
    header: "Подтверждение удаления",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      crmStore.deleteDeal(deal.id);
    },
    reject: () => {},
  });
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Канбан сделок</h1>
      <Button
        label="Создать сделку"
        icon="pi pi-plus"
        @click="openCreateDialog()"
      />
    </div>

    <DealDialog
      v-model:visible="showDealDialog"
      :deal="editingDeal"
      @saved="handleDealSaved"
    />

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      <KanbanColumn
        v-for="stage in Object.values(DEAL_STAGES)"
        :key="stage"
        :status="stage"
        :filter-contact-id="null"
        @drop="handleDrop"
      >
        <template #card="{ item }">
          <BaseCard
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="
              $router.push({ name: 'CRMDealDetail', params: { id: item.id } })
            "
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-sm line-clamp-2">
                {{ item.title }}
              </h3>
              <Button
                icon="pi pi-pencil"
                text
                size="small"
                class="h-6 w-6"
                @click.stop="openEditDialog(item)"
              />
              <Button
                icon="pi pi-times"
                text
                size="small"
                severity="danger"
                class="h-6 w-6"
                @click.stop="handleDeleteDeal(item)"
              />
            </div>
            <div class="text-lg font-bold text-green-600">
              {{ formatCurrency(item.amount) }}
            </div>
            <div v-if="item.closeDate" class="text-xs text-gray-400">
              {{ formatDate(item.closeDate) }}
            </div>
            <div v-if="item.contactId" class="text-xs text-blue-500 mt-2">
              {{ getContactName(item.contactId) }}
            </div>
          </BaseCard>
        </template>
        <template #create-btn="{ status }">
          <Button
            label="+"
            icon="pi pi-plus"
            text
            size="small"
            @click="openCreateDialogForStage(status)"
          />
        </template>
      </KanbanColumn>
    </div>
  </div>
</template>

<script>
import BaseCard from "@/components/common/BaseCard.vue";

function formatCurrency(amount) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount || 0);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function getContactName(contactId) {
  const crmStore = useCrmStore();
  const contact = crmStore.contacts.find((c) => c.id === contactId);
  return contact?.name || "Неизвестно";
}
</script>
