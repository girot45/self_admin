<template>
    <div class="w-fit rounded-2xl bg-zinc-900 p-5 grid grid-flow-row gap-5">
        <Button label="Добавить трату" @click="openExpenseDialog" severity="danger"/>
        <Button label="Добавить доход" @click="openIncomeDialog" severity="submit"/>
        <Button label="Перевод" @click="openTransferDialog" severity="info" />
    </div>
    
    <!-- Диалог для трат -->
    <Dialog v-model:visible="expenseVisible" header="Добавить трату" :style="{ width: '35rem' }">
        <NewExpenseForm @close="expenseVisible = false" @success="handleExpenseSuccess" />
    </Dialog>
    
    <!-- Диалог для доходов -->
    <Dialog v-model:visible="incomeVisible" header="Добавить доход" :style="{ width: '35rem' }">
        <NewIncomeForm @close="incomeVisible = false" @success="handleIncomeSuccess" />
    </Dialog>
    
    <!-- Диалог для переводов -->
    <Dialog v-model:visible="transferVisible" header="Выполнить перевод" :style="{ width: '35rem' }">
        <NewTransferForm @close="transferVisible = false" @success="handleTransferSuccess" />
    </Dialog>
</template>

<script setup>
import { ref } from "vue";
import NewExpenseForm from './src/NewExpenseForm.vue';
import NewIncomeForm from './src/NewIncomeForm.vue';
import NewTransferForm from './src/NewTransferForm.vue';

const expenseVisible = ref(false);
const incomeVisible = ref(false);
const transferVisible = ref(false);

const openExpenseDialog = () => {
    expenseVisible.value = true;
};

const openIncomeDialog = () => {
    incomeVisible.value = true;
};

const openTransferDialog = () => {
    transferVisible.value = true;
};

const handleExpenseSuccess = () => {
    expenseVisible.value = false;
    console.log('Трата успешно добавлена');
};

const handleIncomeSuccess = () => {
    incomeVisible.value = false;
    console.log('Доход успешно добавлен');
};

const handleTransferSuccess = () => {
    transferVisible.value = false;
    console.log('Перевод успешно выполнен');
};
</script>