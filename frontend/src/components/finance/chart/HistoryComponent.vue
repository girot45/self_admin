<template>
  <Card :pt="{ root: 'w-full' }">
    <template #header>
      <div class="flex justify-between items-center">
        <ChartHeader />
        
      </div>
    </template>
    <template #content>
      <!-- Таблица вместо графика -->
      <DataTable :value="tableData" class="p-datatable-sm">
        <Column field="quarter" header="Квартал"></Column>
        <Column field="sales" header="Продажи"></Column>
      </DataTable>


    </template>
  </Card>
</template>

<script setup>
  import { ref } from "vue";
  import ChartHeader from "./src/Header.vue";
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';

  // Данные для таблицы
  const tableData = ref([
    { quarter: 'Q1', sales: 540 },
    { quarter: 'Q2', sales: 325 },
    { quarter: 'Q3', sales: 702 },
    { quarter: 'Q4', sales: 620 }
  ]);

</script>