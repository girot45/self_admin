# Project Context — Self Admin Frontend

## 1. Project Overview

**self-admin** — это одностраничное приложение для персонального управления проектами и финансами, построенное на Vue 3 и PrimeVue.
Позволяет пользователям управлять проектами, задачами (в стиле Kanban), эпиками и личными финансами (доходы/расходы) полностью на клиентской стороне.
Все данные сохраняются в localStorage — без бэкенда, аутентификации и сетевых запросов.
Проект находится в активной разработке: основные функции реализованы, некоторые представления являются заглушками.

**Основное назначение**: персонализированная система управления задачами и финансами с возможностью связывания финансовых транзакций с задачами и проектами.

## 2. Tech Stack

| Слой          | Технология                        | Версия         | Примечания                                  |
| ------------- | --------------------------------- | -------------- | ------------------------------------------- |
| Фреймворк     | Vue 3 (Options + Composition API) | 3.5.13         | Используется `<script setup>` в компонентах |
| Сборка        | Vite                              | 6.4.1          | Dev сервер на порту 5173                    |
| Состояние     | Pinia                             | 3.0.1          | Options синтаксис (stores)                  |
| Маршрутизация | Vue Router                        | 4.5.0          | webHistory, без guards                      |
| UI Библиотека | PrimeVue                          | 4.3.1          | Тема Aura, auto-import через resolver       |
| Иконки        | PrimeIcons                        | 7.0.0          | Загружаются через CDN в index.html          |
| CSS           | Tailwind CSS                      | 3.4.1          | + плагин tailwindcss-primeui                |
| Графики       | Chart.js + vue-chartjs            | 4.5.1 / 5.3.3  | Аналитика в Dashboard                       |
| Excel         | xlsx-js-style                     | 1.2.0          | Импорт/экспорт CSV в Dashboard              |
| Линтинг       | ESLint + prettier                 | 9.20.1 / 3.5.1 | `npm run lint`, `npm run format`            |
| Dev Tools     | Vue DevTools                      | 7.7.2          | Интегрирован через vite-plugin-vue-devtools |
| Auto Import   | unplugin-vue-components           | latest         | Автоматический импорт PrimeVue компонентов  |

**Особенности**:

- Отсутствие TypeScript в исходном коде (все файлы .js/.vue)
- Нет бэкенда и аутентификации
- Полная клиентская реализация с сохранением в localStorage

## 3. Архитектура

### Диаграмма архитектуры

```
Пользовательский браузер
  │
  └─ Vue 3 SPA (Vite dev server :5173)
       │
       ├─ Маршрутизатор (Vue Router, webHistory)
       │    └─ AppLayout → Topbar + Sidebar → router-view
       │
       ├─ Компоненты (PrimeVue auto-import)
       │    ├─ common/      → BaseCard, KpiCard, ModalDialog, DataTableWrapper и др.
       │    ├─ dashboard/   → ChartsDashboard (Chart.js + Excel импорт)
       │    ├─ finance/     → FinanceOverview, Payments, Goals, Budgets, Reports
       │    └─ projects/    → ProjectCard, TaskCard, EpicCard, KanbanColumn, диалоги, FinancePanels
       │
       ├─ Сторы (Pinia → localStorage)
       │    ├─ finance.js  → transactions[] (финансовые операции)
       │    └─ projects.js → projects[], tasks[], epics[] (проекты/задачи)
       │         └─ cross-store связь: project/task ↔ finance через financeIds[]
       │
       ├─ Константы
       │    └─ projects.js → статусы/приоритеты/severity (русские метки)
       │
       ├─ Мок-данные
       │    └─ mock.js → cards, accounts, categories, commissions (в основном не используются)
       │
       └─ Сервисы PrimeVue
            ├─ ToastService (уведомления)
            ├─ DialogService (диалоги)
            └─ ConfirmationService (подтверждения)
```

### Конфигурация Vite

