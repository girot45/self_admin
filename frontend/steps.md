## Контекст
Добавляем CRM-модуль в существующий self-admin проект (Vue 3 + Pinia + PrimeVue + localStorage).
CRM становится частью ядра вместе с Finance и Projects. Все новые сущности хранятся в localStorage по аналогии с существующими сторами.

---

## Фаза 1 — Модели данных и константы

### TASK-001
**Создать файл `src/constants/crm.js`**

Добавить перечисления:
- `CONTACT_TYPES` — физлицо, юрлицо, ИП
- `DEAL_STAGES` — новая, в работе, переговоры, выставлен счёт, выиграна, проиграна
- `DEAL_STAGE_SEVERITY` — маппинг стадий к severity PrimeVue (success, warn, danger, info, secondary)
- `CONTACT_STATUSES` — активный, архивный
- `ACTIVITY_TYPES` — звонок, встреча, письмо, задача

**Ожидание**: файл экспортирует 5 именованных констант, все строки на русском языке.

---

### TASK-002
**Описать структуры данных CRM в комментариях `src/stores/crm.js` (создать пустой стор)**

Структуры:

**Contact**

id, type, name, phone, email, company,
status, notes, financeIds[], dealIds[],
createdAt, updatedAt


**Deal**

id, title, stage, amount, currency,
contactId, projectId (nullable), taskId (nullable),
description, notes, closeDate (nullable),
financeIds[], activityIds[],
createdAt, updatedAt


**Activity**

id, type, dealId (nullable), contactId (nullable),
title, description, date, isDone,
createdAt, updatedAt


**Ожидание**: файл `src/stores/crm.js` создан, структуры задокументированы, стор пока пустой (state: { contacts: [], deals: [], activities: [] }).

---

## Фаза 2 — Pinia Store

### TASK-003
**Реализовать state и localStorage-методы в `src/stores/crm.js`**

- `state`: `contacts[]`, `deals[]`, `activities[]`, `loading`, `error`
- Метод `load()`: читает три ключа из localStorage (`crm_contacts`, `crm_deals`, `crm_activities`), парсит JSON, устанавливает значения
- Метод `save()`: сериализует и записывает три ключа в localStorage
- Использовать Options API (как `finance.js` и `projects.js`)

**Ожидание**: `load()` и `save()` работают корректно, данные изолированы в трёх ключах localStorage.

---

### TASK-004
**Добавить CRUD-действия для Contact в `src/stores/crm.js`**

- `createContact(data)` — генерирует id через `crypto.randomUUID()`, проставляет `createdAt/updatedAt`, пушит в `contacts[]`, вызывает `save()`
- `updateContact(id, data)` — обновляет поля, проставляет `updatedAt`, вызывает `save()`
- `deleteContact(id)` — удаляет контакт, отвязывает `contactId` в связанных Deal, вызывает `save()`

**Ожидание**: три действия реализованы, cascade-удаление (обнуление contactId в deals) работает.

---

### TASK-005
**Добавить CRUD-действия для Deal в `src/stores/crm.js`**

- `createDeal(data)` — генерирует id, проставляет `createdAt/updatedAt`, добавляет id в `contact.dealIds[]` если `contactId` указан, вызывает `save()`
- `updateDeal(id, data)` — обновляет поля, `updatedAt`, `save()`
- `deleteDeal(id)` — удаляет сделку, убирает id из `contact.dealIds[]`, удаляет связанные Activities, `save()`
- `moveDeal(id, newStage)` — меняет только `stage` и `updatedAt`, `save()`

**Ожидание**: четыре действия реализованы, синхронизация `dealIds` в контактах работает.

---

### TASK-006
**Добавить CRUD-действия для Activity в `src/stores/crm.js`**

- `createActivity(data)` — генерирует id, добавляет id в `deal.activityIds[]` если `dealId` указан, `save()`
- `updateActivity(id, data)` — обновляет поля, `save()`
- `toggleActivityDone(id)` — инвертирует `isDone`, обновляет `updatedAt`, `save()`
- `deleteActivity(id)` — удаляет активность, убирает id из `deal.activityIds[]`, `save()`

