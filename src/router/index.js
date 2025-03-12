import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import FinanceView from "@/views/FinanceView.vue";

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
      ],
    },
  ],
});

export default router;
