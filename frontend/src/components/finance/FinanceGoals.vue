<template>
  <div class="flex justify-between items-center mb-6">
    <p class="text-6xl">Цели</p>
    <Button label="Добавить цель" icon="pi pi-plus" @click="openGoalDialog()" />
  </div>

  <!-- KPI -->
  <div class="flex gap-5 mb-5">
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Активных целей</p>
      <p class="text-3xl font-bold">{{ goals.length }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Целевая сумма</p>
      <p class="text-3xl font-bold">₽{{ totalGoalTarget.toLocaleString('ru-RU') }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">Уже накоплено</p>
      <p class="text-3xl font-bold text-teal-600">₽{{ totalGoalSaved.toLocaleString('ru-RU') }}</p>
    </div>
    <div class="custom-card grow">
      <p class="text-sm text-gray-400 mb-1">До завершения</p>
      <p class="text-3xl font-bold">₽{{ (totalGoalTarget - totalGoalSaved).toLocaleString('ru-RU') }}</p>
    </div>
  </div>

  <!-- Карточки целей -->
  <div class="goals-grid">
    <Card v-for="g in goals" :key="g.id">
      <template #content>
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <div class="cat-icon" :style="{ background: g.bg }">{{ g.emoji }}</div>
            <div>
              <p class="font-semibold text-base">{{ g.name }}</p>
              <Tag
                :value="g.type === 'saving' ? 'Накопление' : 'Трата'"
                :severity="g.type === 'saving' ? 'success' : 'warn'"
                rounded class="text-xs"
              />
            </div>
          </div>
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded size="small" @click="openGoalDialog(g)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeGoal(g.id)" />
          </div>
        </div>

        <!-- Дедлайн -->
        <div class="flex items-center gap-2 mb-3 text-sm text-gray-400" v-if="g.deadline">
          <i class="pi pi-calendar text-xs"></i>
          <span>До {{ formatDate(g.deadline) }}</span>
          <span class="ml-auto text-xs" :class="daysLeft(g.deadline) < 30 ? 'text-red-400' : ''">
            {{ daysLeft(g.deadline) }} дн.
          </span>
        </div>

        <!-- Прогресс -->
        <div class="flex justify-between text-sm mb-1">
          <span class="text-gray-500">Прогресс</span>
          <span class="font-semibold">
            ₽{{ g.saved.toLocaleString('ru-RU') }} / ₽{{ g.target.toLocaleString('ru-RU') }}
          </span>
        </div>
        <ProgressBar :value="Math.min((g.saved / g.target) * 100, 100)" :showValue="false" style="height:8px">
          <template #value>
            <div class="h-full rounded-full" style="background: #01696f" />
          </template>
        </ProgressBar>

        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ Math.round((g.saved / g.target) * 100) }}%</span>
          <span class="text-teal-600">
            Осталось ₽{{ (g.target - g.saved).toLocaleString('ru-RU') }}
          </span>
        </div>

        <!-- Пополнение -->
        <Divider class="my-3" />
        <div class="flex gap-2">
          <InputNumber
            v-model="g._deposit"
            placeholder="Пополнить, ₽"
            :min="0"
            :useGrouping="false"
            class="grow"
            inputClass="text-sm"
          />
          <Button label="+" @click="depositGoal(g)" :disabled="!g._deposit" size="small" />
        </div>
      </template>
    </Card>
  </div>

  <!-- Диалог -->
  <Dialog
    v-model:visible="showGoalDialog"
    :header="editingGoal?.id ? 'Редактировать цель' : 'Новая цель'"
    :style="{ width: '480px' }"
    modal
  >
    <div class="flex flex-col gap-4 mt-2">

      <div class="flex gap-3">
        <Button
          v-for="t in goalTypeOptions" :key="t.value"
          :label="t.label"
          :outlined="gf.type !== t.value"
          :severity="t.value === 'saving' ? 'success' : 'warn'"
          class="grow"
          @click="gf.type = t.value"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="label">Название цели</label>
        <InputText v-model="gf.name" placeholder="Например: Отпуск в Турции" />
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col gap-1 grow">
          <label class="label">{{ gf.type === 'saving' ? 'Целевая сумма' : 'Бюджет на трату' }} (₽)</label>
          <InputNumber v-model="gf.target" :min="1" :useGrouping="true" placeholder="100 000" />
        </div>
        <div class="flex flex-col gap-1 grow">
          <label class="label">Уже {{ gf.type === 'saving' ? 'накоплено' : 'потрачено' }} (₽)</label>
          <InputNumber v-model="gf.saved" :min="0" :useGrouping="true" placeholder="0" />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="label">Дедлайн (необязательно)</label>
        <DatePicker v-model="gf.deadline" dateFormat="dd.mm.yy" showIcon showButtonBar />
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col gap-1 grow">
          <label class="label">Эмодзи</label>
          <InputText v-model="gf.emoji" placeholder="🏖️" maxlength="2" />
        </div>
        <div class="flex flex-col gap-1 grow">
          <label class="label">Цвет фона</label>
          <Select v-model="gf.bg" :options="colorOptions" optionLabel="label" optionValue="value">
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
      <Button label="Отмена" outlined severity="secondary" @click="showGoalDialog = false" />
      <Button
        :label="editingGoal?.id ? 'Сохранить' : 'Создать'"
        @click="saveGoal"
        :disabled="!gf.name || !gf.target"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

