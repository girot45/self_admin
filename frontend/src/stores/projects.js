import { defineStore } from "pinia";
import { useFinanceStore } from "./finance";
import { PRESET_COLORS } from "@/constants/projects";

export const useProjectStore = defineStore("projects", {
  state: () => ({
    projects: [],
    tasks: [],
    epics: [],
    loading: false,
    error: null,
  }),

  getters: {
    tasksByStatus: (state) => (projectId, status) => {
      return state.tasks
        .filter((t) => t.projectId === projectId && t.status === status)
        .sort((a, b) => a.position - b.position);
    },

    taskFinanceSummary: (state) => (taskId) => {
      const financeStore = useFinanceStore();
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task || !task.financeIds.length)
        return { income: 0, expense: 0, balance: 0 };
      const linked = financeStore.transactions.filter((tr) =>
        task.financeIds.includes(tr.id),
      );
      const income = linked
        .filter((tr) => tr.type === "income")
        .reduce((s, tr) => s + tr.amount, 0);
      const expense = linked
        .filter((tr) => tr.type === "expense")
        .reduce((s, tr) => s + tr.amount, 0);
      return { income, expense, balance: income - expense };
    },

    projectFinanceSummary: (state) => (projectId) => {
      const financeStore = useFinanceStore();
      const project = state.projects.find((p) => p.id === projectId);
      const projectTasks = state.tasks.filter((t) => t.projectId === projectId);
      const taskFinanceIds = projectTasks.flatMap((t) => t.financeIds);
      const allIds = [
        ...new Set([...(project?.financeIds ?? []), ...taskFinanceIds]),
      ];
      const linked = financeStore.transactions.filter((tr) =>
        allIds.includes(tr.id),
      );
      const income = linked
        .filter((tr) => tr.type === "income")
        .reduce((s, tr) => s + tr.amount, 0);
      const expense = linked
        .filter((tr) => tr.type === "expense")
        .reduce((s, tr) => s + tr.amount, 0);
      return { income, expense, balance: income - expense };
    },

    epicsByProject: (state) => (projectId) => {
      return state.epics.filter((e) => e.projectId === projectId);
    },

    tasksByEpic: (state) => (epicId) => {
      return state.tasks.filter((t) => t.epicId === epicId && !t.parentTaskId);
    },

    subtasksByTask: (state) => (taskId) => {
      return state.tasks
        .filter((t) => t.parentTaskId === taskId)
        .sort((a, b) => a.position - b.position);
    },

    tasksWithoutEpic: (state) => (projectId) => {
      return state.tasks.filter(
        (t) => t.projectId === projectId && !t.epicId && !t.parentTaskId,
      );
    },

    epicProgress: (state) => (epicId) => {
      const tasks = state.tasks.filter(
        (t) => t.epicId === epicId && !t.parentTaskId,
      );
      if (!tasks.length) return 0;
      const done = tasks.filter((t) => t.status === "done").length;
      return Math.round((done / tasks.length) * 100);
    },
  },

  actions: {
    createProject(data) {
      const project = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? "active",
        color: data.color ?? PRESET_COLORS[0],
        financeIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.projects.push(project);
      this.save();
      return project;
    },

    updateProject(id, data) {
      const index = this.projects.findIndex((p) => p.id === id);
      if (index === -1) return;
      this.projects[index] = {
        ...this.projects[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    deleteProject(id) {
      this.projects = this.projects.filter((p) => p.id !== id);
      this.tasks = this.tasks.filter((t) => t.projectId !== id);
      this.epics = this.epics.filter((e) => e.projectId !== id);
      this.save();
    },

    createTask(projectId, data) {
      const sameCols = this.tasks.filter(
        (t) =>
          t.projectId === projectId && t.status === (data.status ?? "todo"),
      );
      const maxPos = sameCols.length
        ? Math.max(...sameCols.map((t) => t.position))
        : -1;
      const task = {
        id: crypto.randomUUID(),
        projectId,
        epicId: data.epicId ?? null,
        parentTaskId: data.parentTaskId ?? null,
        isSubtask: data.parentTaskId != null,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? "todo",
        priority: data.priority ?? "medium",
        assignee: data.assignee ?? null,
        dueDate: data.dueDate ?? null,
        position: maxPos + 1,
        financeIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tasks.push(task);
      this.save();
      return task;
    },

    updateTask(id, data) {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index === -1) return;
      this.tasks[index] = {
        ...this.tasks[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    moveTask(id, newStatus, newPosition) {
      const task = this.tasks.find((t) => t.id === id);
      if (!task) return;
      const oldStatus = task.status;
      task.status = newStatus;
      task.position = newPosition;
      task.updatedAt = new Date().toISOString();
      [oldStatus, newStatus].forEach((status) => {
        this.tasks
          .filter(
            (t) =>
              t.id !== id &&
              t.projectId === task.projectId &&
              t.status === status,
          )
          .sort((a, b) => a.position - b.position)
          .forEach((t, i) => {
            t.position = i;
          });
      });
      this.save();
    },

    deleteTask(id) {
      this.tasks = this.tasks.filter(
        (t) => t.id !== id && t.parentTaskId !== id,
      );
      this.save();
    },

    linkFinanceToTask(taskId, financeId) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task || task.financeIds.includes(financeId)) return;
      task.financeIds.push(financeId);
      task.updatedAt = new Date().toISOString();
      this.save();
    },

    unlinkFinanceFromTask(taskId, financeId) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return;
      task.financeIds = task.financeIds.filter((id) => id !== financeId);
      task.updatedAt = new Date().toISOString();
      this.save();
    },

    linkFinanceToProject(projectId, financeId) {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project || project.financeIds.includes(financeId)) return;
      project.financeIds.push(financeId);
      project.updatedAt = new Date().toISOString();
      this.save();
    },

    unlinkFinanceFromProject(projectId, financeId) {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project) return;
      project.financeIds = project.financeIds.filter((id) => id !== financeId);
      project.updatedAt = new Date().toISOString();
      this.save();
    },

    createEpic(projectId, data) {
      const epic = {
        id: crypto.randomUUID(),
        projectId,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? "open",
        color: data.color ?? "#8B5CF6",
        startDate: data.startDate ?? null,
        dueDate: data.dueDate ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.epics.push(epic);
      this.save();
      return epic;
    },

    updateEpic(id, data) {
      const index = this.epics.findIndex((e) => e.id === id);
      if (index === -1) return;
      this.epics[index] = {
        ...this.epics[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.save();
    },

    deleteEpic(id) {
      this.tasks.forEach((t) => {
        if (t.epicId === id) t.epicId = null;
      });
      this.epics = this.epics.filter((e) => e.id !== id);
      this.save();
    },

    save() {
      localStorage.setItem("projects", JSON.stringify(this.projects));
      localStorage.setItem("project_tasks", JSON.stringify(this.tasks));
      localStorage.setItem("project_epics", JSON.stringify(this.epics));
    },

    load() {
      try {
        const projects = localStorage.getItem("projects");
        const tasks = localStorage.getItem("project_tasks");
        const epics = localStorage.getItem("project_epics");
        if (projects)
          this.projects = JSON.parse(projects).map((p) => ({
            financeIds: [],
            ...p,
          }));
        if (tasks)
          this.tasks = JSON.parse(tasks).map((t) => ({
            epicId: null,
            parentTaskId: null,
            isSubtask: false,
            ...t,
          }));
        if (epics) this.epics = JSON.parse(epics);
      } catch (e) {
        console.error("Ошибка загрузки проектов:", e);
      }
    },
  },
});
