<template>
    <div class="rounded-2xl shadow-md bg-zinc-900 flex flex-col w-fit p-3 gap-4">

        <Inplace>
            <template #display>
                <div class="text-3xl text-center">
                    Задачи на {{ (new Date(date)).toLocaleDateString("ru-RU") }}
                </div>
            </template>
            <template #content="{ closeCallback }">
                <div class="flex">
                    <DatePicker v-model="date" dateFormat="dd.mm.yy" showWeek class="w-full sm:w-[30rem]" />
                    <Button icon="pi pi-times" text severity="danger" @click="closeCallback" class="align-middle" />
                </div>

            </template>
        </Inplace>
        <div class="rounded-2xl p-3 border border-zinc-800" v-for="task in tasks[(new Date(date)).toLocaleDateString('ru-RU')]">
            <p>            {{ task.name }}</p>
            <p>            {{ task.priority }}</p>


        </div>

    </div>

</template>

<script setup>
    import { ref } from "vue";

    const date = ref(new Date());
    var tasks = {
        "15.03.2025": [
            {
                "name": "test",
                "priority": "high"
            }
        ]
    }
</script>