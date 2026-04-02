<template>
    <div class="p-1">
        <span class="text-surface-500 dark:text-surface-400 block mb-6 text-sm">Введите информацию о доходе.</span>
        
        <!-- Сумма -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="income-amount" class="font-semibold text-left">Сумма</label>
            <div class="col-span-3">
                <InputNumber 
                    id="income-amount" 
                    v-model="amount" 
                    class="w-full" 
                    :min="0" 
                    :maxFractionDigits="2"
                    :minFractionDigits="0"
                    placeholder="0.0"
                />
            </div>
        </div>
        
        <!-- Источник дохода -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="source" class="font-semibold text-left">Источник</label>
            <div class="col-span-3">
                <Dropdown 
                    id="source"
                    v-model="selectedSource"
                    :options="incomeSources"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите источник"
                    class="w-full"
                    :filter="true"
                />
            </div>
        </div>
        
        <!-- Категория дохода -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="income-category" class="font-semibold text-left">Категория</label>
            <div class="col-span-3">
                <Dropdown 
                    id="income-category"
                    v-model="selectedCategory"
                    :options="incomeCategories"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите категорию"
                    class="w-full"
                    :filter="true"
                />
            </div>
        </div>
        
        <!-- Опциональный комментарий -->
        <div class="grid grid-cols-4 gap-4 mb-6 items-start">
            <label for="income-comment" class="font-semibold text-left pt-2">Комментарий</label>
            <div class="col-span-3">
                <Textarea 
                    id="income-comment"
                    v-model="comment"
                    class="w-full"
                    rows="3"
                    placeholder="Необязательное поле"
                    :autoResize="true"
                />
            </div>
        </div>
        
        <div class="flex justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" label="Отмена" severity="secondary" @click="$emit('close')" />
            <Button type="button" label="Сохранить" @click="submitForm" />
        </div>
    </div>
</template>
<script setup>
import { ref, defineEmits, onMounted } from "vue";
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import { mockHelpers } from '@/stores/mock';

const emit = defineEmits(['close', 'success']);

const amount = ref(null);
const selectedSource = ref(null);
const selectedCategory = ref(null);
const comment = ref("");

const incomeSources = ref([]);
const incomeCategories = ref([]);

onMounted(() => {
    // Загружаем данные из единого источника
    incomeSources.value = mockHelpers.getActiveIncomeSources();
    incomeCategories.value = mockHelpers.getActiveIncomeCategories();
});

const submitForm = async () => {
    if (!amount.value || amount.value <= 0) {
        alert("Пожалуйста, введите корректную сумму");
        return;
    }
    
    if (!selectedSource.value) {
        alert("Пожалуйста, выберите источник дохода");
        return;
    }
    
    if (!selectedCategory.value) {
        alert("Пожалуйста, выберите категорию дохода");
        return;
    }

    const incomeData = {
        amount: amount.value,
        sourceId: selectedSource.value,
        categoryId: selectedCategory.value,
        comment: comment.value || null,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch("http://127.0.0.1:8003/incomes", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(incomeData)
        });
        
        if (response.ok) {
            resetForm();
            emit('success', incomeData);
        } else {
            const errorData = await response.json();
            console.error("Ошибка при отправке запроса:", errorData);
            alert("Ошибка при добавлении дохода");
        }
    } catch (error) {
        console.error("Ошибка сети", error);
        alert("Ошибка сети при отправке запроса");
    }
};

const resetForm = () => {
    amount.value = null;
    selectedSource.value = null;
    selectedCategory.value = null;
    comment.value = "";
};
</script>

<style scoped>
/* Стили для более широкой формы */
:deep(.p-dropdown) {
    width: 100%;
}

:deep(.p-inputnumber) {
    width: 100%;
}

:deep(.p-textarea) {
    width: 100%;
}

/* Дополнительные стили для лучшего выравнивания */
:deep(.p-dropdown-panel) {
    width: 100%;
    min-width: 200px;
}
</style>