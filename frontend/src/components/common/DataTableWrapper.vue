<template>
  <div class="data-table-wrapper">
    <DataTable
      :value="data"
      :rows="rowsPerPage"
      :paginator="paginator"
      :totalRecords="totalRecords"
      :resizableColumns="resizableColumns"
      :stripedRows="stripedRows"
      :loading="loading"
      :virtualScrollerOptions="virtualScroller ? { itemSize: 50 } : undefined"
      :scrollable="scrollable"
      :scrollHeight="scrollHeight"
      :sortField="sortField"
      :sortOrder="sortOrder"
      :rowsPerPageOptions="rowsPerPageOptions"
      :first="first"
      :emptyMessage="emptyMessage"
      aria-label="Data table"
      @page="onPage"
      @sort="onSort"
    >
      <slot></slot>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";

const props = defineProps({
  data: { type: Array, required: true },
  rowsPerPage: { type: Number, default: 10 },
  paginator: { type: Boolean, default: true },
  totalRecords: { type: Number, default: 0 },
  resizableColumns: { type: Boolean, default: false },
  stripedRows: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  virtualScroller: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  scrollHeight: { type: String, default: "24rem" },
  sortField: { type: String, default: "" },
  sortOrder: { type: Number, default: 1 },
  rowsPerPageOptions: { type: Array, default: () => [5, 10, 20, 50] },
  first: { type: Number, default: 0 },
  emptyMessage: { type: String, default: "Нет данных для отображения" },
});

const emit = defineEmits(["page", "sort"]);

function onPage(event) {
  emit("page", event);
}

function onSort(event) {
  emit("sort", event);
}
</script>

<style scoped>
.data-table-wrapper {
  background: var(--p-card-background, var(--p-surface-ground));
  border-radius: var(--p-card-border-radius, 8px);
  box-shadow: var(
    --p-card-shadow,
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1)
  );
  padding: 1rem;
}
</style>
