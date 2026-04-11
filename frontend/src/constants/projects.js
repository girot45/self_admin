export const TASK_STATUSES = ["todo", "in_progress", "review", "done"];

export const TASK_STATUS_LABELS = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

export const TASK_PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",
};

export const TASK_PRIORITY_SEVERITY = {
  low: "secondary",
  medium: "info",
  high: "warn",
  critical: "danger",
};

export const PROJECT_STATUS_LABELS = {
  active: "Активный",
  paused: "На паузе",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const PROJECT_STATUS_SEVERITY = {
  active: "success",
  paused: "warn",
  completed: "info",
  cancelled: "danger",
};

export const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
];

export const EPIC_STATUS_LABELS = {
  open: "Открыт",
  in_progress: "В работе",
  done: "Завершён",
};

export const EPIC_STATUS_SEVERITY = {
  open: "secondary",
  in_progress: "info",
  done: "success",
};

export const ITEM_TYPE_LABELS = {
  epic: "Эпик",
  task: "Задача",
  subtask: "Подзадача",
};
