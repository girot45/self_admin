<template>
    <div>
        <span class="text-surface-500 dark:text-surface-400 block mb-6">Введите информацию о трате.</span>
        
        <!-- Сумма -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="amount" class="font-semibold text-left">Сумма</label>
            <div class="col-span-3">
                <InputNumber 
                    id="amount" 
                    v-model="amount" 
                    class="w-full" 
                    :min="0" 
                    :maxFractionDigits="2"
                    :minFractionDigits="2"
                    placeholder="0.00"
                />
            </div>
        </div>
        
        <!-- Карта списания -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="card" class="font-semibold text-left">Карта</label>
            <div class="col-span-3">
                <Dropdown 
                    id="card"
                    v-model="selectedCard"
                    :options="cards"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите карту"
                    class="w-full"
                    :filter="true"
                />
            </div>
        </div>
        
        <!-- Категория -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="category" class="font-semibold text-left">Категория</label>
            <div class="col-span-3">
                <Dropdown 
                    id="category"
                    v-model="selectedCategory"
                    :options="categories"
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
            <label for="comment" class="font-semibold text-left pt-2">Комментарий</label>
            <div class="col-span-3">
                <Textarea 
                    id="comment"
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
import { mockData, mockHelpers } from '@/stores/mock';

const emit = defineEmits(['close', 'success']);

const amount = ref(null);
const selectedCard = ref(null);
const selectedCategory = ref(null);
const comment = ref("");

const cards = ref([]);
const categories = ref([]);

onMounted(() => {
    // Загружаем данные из единого источника
    cards.value = mockHelpers.getActiveCards();
    categories.value = mockHelpers.getActiveExpenseCategories();
});

const resetForm = () => {
    amount.value = null;
    selectedCard.value = null;
    selectedCategory.value = null;
    comment.value = "";
};

const submitForm = async () => {
    if (!amount.value || amount.value <= 0) {
        alert("Пожалуйста, введите корректную сумму");
        return;
    }
    
    if (!selectedCard.value) {
        alert("Пожалуйста, выберите карту списания");
        return;
    }
    
    if (!selectedCategory.value) {
        alert("Пожалуйста, выберите категорию");
        return;
    }

    const expenseData = {
        amount: amount.value,
        cardId: selectedCard.value,
        categoryId: selectedCategory.value,
        comment: comment.value || null,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch("http://127.0.0.1:8003/expenses", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(expenseData)
        });
        
        if (response.ok) {
            resetForm();
            emit('success', expenseData);
        } else {
            const errorData = await response.json();
            console.error("Ошибка при отправке запроса:", errorData);
            alert("Ошибка при добавлении траты");
        }
    } catch (error) {
        console.error("Ошибка сети", error);
        alert("Ошибка сети при отправке запроса");
    }
};
</script>