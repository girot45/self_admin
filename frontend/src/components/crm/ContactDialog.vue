<script setup>
import { ref, watch, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useCrmStore } from "@/stores/crm";
import { CONTACT_TYPES } from "@/constants/crm";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";

const props = defineProps({ contact: Object, visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const toast = useToast();
const crmStore = useCrmStore();

const form = ref({
  name: "",
  type: CONTACT_TYPES.PERSON,
  phone: "",
  email: "",
  company: "",
  status: CONTACT_STATUSES.ACTIVE,
  notes: "",
});

const errors = ref({
  name: false,
  email: false,
});

const isEdit = ref(false);

const typeOptions = Object.entries(CONTACT_TYPES).map(([value, label]) => ({
  value,
  label,
}));
const statusOptions = Object.entries(CONTACT_STATUSES).map(
  ([value, label]) => ({ value, label }),
);

watch(
  () => props.contact,
  (c) => {
    if (c?.id) {
      isEdit.value = true;
      form.value = {
        name: c.name,
        type: c.type,
        phone: c.phone || "",
        email: c.email || "",
        company: c.company || "",
        status: c.status,
        notes: c.notes || "",
      };
    } else {
      isEdit.value = false;
      form.value = {
        name: "",
        type: CONTACT_TYPES.PERSON,
        phone: "",
        email: "",
        company: "",
        status: CONTACT_STATUSES.ACTIVE,
        notes: "",
      };
    }
  },
);

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function submit() {
  errors.value.name = !form.value.name.trim();
  if (errors.value.name) return;

  if (form.value.email && !validateEmail(form.value.email)) {
    errors.value.email = true;
    return;
  }

  if (isEdit.value) {
    crmStore.updateContact(props.contact.id, { ...form.value });
    toast.add({ severity: "success", summary: "Контакт обновлён", life: 2000 });
  } else {
    crmStore.createContact({ ...form.value });
    toast.add({ severity: "success", summary: "Контакт создан", life: 2000 });
  }

  emit("saved");
  emit("update:visible", false);
}
</script>

<template>
  <Dialog
    v-model:visible="localVisible"
    :header="isEdit ? 'Редактировать контакт' : 'Новый контакт'"
    modal
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="text-sm text-gray-500 mb-1 block">Имя *</label>
        <InputText
          v-model="form.name"
          placeholder="ФИО или название"
          class="w-full"
          :pt="{ root: { class: 'border-red-500' } }"
          :class="{ 'border-red-500': errors.name }"
        />
        <small v-if="errors.name" class="text-red-500">Имя обязательно</small>
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Тип</label>
        <Select
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Телефон</label>
        <InputText
          v-model="form.phone"
          placeholder="+7 (999) 999-99-99"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Email</label>
        <InputText
          v-model="form.email"
          placeholder="email@example.com"
          class="w-full"
          :class="{ 'border-red-500': errors.email }"
        />
        <small v-if="errors.email" class="text-red-500"
          >Неверный формат email</small
        >
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Компания</label>
        <InputText
          v-model="form.company"
          placeholder="Название организации"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Статус</label>
        <Select
          v-model="form.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Заметки</label>
        <Textarea
          v-model="form.notes"
          rows="3"
          placeholder="Дополнительная информация"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" text @click="emit('update:visible', false)" />
      <Button :label="isEdit ? 'Сохранить' : 'Создать'" @click="submit" />
    </template>
  </Dialog>
</template>
