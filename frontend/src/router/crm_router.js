import CRMView from "@/views/crm/CRMView.vue";

export const crmRoutes = {
  path: "crm",
  component: CRMView,
  meta: {
    sidebar: [
      { label: "Контакты", to: { name: "CRMContacts" } },
      { label: "Сделки", to: { name: "CRMDeals" } },
      {
        label: "Активности",
        to: { name: "CRMActivities" },
        icon: "pi pi-calendar-check",
      },
    ],
  },
  children: [
    {
      path: "contacts",
      name: "CRMContacts",
      component: () => import("@/views/crm/ContactsView.vue"),
    },
    {
      path: "contacts/:id",
      name: "CRMContactDetail",
      component: () => import("@/views/crm/ContactDetailView.vue"),
    },
    {
      path: "deals",
      name: "CRMDeals",
      component: () => import("@/views/crm/DealsView.vue"),
    },
    {
      path: "deals/:id",
      name: "CRMDealDetail",
      component: () => import("@/views/crm/DealDetailView.vue"),
    },
    {
      path: "activities",
      name: "CRMActivities",
      component: () => import("@/views/crm/ActivitiesView.vue"),
    },
  ],
};
