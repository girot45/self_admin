<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCrmStore } from "@/stores/crm";
import { CONTACT_TYPES, CONTACT_STATUSES } from "@/constants/crm";
import Button from "primevue/button";
import Badge from "primevue/badge";

const route = useRoute();
const crmStore = useCrmStore();

onMounted(() => {
  crmStore.load();
});

const contact = () => {
  return crmStore.contacts.find((c) => c.id === route.params.id);
};

const deals = () => {
  return crmStore.dealsByContact(route.params.id);
};

const activities = () => {
  return crmStore.activitiesByContact(route.params.id);
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <Button icon="pi pi-arrow-left" text @click="$router.back()" />
      <h1 class="text-2xl font-bold mt-2">
        {{ contact()?.name || "Загрузка..." }}
      </h1>
    </div>

    <div v-if="contact()">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <BaseCard title="Основная информация">
          <div class="space-y-3">
            <div>
              <div class="text-sm text-gray-400">Тип</div>
              <div>
                <Badge
                  :value="getContactTypeLabel(contact().type)"
                  severity="info"
                />
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Компания</div>
              <div>{{ contact().company || "-" }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Телефон</div>
              <div>{{ contact().phone || "-" }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Email</div>
              <div>{{ contact().email || "-" }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Статус</div>
              <Badge
                :value="contact().status === 'active' ? 'Активный' : 'Архивный'"
                :severity="
                  contact().status === 'active' ? 'success' : 'secondary'
                "
              />
            </div>
            <div v-if="contact().notes" class="pt-2">
              <div class="text-sm text-gray-400">Заметки</div>
              <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                {{ contact().notes }}
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Финансы контакта">
          <div class="space-y-4">
            <KpiCard
              title="Сумма сделок"
              :value="contactDealsTotalValue().toLocaleString()"
              icon="pi pi-chart-line"
            />
            <KpiCard
              title="Количество сделок"
              :value="deals().length"
              icon="pi pi-briefcase"
            />
          </div>
        </BaseCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BaseCard title="Сделки контакта">
          <div
            v-if="deals().length === 0"
            class="text-center text-gray-400 py-4"
          >
            Нет сделок
          </div>
          <div v-else class="space-y-3">
            <BaseCard
              v-for="deal in deals()"
              :key="deal.id"
              class="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="
                $router.push({ name: 'CRMDealDetail', params: { id: deal.id } })
              "
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="font-medium">{{ deal.title }}</div>
                  <div class="text-xs text-gray-400">
                    {{ formatDate(deal.closeDate) }}
                  </div>
                </div>
                <Badge
                  :value="getDealStageLabel(deal.stage)"
                  :severity="getDealStageSeverity(deal.stage)"
                />
              </div>
              <div class="text-sm font-bold mt-2">
                {{ formatCurrency(deal.amount) }}
              </div>
            </BaseCard>
          </div>
        </BaseCard>

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
      </div>
    </div>
  </div>
</template>

<script>
import BaseCard from "@/components/common/BaseCard.vue";
import KpiCard from "@/components/common/KpiCard.vue";

const CONTACT_TYPES_MAP = {
  [CONTACT_TYPES.PERSON]: "Физлицо",
  [CONTACT_TYPES.COMPANY]: "Юрлицо",
  [CONTACT_TYPES.IP]: "ИП",
};

function getContactTypeLabel(type) {
  return CONTACT_TYPES_MAP[type] || type;
}

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

function contactDealsTotalValue() {
  const c = contact();
  return c ? crmStore.contactDealsTotal(c.id) : 0;
}
</script>
