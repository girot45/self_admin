<script setup>
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useFinanceStore } from '@/stores/finance'
import FinanceCreateDialog from './FinanceCreateDialog.vue'

const props = defineProps({ projectId: String })
const store = useProjectStore()
const financeStore = useFinanceStore()
const showPicker = ref(false)
const createDialogVisible = ref(false)

const project = computed(() => store.projects.find(p => p.id === props.projectId))

// Только прямые транзакции проекта (не из задач)
const linkedTransactions = computed(() =>
  financeStore.transactions.filter(tr => project.value?.financeIds?.includes(tr.id))
)

// Транзакции не привязанные к этому проекту напрямую
const availableTransactions = computed(() =>
  financeStore.transactions.filter(tr => !project.value?.financeIds?.includes(tr.id))
)

const summary = computed(() => {
  const income = linkedTransactions.value.filter(tr => tr.type === 'income').reduce((s, tr) => s + tr.amount, 0)
  const expense = linkedTransactions.value.filter(tr => tr.type === 'expense').reduce((s, tr) => s + tr.amount, 0)
  return { income, expense, balance: income - expense }
})

function unlink(financeId) {
  store.unlinkFinanceFromProject(props.projectId, financeId)
}

function onSelectTransaction(e) {
  store.linkFinanceToProject(props.projectId, e.data.id)
  showPicker.value = false
}
</script>

<template>
  <!-- Итог -->
  <div class="flex gap-4 mb-4 text-sm">
    <span class="text-green-500">Доходы: +{{ summary.income }} ₽</span>
    <span class="text-red-500">Расходы: -{{ summary.expense }} ₽</span>
    <span :class="summary.balance >= 0 ? 'text-green-500' : 'text-red-500'">
      Баланс: {{ summary.balance }} ₽
    </span>
  </div>

  <!-- Список транзакций -->
  <div v-for="tr in linkedTransactions" :key="tr.id"
    class="flex items-center justify-between p-2 border-b text-sm">
    <div class="flex items-center gap-2">
      <Tag :value="tr.type === 'income' ? 'Доход' : 'Расход'"
        :severity="tr.type === 'income' ? 'success' : 'danger'" class="text-xs" />
      <span>{{ tr.description }}</span>
    </div>
    <div class="flex items-center gap-2">
      <span :class="tr.type === 'income' ? 'text-green-500' : 'text-red-500'">
        {{ tr.type === 'income' ? '+' : '-' }}{{ tr.amount }} ₽
      </span>
      <Button icon="pi pi-times" text size="small" severity="danger" @click="unlink(tr.id)" />
    </div>
  </div>

  <p v-if="!linkedTransactions.length" class="text-gray-400 text-sm py-3 text-center">
    Нет привязанных операций
  </p>

  <!-- Кнопки -->
  <div class="flex flex-col gap-2 mt-3">
    <Button label="Создать операцию" icon="pi pi-plus" severity="success" outlined class="w-full"
      @click="createDialogVisible = true" />
    <Button label="Привязать существующую" icon="pi pi-link" outlined class="w-full"
      @click="showPicker = true" />
  </div>

  <!-- Диалог выбора существующей транзакции -->
  <Dialog v-model:visible="showPicker" header="Выбрать транзакцию" modal class="w-full max-w-2xl">
    <DataTable :value="availableTransactions" selectionMode="single"
      @rowSelect="onSelectTransaction" :rows="8"
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

  <FinanceCreateDialog v-model:visible="createDialogVisible" :project-id="projectId" />
</template>