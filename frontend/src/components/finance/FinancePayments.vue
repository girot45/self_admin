<template>
  <div class="flex justify-between items-center mb-6">
    <p class="text-6xl">Платежи</p>
    <Button label="+ Добавить транзакцию" @click="showDialog = true" />
  </div>

  <!-- Диалог добавления транзакции -->
  <Dialog
    v-model:visible="showDialog"
    header="Новая транзакция"
    :style="{ width: '460px' }"
    modal
  >
    <div class="flex flex-col gap-4 mt-2">
      <div class="flex gap-3">
        <Button
          v-for="t in ['expense', 'income']"
          :key="t"
          :label="t === 'income' ? 'Доход' : 'Расход'"
          :outlined="form.type !== t"
          :severity="t === 'income' ? 'success' : 'danger'"
          class="grow"
          @click="form.type = t"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Название</label>
        <InputText v-model="form.name" placeholder="Например: Продукты" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Сумма (₽)</label>
        <InputNumber
          v-model="form.amount"
          :min="0"
          mode="decimal"
          :useGrouping="true"
          placeholder="0"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Категория</label>
        <Select
          v-model="form.category"
          :options="categoryOptions"
          placeholder="Выберите категорию"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Дата</label>
        <DatePicker v-model="form.date" dateFormat="dd.mm.yy" showIcon />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Комментарий</label>
        <Textarea
          v-model="form.comment"
          rows="2"
          placeholder="Необязательно"
          autoResize
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Отмена"
        severity="secondary"
        outlined
        @click="showDialog = false"
      />
      <Button
        label="Добавить"
        @click="addTransaction"
        :disabled="!form.name || !form.amount"
      />
    </template>
  </Dialog>

  <!-- Фильтры -->
  <Card class="mb-4">
    <template #content>
      <div class="flex gap-3 flex-wrap items-end">
        <SearchFilter
          v-model="filters.search"
          placeholder="Название транзакции..."
        />

        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Тип</label>
          <Select
            v-model="filters.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Все"
            class="w-36"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Категория</label>
          <Select
            v-model="filters.category"
            :options="['Все', ...categoryOptions]"
            placeholder="Все"
            class="w-44"
          />
        </div>

        <Button
          label="Сбросить"
          severity="secondary"
          outlined
          @click="resetFilters"
        />
      </div>
    </template>
  </Card>

  <!-- Таблица транзакций -->
  <DataTableWrapper
    :data="filteredTransactions"
    :rows-per-page="pageSize"
    :total-records="filteredTransactions.length"
    :rows-per-page-options="[5, 10, 20]"
    striped-rows
    scrollable
    scroll-height="24rem"
    empty-message="Нет транзакций для отображения"
  >
    <Column header="Транзакция" style="min-width: 220px">
      <template #body="{ data }">
        <div class="flex items-center gap-3">
          <div class="txn-icon-cell">
            <i :class="getCategoryIcon(data.category)"></i>
          </div>
          <div>
            <p class="font-medium">{{ data.name }}</p>
            <p class="text-sm text-gray-400">{{ data.category }}</p>
          </div>
        </div>
      </template>
    </Column>

    <Column field="date" header="Дата" style="width: 120px">
      <template #body="{ data }">
        <span class="text-gray-500 text-sm">{{ formatDate(data.date) }}</span>
      </template>
    </Column>

    <Column header="Тип" style="width: 110px">
      <template #body="{ data }">
        <Tag
          :value="data.type === 'income' ? 'Доход' : 'Расход'"
          :severity="data.type === 'income' ? 'success' : 'danger'"
          rounded
        />
      </template>
    </Column>

    <Column header="Сумма" style="width: 140px">
      <template #body="{ data }">
        <span
          :class="data.type === 'income' ? 'amount-income' : 'amount-expense'"
        >
          {{ data.type === "income" ? "+" : "−" }} ₽{{
            data.amount.toLocaleString("ru-RU")
          }}
        </span>
      </template>
    </Column>

    <Column field="comment" header="Комментарий">
      <template #body="{ data }">
        <span class="text-gray-400 text-sm">{{ data.comment || "—" }}</span>
      </template>
    </Column>

    <Column header="" style="width: 60px">
      <template #body="{ data }">
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          size="small"
          @click="removeTransaction(data.id)"
        />
      </template>
    </Column>
  </DataTableWrapper>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import Column from "primevue/column";

import DataTableWrapper from "../common/DataTableWrapper.vue";
import SearchFilter from "../common/SearchFilter.vue";
import ModalDialog from "../common/ModalDialog.vue";
import { useFinanceStore } from "@/stores/finance";
import { useProjectStore } from "@/stores/projects";

// ── Диалог ──────────────────────────────────────────────
const showDialog = ref(false);

const emptyForm = () => ({
  type: "expense",
  name: "",
  amount: null,
  category: null,
  date: new Date(),
  comment: "",
});
const form = reactive(emptyForm());

const categoryOptions = [
  "Жильё",
  "Питание",
  "Транспорт",
  "Развлечения",
  "Зарплата",
  "Фриланс",
  "Прочее",
];

const typeOptions = [
  { label: "Все", value: null },
  { label: "Доход", value: "income" },
  { label: "Расход", value: "expense" },
];

// ── Stores ──────────────────────────────────────────────
const financeStore = useFinanceStore();
const projectStore = useProjectStore();

onMounted(() => {
  financeStore.load();
  projectStore.load();
});

function addTransaction() {
  const transaction = {
    id: crypto.randomUUID(),
    name: form.name,
    date: form.date ?? new Date(),
    type: form.type,
    amount: form.amount,
    category: form.category ?? "Прочее",
    comment: form.comment,
    createdAt: new Date().toISOString(),
  };
  financeStore.transactions.unshift(transaction);
  financeStore.save();
  Object.assign(form, emptyForm());
  showDialog.value = false;
}

function removeTransaction(id) {
  financeStore.transactions = financeStore.transactions.filter(
    (t) => t.id !== id,
  );
  financeStore.save();
}

// ── Связь с проектами ──────────────────────────────────
function getLinkedTask(transactionId) {
  try {
    return (
      projectStore.tasks.find((t) => t.financeIds?.includes(transactionId)) ??
      null
    );
  } catch {
    return null;
  }
}

// ── Фильтры ──────────────────────────────────────────────
const filters = reactive({ search: "", type: null, category: "Все" });

function resetFilters() {
  Object.assign(filters, { search: "", type: null, category: "Все" });
}

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter((t) => {
    const matchSearch =
      !filters.search ||
      t.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchType = !filters.type || t.type === filters.type;
    const matchCat =
      filters.category === "Все" || t.category === filters.category;
    return matchSearch && matchType && matchCat;
  });
});

// ── Пагинация ────────────────────────────────────────────
const pageSize = ref(8);

// ── Утилиты
const categoryIconMap = {
  Жильё: "pi pi-home",
  Питание: "pi pi-shopping-cart",
  Транспорт: "pi pi-car",
  Развлечения: "pi pi-play-circle",
  Зарплата: "pi pi-briefcase",
  Фриланс: "pi pi-code",
  Прочее: "pi pi-tag",
};

function getCategoryIcon(category) {
  return categoryIconMap[category] ?? "pi pi-tag";
}

function formatDate(dateVal) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
</script>

<style scoped>
.txn-icon-cell {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--p-surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-primary-color);
  flex-shrink: 0;
}

.amount-income {
  color: var(--p-green-600);
  font-weight: 600;
}
.amount-expense {
  color: var(--p-red-500);
  font-weight: 600;
}
</style>
