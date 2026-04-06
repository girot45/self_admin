<template>
  <div class="flex justify-between items-center mb-6">
    <p class="text-6xl">Платежи</p>
    <Button label="+ Добавить транзакцию" @click="showDialog = true" />
  </div>

  <!-- Диалог добавления транзакции -->
  <Dialog v-model:visible="showDialog" header="Новая транзакция" :style="{ width: '460px' }" modal>
    <div class="flex flex-col gap-4 mt-2">

      <div class="flex gap-3">
        <Button
          v-for="t in ['expense', 'income']" :key="t"
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
        <InputNumber v-model="form.amount" :min="0" mode="decimal" :useGrouping="true" placeholder="0" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Категория</label>
        <Select v-model="form.category" :options="categoryOptions" placeholder="Выберите категорию" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Дата</label>
        <DatePicker v-model="form.date" dateFormat="dd.mm.yy" showIcon />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-gray-500">Комментарий</label>
        <Textarea v-model="form.comment" rows="2" placeholder="Необязательно" autoResize />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" severity="secondary" outlined @click="showDialog = false" />
      <Button label="Добавить" @click="addTransaction" :disabled="!form.name || !form.amount" />
    </template>
  </Dialog>

  <!-- Фильтры -->
  <Card class="mb-4">
    <template #content>
      <div class="flex gap-3 flex-wrap items-end">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Поиск</label>
          <InputText v-model="filters.search" placeholder="Название транзакции..." class="w-56" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Тип</label>
          <Select v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Все" class="w-36" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-500">Категория</label>
          <Select v-model="filters.category" :options="['Все', ...categoryOptions]" placeholder="Все" class="w-44" />
        </div>

        <Button label="Сбросить" severity="secondary" outlined @click="resetFilters" />
      </div>
    </template>
  </Card>

  <!-- Таблица транзакций -->
  <Card>
    <template #content>
      <DataTable
        :value="paginatedRows"
        :rows="pageSize"
        responsiveLayout="scroll"
        class="txn-table"
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
            <span :class="data.type === 'income' ? 'amount-income' : 'amount-expense'">
              {{ data.type === 'income' ? '+' : '−' }} ₽{{ data.amount.toLocaleString('ru-RU') }}
            </span>
          </template>
        </Column>

        <Column field="comment" header="Комментарий">
          <template #body="{ data }">
            <span class="text-gray-400 text-sm">{{ data.comment || '—' }}</span>
          </template>
        </Column>

        <Column header="" style="width: 60px">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="removeTransaction(data.id)" />
          </template>
        </Column>
      </DataTable>

      <!-- Пагинация -->
      <div class="flex justify-between items-center mt-4 px-1">
        <span class="text-sm text-gray-400">
          {{ filteredTransactions.length }} транзакций
        </span>
        <Paginator
          :rows="pageSize"
          :totalRecords="filteredTransactions.length"
          v-model:first="pageFirst"
          :rowsPerPageOptions="[5, 10, 20]"
          @page="onPage"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'

// ── Диалог ──────────────────────────────────────────────
const showDialog = ref(false)

const emptyForm = () => ({
  type: 'expense',
  name: '',
  amount: null,
  category: null,
  date: new Date(),
  comment: ''
})
const form = reactive(emptyForm())

const categoryOptions = ['Жильё', 'Питание', 'Транспорт', 'Развлечения', 'Зарплата', 'Фриланс', 'Прочее']

const typeOptions = [
  { label: 'Все', value: null },
  { label: 'Доход', value: 'income' },
  { label: 'Расход', value: 'expense' }
]

// ── Транзакции ───────────────────────────────────────────
let nextId = ref(100)