- **Файл**: `vite.config.mjs`
- **Плагины**:
  - `@vitejs/plugin-vue` для Vue 3
  - `vite-plugin-vue-devtools` для Vue DevTools
  - `unplugin-vue-components` с `PrimeVueResolver` для автоматического импорта компонентов PrimeVue
- **Алиасы**: `@` → `./src`

## 4. Структура директорий

### Корневые файлы

| Путь                 | Описание                                                                       |
| -------------------- | ------------------------------------------------------------------------------ |
| `package.json`       | Зависимости и скрипты проекта                                                  |
| `vite.config.mjs`    | Конфигурация Vite с плагинами Vue, DevTools и auto-import                      |
| `tailwind.config.js` | Конфигурация Tailwind CSS с плагином tailwindcss-primeui и dark mode           |
| `postcss.config.js`  | Конфигурация PostCSS для обработки CSS                                         |
| `index.html`         | Главный HTML файл с загрузкой PrimeIcons через CDN и инициализацией приложения |
| `Dockerfile`         | Конфигурация Docker для запуска dev сервера                                    |

### Исходный код (`src/`)

| Категория         | Путь                           | Описание                                                                                                  |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Входная точка** | `src/main.js`                  | Инициализация приложения — монтирование Vue, регистрация Pinia, PrimeVue (Aura), Router, сервисы PrimeVue |
|                   | `src/App.vue`                  | Корневой компонент — `<router-view />`                                                                    |
| **Макеты**        | `src/layout/AppLayout.vue`     | Основной макет — Topbar + Sidebar + content slot                                                          |
|                   | `src/layout/AppTopbar.vue`     | Фиксированная верхняя панель с навигацией и часами                                                        |
|                   | `src/layout/AppSidebar.vue`    | Сворачиваемая боковая панель, заполняется из route.meta.sidebar, сохраняется в localStorage               |
| **Маршрутизация** | `src/router/index.js`          | Главный роутер — оборачивает все маршруты в AppLayout                                                     |
|                   | `src/router/finance_router.js` | Подмаршруты финансов (5 дочерних, lazy-loaded), метаданные для sidebar                                    |
|                   | `src/router/project_router.js` | Подмаршруты проектов (список + детализация с :id), eager-loaded                                           |
| **Сторы**         | `src/stores/finance.js`        | Pinia store: операции CRUD для транзакций, геттеры (доходы/расходы/баланс), localStorage                  |
|                   | `src/stores/projects.js`       | Pinia store: CRUD для проектов/задач/эпиков, связь с финансами, localStorage (3 ключа)                    |
|                   | `src/stores/sidebarMenu.js`    | Конфигурация меню боковой панели                                                                          |
|                   | `src/stores/mock.js`           | Статические мок-данные (в основном не используются)                                                       |
|                   | `src/stores/counter.js`        | Демо store — НЕ используется                                                                              |
| **Константы**     | `src/constants/projects.js`    | Перечисления: статусы задач, приоритеты, severity, цвета (русские метки)                                  |
| **Представления** | `src/views/HomeView.vue`       | Домашняя страница — выбор даты + список задач                                                             |
|                   | `src/views/DashboardView.vue`  | Панель с графиками и возможностью импорта Excel                                                           |
|                   | `src/views/FinanceView.vue`    | Обертка для финансовых представлений (router-view)                                                        |
|                   | `src/views/ProjectView.vue`    | Список проектов                                                                                           |
|                   | `src/views/CRMView.vue`        | Пустая заглушка                                                                                           |
|                   | `src/views/KnowladgeView.vue`  | Пустая заглушка                                                                                           |
|                   | `src/views/AboutView.vue`      | Статическая страница "О проекте"                                                                          |
| **Компоненты**    | `src/components/common/`       | Переиспользуемые UI: BaseCard, ChartCardFrame, DataTableWrapper, FilterInput, KpiCard, ModalDialog и др.  |
|                   | `src/components/finance/`      | Финансовые представления: FinanceBugets, FinanceGoals, FinanceOverview, FinancePayments, FinanceReports   |
|                   | `src/components/projects/`     | Проектные компоненты: EpicCard, EpicDialog, FinanceCreateDialog, KanbanColumn, ProjectCard и др.          |
|                   | `src/components/dashboard/`    | ChartsDashboard (графики + импорт Excel)                                                                  |
| **Ассеты**        | `src/assets/main.css`          | Основные стили приложения                                                                                 |
|                   | `src/assets/base.css`          | Базовые CSS стили                                                                                         |

