# Documentation TODO

> Цель: перенести исходную проектную документацию в новую структуру `docs/` без потери смысла, без дублей и с понятной навигацией для человека и AI. 

## Общие правила

- [ ] Не менять корневую структуру `docs/`
- [ ] Один файл = одна тема = один тип информации
- [ ] Не дублировать один и тот же смысл в нескольких файлах
- [ ] Если информация уже есть в другом файле, оставить ссылку вместо копии
- [ ] Во всех файлах использовать одинаковую иерархию заголовков
- [ ] В начале каждого файла добавить служебный блок:
  - `title`
  - `doc_type`
  - `status`
  - `last_updated`
- [ ] Использовать короткие, понятные названия секций
- [ ] После заполнения каждого файла проверять: “этот файл отвечает только на один тип вопросов?” 

## Этап 1. Подготовка

- [ ] Прочитать исходный большой документ целиком
- [ ] Разметить исходный текст на блоки:
  - overview
  - stack
  - architecture
  - domain
  - workflows
  - limitations
  - rules
- [ ] Составить черновой mapping “блок -> файл”
- [ ] Отметить спорные куски, которые могут задевать несколько файлов
- [ ] Сначала переносить факты, потом пояснения и комментарии 

## Этап 2. Корневые файлы

### `docs/README.md`

- [ ] Добавить краткое описание проекта
- [ ] Добавить карту документации
- [ ] Добавить список разделов с коротким описанием
- [ ] Добавить порядок чтения для нового разработчика
- [ ] Добавить порядок чтения для AI/агента
- [ ] Добавить ссылки на ключевые файлы:
  - `01-overview/product-summary.md`
  - `01-overview/tech-stack.md`
  - `02-architecture/system-overview.md`
  - `02-architecture/state-management.md`
  - `03-domain/relationships.md` 

### `docs/CONVENTIONS.md`

- [ ] Зафиксировать правила именования файлов
- [ ] Зафиксировать единый шаблон заголовков
- [ ] Зафиксировать правило “не дублировать, а ссылаться”
- [ ] Зафиксировать, где хранить ADR
- [ ] Зафиксировать, где хранить frontend rules
- [ ] Зафиксировать правила ссылок между документами
- [ ] Зафиксировать правило обновлять `last_updated` при изменении файла 

## Этап 3. Overview

### `docs/01-overview/product-summary.md`

- [ ] Описать назначение проекта
- [ ] Описать, какую задачу решает продукт
- [ ] Описать ключевые пользовательские сценарии
- [ ] Описать главные функции в 1 коротком блоке
- [ ] Не добавлять детали реализации store/router/components 

### `docs/01-overview/tech-stack.md`

- [ ] Перенести таблицу технологий
- [ ] Для каждой технологии указать роль
- [ ] Отдельно отметить:
  - Vue 3
  - Vite
  - Pinia
  - PrimeVue
  - Tailwind
  - Chart.js
  - localStorage
- [ ] Зафиксировать отсутствие TypeScript в исходниках
- [ ] Не смешивать стек с архитектурными решениями 

### `docs/01-overview/project-scope.md`

- [ ] Описать, что уже реализовано
- [ ] Описать, что пока является заглушкой
- [ ] Описать, чего в проекте нет
- [ ] Отделить product scope от technical debt
- [ ] Отдельно вынести ограничения клиентской архитектуры 

### `docs/01-overview/glossary.md`

- [ ] Перенести все ключевые термины
- [ ] Сделать определения короткими и однозначными
- [ ] Проверить единообразие терминов по всем файлам
- [ ] Убедиться, что одинаковые понятия называются одинаково везде 

## Этап 4. Architecture

### `docs/02-architecture/system-overview.md`

- [ ] Перенести высокоуровневую архитектурную схему
- [ ] Описать основные слои системы
- [ ] Кратко описать поток данных
- [ ] Не переносить сюда таблицы полей доменных сущностей 

### `docs/02-architecture/frontend-architecture.md`

- [ ] Описать структуру `src/`
- [ ] Описать роли:
  - layout
  - views
  - common components
  - dashboard
  - finance
  - projects
- [ ] Не дублировать `tech-stack.md` 

### `docs/02-architecture/routing.md`

- [ ] Описать главный router
- [ ] Описать AppLayout wrapper
- [ ] Описать `finance_router.js`
- [ ] Описать `project_router.js`
- [ ] Зафиксировать lazy/eager loading
- [ ] Зафиксировать отсутствие guards
- [ ] Зафиксировать отсутствие 404-обработки 

### `docs/02-architecture/state-management.md`

- [ ] Описать все store
- [ ] Для каждого store указать ответственность
- [ ] Перенести load/save поведение
- [ ] Описать зависимость `projects -> finance`
- [ ] Описать разницу Options API / Composition API
- [ ] Указать, что store не автозагружаются при старте приложения 

### `docs/02-architecture/storage.md`

- [ ] Описать все ключи localStorage
- [ ] Описать, какие данные где лежат
- [ ] Описать ограничения browser-only хранения
- [ ] Описать риски потери данных
- [ ] Описать отсутствие синхронизации и бэкапа 

