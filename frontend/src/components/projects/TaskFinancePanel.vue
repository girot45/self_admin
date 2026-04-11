<script setup>
import { ref, computed } from "vue";
import { useProjectStore } from "@/stores/projects";
import { useFinanceStore } from "@/stores/finance";
import FinanceCreateDialog from "./FinanceCreateDialog.vue";

const props = defineProps({ taskId: String });
const store = useProjectStore();
const financeStore = useFinanceStore();

const createDialogVisible = ref(false);
const showPicker = ref(false);
const task = computed(() => store.tasks.find((t) => t.id === props.taskId));

const linkedTransactions = computed(() =>
  financeStore.transactions.filter((tr) =>
    task.value?.financeIds.includes(tr.id),
  ),
);

const availableTransactions = computed(() =>
  financeStore.transactions.filter(
    (tr) => !task.value?.financeIds.includes(tr.id),
  ),
);

const summary = computed(() => store.taskFinanceSummary(props.taskId));

function unlink(financeId) {
  store.unlinkFinanceFromTask(props.taskId, financeId);
}

function onSelect(e) {
  store.linkFinanceToTask(props.taskId, e.data.id);
  showPicker.value = false;
}
</script>

<template>
  <div>
    <div class="flex gap-4 mb-4 text-sm">
      <span class="text-green-500">Доходы: +{{ summary.income }} ₽</span>
      <span class="text-red-500">Расходы: -{{ summary.expense }} ₽</span>
      <span :class="summary.balance >= 0 ? 'text-green-500' : 'text-red-500'">
        Баланс: {{ summary.balance }} ₽
      </span>
    </div>

    <div v-for="tr in linkedTransactions" :key="tr.id" class="flex items-center justify-between p-2 border-b text-sm">
      <div class="flex items-center gap-2">
        <Tag :value="tr.type === 'income' ? 'Доход' : 'Расход'" :severity="tr.type === 'income' ? 'success' : 'danger'"
          class="text-xs" />
        <span>{{ tr.description }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span :class="tr.type === 'income' ? 'text-green-500' : 'text-red-500'">
          {{ tr.type === "income" ? "+" : "-" }}{{ tr.amount }} ₽
        </span>
        <Button icon="pi pi-times" text size="small" severity="danger" @click="unlink(tr.id)" />
      </div>
    </div>

    <p v-if="!linkedTransactions.length" class="text-gray-400 text-sm py-3 text-center">
      Нет привязанных транзакций
    </p>

    <Button label="Привязать транзакцию" icon="pi pi-link" outlined class="mt-3 w-full" @click="showPicker = true" />
    <Button label="Создать операцию" icon="pi pi-plus" severity="success" outlined class="mt-2 w-full"
      @click="createDialogVisible = true" />

    <FinanceCreateDialog v-model:visible="createDialogVisible" :task-id="taskId" />

    <Dialog v-model:visible="showPicker" header="Выбрать транзакцию" modal class="w-full max-w-2xl">
      <DataTable :value="availableTransactions" selectionMode="single" @rowSelect="onSelect" :rows="8"
        :paginator="availableTransactions.length > 8">
        <Column field="date" header="Дата" />
        <Column field="description" header="Описание" />
        <Column field="amount" header="Сумма" />
        <Column header="Тип">
          <template #body="{ data }">
            <Tag :value="data.type === 'income' ? 'Доход' : 'Расход'"
              :severity="data.type === 'income' ? 'success' : 'danger'" />
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>
