<script setup>
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useProjectStore } from "@/stores/projects";
import { useFinanceStore } from "@/stores/finance";

const props = defineProps({
  taskId: { type: String, default: null },
  projectId: { type: String, default: null },
});

const visible = defineModel("visible", { default: false });

const toast = useToast();
const store = useProjectStore();
const financeStore = useFinanceStore();

const form = ref({
  type: "expense",
  amount: null,
  description: "",
  category: "",
  date: new Date(),
});

function submit() {
  if (!form.value.amount || form.value.amount <= 0) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Сумма должна быть больше 0",
      life: 3000,
    });
    return;
  }
  if (!form.value.description.trim()) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Описание обязательно",
      life: 3000,
    });
    return;
  }

  const newTransaction = financeStore.addTransaction({
    amount: form.value.amount,
    type: form.value.type,
    description: form.value.description,
    category: form.value.category,
    date: form.value.date.toISOString(),
  });

  if (props.taskId) {
    store.linkFinanceToTask(props.taskId, newTransaction.id);
  } else if (props.projectId) {
    store.linkFinanceToProject(props.projectId, newTransaction.id);
  }

  toast.add({
    severity: "success",
    summary: "Успех",
    detail: "Операция добавлена",
    life: 3000,
  });
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="
      taskId ? 'Создать операцию для задачи' : 'Создать операцию проекта'
    "
    modal
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="text-xs text-gray-500 mb-1 block">Тип операции</label>
        <SelectButton
          v-model="form.type"
          :options="['expense', 'income']"
          optionLabel="label"
          @update:modelValue="(val) => (form.type = val)"
          class="w-full"
        >
          <template #option="slotProps">
            {{ slotProps.option === "income" ? "Доход" : "Расход" }}
          </template>
        </SelectButton>
      </div>

      <div>
        <label class="text-xs text-gray-500 mb-1 block">Сумма</label>
        <InputNumber
          v-model="form.amount"
          mode="currency"
          currency="RUB"
          locale="ru-RU"
          min="0"
          step="1"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500 mb-1 block">Описание</label>
        <InputText
          v-model="form.description"
          placeholder="Описание операции"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500 mb-1 block">Категория</label>
        <InputText
          v-model="form.category"
          placeholder="Категория (необязательно)"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500 mb-1 block">Дата</label>
        <DatePicker v-model="form.date" class="w-full" dateFormat="dd.mm.yy" />
      </div>
    </div>
    <template #footer>
      <Button label="Отмена" text @click="visible = false" />
      <Button
        :label="taskId ? 'Добавить к задаче' : 'Добавить к проекту'"
        @click="submit"
      />
    </template>
  </Dialog>
</template>