const goalTypeOptions = [
  { label: '💰 Накопление', value: 'saving'   },
  { label: '🛍️ Трата',      value: 'spending' }
]

const colorOptions = [
  { label: 'Мятный',      value: '#e8f4f5' },
  { label: 'Бежевый',     value: '#f0eeea' },
  { label: 'Зелёный',     value: '#e3f5ef' },
  { label: 'Лавандовый',  value: '#ede9f6' },
  { label: 'Персиковый',  value: '#fdeee8' }
]

const goalIdSeq = ref(10)

const goals = ref([
  { id: 1, name: 'Отпуск в Турции', saved: 68000,  target: 120000, type: 'saving',   emoji: '🏖️', bg: '#e8f4f5', deadline: new Date(2026, 6, 1),  _deposit: null },
  { id: 2, name: 'Новый MacBook',   saved: 95000,  target: 180000, type: 'saving',   emoji: '💻', bg: '#f0eeea', deadline: new Date(2026, 11, 31), _deposit: null },
  { id: 3, name: 'Резервный фонд',  saved: 210000, target: 300000, type: 'saving',   emoji: '🛡️', bg: '#e3f5ef', deadline: null,                   _deposit: null },
  { id: 4, name: 'Ремонт кухни',    saved: 45000,  target: 150000, type: 'spending', emoji: '🔨', bg: '#fdeee8', deadline: new Date(2026, 8, 1),   _deposit: null }
])

const totalGoalTarget = computed(() => goals.value.reduce((s, g) => s + g.target, 0))
const totalGoalSaved  = computed(() => goals.value.reduce((s, g) => s + g.saved,  0))

function depositGoal(g) {
  if (!g._deposit) return
  g.saved = Math.min(g.saved + g._deposit, g.target)
  g._deposit = null
}

function removeGoal(id) {
  goals.value = goals.value.filter(g => g.id !== id)
}

const showGoalDialog = ref(false)
const editingGoal    = ref(null)

const emptyGf = () => ({ name: '', target: null, saved: 0, type: 'saving', emoji: '🎯', bg: '#e8f4f5', deadline: null })
const gf = reactive(emptyGf())

function openGoalDialog(g = null) {
  editingGoal.value = g
  Object.assign(gf, g ? { ...g } : emptyGf())
  showGoalDialog.value = true
}

function saveGoal() {
  if (editingGoal.value?.id) {
    const idx = goals.value.findIndex(g => g.id === editingGoal.value.id)
    if (idx !== -1) goals.value[idx] = { ...goals.value[idx], ...gf, _deposit: null }
  } else {
    goals.value.push({ id: goalIdSeq.value++, ...gf, _deposit: null })
  }
  showGoalDialog.value = false
}

function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

function daysLeft(date) {
  if (!date) return null
  return Math.max(0, Math.ceil((new Date(date) - new Date()) / 86400000))
}
</script>

<style scoped>
.custom-card {
  background: var(--p-card-background);
  border-radius: var(--p-card-border-radius);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--p-card-shadow);
}

.goals-grid {
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