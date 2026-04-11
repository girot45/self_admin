# Project Context — Self Admin Frontend

## 1. Project Overview

self-admin is a single-page personal management and finance tracking dashboard built with Vue 3 and PrimeVue.
It enables users to manage projects, tasks (Kanban-style), epics, and personal finances (income/expense) entirely client-side.
All data is persisted in localStorage — no backend, no auth, no network calls.
Currently in active development: core features built, some views are empty placeholders.

## 2. Tech Stack

| Layer      | Technology                        | Version        | Notes                                    |
| ---------- | --------------------------------- | -------------- | ---------------------------------------- |
| Framework  | Vue 3 (Options + Composition API) | 3.5.13         | `<script setup>` used in some components |
| Build Tool | Vite                              | 6.4.1          | Dev server on port 5173                  |
| State Mgmt | Pinia                             | 3.0.1          | Options syntax (stores), no composables  |
| Routing    | Vue Router                        | 4.5.0          | webHistory, no guards                    |
| UI Library | PrimeVue                          | 4.3.1          | Aura theme, auto-import via resolver     |
| Icons      | PrimeIcons                        | 7.0.0          | CDN loaded in index.html                 |
| CSS        | Tailwind CSS                      | 3.4.1          | + tailwindcss-primeui plugin             |
| Charts     | Chart.js + vue-chartjs            | 4.5.1 / 5.3.3  | Dashboard analytics                      |
| Excel      | xlsx-js-style                     | 1.2.0          | CSV import/export in Dashboard           |
| Lint       | ESLint + prettier                 | 9.20.1 / 3.5.1 | `npm run lint`, `npm run format`         |

**Notable**: No TypeScript in source (all .js/.vue). No backend. No authentication.

## 3. Architecture Diagram (ASCII)

```
User Browser
  │
  └─ Vue 3 SPA (Vite dev server :5173)
       │
       ├─ Router (Vue Router, webHistory)
       │    └─ AppLayout → Topbar + Sidebar → router-view
       │
       ├─ Components (PrimeVue auto-imported)
       │    ├─ common/      → BaseCard, KpiCard, ModalDialog, DataTableWrapper, etc.
       │    ├─ dashboard/   → ChartsDashboard (Chart.js + Excel import)
       │    ├─ finance/     → FinanceOverview, Payments, Goals, Budgets, Reports
       │    └─ projects/    → ProjectCard, TaskCard, EpicCard, KanbanColumn, Dialogs, FinancePanels
       │
       ├─ Stores (Pinia → localStorage)
       │    ├─ finance.js  → transactions[]
       │    └─ projects.js → projects[], tasks[], epics[]
       │         └─ cross-store: project/task → finance via financeIds[]
       │
       ├─ Constants
       │    └─ projects.js → status/priority/severity mappings (Russian labels)
       │
       └─ Mock Data
            └─ mock.js → cards, accounts, categories, commissions (mostly unused)
```

## 4. Directory Map

