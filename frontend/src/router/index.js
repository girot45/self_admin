import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import Dashboard from "@/views/DashboardView.vue";

import { financeRoutes } from "./finance_router.js";
import { projectRoutes } from "./project_router.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "Home",
          component: HomeView,
        },

        financeRoutes,

        projectRoutes,

        {
          path: "dash",
          name: "Dashboard",
          component: Dashboard,
        },
      ],
    },
  ],
});

export default router;