**Ожидание**: четыре действия реализованы, синхронизация `activityIds` в сделках работает.

---

### TASK-007
**Добавить геттеры в `src/stores/crm.js`**

- `dealsByStage(stage)` — массив Deal с указанным stage, отсортированный по `createdAt` desc
- `dealsByContact(contactId)` — все Deal контакта
- `activitiesByDeal(dealId)` — все Activity сделки, отсортированные по `date` asc
- `activitiesByContact(contactId)` — все Activity контакта
- `dealFinanceSummary(dealId)` — доходы/расходы/баланс через `useFinanceStore()` по `deal.financeIds[]`
- `contactDealsTotal(contactId)` — сумма `amount` всех Deal контакта

**Ожидание**: шесть геттеров реализованы, `dealFinanceSummary` использует finance store (по аналогии с `projectFinanceSummary`).

---

### TASK-008
**Добавить cross-store методы связи Finance ↔ CRM**

- `linkFinanceToDeal(dealId, financeId)` — добавляет financeId в `deal.financeIds[]`, `save()`
- `unlinkFinanceFromDeal(dealId, financeId)` — убирает financeId из `deal.financeIds[]`, `save()`

**Ожидание**: два метода реализованы по аналогии с `linkFinanceToProject/Task` из projects store.

---

## Фаза 3 — Маршрутизация

### TASK-009
**Создать файл `src/router/crm_router.js`**

Маршруты (lazy-loaded):
- `/crm` → `CRMView.vue` (список контактов — главная страница CRM)
- `/crm/contacts` → `ContactsView.vue`
- `/crm/contacts/:id` → `ContactDetailView.vue`
- `/crm/deals` → `DealsView.vue`
- `/crm/deals/:id` → `DealDetailView.vue`
- `/crm/activities` → `ActivitiesView.vue`

Каждый маршрут должен иметь `meta.sidebar` для боковой панели.

**Ожидание**: файл создан, все 6 маршрутов lazy-loaded, экспортируется массив `crmRoutes`.

---

### TASK-010
**Подключить `crmRoutes` в `src/router/index.js`**

- Импортировать `crmRoutes` из `crm_router.js`
- Добавить маршруты в children AppLayout (по аналогии с finance и project маршрутами)
- Убедиться, что `/crm` резолвится корректно (не конфликтует с существующим `CRMView.vue`)

**Ожидание**: навигация по всем CRM-маршрутам работает без ошибок.

---

## Фаза 4 — Views (каркасы)

### TASK-011
**Создать `src/views/crm/ContactsView.vue` — список контактов**

- Вызов `crmStore.load()` в `onMounted`
- Таблица контактов через `DataTable` PrimeVue: имя, тип, телефон, email, компания, статус, кол-во сделок
- Кнопка "Добавить контакт" (заглушка — вызов `console.log` пока нет диалога)
- Фильтрация по имени через `FilterInput` (уже есть в common/)

**Ожидание**: view рендерится, данные из стора отображаются, фильтр работает.

---

### TASK-012
**Создать `src/views/crm/DealsView.vue` — Kanban сделок**

- Kanban-колонки по стадиям из `DEAL_STAGES`
- Каждая колонка — компонент `KanbanColumn` (адаптировать существующий из projects) или новый `DealKanbanColumn`
- Карточка сделки: название, сумма, контакт (имя), дата закрытия
- Перемещение карточки вызывает `crmStore.moveDeal(id, newStage)`

**Ожидание**: Kanban отображается со всеми стадиями, drag-and-drop меняет стадию сделки через стор.

---

### TASK-013
**Создать `src/views/crm/ContactDetailView.vue` — карточка контакта**

- Загружает контакт по `:id` из `crmStore.contacts`
- Отображает основную информацию (имя, тип, телефон, email, компания, статус, заметки)
- Секция "Сделки контакта" — список через `crmStore.dealsByContact(id)`, каждая сделка кликабельна (переход на `/crm/deals/:id`)
- Секция "Активности" — список через `crmStore.activitiesByContact(id)`