| Path                           | Description                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.js`                  | App bootstrap — mounts Vue, registers Pinia, PrimeVue (Aura), Router, Toast/Confirmation/Dialog services                                                                           |
| `src/App.vue`                  | Root component — single <router-view />                                                                                                                                            |
| `src/layout/AppLayout.vue`     | Main layout wrapper — Topbar + Sidebar + content slot                                                                                                                              |
| `src/layout/AppTopbar.vue`     | Fixed menubar with nav links + live clock                                                                                                                                          |
| `src/layout/AppSidebar.vue`    | Collapsible sidebar, populated from route.meta.sidebar, persist to localStorage                                                                                                    |
| `src/router/index.js`          | Main router — wraps all routes in AppLayout                                                                                                                                        |
| `src/router/finance_router.js` | Finance sub-routes (5 children, lazy-loaded), sidebar meta                                                                                                                         |
| `src/router/project_router.js` | Project sub-routes (list + detail with :id), eager-loaded, dead markRaw import                                                                                                     |
| `src/stores/finance.js`        | Pinia store: transactions CRUD, getters (totalIncome, totalExpense, balance), localStorage                                                                                         |
| `src/stores/projects.js`       | Pinia store: projects/tasks/epics CRUD, finance linking, cross-store getters, localStorage (3 keys)                                                                                |
| `src/stores/mock.js`           | Static mock data + helper funcs (mostly unused)                                                                                                                                    |
| `src/stores/sidebarMenu.js`    | Plain JS config for sidebar menu labels -> routes                                                                                                                                  |
| `src/stores/counter.js`        | Demo boilerplate store — NOT used anywhere                                                                                                                                         |
| `src/constants/projects.js`    | Enums: task statuses, priorities, severities, preset colors (Russian labels)                                                                                                       |
| `src/views/HomeView.vue`       | Home — date picker + task list                                                                                                                                                     |
| `src/views/DashboardView.vue`  | Charts dashboard with Excel import capability                                                                                                                                      |
| `src/views/FinanceView.vue`    | Finance layout wrapper (router-view)                                                                                                                                               |
| `src/views/ProjectView.vue`    | Projects list view                                                                                                                                                                 |
| `src/views/CRMView.vue`        | Empty placeholder (0 bytes)                                                                                                                                                        |
| `src/views/KnowladgeView.vue`  | Empty placeholder (0 bytes)                                                                                                                                                        |
| `src/views/AboutView.vue`      | Static about page                                                                                                                                                                  |
| `src/components/common/`       | Reusable UI: BaseCard, ChartCardFrame, DataTableWrapper, FilterInput, KpiCard, ModalDialog, SearchFilter, StatusButton                                                             |
| `src/components/finance/`      | Finance views: FinanceBugets, FinanceGoals, FinanceOverview, FinancePayments, FinanceReports + report subcharts                                                                    |
| `src/components/projects/`     | Project views: EpicCard, EpicDialog, FinanceCreateDialog, KanbanColumn, ProjectCard, ProjectDetailPage, ProjectDialog, ProjectFinancePanel, TaskCard, TaskDialog, TaskFinancePanel |

## 5. Core Entities & Data Models

### Project

| Field       | Type           | Notes                                                   |
| ----------- | -------------- | ------------------------------------------------------- |
| id          | string         | crypto.randomUUID()                                     |
| title       | string         | required                                                |
| description | string or null |                                                         |
| status      | string         | active, paused, completed, cancelled                    |
| color       | string         | preset hex: #3B82F6, #10B981, #F59E0B, #8B5CF6, #EF4444 |
| financeIds  | string[]       | foreign keys to finance transactions                    |
| createdAt   | ISO string     |                                                         |
| updatedAt   | ISO string     |                                                         |

### Task

| Field        | Type           | Notes                                |
| ------------ | -------------- | ------------------------------------ |
| id           | string         | crypto.randomUUID()                  |
| projectId    | string         | foreign key                          |
| epicId       | string or null | foreign key, nullable                |
| parentTaskId | string or null | for subtasks                         |
| isSubtask    | boolean        | derived from parentTaskId != null    |
| title        | string         | required                             |
| description  | string or null |                                      |
| status       | string         | todo, in_progress, review, done      |
| priority     | string         | low, medium, high, critical          |
| assignee     | string or null |                                      |
| dueDate      | string or null |                                      |
| position     | number         | ordering within status column        |
| financeIds   | string[]       | foreign keys to finance transactions |
| createdAt    | ISO string     |                                      |
| updatedAt    | ISO string     |                                      |

### Epic

| Field       | Type           | Notes                   |
| ----------- | -------------- | ----------------------- |
| id          | string         | crypto.randomUUID()     |
| projectId   | string         | foreign key             |
| title       | string         | required                |
| description | string or null |                         |
| status      | string         | open, in_progress, done |
| color       | string         | default #8B5CF6         |
| startDate   | string or null |                         |
| dueDate     | string or null |                         |
| createdAt   | ISO string     |                         |
| updatedAt   | ISO string     |                         |

### Transaction (Finance)

| Field       | Type       | Notes                 |
| ----------- | ---------- | --------------------- |
| id          | string     | crypto.randomUUID()   |
| amount      | number     |                       |
| type        | string     | income or expense     |
| description | string     |                       |
| category    | string     | default uncategorized |
| date        | ISO string |                       |
| createdAt   | ISO string |                       |

### Relationships

- Project 1-to-N Task (via projectId)
- Project 1-to-N Epic (via projectId)
- Epic 1-to-N Task (via epicId)
- Task 1-to-N Task subtasks (via parentTaskId)
- Project/Task N-to-M Transaction (via financeIds[] — linking, not duplicating data)

## 6. API Surface

There is NO external API. All operations are local. Below are store actions:

| Method | Store Action                              | Purpose                                   |
| ------ | ----------------------------------------- | ----------------------------------------- |
| CRUD   | finance.addTransaction()                  | Create income/expense transaction         |
| CRUD   | projects.createProject()                  | Create a new project                      |
| CRUD   | projects.updateProject()                  | Update project fields                     |
| CRUD   | projects.deleteProject()                  | Delete project + all its tasks            |
| CRUD   | projects.createTask()                     | Create task in a project                  |
| CRUD   | projects.updateTask()                     | Update task fields                        |
| CRUD   | projects.moveTask()                       | Move task between Kanban columns, reorder |
| CRUD   | projects.deleteTask()                     | Delete task + subtasks                    |
| CRUD   | projects.createEpic()                     | Create epic in a project                  |
| CRUD   | projects.updateEpic()                     | Update epic fields                        |
| CRUD   | projects.deleteEpic()                     | Delete epic, unlink its tasks             |
| CRUD   | projects.linkFinanceToTask()              | Link transaction to task                  |
| CRUD   | projects.unlinkFinanceFromTask()          | Unlink transaction from task              |
| CRUD   | projects.linkFinanceToProject()           | Link transaction to project               |
| CRUD   | projects.unlinkFinanceFromProject()       | Unlink transaction from project           |
| Read   | projects.taskFinanceSummary(taskId)       | Get income/expense/balance for task       |
| Read   | projects.projectFinanceSummary(projectId) | Get income/expense/balance for project    |
| Read   | projects.tasksByStatus(projectId, status) | Get sorted tasks by status                |
| Read   | projects.epicsByProject(projectId)        | Get epics for a project                   |
| Read   | projects.tasksByEpic(epicId)              | Get tasks in an epic                      |
| Read   | projects.epicProgress(epicId)             | Calculate % of done tasks in epic         |

## 7. State Management

| Store       | Holds                                                           | Used By                                                         | Persistence                                                    |
| ----------- | --------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| finance     | transactions[], loading, error                                  | Finance views, ProjectFinancePanel, TaskFinancePanel, Dashboard | localStorage["finance_transactions"]                           |
| projects    | projects[], tasks[], epics[], loading, error                    | Project views, KanbanColumn, TaskDialog, EpicDialog, HomeView   | localStorage["projects"], ["project_tasks"], ["project_epics"] |
| counter     | count (demo)                                                    | Not used anywhere                                               | None                                                           |
| sidebarMenu | static menu config                                              | AppSidebar via route.meta.sidebar                               | localStorage["sidebarVisible"] (in AppSidebar)                 |
| mock        | cards, accounts, categories, transactions, commissions, helpers | Mostly unused                                                   | None                                                           |

**Cross-store communication**: projects.js imports useFinanceStore() directly in getters. This creates a hard dependency.

## 8. Key Workflows

1. **App Initialization**: main.js creates Pinia -> creates Vue App -> mounts. Stores are NOT auto-loaded — load() must be called manually by components [?].
2. **Sidebar Toggle**: Topbar button toggles v-model:visible on Sidebar -> AppSidebar persists to localStorage key sidebarVisible.
3. **Project Creation**: User opens ProjectDialog -> fills form -> store.createProject() -> saved to localStorage.
4. **Task Kanban Flow**: User drags task between columns -> store.moveTask(id, newStatus, newPosition) -> reorders positions -> saves.
5. **Finance Linking**: User links a transaction to a task via TaskFinancePanel -> store.linkFinanceToTask(taskId, financeId) -> finance data appears in summaries.
6. **Project/Task Finance Summary**: Component calls store.projectFinanceSummary(projectId) -> cross-store join with Finance store -> returns income/expense/balance.
7. **Dashboard Analytics**: ChartsDashboard renders Chart.js charts from finance data -> supports CSV/Excel import via xlsx-js-style.
8. **Report Generation**: FinanceReports shows category distribution, expenses dynamics, hourly/weekday analytics via ChartCardFrame.

## 9. External Integrations

| Service               | Connection              | Purpose    | Status |
| --------------------- | ----------------------- | ---------- | ------ |
| PrimeIcons CDN        | unpkg.com in index.html | Icon fonts | Active |
| No other integrations | None                    | None       | None   |

No OAuth, no S3, no payment gateways, no WebSockets, no REST APIs.

## 10. Known Constraints & Gotchas

- **No auto-load**: Stores have load() methods but no component appears to call them on app startup. If user refreshes, data only restores when a component explicitly calls load() [?].
- **Hard cross-store coupling**: projects.js imports useFinanceStore() directly — cannot use projects store without finance store initialized.
- **Inconsistent store syntax**: counter.js uses setup syntax (ref/computed), finance.js and projects.js use options API.
- **Dead code**: counter.js unused, CRMView.vue and KnowladgeView.vue are empty files, mock.js helpers mostly unused, markRaw import in project_router.js unused.
- **No TypeScript**: Despite project.config specifying TypeScript ecosystem, source files are plain JavaScript.
- **No navigation guards**: No auth checks, no redirect logic, no 404 handling.
- **localStorage only**: All data is per-browser, not synced across devices, easily lost.
- **Russian UI labels**: Status/priority labels are in Russian ("К выполнению", "В работе", etc.). Internationalization would require refactoring constants.
- **Dockerfile runs dev server**: node:22-alpine runs npm run dev (Vite) in production container — not a production-ready build.
- **No error boundaries**: No Vue error handling, no global error capture.
- **No form validation**: Dialogs (ProjectDialog, TaskDialog, EpicDialog) appear to have no client-side validation beyond HTML required attribute.

## 11. Glossary

| Term            | Meaning                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| Epic            | A collection/group of related tasks within a project                                    |
| Kanban          | Task management board with columns: Todo -> In Progress -> Review -> Done               |
| Finance linking | Associating a finance transaction with a project or task via financeIds[]               |
| Severity        | Visual badge level mapping for status/priority (success, warn, danger, info, secondary) |
| PT API          | PrimeVue PassThrough — used internally for component customization                      |
| Aura            | Default PrimeVue theme preset in use                                                    |
