<script setup>
import { onMounted, ref } from "vue";
import { useCrmStore } from "@/stores/crm";
import { CONTACT_TYPES } from "@/constants/crm";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import FilterInput from "@/components/common/FilterInput.vue";
import ContactDialog from "@/components/crm/ContactDialog.vue";

const crmStore = useCrmStore();
const filterName = ref("");
const showContactDialog = ref(false);
const editingContact = ref(null);

onMounted(() => {
  crmStore.load();
});

const filteredContacts = () => {
  return crmStore.contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(filterName.value.toLowerCase());
  });
};

function openCreateDialog() {
  editingContact.value = null;
  showContactDialog.value = true;
}

function openEditDialog(contact) {
  editingContact.value = contact;
  showContactDialog.value = true;
}

function handleContactSaved() {
  crmStore.load();
}

function handleDeleteContact(contact) {
  if (confirm(`Удалить контакт "${contact.name}"?`)) {
    crmStore.deleteContact(contact.id);
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Контакты</h1>
      <Button
        label="Добавить контакт"
        icon="pi pi-user-plus"
        @click="openCreateDialog()"
      />
    </div>

    <FilterInput
      v-model="filterName"
      label="Поиск по имени"
      placeholder="Введите имя контакта..."
      type="text"
    />

    <DataTable
      :value="filteredContacts()"
      paginator
      :rows="10"
      filterDisplay="row"
      dataKey="id"
      :globalFilterFields="['name', 'email', 'company']"
      :pt="{ header: { class: 'text-lg' } }"
      class="mt-4"
      aria-label="Список контактов"
    >
      <Column field="name" header="Имя" sortable />
      <Column field="type" header="Тип">
        <template #body="{ data }">
          <Badge :value="getContactTypeLabel(data.type)" severity="info" />
        </template>
      </Column>
      <Column field="phone" header="Телефон" />
      <Column field="email" header="Email" />
      <Column field="company" header="Компания" />
      <Column field="status" header="Статус">
        <template #body="{ data }">
          <Badge
            :value="data.status === 'active' ? 'Активный' : 'Архивный'"
            :severity="data.status === 'active' ? 'success' : 'secondary'"
          />
        </template>
      </Column>
      <Column field="dealIds" header="Сделки">
        <template #body="{ data }">
          {{ data.dealIds?.length || 0 }}
        </template>
      </Column>
      <Column header="Действия">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            text
            size="small"
            @click="openEditDialog(data)"
          />
          <Button
            icon="pi pi-trash"
            text
            size="small"
            severity="danger"
            @click="handleDeleteContact(data)"
          />
        </template>
      </Column>
    </DataTable>

    <ContactDialog
      v-model:visible="showContactDialog"
      :contact="editingContact"
      @saved="handleContactSaved"
    />
  </div>
</template>

<script>
const CONTACT_TYPES_MAP = {
  [CONTACT_TYPES.PERSON]: "Физлицо",
  [CONTACT_TYPES.COMPANY]: "Юрлицо",
  [CONTACT_TYPES.IP]: "ИП",
};

function getContactTypeLabel(type) {
  return CONTACT_TYPES_MAP[type] || type;
}
</script>