**Ожидание**: view рендерится с данными, навигация к сделкам работает.

---

### TASK-014
**Создать `src/views/crm/DealDetailView.vue` — карточка сделки**

- Загружает сделку по `:id` из `crmStore.deals`
- Основная информация: название, стадия (Badge с severity), сумма, контакт (ссылка), связанный проект (ссылка если есть)
- Секция "Финансы сделки" — использует геттер `dealFinanceSummary(id)`, отображает KpiCard с доходами/расходами/балансом
- Секция "Активности" — список через `crmStore.activitiesByDeal(id)`, с чекбоксом `isDone`

**Ожидание**: view рендерится, финансовая сводка корректно суммирует связанные транзакции.

---

### TASK-015
**Создать `src/views/crm/ActivitiesView.vue` — список всех активностей**

- Таблица активностей: тип, заголовок, дата, сделка (ссылка), контакт (ссылка), статус `isDone`
- Чекбокс в строке вызывает `crmStore.toggleActivityDone(id)`
- Фильтр по типу активности через Dropdown (значения из `ACTIVITY_TYPES`)

**Ожидание**: view рендерится, toggle статуса сохраняется в localStorage.

---

## Фаза 5 — Диалоги (CRUD UI)

### TASK-016
**Создать `src/components/crm/ContactDialog.vue`**

- Props: `visible` (boolean), `contact` (объект или null — режим создания/редактирования)
- Форма: имя (required), тип (Dropdown), телефон, email, компания, статус (Dropdown), заметки (Textarea)
- Кнопки: "Сохранить" → `createContact` или `updateContact`, "Отмена"
- Emit: `update:visible`, `saved`

**Ожидание**: диалог открывается и закрывается, сохранение создаёт/обновляет контакт в сторе.

---

### TASK-017
**Создать `src/components/crm/DealDialog.vue`**

- Props: `visible`, `deal` (null = создание), `contactId` (nullable — предзаполнение)
- Форма: название (required), стадия (Dropdown), сумма (InputNumber), контакт (Dropdown из `crmStore.contacts`), проект (Dropdown из `projectsStore.projects`, nullable), дата закрытия (DatePicker), описание
- Кнопки: "Сохранить", "Отмена"
- Emit: `update:visible`, `saved`

**Ожидание**: диалог корректно создаёт/обновляет сделку, при передаче `contactId` предзаполняет поле контакта.

---

### TASK-018
**Создать `src/components/crm/ActivityDialog.vue`**

- Props: `visible`, `activity` (null = создание), `dealId` (nullable), `contactId` (nullable)
- Форма: тип (Dropdown из `ACTIVITY_TYPES`), заголовок (required), описание, дата (DatePicker), статус `isDone` (Checkbox)
- Кнопки: "Сохранить", "Отмена"
- Emit: `update:visible`, `saved`

**Ожидание**: диалог работает, предзаполнение `dealId`/`contactId` работает корректно.

---

### TASK-019
**Подключить `ContactDialog` в `ContactsView.vue`**

- Добавить кнопку "Добавить контакт" → открывает диалог в режиме создания
- Добавить действие "Редактировать" в строке таблицы → открывает диалог с данными контакта
- Добавить действие "Удалить" → ConfirmationService + `deleteContact(id)`
- После `saved` — перезагружать список

**Ожидание**: полный CRUD контактов работает через UI.

---

### TASK-020
**Подключить `DealDialog` в `DealsView.vue`**

- Кнопка "Добавить сделку" → диалог создания
- Клик на карандаш в карточке Kanban → диалог редактирования
- Клик на крестик в карточке → ConfirmationService + `deleteDeal(id)`

**Ожидание**: полный CRUD сделок работает через Kanban UI.

---

## Фаза 6 — Интеграция с ядром

### TASK-021
**Добавить CRM-раздел в меню `src/stores/sidebarMenu.js`**

