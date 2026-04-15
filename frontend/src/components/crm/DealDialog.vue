<script setup>
import { ref, watch, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useCrmStore } from "@/stores/crm";
import { useProjectStore } from "@/stores/projects";
import { DEAL_STAGES } from "@/constants/crm";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";

const props = defineProps({
  deal: Object,
  visible: Boolean,
  contactId: { type: String, default: null },
});
const emit = defineEmits(["update:visible", "saved"]);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const toast = useToast();
const crmStore = useCrmStore();
const projectStore = useProjectStore();

const form = ref({
  title: "",
  stage: DEAL_STAGES.NEW,
  amount: 0,
  currency: "RUB",
  contactId: null,
  projectId: null,
  closeDate: null,
  description: "",
  notes: "",
});

const errors = ref({
  title: false,
  amount: false,
});

const isEdit = ref(false);

const stageOptions = Object.entries(DEAL_STAGES).map(([value, label]) => ({
  value,
  label,
}));
const projectOptions = () => {
  return projectStore.projects.map((p) => ({ value: p.id, label: p.title }));
};

watch(
  () => props.deal,
  (d) => {
    if (d?.id) {
      isEdit.value = true;
      form.value = {
        title: d.title,
        stage: d.stage,
        amount: d.amount || 0,
        currency: d.currency || "RUB",
        contactId: d.contactId,
        projectId: d.projectId,
        closeDate: d.closeDate,
        description: d.description || "",
        notes: d.notes || "",
      };
    } else {
      isEdit.value = false;
      form.value = {
        title: "",
        stage: DEAL_STAGES.NEW,
        amount: 0,
        currency: "RUB",
        contactId: props.contactId || null,
        projectId: null,
        closeDate: null,
        description: "",
        notes: "",
      };
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
  errors.value.amount = form.value.amount < 0;

  if (errors.value.title) return;
  if (errors.value.amount) return;

  if (isEdit.value) {
    crmStore.updateDeal(props.deal.id, { ...form.value });
    toast.add({ severity: "success", summary: "Сделка обновлена", life: 2000 });
  } else {
    crmStore.createDeal({ ...form.value });
    toast.add({ severity: "success", summary: "Сделка создана", life: 2000 });
  }

  emit("saved");
  emit("update:visible", false);
}
</script>

<template>
  <Dialog
    v-model:visible="localVisible"
    :header="isEdit ? 'Редактировать сделку' : 'Новая сделка'"
    modal
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="text-sm text-gray-500 mb-1 block">Название *</label>
        <InputText
          v-model="form.title"
          placeholder="Название сделки"
          class="w-full"
          :pt="{ root: { class: 'border-red-500' } }"
          :class="{ 'border-red-500': errors.title }"
        />
        <small v-if="errors.title" class="text-red-500"
          >Название обязательно</small
        >
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Стадия</label>
        <Select
          v-model="form.stage"
          :options="stageOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Сумма</label>
        <InputNumber
          v-model="form.amount"
          placeholder="0"
          :useGrouping="true"
          class="w-full"
          :pt="{ root: { class: 'border-red-500' } }"
          :class="{ 'border-red-500': errors.amount }"
        />
        <small v-if="errors.amount" class="text-red-500"
          >Сумма должна быть положительной</small
        >
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Валюта</label>
        <Dropdown
          v-model="form.currency"
          :options="['RUB', 'USD', 'EUR', 'KZT']"
          class="w-full"
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
        <label class="text-sm text-gray-500 mb-1 block">Проект</label>
        <Select
          v-model="form.projectId"
          :options="projectOptions()"
          option-label="label"
          option-value="value"
          placeholder="Выберите проект"
          class="w-full"
          show-clear
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Дата закрытия</label>
        <DatePicker
          v-model="form.closeDate"
          date-format="dd.mm.yy"
          class="w-full"
          show-icon
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Описание</label>
        <Textarea
          v-model="form.description"
          rows="3"
          placeholder="Детали сделки"
          class="w-full"
        />
      </div>

      <div>
        <label class="text-sm text-gray-500 mb-1 block">Заметки</label>
        <Textarea
          v-model="form.notes"
          rows="2"
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