const transactions = ref([
  { id: 1,  name: 'Зарплата',          date: new Date(2026, 8, 30), type: 'income',  amount: 120000, category: 'Зарплата',     comment: '' },
  { id: 2,  name: 'Аренда квартиры',   date: new Date(2026, 8, 28), type: 'expense', amount: 28000,  category: 'Жильё',        comment: '' },
  { id: 3,  name: 'Продукты — Лента',  date: new Date(2026, 8, 27), type: 'expense', amount: 4200,   category: 'Питание',      comment: 'Еженедельная закупка' },
  { id: 4,  name: 'Фриланс-проект',    date: new Date(2026, 8, 25), type: 'income',  amount: 30200,  category: 'Фриланс',      comment: '' },
  { id: 5,  name: 'Яндекс.Такси',      date: new Date(2026, 8, 24), type: 'expense', amount: 1850,   category: 'Транспорт',    comment: '' },
  { id: 6,  name: 'Netflix',           date: new Date(2026, 8, 23), type: 'expense', amount: 749,    category: 'Развлечения',  comment: '' },
  { id: 7,  name: 'Продукты — ВкусВилл', date: new Date(2026, 8, 20), type: 'expense', amount: 3100, category: 'Питание',     comment: '' },
  { id: 8,  name: 'Метро / автобус',   date: new Date(2026, 8, 19), type: 'expense', amount: 2100,   category: 'Транспорт',    comment: 'Пополнение карты' },
  { id: 9,  name: 'Аванс',             date: new Date(2026, 8, 15), type: 'income',  amount: 60000,  category: 'Зарплата',     comment: '' },
  { id: 10, name: 'Кино',              date: new Date(2026, 8, 14), type: 'expense', amount: 1200,   category: 'Развлечения',  comment: '' },
  { id: 11, name: 'Электроэнергия',    date: new Date(2026, 8, 10), type: 'expense', amount: 1850,   category: 'Жильё',        comment: '' },
  { id: 12, name: 'Интернет',          date: new Date(2026, 8, 10), type: 'expense', amount: 690,    category: 'Прочее',       comment: '' },
])

function addTransaction() {
  transactions.value.unshift({
    id: nextId.value++,
    name: form.name,
    date: form.date ?? new Date(),
    type: form.type,
    amount: form.amount,
    category: form.category ?? 'Прочее',
    comment: form.comment
  })
  Object.assign(form, emptyForm())
  showDialog.value = false
}

function removeTransaction(id) {
  transactions.value = transactions.value.filter(t => t.id !== id)
}

// ── Фильтры ──────────────────────────────────────────────
const filters = reactive({ search: '', type: null, category: 'Все' })

function resetFilters() {
  Object.assign(filters, { search: '', type: null, category: 'Все' })
}

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    const matchSearch = !filters.search || t.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchType   = !filters.type   || t.type === filters.type
    const matchCat    = filters.category === 'Все' || t.category === filters.category
    return matchSearch && matchType && matchCat
  })
})

// ── Пагинация ────────────────────────────────────────────
const pageFirst = ref(0)
const pageSize  = ref(8)

function onPage(e) {
  pageFirst.value = e.first
  pageSize.value  = e.rows
}

const paginatedRows = computed(() => {
  return filteredTransactions.value.slice(pageFirst.value, pageFirst.value + pageSize.value)
})

// ── Утилиты ──────────────────────────────────────────────
const categoryIconMap = {
  'Жильё':       'pi pi-home',
  'Питание':     'pi pi-shopping-cart',
  'Транспорт':   'pi pi-car',
  'Развлечения': 'pi pi-play-circle',
  'Зарплата':    'pi pi-briefcase',
  'Фриланс':     'pi pi-code',
  'Прочее':      'pi pi-tag'
}

function getCategoryIcon(category) {
  return categoryIconMap[category] ?? 'pi pi-tag'
}

function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
</script>

<style scoped>
.txn-icon-cell {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--p-surface-100);
  display: flex; align-items: center; justify-content: center;
  color: var(--p-primary-color);
  flex-shrink: 0;
}

.amount-income  { color: var(--p-green-600); font-weight: 600; }
.amount-expense { color: var(--p-red-500);   font-weight: 600; }
</style>