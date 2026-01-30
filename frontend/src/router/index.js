import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import FinanceView from "@/views/FinanceView.vue";
import Dashboard from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "/",
          name: "Home",
          component: HomeView,
        },
        {
          path: "/finance",
          name: "Finance",
          component: FinanceView,
        },
        {
          path: "/projects",
          name: "Projects",
          component: HomeView,
        },
        {
          path: "/dash",
          name: "Dashboard",
          component: Dashboard,
        },
      ],
    },
  ],
});

export default router;