## Этап 5. Domain

### `docs/03-domain/projects.md`

- [ ] Описать сущность Project
- [ ] Перенести таблицу полей
- [ ] Отметить обязательные поля
- [ ] Описать связи с tasks, epics, finance
- [ ] Указать store-методы, которые меняют Project 

### `docs/03-domain/tasks.md`

- [ ] Описать сущность Task
- [ ] Перенести таблицу полей
- [ ] Описать `parentTaskId`
- [ ] Описать derived rule для `isSubtask`
- [ ] Описать связи с project, epic и finance 

### `docs/03-domain/epics.md`

- [ ] Описать сущность Epic
- [ ] Перенести таблицу полей
- [ ] Описать связи с project и tasks
- [ ] Указать логику прогресса эпика 

### `docs/03-domain/transactions.md`

- [ ] Описать сущность Transaction
- [ ] Перенести таблицу полей
- [ ] Зафиксировать типы `income` и `expense`
- [ ] Описать роль транзакций в проекте 

### `docs/03-domain/relationships.md`

- [ ] Описать все межсущностные связи
- [ ] Для каждой связи указать тип:
  - one-to-many
  - many-to-many
  - derived
- [ ] Не копировать полные таблицы полей 

### `docs/03-domain/business-rules.md`

- [ ] Перенести правила каскадного удаления
- [ ] Перенести правила отвязки эпика от задач
- [ ] Перенести правила связывания finance
- [ ] Перенести правила расчета сводок
- [ ] Явно указать, что `financeIds[]` хранит связи, а не дубли данных 

## Этап 6. Modules

### `docs/04-modules/dashboard/README.md`

- [ ] Описать назначение dashboard
- [ ] Описать основные возможности
- [ ] Описать источники данных
- [ ] Описать связь с аналитикой и импортом 

### `docs/04-modules/dashboard/components.md`

- [ ] Перечислить ключевые компоненты
- [ ] Для каждого указать роль
- [ ] Не переносить сюда store и domain rules 

### `docs/04-modules/dashboard/store-usage.md`

- [ ] Описать используемые store
- [ ] Описать getters/actions
- [ ] Описать источники данных dashboard 

### `docs/04-modules/dashboard/user-flows.md`

- [ ] Описать сценарий просмотра аналитики
- [ ] Описать сценарий импорта CSV/Excel
- [ ] Описать сценарий формирования отчетов 

### `docs/04-modules/dashboard/known-issues.md`

- [ ] Перенести локальные ограничения dashboard
- [ ] Отметить проблемные места импорта и аналитики 

---

### `docs/04-modules/finance/`

- [ ] Создать `README.md`
- [ ] Создать `components.md`
- [ ] Создать `store-usage.md`
- [ ] Создать `user-flows.md`
- [ ] Создать `known-issues.md`

### `docs/04-modules/finance/README.md`

- [ ] Описать финансовый модуль
- [ ] Описать overview, payments, goals, budgets, reports 

### `docs/04-modules/finance/components.md`

- [ ] Описать основные компоненты
- [ ] Отметить реальные и частично заглушечные части 

### `docs/04-modules/finance/store-usage.md`

- [ ] Описать использование `finance` store
- [ ] Описать пересечения с `projects` store 

### `docs/04-modules/finance/user-flows.md`

- [ ] Описать создание транзакции
- [ ] Описать редактирование транзакции
- [ ] Описать удаление транзакции
- [ ] Описать просмотр отчетов 

### `docs/04-modules/finance/known-issues.md`

- [ ] Перенести ограничения финансового модуля
- [ ] Указать ограничения валидации и аналитики 

---

### `docs/04-modules/projects/`

- [ ] Создать `README.md`
- [ ] Создать `components.md`
- [ ] Создать `store-usage.md`
- [ ] Создать `user-flows.md`
- [ ] Создать `known-issues.md`

### `docs/04-modules/projects/README.md`

- [ ] Описать модуль проектов
- [ ] Описать список проектов, детализацию, kanban, эпики, подзадачи 

### `docs/04-modules/projects/components.md`

- [ ] Описать `ProjectCard`
- [ ] Описать `TaskCard`
- [ ] Описать `EpicCard`
- [ ] Описать `KanbanColumn`
- [ ] Описать dialog-компоненты
- [ ] Описать finance panels 

### `docs/04-modules/projects/store-usage.md`

- [ ] Описать использование `projects` store
- [ ] Описать summary getters
- [ ] Описать связь с finance store 

### `docs/04-modules/projects/user-flows.md`

- [ ] Описать создание проекта
- [ ] Описать создание задачи
- [ ] Описать создание эпика
- [ ] Описать перемещение задач по Kanban
- [ ] Описать связывание финансов с проектом и задачей 

### `docs/04-modules/projects/known-issues.md`

- [ ] Указать ограничения drag-and-drop
- [ ] Указать ограничения валидации
- [ ] Указать ограничения производительности 

---

### `docs/04-modules/layout/`

