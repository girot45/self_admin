<template>
    <div class="flex flex-row m-5  mb-0 justify-between">
        <div class="flex flex-row gap-2">
            <p class="m-0 p-0 top-0 text-4xl text-center">Траты за </p>
            <Select v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Промежуток"
                class="w-full md:w-56" />
        </div>

        <div class="flex flex-row gap-3">
            <Button label="Таблица" iconPos="right" icon="pi pi-external-link" class="self-center p-0" />
            <Button icon="pi pi-refresh" />
        </div>

    </div>
</template>

<script setup>
import { ref } from "vue";

const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);
</script>
