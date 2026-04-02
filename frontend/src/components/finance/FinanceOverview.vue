<!-- <script setup>
import BankCards from '@/components/finance/bank_cards/BankCards.vue';
import HistoryComponent from '@/components/finance/chart/HistoryComponent.vue';
import ActiveButtons from '@/components/finance/active_buttons/ActiveButtonsComponent.vue';
</script>

<template>
    
  <div>
    <div class="flex flex-row gap-5 mb-5">
      <BankCards class="grow" />
      <ActiveButtons />
    </div>

    <div class="flex-1 min-h-[300px]">
      <HistoryComponent />
    </div>
  </div>
</template> -->

<template>
  <div class="flex justify-between">
      <p class="text-6xl">Дашборд</p>
      <p class="text-6xl">{{ currentDate }}</p>
  </div>



  <div class="flex mt-4 mb-2 gap-4">
    <Button v-for="tab in tabs" :key="tab" :label="tab" :outlined="activeTab !== tab" size="small" class="w-24"
      @click="activeTab = tab" />
  </div>

  <div class="flex justify-between gap-10 py-3 ">

    <div v-for="kpi in kpis" :key="kpi.label" class="grow custom-card w-1/4">
      <!-- Контент сверху -->
      <div class="flex justify-between self-center">
        <div>
          <div class="content-section">
            <p class="text-2xl">{{ kpi.label }}</p>
          </div>

          <!-- Заголовок и подзаголовок снизу -->
          <div class="title-section">
            <div class="text-3xl font-bold">{{ kpi.value }}</div>
            <Tag :value="`${kpi.trend > 0 ? '▲' : '▼'} ${Math.abs(kpi.trend)}% ${kpi.trendLabel}`"
              :severity="kpi.trend > 0 ? 'success' : 'danger'" rounded />
          </div>
        </div>

        <div class="justify-self-center self-center" :class="kpi.iconColor">
          <i :class="kpi.icon" style="font-size: 2.5rem"></i>
        </div>
      </div>

    </div>

  </div>

  <div class="charts-row">
    <Card>
      <template #content>
        <div class="section-header">
          <span class="card-title">Доходы и расходы</span>
          <div class="chart-legend">
            <span><span class="legend-dot income"></span>Доходы</span>
            <span><span class="legend-dot expense"></span>Расходы</span>
          </div>
        </div>

        <Chart type="bar" :data="barChartData" :options="barChartOptions" class="chart-box" />
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="card-title">Расходы по категориям</p>

        <Chart type="doughnut" :data="doughnutData" :options="doughnutOptions" class="donut-box" />

        <div class="donut-legend">
          <div class="legend-item" v-for="cat in categories" :key="cat.name">
            <div class="legend-left">
              <span class="legend-dot round" :style="{ background: cat.color }"></span>
              <span class="legend-name">{{ cat.name }}</span>
            </div>
            <span class="legend-pct">{{ cat.pct }}%</span>
          </div>
        </div>
      </template>
    </Card>
  </div>

  <div class="bottom-row">
    <Card>
      <template #content>
        <div class="section-header">
          <span class="card-title">Последние операции</span>
          <a href="#" class="section-link">Все →</a>
        </div>

        <div class="transactions-list">
          <div class="txn-row" v-for="txn in transactions" :key="txn.id">
            <div class="txn-icon">
              <i :class="txn.icon"></i>
            </div>

            <div class="txn-info">
              <p class="txn-name">{{ txn.name }}</p>
              <p class="txn-date">{{ txn.date }}</p>
            </div>

            <span class="txn-amount" :class="txn.type">
              {{ txn.type === 'income' ? '+' : '−' }} ₽{{ txn.amount.toLocaleString('ru-RU') }}
            </span>
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="card-title">Бюджет</p>

        <div class="budget-list">
          <div class="budget-item" v-for="b in budgets" :key="b.name">
            <div class="budget-top">
              <span class="budget-label">{{ b.name }}</span>
              <span class="budget-nums">
                ₽{{ b.spent.toLocaleString('ru-RU') }} / ₽{{ b.limit.toLocaleString('ru-RU') }}
              </span>
            </div>

            <ProgressBar :value="Math.min((b.spent / b.limit) * 100, 100)" :showValue="false">
              <template #value>
                <div class="custom-progress-value" :style="{ background: getBudgetColor(b) }" />
              </template>
            </ProgressBar>
          </div>
        </div>

        <Divider />

        <p class="card-title">Цели</p>

        <div class="goals-list">
          <div class="goal-item" v-for="g in goals" :key="g.name">
            <div class="goal-icon" :style="{ background: g.bg }">{{ g.emoji }}</div>

            <div class="goal-info">
              <p class="goal-name">{{ g.name }}</p>
              <p class="goal-sub">
                ₽{{ g.saved.toLocaleString('ru-RU') }} из ₽{{ g.target.toLocaleString('ru-RU') }}
              </p>
            </div>

            <span class="goal-pct">{{ Math.round((g.saved / g.target) * 100) }}%</span>
          </div>
        </div>
      </template>
    </Card>
  </div>


