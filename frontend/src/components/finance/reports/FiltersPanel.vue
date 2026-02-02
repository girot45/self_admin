<script setup>
import { ref, watch } from "vue";

// Mock data for demonstration
const MOCK_INCOME_CATEGORIES = ["Зарплата", "Инвестиции", "Подарок"];
const MOCK_EXPENSE_CATEGORIES = ["Еда", "Транспорт", "Коммунальные услуги", "Развлечения", "Одежда"];
const MOCK_EXPENSE_TYPES = ["mandatory", "impulse"];

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      dateFrom: null,
      dateTo: null,
      incomeCategories: [],
      expenseCategories: [],
      expenseTypes: [],
    })
  }
});

const emit = defineEmits(["update:modelValue"]);

// локальная копия фильтров для редактирования
const localFilters = ref({ ...props.modelValue });

// когда локальные фильтры меняются, эмитим наружу
watch(localFilters, (newVal) => {
  emit("update:modelValue", { ...newVal });
}, { deep: true });

// синхронизируем с внешним modelValue, если он изменился снаружи
watch(() => props.modelValue, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });
</script>

<template>
  <div class="flex flex-wrap gap-4 p-3 border rounded-lg bg-gray-50">
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Дата от:</label>
      <input type="date" v-model="localFilters.dateFrom" class="p-1 border rounded text-sm" />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Дата до:</label>
      <input type="date" v-model="localFilters.dateTo" class="p-1 border rounded text-sm" />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Категории доходов:</label>
      <select v-model="localFilters.incomeCategories" multiple class="p-1 border rounded text-sm min-w-[150px]">
        <option v-for="cat in MOCK_INCOME_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Категории расходов:</label>
      <select v-model="localFilters.expenseCategories" multiple class="p-1 border rounded text-sm min-w-[150px]">
        <option v-for="cat in MOCK_EXPENSE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600">Типы расходов:</label>
      <select v-model="localFilters.expenseTypes" multiple class="p-1 border rounded text-sm min-w-[100px]">
        <option v-for="type in MOCK_EXPENSE_TYPES" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>
  </div>
</template>