## 5. Основные сущности и модели данных

### Проект (Project)

| Поле        | Тип             | Описание                                                               |
| ----------- | --------------- | ---------------------------------------------------------------------- |
| id          | string          | Уникальный идентификатор (crypto.randomUUID())                         |
| title       | string          | Название (обязательное)                                                |
| description | string или null | Описание                                                               |
| status      | string          | Статус: active, paused, completed, cancelled                           |
| color       | string          | Цвет из предустановленных: #3B82F6, #10B981, #F59E0B, #8B5CF6, #EF4444 |
| financeIds  | string[]        | Внешние ключи к финансовым транзакциям                                 |
| createdAt   | ISO string      | Дата создания                                                          |
| updatedAt   | ISO string      | Дата обновления                                                        |

### Задача (Task)

| Поле         | Тип             | Описание                                          |
| ------------ | --------------- | ------------------------------------------------- |
| id           | string          | Уникальный идентификатор (crypto.randomUUID())    |
| projectId    | string          | Внешний ключ к проекту                            |
| epicId       | string или null | Внешний ключ к эпику (опционально)                |
| parentTaskId | string или null | Родительская задача для подзадач                  |
| isSubtask    | boolean         | Производное от parentTaskId != null               |
| title        | string          | Название (обязательное)                           |
| description  | string или null | Описание                                          |
| status       | string          | Статус: todo, in_progress, review, done           |
| priority     | string          | Приоритет: low, medium, high, critical            |
| assignee     | string или null | Исполнитель                                       |
| dueDate      | string или null | Срок выполнения                                   |
| position     | number          | Позиция для упорядочивания внутри колонки статуса |
| financeIds   | string[]        | Внешние ключи к финансовым транзакциям            |
| createdAt    | ISO string      | Дата создания                                     |
| updatedAt    | ISO string      | Дата обновления                                   |

### Эпик (Epic)

| Поле        | Тип             | Описание                                       |
| ----------- | --------------- | ---------------------------------------------- |
| id          | string          | Уникальный идентификатор (crypto.randomUUID()) |
| projectId   | string          | Внешний ключ к проекту                         |
| title       | string          | Название (обязательное)                        |
| description | string или null | Описание                                       |
| status      | string          | Статус: open, in_progress, done                |
| color       | string          | Цвет по умолчанию #8B5CF6                      |
| startDate   | string или null | Дата начала                                    |
| dueDate     | string или null | Срок выполнения                                |
| createdAt   | ISO string      | Дата создания                                  |
| updatedAt   | ISO string      | Дата обновления                                |

### Транзакция (Transaction, Finance)

| Поле        | Тип        | Описание                                       |
| ----------- | ---------- | ---------------------------------------------- |
| id          | string     | Уникальный идентификатор (crypto.randomUUID()) |
| amount      | number     | Сумма                                          |
| type        | string     | Тип: income (доход) или expense (расход)       |
| description | string     | Описание                                       |
| category    | string     | Категория (по умолчанию "uncategorized")       |
| date        | ISO string | Дата транзакции                                |
| createdAt   | ISO string | Дата создания записи                           |

### Отношения между сущностями

