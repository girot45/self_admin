import FinanceView from "@/views/FinanceView.vue";

export const financeRoutes = {
  path: "finance",
  component: FinanceView,
  meta: {
    sidebar: [
      { label: "Главная", to: { name: "FinanceOverview" } },
      { label: "Платежи", to: { name: "FinancePayments" } },
      { label: "Цели", to: { name: "FinancePayments" } },
      { label: "Отчёты", to: { name: "FinanceReports" } },
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
      path: "payments",
      name: "FinancePayments",
      component: () => import("@/components/finance/FinancePayments.vue"),
    },
  ],
};