- Добавить пункт "CRM" с иконкой `pi-users` и дочерними пунктами: Контакты, Сделки, Активности
- Убедиться, что пункт отображается в AppSidebar

**Ожидание**: CRM-раздел виден в боковой панели, навигация работает.

---

### TASK-022
**Обновить `CRMView.vue` — редирект или сводная страница**

Два варианта (выбрать один):
- **Вариант A**: `CRMView.vue` редиректит на `/crm/contacts` через `router.replace`
- **Вариант B**: `CRMView.vue` становится дашбордом CRM — KPI-карточки (кол-во контактов, открытые сделки, сумма в pipeline, активности на сегодня)

Реализовать **Вариант B** с использованием `KpiCard` из `common/`.

**Ожидание**: `/crm` показывает сводку по CRM с актуальными данными из стора.

---

### TASK-023
**Добавить блок "Связанные сделки" в `ProjectDetailView` (если существует) или в карточку проекта**

- В `ProjectCard.vue` или на странице деталей проекта добавить секцию "Сделки CRM"
- Показывать список сделок, где `deal.projectId === project.id`
- Кнопка "Создать сделку" → открывает `DealDialog` с предзаполненным `projectId`

**Ожидание**: из карточки проекта видны связанные CRM-сделки, новую сделку можно создать прямо из контекста проекта.

---

### TASK-024
**Добавить `crmStore.load()` в точку инициализации приложения**

- В `src/main.js` или в `App.vue` (onMounted) вызвать `useCrmStore().load()` — по аналогии с тем, как остальные сторы загружают данные
- Проверить, что при перезагрузке страницы данные CRM восстанавливаются

**Ожидание**: CRM-данные доступны сразу при открытии любого маршрута без ручного вызова `load()`.

---

## Фаза 7 — Полировка

### TASK-025
**Добавить валидацию форм в CRM-диалоги**

- `ContactDialog`: поле `name` — обязательное, минимум 2 символа; `email` — формат email если заполнен
- `DealDialog`: поле `title` — обязательное; `amount` — число > 0 если заполнено
- `ActivityDialog`: поле `title` — обязательное; `date` — обязательное
- Блокировать кнопку "Сохранить" при невалидных данных, показывать inline-ошибки

**Ожидание**: невалидные формы не отправляются, пользователь видит подсказки об ошибках.

---

### TASK-026
**Добавить Toast-уведомления для CRM-операций**

- После `createContact/Deal/Activity` → Toast "success" с текстом "Создано"
- После `update*` → Toast "success" "Сохранено"
- После `delete*` → Toast "info" "Удалено"
- Использовать `useToast()` из PrimeVue (уже подключён в проекте)

**Ожидание**: все CRUD-операции сопровождаются Toast-уведомлениями.

---

### TASK-027
**Финальная проверка: удалить мёртвый код CRM-заглушки**

- Убедиться, что старый пустой `CRMView.vue` либо заменён, либо удалён
- Проверить, что в `src/router/index.js` нет дублирующих маршрутов `/crm`
- Запустить `npm run lint` и устранить все предупреждения, связанные с новыми файлами

**Ожидание**: `npm run lint` завершается без ошибок, маршрут `/crm` однозначно резолвится в новый компонент.

---

## Итоговая структура новых файлов


src/
├── constants/
│   └── crm.js                          # TASK-001
├── stores/
│   └── crm.js                          # TASK-002..008
├── router/
│   └── crm_router.js                   # TASK-009
├── views/
│   └── crm/
│       ├── ContactsView.vue            # TASK-011
│       ├── ContactDetailView.vue       # TASK-013
│       ├── DealsView.vue               # TASK-012
│       ├── DealDetailView.vue          # TASK-014
│       └── ActivitiesView.vue          # TASK-015
└── components/
    └── crm/
        ├── ContactDialog.vue           # TASK-016
        ├── DealDialog.vue              # TASK-017
        └── ActivityDialog.vue          # TASK-018
