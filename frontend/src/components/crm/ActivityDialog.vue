<script setup>
import { ref, watch,computed  } from "vue";
import { useToast } from "primevue/usetoast";
import { useCrmStore } from "@/stores/crm";
import { ACTIVITY_TYPES } from "@/constants/crm";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea  from "primevue/textarea";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import DatePicker from "primevue/datepicker";

const props = defineProps({
  activity: Object,
  visible: Boolean,
  dealId: { type: String, default: null },
  contactId: { type: String, default: null },
});
const emit = defineEmits(["update:visible", "saved"]);

const toast = useToast();
const crmStore = useCrmStore();

const form = ref({
  type: ACTIVITY_TYPES.CALL,
  dealId: null,
  contactId: null,
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  isDone: false,
});

const errors = ref({
  title: false,
  date: false,
});

const isEdit = ref(false);

const typeOptions = Object.entries(ACTIVITY_TYPES).map(([value, label]) => ({
  value,
  label,
}));
const dealOptions = computed(() =>
  crmStore.deals.map((d) => ({ value: d.id, label: d.title }))
);

watch(
  () => props.activity,
  (a) => {
    if (a?.id) {
      isEdit.value = true;
      form.value = {
        type: a.type,
        dealId: a.dealId,
        contactId: a.contactId,
        title: a.title,
        description: a.description || "",
        date: a.date,
        isDone: a.isDone,
      };
    } else {
      isEdit.value = false;
      form.value = {
        type: ACTIVITY_TYPES.CALL,
        dealId: props.dealId || null,
        contactId: props.contactId || null,
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isDone: false,
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.dealId,
  (id) => {
    if (!isEdit.value) {
      form.value.dealId = id;
    }
  },
);

watch(
  () => props.contactId,
  (id) => {
    if (!isEdit.value) {
      form.value.contactId = id;
    }
  },
);

function submit() {
  errors.value.title = !form.value.title.trim();
  errors.value.date = !form.value.date;

  if (errors.value.title) return;
  if (errors.value.date) return;

  if (isEdit.value) {
    crmStore.updateActivity(props.activity.id, { ...form.value });
    toast.add({
      severity: "success",
      summary: "Активность обновлена",
      life: 2000,
    });
  } else {
    crmStore.createActivity({ ...form.value });
    toast.add({
      severity: "success",
      summary: "Активность создана",
      life: 2000,
    });
  }

  emit("saved");
  emit("update:visible", false);
}

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});
</script>

<template>
  <Dialog
    v-model:visible="localVisible"
    :header="isEdit ? 'Редактировать активность' : 'Новая активность'"
    modal
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="text-sm text-gray-500 mb-1 block">Тип *</label>
        <Select
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Заголовок *</label>
        <InputText
          v-model="form.title"
          placeholder="Тема активности"
          class="w-full"
          
          :class="{ 'border-red-500': errors.title }"
        />
        <small v-if="errors.title" class="text-red-500"
          >Заголовок обязателен</small
        >
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Описание</label>
        <Textarea 
          v-model="form.description"
          rows="3"
          placeholder="Детали"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Дата *</label>
        <DatePicker
          v-model="form.date"
          date-format="dd.mm.yy"
          class="w-full"
          show-icon
          
          :class="{ 'border-red-500': errors.date }"
        />
        <small v-if="errors.date" class="text-red-500">Дата обязательна</small>
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Сделка</label>
        <Select
          v-model="form.dealId"
          :options="dealOptions"
          option-label="label"
          option-value="value"
          placeholder="Выберите сделку"
          class="w-full"
          show-clear
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Контакт</label>
        <Select
          v-model="form.contactId"
          :options="
            crmStore.contacts.map((c) => ({ value: c.id, label: c.name }))
          "
          option-label="label"
          option-value="value"
          placeholder="Выберите контакт"
          class="w-full"
          show-clear
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Завершена</label>
        <Checkbox v-model="form.isDone" :binary="true" />
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" text @click="emit('update:visible', false)" />
      <Button :label="isEdit ? 'Сохранить' : 'Создать'" @click="submit" />
    </template>
  </Dialog>
</template>
