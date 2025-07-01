<template>
    <div class="w-fit rounded-2xl bg-zinc-900 p-5 grid grid-flow-row gap-5 ">
        <Button label="Добавить трату" @click="openDialog" />
        <Button label="Добавить доход" />
    </div>
    <Dialog v-model:visible="visible" header="Добавить трату" :style="{ width: '25rem' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-8">Введите информацию о трате.</span>
        <div class="flex items-center gap-4 mb-4">
            <label for="amount" class="font-semibold w-24">Сумма</label>
            <InputText id="amount" v-model="amount" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="description" class="font-semibold w-24">Описание</label>
            <InputText id="description" v-model="description" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Отмена" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="Сохранить" @click="submitForm"></Button>
        </div>
    </Dialog>
</template>

<script setup>
    import { ref } from "vue";

    const visible = ref(false);
    const amount = ref("");
    const description = ref("");

    const openDialog = () => {
        visible.value = true;
    };

    const submitForm = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8003/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },

            });
            if (response.ok) {
                visible.value = false;
                amount.value = "";
                description.value = "";
            } else {
                console.error("Ошибка при отправке запроса");
            }
        } catch (error) {
            console.error("Ошибка сети", error);
        }
    };
</script>
