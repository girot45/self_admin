// sidebarMenu.js
export const sidebarMenu = {
  Home: [
    { label: "Главная", to: "/" },
    { label: "Проекты", to: "/projects" },
  ],
  Finance: [
    { label: "Отчёты", to: "/finance/reports" },
    { label: "Платежи", to: "/finance/payments" },
  ],
  CRM: [
    { label: "Контакты", to: "/crm/contacts" },
    { label: "Сделки", to: "/crm/deals" },
    { label: "Активности", to: "/crm/activities" },
  ],
  Dashboard: [
    { label: "Статистика", to: "/dash/stats" },
    { label: "Пользователи", to: "/dash/users" },
  ],
};
