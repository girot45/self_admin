<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCrmStore } from "@/stores/crm";
import { useProjectStore } from "@/stores/projects";
import { ACTIVITY_TYPES } from "@/constants/crm";
import Button from "primevue/button";
import Badge from "primevue/badge";

const route = useRoute();
const crmStore = useCrmStore();
const projectStore = useProjectStore();
const financeStore = useFinanceStore();

onMounted(() => {
  crmStore.load();
  projectStore.load();
});

const deal = () => {
  return crmStore.deals.find((d) => d.id === route.params.id);
};

const contact = () => {
  return crmStore.contacts.find((c) => c.id === deal().contactId);
};

const project = () => {
  return projectStore.projects.find((p) => p.id === deal().projectId);
};

const tasks = () => {
  return projectStore.tasks.filter((t) => t.projectId === deal().projectId);
};

const financeSummary = () => {
  return crmStore.dealFinanceSummary(route.params.id);
};

const activities = () => {
  return crmStore.activitiesByDeal(route.params.id);
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <Button icon="pi pi-arrow-left" text @click="$router.back()" />
      <h1 class="text-2xl font-bold mt-2">
        {{ deal()?.title || "Загрузка..." }}
      </h1>
    </div>

    <div v-if="deal()">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BaseCard title="Основная информация">
          <div class="space-y-3">
            <div>
              <div class="text-sm text-gray-400">Статус</div>
              <Badge
                :value="getDealStageLabel(deal().stage)"
                :severity="getDealStageSeverity(deal().stage)"
              />
            </div>
            <div>
              <div class="text-sm text-gray-400">Сумма</div>
              <div class="text-2xl font-bold text-green-600">
                {{ formatCurrency(deal().amount) }}
              </div>
            </div>
            <div v-if="deal().closeDate">
              <div class="text-sm text-gray-400">Дата закрытия</div>
              <div>{{ formatDate(deal().closeDate) }}</div>
            </div>
            <div v-if="deal().currency && deal().currency !== 'RUB'">
              <div class="text-sm text-gray-400">Валюта</div>
              <div>{{ deal().currency }}</div>
            </div>
            <div v-if="deal().contactId">
              <div class="text-sm text-gray-400">Контакт</div>
              <Button
                text
                size="small"
                @click="
                  $router.push({
                    name: 'CRMContactDetail',
                    params: { id: deal().contactId },
                  })
                "
              >
                {{ contact()?.name }}
              </Button>
            </div>
            <div v-if="deal().projectId">
              <div class="text-sm text-gray-400">Проект</div>
              <Button
                text
                size="small"
                @click="
                  $router.push({
                    name: 'ProjectView',
                    params: { id: deal().projectId },
                  })
                "
              >
                {{ project()?.title }}
              </Button>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Финансы сделки">
          <div class="space-y-4">
            <KpiCard
              title="Доходы"
              :value="formatCurrency(financeSummary().income)"
              icon="pi pi-arrow-up"
              severity="success"
            />
            <KpiCard
              title="Расходы"
              :value="formatCurrency(financeSummary().expense)"
              icon="pi pi-arrow-down"
              severity="danger"
            />
            <KpiCard
              title="Баланс"
              :value="formatCurrency(financeSummary().balance)"
              :icon="
                financeSummary().balance >= 0
                  ? 'pi pi-wallet'
                  : 'pi pi-exclamation-triangle'
              "
              :severity="financeSummary().balance >= 0 ? 'success' : 'danger'"
            />
            <p
              v-if="!deal().financeIds?.length"
              class="text-sm text-gray-400 text-center"
            >
              Не привязано финансовых транзакций
            </p>
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaseCard title="Активности">
          <div
            v-if="activities().length === 0"
            class="text-center text-gray-400 py-4"
          >
            Нет активностей
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="activity in activities()"
              :key="activity.id"
              class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              :class="{ 'opacity-50': activity.isDone }"
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
                <div v-if="activity.description" class="text-sm mt-1">
                  {{ activity.description }}
                </div>
              </div>
              <i
                v-if="activity.isDone"
                class="pi pi-check-circle text-green-500 text-xl"
              ></i>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Взаимосвязи">
          <div class="space-y-3">
            <div>
              <div class="text-sm text-gray-400">Контакт</div>
              <div>
                {{ contact()?.name || "-" }}
                <Button
                  v-if="contact()"
                  icon="pi pi-arrow-right"
                  text
                  size="small"
                  @click="
                    $router.push({
                      name: 'CRMContactDetail',
                      params: { id: contact().id },
                    })
                  "
                />
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Проект</div>
              <div>
                {{ project()?.title || "-" }}
                <Button
                  v-if="project()"
                  icon="pi pi-arrow-right"
                  text
                  size="small"
                  @click="
                    $router.push({
                      name: 'ProjectView',
                      params: { id: project().id },
                    })
                  "
                />
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Задачи в проекте</div>
              <div>{{ tasks().length }}</div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import BaseCard from "@/components/common/BaseCard.vue";
import KpiCard from "@/components/common/KpiCard.vue";

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