</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Chart from 'primevue/chart'
import ProgressBar from 'primevue/progressbar'
import Divider from 'primevue/divider'

const currentDate = 'Сентябрь 2024'

const tabs = ['Все', 'Личное', 'Работа']
const activeTab = ref('Все')

const kpis = [
  { label: 'Общий баланс', value: '₽ 345 800', trend: 2.1, trendLabel: '', icon: 'pi pi-wallet', iconColor: 'teal' },
  { label: 'Доходы', value: '₽ 150 200', trend: 12, trendLabel: 'vs last month', icon: 'pi pi-chart-line', iconColor: 'green' },
  { label: 'Расходы', value: '₽ 88 400', trend: -5, trendLabel: 'vs budget', icon: 'pi pi-chart-bar', iconColor: 'gray' },
  { label: 'Денежный поток', value: '₽ 61 800', trend: 8, trendLabel: 'increase', icon: 'pi pi-arrow-right-arrow-left', iconColor: 'blue' }
]

const barData = [
  { month: 'Апр', income: 110000, expense: 75000 },
  { month: 'Май', income: 125000, expense: 82000 },
  { month: 'Июн', income: 118000, expense: 91000 },
  { month: 'Июл', income: 134000, expense: 78000 },
  { month: 'Авг', income: 128000, expense: 86000 },
  { month: 'Сен', income: 150200, expense: 88400 }
]

const categories = [
  { name: 'Жильё', pct: 32, color: '#01696f' },
  { name: 'Питание', pct: 24, color: '#4f98a3' },
  { name: 'Транспорт', pct: 18, color: '#c8dede' },
  { name: 'Развлечения', pct: 14, color: '#e8f4f5' },
  { name: 'Прочее', pct: 12, color: '#dcd9d5' }
]

const transactions = [
  { id: 1, name: 'Зарплата', date: '30 сен', type: 'income', amount: 120000, icon: 'pi pi-briefcase' },
  { id: 2, name: 'Аренда квартиры', date: '28 сен', type: 'expense', amount: 28000, icon: 'pi pi-home' },
  { id: 3, name: 'Продукты — Лента', date: '27 сен', type: 'expense', amount: 4200, icon: 'pi pi-shopping-cart' },
  { id: 4, name: 'Фриланс-проект', date: '25 сен', type: 'income', amount: 30200, icon: 'pi pi-code' },
  { id: 5, name: 'Яндекс.Такси', date: '24 сен', type: 'expense', amount: 1850, icon: 'pi pi-car' },
  { id: 6, name: 'Netflix', date: '23 сен', type: 'expense', amount: 749, icon: 'pi pi-play-circle' }
]

const budgets = [
  { name: 'Питание', spent: 21200, limit: 25000 },
  { name: 'Транспорт', spent: 7400, limit: 8000 },
  { name: 'Развлечения', spent: 11900, limit: 12000 },
  { name: 'Коммунальные', spent: 6200, limit: 7500 }
]

const goals = [
  { name: 'Отпуск в Турции', saved: 68000, target: 120000, emoji: '🏖️', bg: '#e8f4f5' },
  { name: 'Новый MacBook', saved: 95000, target: 180000, emoji: '💻', bg: '#f0eeea' },
  { name: 'Резервный фонд', saved: 210000, target: 300000, emoji: '🛡️', bg: '#e3f5ef' }
]

const barChartData = computed(() => ({
  labels: barData.map((d) => d.month),
  datasets: [
    {
      label: 'Доходы',
      data: barData.map((d) => d.income),
      backgroundColor: '#01696f',
      borderRadius: 4,
      barPercentage: 0.55,
      categoryPercentage: 0.6
    },
    {
      label: 'Расходы',
      data: barData.map((d) => d.expense),
      backgroundColor: '#c8dede',
      borderRadius: 4,
      barPercentage: 0.55,
      categoryPercentage: 0.6
    }
  ]
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#b0aea9',
        font: { size: 11, family: 'Inter' }
      }
    },
    y: {
      grid: { color: '#f0eeea' },
      border: { display: false },
      ticks: {
        color: '#b0aea9',
        font: { size: 10, family: 'Inter' },
        callback: (value) => `₽${value / 1000}к`
      }
    }
  }
}))

const doughnutData = computed(() => ({
  labels: categories.map((c) => c.name),
  datasets: [
    {
      data: categories.map((c) => c.pct),
      backgroundColor: categories.map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '72%',
  plugins: {
    legend: { display: false }
  }
}))

function getBudgetColor(budget) {
  const ratio = budget.spent / budget.limit
  if (ratio > 0.85) return 'var(--color-error)'
  if (ratio > 0.65) return 'var(--color-warning)'
  return 'var(--color-primary)'
}
</script>

<style>
.custom-card {
  background: var(--p-card-background);
  border-radius: var(--p-card-border-radius);
  padding: 1.5rem;
  box-shadow: var(--p-card-shadow);
}
</style>