- [ ] Создать `README.md`
- [ ] Создать `components.md`
- [ ] Создать `store-usage.md`
- [ ] Создать `user-flows.md`
- [ ] Создать `known-issues.md`

### `docs/04-modules/layout/README.md`

- [ ] Описать AppLayout
- [ ] Описать Topbar
- [ ] Описать Sidebar
- [ ] Описать общую навигацию 

### `docs/04-modules/layout/components.md`

- [ ] Описать layout-компоненты
- [ ] Описать роль `route.meta.sidebar` 

### `docs/04-modules/layout/store-usage.md`

- [ ] Описать `sidebarVisible`
- [ ] Описать хранение состояния sidebar 

### `docs/04-modules/layout/user-flows.md`

- [ ] Описать открытие/закрытие sidebar
- [ ] Описать основной сценарий навигации 

### `docs/04-modules/layout/known-issues.md`

- [ ] Указать ограничения sidebar UX
- [ ] Указать ограничения localStorage для sidebar 

## Этап 7. Decisions

### `docs/05-decisions/README.md`

- [ ] Кратко объяснить назначение ADR
- [ ] Описать формат ADR
- [ ] Добавить список существующих ADR 

### `docs/05-decisions/ADR-001-localstorage-only.md`

- [ ] Описать Context
- [ ] Описать Decision
- [ ] Описать Alternatives
- [ ] Описать Consequences 

### `docs/05-decisions/ADR-002-pinia-store-separation.md`

- [ ] Описать причину разделения store
- [ ] Описать плюсы
- [ ] Описать минусы 

### `docs/05-decisions/ADR-003-projects-finance-coupling.md`

- [ ] Описать причину зависимости `projects -> finance`
- [ ] Описать компромиссы
- [ ] Описать риски 

### `docs/05-decisions/ADR-004-no-backend-no-auth.md`

- [ ] Описать контекст client-only решения
- [ ] Описать ограничения безопасности
- [ ] Описать ограничения масштабирования 

## Этап 8. Operations

### `docs/06-operations/setup.md`

- [ ] Описать установку зависимостей
- [ ] Описать запуск проекта
- [ ] Указать версию Node/npm при необходимости
- [ ] Указать dev-порт 

### `docs/06-operations/dev-workflow.md`

- [ ] Описать ежедневный цикл разработки
- [ ] Добавить `npm run dev`
- [ ] Добавить `npm run lint`
- [ ] Добавить `npm run format`
- [ ] Добавить правило обновлять docs при изменениях структуры 

### `docs/06-operations/frontend-rules.md`

- [ ] Перенести все обязательные frontend-правила
- [ ] Оформить каждое правило как:
  - Rule
  - Why
  - Bad example
  - Correct pattern
  - Review checklist
- [ ] Добавить правило:

#### Rule: не использовать `v-model` напрямую на prop

- [ ] Зафиксировать запрет `v-model="modelValue"` на prop
- [ ] Описать, почему это anti-pattern
- [ ] Привести корректный computed getter/setter pattern
- [ ] Добавить список типичных prop:
  - `modelValue`
  - `value`
  - `visible`
  - `isOpen` 

### `docs/06-operations/testing-checklist.md`

- [ ] Добавить smoke checklist перед коммитом
- [ ] Проверка создания проекта
- [ ] Проверка создания задачи
- [ ] Проверка создания эпика
- [ ] Проверка создания транзакции
- [ ] Проверка связывания finance
- [ ] Проверка reload страницы
- [ ] Проверка восстановления состояния 

### `docs/06-operations/debugging.md`

- [ ] Собрать типовые проблемы
- [ ] Добавить раздел по localStorage
- [ ] Добавить раздел по store load/save
- [ ] Добавить раздел по routing
- [ ] Добавить раздел по sidebar
- [ ] Добавить раздел по PrimeVue dialogs 

### `docs/06-operations/release-notes.md`

- [ ] Создать шаблон release note
- [ ] Добавить поля:
  - date
  - changes
  - breaking notes
  - docs updated 

## Финальная проверка

- [ ] Убедиться, что нет пустых папок без README
- [ ] Убедиться, что все markdown-файлы имеют одинаковую структуру
- [ ] Проверить единообразие терминов по `glossary.md`
- [ ] Проверить, что ADR не дублируют architecture docs
- [ ] Проверить, что operations содержат инструкции, а не обзор
- [ ] Проверить, что module docs не дублируют domain docs
- [ ] Проверить, что known-issues содержат только локальные проблемы
- [ ] Проверить, что README действительно ведет по документации сверху вниз
- [ ] Проверить, что при переносе не потерян смысл исходного документа
- [ ] Сделать финальный diff исходного документа против новой структуры 

## Приоритет

- [ ] P1 — `README.md`, `CONVENTIONS.md`, весь `01-overview/`
- [ ] P2 — весь `02-architecture/`, весь `03-domain/`
- [ ] P3 — весь `04-modules/`
- [ ] P4 — весь `05-decisions/`
- [ ] P5 — весь `06-operations/`
- [ ] P6 — финальная чистка дублей и сверка 