import ProjectView from "@/views/ProjectView.vue";
import ProjectDetailPage from "@/components/projects/ProjectDetailPage.vue";

export const projectRoutes = {
  path: "projects",
  meta: {
    sidebar: [{ label: "Главная", to: "/projects", icon: "pi pi-th-large" }],
  },
  children: [
    {
      path: "",
      name: "Projects",
      component: ProjectView,
    },
    {
      path: ":id",
      name: "ProjectDetail",
      component: ProjectDetailPage,
    },
  ],
};