- **Проект 1-ко-многим Задачи** (через projectId)
- **Проект 1-ко-многим Эпики** (через projectId)
- **Эпик 1-ко-многим Задачи** (через epicId)
- **Задача 1-ко-многим Подзадачи** (через parentTaskId)
- **Проект/Задача многие-ко-многим Транзакции** (через financeIds[] — связывание, без дублирования данных)

## 6. Доступные операции

**Внешнего API нет.** Все операции выполняются локально. Ниже перечислены действия в сторах:

### Финансы (finance store)

| Тип     | Действие                      | Назначение                           |
| ------- | ----------------------------- | ------------------------------------ |
| CRUD    | `addTransaction(data)`        | Создать транзакцию (доход/расход)    |
|         | `updateTransaction(id, data)` | Обновить транзакцию                  |
|         | `deleteTransaction(id)`       | Удалить транзакцию                   |
| Read    | `load()`                      | Загрузить транзакции из localStorage |
|         | `save()`                      | Сохранить транзакции в localStorage  |
| Геттеры | `totalIncome`                 | Общая сумма доходов                  |
|         | `totalExpense`                | Общая сумма расходов                 |
|         | `balance`                     | Баланс (доходы - расходы)            |

### Проекты (projects store)

| Тип     | Действие                                         | Назначение                                 |
| ------- | ------------------------------------------------ | ------------------------------------------ |
| CRUD    | `createProject(data)`                            | Создать новый проект                       |
|         | `updateProject(id, data)`                        | Обновить поля проекта                      |
|         | `deleteProject(id)`                              | Удалить проект + все его задачи            |
|         | `createTask(data)`                               | Создать задачу в проекте                   |
|         | `updateTask(id, data)`                           | Обновить поля задачи                       |
|         | `moveTask(id, newStatus, newPosition)`           | Переместить задачу между колонками Kanban  |
|         | `deleteTask(id)`                                 | Удалить задачу + подзадачи                 |
|         | `createEpic(data)`                               | Создать эпик в проекте                     |
|         | `updateEpic(id, data)`                           | Обновить поля эпика                        |
|         | `deleteEpic(id)`                                 | Удалить эпик, отвязать его задачи          |
|         | `linkFinanceToTask(taskId, financeId)`           | Привязать транзакцию к задаче              |
|         | `unlinkFinanceFromTask(taskId, financeId)`       | Отвязать транзакцию от задачи              |
|         | `linkFinanceToProject(projectId, financeId)`     | Привязать транзакцию к проекту             |
|         | `unlinkFinanceFromProject(projectId, financeId)` | Отвязать транзакцию от проекта             |
| Read    | `load()`                                         | Загрузить данные из localStorage           |
|         | `save()`                                         | Сохранить данные в localStorage            |
| Геттеры | `tasksByStatus(projectId, status)`               | Получить отсортированные задачи по статусу |
|         | `epicsByProject(projectId)`                      | Получить эпики проекта                     |
|         | `tasksByEpic(epicId)`                            | Получить задачи эпика                      |
|         | `epicProgress(epicId)`                           | Рассчитать % выполненных задач в эпике     |
|         | `taskFinanceSummary(taskId)`                     | Получить доходы/расходы/баланс для задачи  |
|         | `projectFinanceSummary(projectId)`               | Получить доходы/расходы/баланс для проекта |

## 7. Управление состоянием (Pinia stores)

### Хранилища и их содержимое

| Стор            | Хранит                                                                    | Используется в                                                             | Сохранение в localStorage                                            |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **finance**     | `transactions[]`, `loading`, `error`                                      | Финансовые представления, ProjectFinancePanel, TaskFinancePanel, Dashboard | `localStorage["finance_transactions"]`                               |
| **projects**    | `projects[]`, `tasks[]`, `epics[]`, `loading`, `error`                    | Проектные представления, KanbanColumn, TaskDialog, EpicDialog, HomeView    | `localStorage["projects"]`, `["project_tasks"]`, `["project_epics"]` |
| **counter**     | `count` (демо)                                                            | НЕ используется                                                            | Нет                                                                  |
| **sidebarMenu** | Статическая конфигурация меню                                             | AppSidebar через `route.meta.sidebar`                                      | `localStorage["sidebarVisible"]` (в AppSidebar)                      |
| **mock**        | `cards`, `accounts`, `categories`, `transactions`, `commissions`, helpers | В основном не используется                                                 | Нет                                                                  |

