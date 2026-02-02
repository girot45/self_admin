import FinanceView from "@/views/FinanceView.vue";

export const financeRoutes = {
  path: "finance",
  component: FinanceView,
  meta: {
    sidebar: [
      { label: "Обзор", to: { name: "FinanceOverview" } },
      { label: "Отчёты", to: { name: "FinanceReports" } },
      { label: "Платежи", to: { name: "FinancePayments" } },
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
