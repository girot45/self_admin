import FinanceView from "@/views/FinanceView.vue";

export const financeRoutes = {
  path: "finance",
  component: FinanceView,
  meta: {
    sidebar: [
      { label: "Главная", to: { name: "FinanceOverview" } },
      { label: "Платежи", to: { name: "FinancePayments" }, icon: 'pi pi-list' },
      { label: "Цели", to: { name: "FinanceGoals" }, icon: 'pi pi-bullseye' },
      { label: "Бюджеты", to: { name: "FinanceBugets" } },
      { label: "Отчёты", to: { name: "FinanceReports" }, icon: 'pi pi-chart-line' },
      { label: 'Настройки', to: { name: "FinanceOverview" }, icon: 'pi pi-cog' }
    ],
  },
  children: [
    {
      path: "",
      name: "FinanceOverview",
      component: () => import("@/components/finance/FinanceOverview.vue"),
    },
    {
      path: "reports",
      name: "FinanceReports",
      component: () => import("@/components/finance/FinanceReports.vue"),
    },
        {
      path: "budgets",
      name: "FinanceBugets",
      component: () => import("@/components/finance/FinanceBugets.vue"),
    },
    {
      path: "goals",
      name: "FinanceGoals",
      component: () => import("@/components/finance/FinanceGoals.vue"),
    },
    {
      path: "payments",
      name: "FinancePayments",
      component: () => import("@/components/finance/FinancePayments.vue"),
    },
  ],
};