### Особенности управления состоянием

1. **Межсторейная связь**: `projects.js` напрямую импортирует `useFinanceStore()` в геттерах, создавая жесткую зависимость.
2. **Синтаксис**: `finance.js` и `projects.js` используют Options API, `counter.js` использует Composition API (setup syntax).
3. **Отсутствие автозагрузки**: Сторы имеют методы `load()`, но ни один компонент не вызывает их при запуске приложения.
4. **Сохранение состояния**: Каждый стор самостоятельно управляет сохранением/загрузкой данных в localStorage.
5. **Изоляция данных**: Каждый стор хранит данные в отдельных ключах localStorage для предотвращения конфликтов.

## 8. Ключевые рабочие процессы

### 1. Инициализация приложения

- `main.js` создает Pinia → создает Vue приложение → монтирует
- **Важно**: Сторы НЕ загружаются автоматически — метод `load()` должен вызываться вручную компонентами

### 2. Управление боковой панелью

- Кнопка в Topbar переключает `v-model:visible` на Sidebar
- `AppSidebar` сохраняет состояние видимости в `localStorage["sidebarVisible"]`

### 3. Создание проекта

- Пользователь открывает `ProjectDialog` → заполняет форму
- Вызов `store.createProject()` → сохранение в localStorage

### 4. Работа с Kanban доской

- Пользователь перетаскивает задачу между колонками
- Вызов `store.moveTask(id, newStatus, newPosition)` → переупорядочивание позиций → сохранение

### 5. Связывание финансов с задачами

- Пользователь привязывает транзакцию к задаче через `TaskFinancePanel`
- Вызов `store.linkFinanceToTask(taskId, financeId)` → финансовые данные появляются в сводках

### 6. Финансовые сводки проектов/задач

- Компонент вызывает `store.projectFinanceSummary(projectId)`
- Кросс-сторейное объединение с Finance store → возврат доходов/расходов/баланса

### 7. Аналитика в Dashboard

- `ChartsDashboard` отрисовывает графики Chart.js на основе финансовых данных
- Поддержка импорта CSV/Excel через `xlsx-js-style`

### 8. Генерация отчетов

- `FinanceReports` показывает распределение по категориям, динамику расходов, аналитику по часам/дням недели через `ChartCardFrame`

### 9. Маршрутизация

- Главный роутер оборачивает все маршруты в `AppLayout`
- Финансовые маршруты lazy-loaded для оптимизации загрузки
- Проектные маршруты eager-loaded для быстрого доступа

## 9. Внешние интеграции

| Сервис                    | Подключение            | Назначение | Статус  |
| ------------------------- | ---------------------- | ---------- | ------- |
| **PrimeIcons CDN**        | unpkg.com в index.html | Иконки     | Активно |
| **Нет других интеграций** | Нет                    | Нет        | Нет     |

**Отсутствуют**:

- OAuth аутентификация
- Облачные хранилища (S3 и подобные)
- Платежные шлюзы
- WebSockets
- REST API
- Сторонние аналитические сервисы
- Уведомления (push, email, SMS)

## 10. Известные ограничения и особенности

### Архитектурные ограничения

1. **Отсутствие автозагрузки**: Сторы имеют методы `load()`, но ни один компонент не вызывает их при запуске приложения. При обновлении страницы данные восстанавливаются только когда компонент явно вызывает `load()`.

2. **Жесткая связь между сторами**: `projects.js` напрямую импортирует `useFinanceStore()` — невозможно использовать projects store без инициализированного finance store.

