<template>
    <div>
        <span class="text-surface-500 dark:text-surface-400 block mb-6">Введите информацию о переводе.</span>
        
        <!-- Сумма перевода -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="transfer-amount" class="font-semibold text-right">Сумма перевода</label>
            <div class="col-span-3">
                <InputNumber 
                    id="transfer-amount" 
                    v-model="amount" 
                    class="w-full" 
                    :min="0" 
                    :maxFractionDigits="2"
                    :minFractionDigits="2"
                    placeholder="0.00"
                />
            </div>
        </div>
        
        <!-- Источник (откуда) -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="source-account" class="font-semibold text-right">Источник</label>
            <div class="col-span-3">
                <Dropdown 
                    id="source-account"
                    v-model="selectedSourceAccount"
                    :options="accounts"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите источник"
                    class="w-full"
                    :filter="true"
                />
            </div>
        </div>
        
        <!-- Конечный счет (куда) -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="target-account" class="font-semibold text-right">Конечный счет</label>
            <div class="col-span-3">
                <Dropdown 
                    id="target-account"
                    v-model="selectedTargetAccount"
                    :options="filteredTargetAccounts"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Выберите конечный счет"
                    class="w-full"
                    :filter="true"
                    :disabled="!selectedSourceAccount"
                />
            </div>
        </div>
        
        <!-- Комиссия -->
        <div class="grid grid-cols-4 gap-4 mb-4 items-center">
            <label for="commission" class="font-semibold text-right">Комиссия</label>
            <div class="col-span-3">
                <div class="flex items-center gap-3">
                    <InputNumber 
                        id="commission" 
                        v-model="commission" 
                        class="w-full" 
                        :min="0" 
                        :maxFractionDigits="2"
                        :minFractionDigits="2"
                        placeholder="0.00"
                    />
                    <span class="text-sm text-surface-500 whitespace-nowrap">
                        ({{ commissionPercentage }}%)
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Итоговая сумма -->
        <div v-if="amount > 0" class="grid grid-cols-4 gap-4 mb-6 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
            <div class="font-semibold text-right">Итого списано</div>
            <div class="col-span-3 font-medium">
                {{ formatCurrency(totalAmount) }}
                <span v-if="commission > 0" class="text-sm text-surface-500 ml-2">
                    ({{ formatCurrency(amount) }} + {{ formatCurrency(commission) }} комиссия)
                </span>
            </div>
        </div>
        
        <!-- Опциональный комментарий -->
        <div class="grid grid-cols-4 gap-4 mb-6 items-start">
            <label for="transfer-comment" class="font-semibold text-right pt-2">Комментарий</label>
            <div class="col-span-3">
                <Textarea 
                    id="transfer-comment"
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
            <Button type="button" label="Выполнить перевод" @click="submitForm" />
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits, computed, watch, onMounted } from "vue";
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import { mockHelpers } from '@/stores/mock';

const emit = defineEmits(['close', 'success']);

const amount = ref(null);
const selectedSourceAccount = ref(null);
const selectedTargetAccount = ref(null);
const commission = ref(0);
const comment = ref("");

const accounts = ref([]);

onMounted(() => {
    // Загружаем данные из единого источника
    accounts.value = mockHelpers.getActiveAccounts();
});

// Автоматический расчет комиссии при изменении суммы или счетов
watch([amount, selectedSourceAccount, selectedTargetAccount], () => {
    if (amount.value && selectedSourceAccount.value && selectedTargetAccount.value) {
        const calculatedCommission = mockHelpers.calculateCommission(
            amount.value,
            selectedSourceAccount.value,
            selectedTargetAccount.value
        );
        commission.value = calculatedCommission;
    } else {
        commission.value = 0;
    }
}, { immediate: true });




// Отфильтрованные счета для выбора в качестве конечного счета
const filteredTargetAccounts = computed(() => {
    if (!selectedSourceAccount.value) {
        return accounts.value;
    }
    // Исключаем выбранный источник из списка конечных счетов
    return accounts.value.filter(account => account.id !== selectedSourceAccount.value);
});

// Процент комиссии от суммы
const commissionPercentage = computed(() => {
    if (!amount.value || amount.value <= 0) return 0;
    return ((commission.value / amount.value) * 100).toFixed(2);
});

// Итоговая сумма (сумма + комиссия)
const totalAmount = computed(() => {
    return (amount.value || 0) + (commission.value || 0);
});

// Сброс выбора конечного счета при изменении источника
watch(selectedSourceAccount, (newSource) => {
    if (newSource && selectedTargetAccount.value === newSource) {
        selectedTargetAccount.value = null;
    }
});

const formatCurrency = (value) => {
    if (!value) return '0.00 ₽';
    return `${value.toFixed(2)} ₽`;
};

const resetForm = () => {
    amount.value = null;
    selectedSourceAccount.value = null;
    selectedTargetAccount.value = null;
    commission.value = 0;
    comment.value = "";
};

const submitForm = async () => {
    // Валидация
    if (!amount.value || amount.value <= 0) {
        alert("Пожалуйста, введите корректную сумму перевода");
        return;
    }
    
    if (!selectedSourceAccount.value) {
        alert("Пожалуйста, выберите источник перевода");
        return;
    }
    
    if (!selectedTargetAccount.value) {
        alert("Пожалуйста, выберите конечный счет");
        return;
    }
    
    if (selectedSourceAccount.value === selectedTargetAccount.value) {
        alert("Источник и конечный счет не могут совпадать");
        return;
    }

    const transferData = {
        amount: amount.value,
        sourceAccountId: selectedSourceAccount.value,
        targetAccountId: selectedTargetAccount.value,
        commission: commission.value || 0,
        totalAmount: totalAmount.value,
        comment: comment.value || null,
        date: new Date().toISOString()
    };

    console.log("Отправляемые данные перевода:", transferData); // Для отладки

    try {
        const response = await fetch("http://127.0.0.1:8003/transfers", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(transferData)
        });
        
        if (response.ok) {
            resetForm();
            emit('success', transferData);
        } else {
            const errorData = await response.json();
            console.error("Ошибка при отправке запроса:", errorData);
            alert("Ошибка при выполнении перевода");
        }
    } catch (error) {
        console.error("Ошибка сети", error);
        alert("Ошибка сети при отправке запроса");
    }
};
</script>

<style scoped>
/* Стили для компонентов */
:deep(.p-dropdown) {
    width: 100%;
}

:deep(.p-inputnumber) {
    width: 100%;
}

:deep(.p-textarea) {
    width: 100%;
}

/* Дополнительные стили */
.grid {
    display: grid;
}

.col-span-3 {
    grid-column: span 3 / span 3;
}

.text-right {
    text-align: right;
}

/* Стиль для итоговой суммы */
.bg-surface-100 {
    background-color: rgba(0, 0, 0, 0.02);
}

.dark .bg-surface-800 {
    background-color: rgba(255, 255, 255, 0.05);
}
</style>