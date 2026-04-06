<template>
  <div class="flex justify-between items-center mb-6">
    <p class="text-6xl">Бюджеты</p>
    <Button label="Добавить бюджет" icon="pi pi-plus" @click="openBudgetDialog()" />
  </div>

  <!-- KPI -->
  <div class="flex gap-5 mb-5">
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Всего бюджетов</p>
      <p class="text-3xl font-bold">{{ budgets.length }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Суммарный лимит</p>
      <p class="text-3xl font-bold">₽{{ totalBudgetLimit.toLocaleString('ru-RU') }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Потрачено</p>
      <p class="text-3xl font-bold">₽{{ totalBudgetSpent.toLocaleString('ru-RU') }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Остаток</p>
      <p class="text-3xl font-bold" :class="totalBudgetLeft >= 0 ? 'text-teal-600' : 'text-red-500'">
        ₽{{ Math.abs(totalBudgetLeft).toLocaleString('ru-RU') }}
      </p>
    </div>
  </div>

  <!-- Карточки бюджетов -->
  <div class="budget-grid mb-4">
    <Card v-for="b in budgets" :key="b.id" class="budget-card">
      <template #content>
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <div class="cat-icon" :style="{ background: b.iconBg }">{{ b.emoji }}</div>
            <div>
              <p class="font-semibold text-base">{{ b.name }}</p>
              <p class="text-xs text-gray-400">{{ periodLabel(b) }}</p>
            </div>
          </div>
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded size="small" @click="openBudgetDialog(b)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeBudget(b.id)" />
          </div>
        </div>

        <div class="flex justify-between text-sm mb-1">
          <span class="text-gray-500">Потрачено</span>
          <span :class="b.spent > b.limit ? 'text-red-500 font-semibold' : 'font-semibold'">
            ₽{{ b.spent.toLocaleString('ru-RU') }} / ₽{{ b.limit.toLocaleString('ru-RU') }}
          </span>
        </div>
        <ProgressBar :value="Math.min((b.spent / b.limit) * 100, 100)" :showValue="false" style="height:8px">
          <template #value>
            <div class="h-full rounded-full" :style="{ background: getBudgetColor(b) }" />
          </template>
        </ProgressBar>

        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ Math.round((b.spent / b.limit) * 100) }}% использовано</span>
          <span :class="b.spent > b.limit ? 'text-red-500' : 'text-teal-600'">
            {{ b.spent > b.limit ? 'Превышен на' : 'Остаток' }}
            ₽{{ Math.abs(b.limit - b.spent).toLocaleString('ru-RU') }}
          </span>
        </div>
      </template>
    </Card>
  </div>

  <!-- Диалог -->
  <Dialog
    v-model:visible="showBudgetDialog"
    :header="editingBudget?.id ? 'Редактировать бюджет' : 'Новый бюджет'"
    :style="{ width: '480px' }"
    modal
  >
    <div class="flex flex-col gap-4 mt-2">

      <div class="flex flex-col gap-1">
        <label class="label">Название категории</label>
        <InputText v-model="bf.name" placeholder="Например: Питание" />
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col gap-1 grow">
          <label class="label">Лимит (₽)</label>
          <InputNumber v-model="bf.limit" :min="1" :useGrouping="true" placeholder="25 000" />
        </div>
        <div class="flex flex-col gap-1 grow">
          <label class="label">Потрачено (₽)</label>
          <InputNumber v-model="bf.spent" :min="0" :useGrouping="true" placeholder="0" />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="label">Период</label>
        <div class="flex gap-2">
          <Button
            v-for="p in periodOptions" :key="p.value"
            :label="p.label"
            :outlined="bf.period !== p.value"
            size="small"
            @click="bf.period = p.value"
          />
        </div>
      </div>

      <template v-if="bf.period === 'custom'">
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 grow">
            <label class="label">Начало периода</label>
            <DatePicker v-model="bf.dateFrom" dateFormat="dd.mm.yy" showIcon />
          </div>
          <div class="flex flex-col gap-1 grow">
            <label class="label">Конец периода</label>
            <DatePicker v-model="bf.dateTo" dateFormat="dd.mm.yy" showIcon />
          </div>
        </div>
      </template>

      <div class="flex gap-3">
        <div class="flex flex-col gap-1 grow">
          <label class="label">Эмодзи</label>
          <InputText v-model="bf.emoji" placeholder="🛒" maxlength="2" />
        </div>
        <div class="flex flex-col gap-1 grow">
          <label class="label">Цвет иконки</label>
          <Select v-model="bf.iconBg" :options="colorOptions" optionLabel="label" optionValue="value">
            <template #value="{ value }">
              <div class="flex items-center gap-2">
                <span class="inline-block w-4 h-4 rounded-full" :style="{ background: value }"></span>
                <span>{{ colorOptions.find(c => c.value === value)?.label }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span class="inline-block w-4 h-4 rounded-full" :style="{ background: option.value }"></span>
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
      </div>

    </div>

    <template #footer>
      <Button label="Отмена" outlined severity="secondary" @click="showBudgetDialog = false" />
      <Button
        :label="editingBudget?.id ? 'Сохранить' : 'Создать'"
        @click="saveBudget"
        :disabled="!bf.name || !bf.limit"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

const periodOptions = [
  { label: 'День',   value: 'day'    },
  { label: 'Месяц',  value: 'month'  },
  { label: 'Год',    value: 'year'   },
  { label: 'Период', value: 'custom' }
]

const colorOptions = [
  { label: 'Мятный',      value: '#e8f4f5' },
  { label: 'Бежевый',     value: '#f0eeea' },
  { label: 'Зелёный',     value: '#e3f5ef' },
  { label: 'Лавандовый',  value: '#ede9f6' },
  { label: 'Персиковый',  value: '#fdeee8' }
]

const budgetIdSeq = ref(10)

const budgets = ref([
  { id: 1, name: 'Питание',      limit: 25000, spent: 21200, period: 'month', emoji: '🛒', iconBg: '#e8f4f5', dateFrom: null, dateTo: null },
  { id: 2, name: 'Транспорт',    limit: 8000,  spent: 7400,  period: 'month', emoji: '🚌', iconBg: '#f0eeea', dateFrom: null, dateTo: null },
  { id: 3, name: 'Развлечения',  limit: 12000, spent: 11900, period: 'month', emoji: '🎬', iconBg: '#ede9f6', dateFrom: null, dateTo: null },
  { id: 4, name: 'Коммунальные', limit: 7500,  spent: 6200,  period: 'month', emoji: '💡', iconBg: '#e3f5ef', dateFrom: null, dateTo: null }
])

const totalBudgetLimit = computed(() => budgets.value.reduce((s, b) => s + b.limit, 0))
const totalBudgetSpent = computed(() => budgets.value.reduce((s, b) => s + b.spent, 0))
const totalBudgetLeft  = computed(() => totalBudgetLimit.value - totalBudgetSpent.value)

function periodLabel(b) {
  const map = { day: 'День', month: 'Месяц', year: 'Год' }
  if (b.period !== 'custom') return map[b.period] ?? b.period
  const from = b.dateFrom ? formatDate(b.dateFrom) : '?'
  const to   = b.dateTo   ? formatDate(b.dateTo)   : '?'
  return `${from} — ${to}`
}

function getBudgetColor(b) {
  const r = b.spent / b.limit
  if (r > 0.85) return 'var(--p-red-500)'
  if (r > 0.65) return 'var(--p-orange-400)'
  return '#01696f'
}

function removeBudget(id) {
  budgets.value = budgets.value.filter(b => b.id !== id)
}

const showBudgetDialog = ref(false)
const editingBudget    = ref(null)

const emptyBf = () => ({
  name: '', limit: null, spent: 0,
  period: 'month', emoji: '📦',
  iconBg: '#e8f4f5', dateFrom: null, dateTo: null
})
const bf = reactive(emptyBf())

function openBudgetDialog(b = null) {
  editingBudget.value = b
  Object.assign(bf, b ? { ...b } : emptyBf())
  showBudgetDialog.value = true
}

function saveBudget() {
  if (editingBudget.value?.id) {
    const idx = budgets.value.findIndex(b => b.id === editingBudget.value.id)
    if (idx !== -1) budgets.value[idx] = { ...budgets.value[idx], ...bf }
  } else {
    budgets.value.push({ id: budgetIdSeq.value++, ...bf })
  }
  showBudgetDialog.value = false
}

function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}
</script>

<style scoped>
.custom-card {
  background: var(--p-card-background);
  border-radius: var(--p-card-border-radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--p-card-shadow);
}

.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.cat-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
</style>