3. **Несогласованность синтаксиса**:

   - `counter.js` использует Composition API (setup syntax)
   - `finance.js` и `projects.js` используют Options API

4. **Неиспользуемый код**:
   - `counter.js` не используется
   - `CRMView.vue` и `KnowladgeView.vue` — пустые файлы
   - Помощники в `mock.js` в основном не используются
   - Импорт `markRaw` в `project_router.js` не используется

### Функциональные ограничения

5. **Отсутствие TypeScript**: Несмотря на экосистему TypeScript в конфигурации, исходные файлы — обычный JavaScript.

6. **Нет навигационных guards**: Отсутствуют проверки аутентификации, логика перенаправлений, обработка 404 ошибок.

7. **Только localStorage**: Все данные хранятся только в браузере, не синхронизируются между устройствами, легко теряются.

8. **Русские метки интерфейса**: Статусы/приоритеты на русском языке ("К выполнению", "В работе" и т.д.). Интернационализация потребует рефакторинга констант.

### Технические ограничения

9. **Dockerfile запускает dev сервер**: `node:22-alpine` запускает `npm run dev` (Vite) в продакшен контейнере — не готовый к продакшену билд.

10. **Нет error boundaries**: Отсутствует обработка ошибок Vue, нет глобального перехвата ошибок.

11. **Нет валидации форм**: Диалоги (ProjectDialog, TaskDialog, EpicDialog) не имеют клиентской валидации, кроме HTML атрибута `required`.

12. **Отсутствие тестов**: В проекте нет unit или интеграционных тестов.

13. **Ограниченная масштабируемость**: Архитектура не рассчитана на большое количество данных из-за хранения всего в localStorage.

14. **Нет резервного копирования**: Нет механизмов экспорта/импорта данных для резервного копирования.

15. **Ограниченная производительность**: При большом количестве задач/транзакций может снижаться производительность из-за полной загрузки данных в память.

## 11. Глоссарий

| Термин                           | Значение                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Эпик (Epic)**                  | Коллекция/группа связанных задач в рамках проекта                                               |
| **Канбан (Kanban)**              | Доска управления задачами с колонками: К выполнению → В работе → На проверке → Готово           |
| **Связывание финансов**          | Привязка финансовой транзакции к проекту или задаче через массив `financeIds[]`                 |
| **Severity**                     | Визуальный уровень значимости для статусов/приоритетов (success, warn, danger, info, secondary) |
| **PT API**                       | PrimeVue PassThrough — используется для внутренней кастомизации компонентов                     |
| **Aura**                         | Предустановленная тема PrimeVue, используемая в проекте                                         |
| **Pinia**                        | Библиотека управления состоянием для Vue, альтернатива Vuex                                     |
| **PrimeVue**                     | UI библиотека компонентов для Vue 3                                                             |
| **Tailwind CSS**                 | Утилитарный CSS фреймворк для быстрой разработки интерфейсов                                    |
| **Vite**                         | Современный инструмент сборки для фронтенд проектов                                             |
| **Композиция (Composition API)** | API Vue 3 для организации логики компонентов с помощью функций                                  |
| **Options API**                  | Традиционный API Vue для организации логики компонентов с помощью объектов                      |


RULES: V-MODEL WITH PROPS
1. NEVER use v-model directly on a prop (e.g., v-model="modelValue")
2. This is a Vue 3 anti-pattern that causes runtime warnings
3. ALWAYS use computed property with getter/setter pattern instead
4. Pattern example:
   const localValue = computed({
     get: () => props.modelValue,
     set: (value) => emit("update:modelValue", value)
   });
   Then use v-model="localValue"
5. This ensures proper two-way binding while respecting Vue's reactivity rules
6. Common props requiring this pattern: modelValue, value, visible, isOpen, etc.
7. Review all v-model bindings to ensure they follow this rule
