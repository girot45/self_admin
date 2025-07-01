<template>
    <div class="flex flex-row m-5  mb-0 justify-between">
        <div class="flex flex-row gap-2 me-3">
            <p class="m-0 p-0 top-0 text-4xl text-center">Траты за </p>
            <DatePicker v-model="dates" selectionMode="range" :manualInput="false" />
        </div>

        <div class="flex flex-row gap-3">
            <Button @click="showChartModal" label="Показать график" class="p-button-sm" />
            <Button icon="pi pi-refresh" />
        </div>

    </div>
    <Dialog v-model:visible="displayModal" modal header="График продаж" :style="{ width: '80vw' }"
        :breakpoints="{ '960px': '75vw', '641px': '90vw' }">
        <Chart type="bar" :data="chartData" :options="chartOptions" :width="chartWidth" :height="100" />
        <template #footer>
            <Button label="Закрыть" icon="pi pi-times" @click="displayModal = false" class="p-button-text" />
        </template>
    </Dialog>
</template>

<script setup>
    import { ref, onMounted } from "vue";

    import Button from "primevue/button";
    import Dialog from 'primevue/dialog';

    const displayModal = ref(false);
    const chartWidth = ref(100);

    const showChartModal = () => {
        displayModal.value = true;
        // Автоматически подстраиваем ширину под размер модального окна
        chartWidth.value = null; // null заставит график использовать 100% ширину контейнера
    };



    onMounted(() => {
        chartData.value = setChartData();
        chartOptions.value = setChartOptions();
    });

    const chartData = ref();
    const chartOptions = ref();

    const setChartData = () => {
        return {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            datasets: [
                {
                    label: "Sales",
                    data: [540, 325, 702, 620],
                    backgroundColor: [
                        "rgba(249, 115, 22, 0.2)",
                        "rgba(6, 182, 212, 0.2)",
                        "rgb(107, 114, 128, 0.2)",
                        "rgba(139, 92, 246, 0.2)",
                    ],
                    borderColor: [
                        "rgb(249, 115, 22)",
                        "rgb(6, 182, 212)",
                        "rgb(107, 114, 128)",
                        "rgb(139, 92, 246)",
                    ],
                    borderWidth: 2,
                    borderRadius: 20,
                },
            ],
        };
    };

    const setChartOptions = () => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue(
            "--p-text-muted-color",
        );
        const surfaceBorder = documentStyle.getPropertyValue(
            "--p-content-border-color",
        );

        return {
            plugins: {
                legend: false,
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
            },
        };
    };
</script>
