<script setup>
import { onMounted } from "vue";
import { useCrmStore } from "@/stores/crm";
import { useFinanceStore } from "@/stores/finance";
import { useProjectStore } from "@/stores/projects";
import KpiCard from "@/components/common/KpiCard.vue";
import Button from "primevue/button";

const crmStore = useCrmStore();
const projectStore = useProjectStore();
const financeStore = useFinanceStore();

onMounted(() => {
  crmStore.load();
});

const activeDeals = () => {
  return crmStore.deals.filter((d) => d.stage !== "won" && d.stage !== "lost")
    .length;
};

const totalPipeline = () => {
  return crmStore.deals.reduce((total, deal) => {
    return total + (deal.amount || 0);
  }, 0);
};

const activitiesToday = () => {
  const today = new Date().toISOString().split("T")[0];
  return crmStore.activities.filter((a) => {
    return a.date.startsWith(today) && !a.isDone;
  }).length;
};
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">CRM</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KpiCard
        title="Контакты"
        :value="crmStore.contacts.length"
        icon="pi pi-users"
      />
      <KpiCard
        title="Активные сделки"
        :value="activeDeals()"
        icon="pi pi-briefcase"
        severity="warn"
      />
      <KpiCard
        title="Pipeline"
        :value="totalPipeline().toLocaleString()"
        icon="pi pi-chart-line"
      />
      <KpiCard
        title="Не выполненные активности"
        :value="activitiesToday()"
        icon="pi pi-calendar-times"
        severity="danger"
      />
      <KpiCard
        title="Выигранные сделки"
        :value="crmStore.deals.filter((d) => d.stage === 'won').length"
        icon="pi pi-check-circle"
        severity="success"
      />
      <KpiCard
        title="Успешных сделок по контактам"
        :value="crmStore.contacts.filter((c) => c.dealIds.length > 0).length"
        icon="pi pi-link"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseCard title="Последние активности" class="h-64">
        <p
          v-if="crmStore.activities.length === 0"
          class="text-center text-gray-400"
        >
          Нет активностей
        </p>
        <div v-else class="space-y-3">
          <div
            v-for="activity in crmStore.activities.slice(0, 5)"
            :key="activity.id"
            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <i
              :class="getActivityIcon(activity.type)"
              class="text-xl mt-0.5"
            ></i>
            <div class="flex-1">
              <div class="font-medium">{{ activity.title }}</div>
              <div class="text-xs text-gray-400">
                {{ formatDate(activity.date) }}
              </div>
            </div>
            <i
              :class="
                activity.isDone
                  ? 'pi pi-check text-green-500'
                  : 'pi pi-clock text-orange-500'
              "
              class="text-lg"
            ></i>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Свежие сделки" class="h-64">
        <p v-if="crmStore.deals.length === 0" class="text-center text-gray-400">
          Нет сделок
        </p>
        <div v-else class="space-y-3">
          <div
            v-for="deal in crmStore.deals.slice(0, 5)"
            :key="deal.id"
            class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <Badge
              :value="getDealStageLabel(deal.stage)"
              :severity="getDealStageSeverity(deal.stage)"
            />
            <div class="flex-1">
              <div class="font-medium">{{ deal.title }}</div>
              <div class="text-xs text-gray-400">
                {{ formatCurrency(deal.amount) }}
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <div class="mt-6 flex gap-4">
      <Button
        label="Контакты"
        icon="pi pi-users"
        @click="$router.push({ name: 'CRMContacts' })"
      />
      <Button
        label="Сделки"
        icon="pi pi-briefcase"
        @click="$router.push({ name: 'CRMDeals' })"
      />
      <Button
        label="Активности"
        icon="pi pi-calendar-check"
        @click="$router.push({ name: 'CRMActivities' })"
      />
    </div>
  </div>
</template>

<script>
import BaseCard from "@/components/common/BaseCard.vue";
import Badge from "primevue/badge";
import { ACTIVITY_TYPES } from "@/constants/crm";

const ACTIVITY_TYPES_MAP = {
  [ACTIVITY_TYPES.CALL]: "pi pi-phone",
  [ACTIVITY_TYPES.MEETING]: "pi pi-video",
  [ACTIVITY_TYPES.EMAIL]: "pi pi-envelope",
  [ACTIVITY_TYPES.TASK]: "pi pi-tasks",
};

function getActivityIcon(type) {
  return ACTIVITY_TYPES_MAP[type] || "pi pi-bell";
}

function getDealStageLabel(stage) {
  const stages = {
    new: "Новая",
    in_progress: "В работе",
    negotiations: "Переговоры",
    invoice_sent: "Счёт выставлен",
    won: "Выиграна",
    lost: "Проиграна",
  };
  return stages[stage] || stage;
}

function getDealStageSeverity(stage) {
  const severity = {
    new: "info",
    in_progress: "warn",
    negotiations: "primary",
    invoice_sent: "secondary",
    won: "success",
    lost: "danger",
  };
  return severity[stage] || "secondary";
}

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
</script>
