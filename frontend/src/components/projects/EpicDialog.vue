<script setup>
import { ref, watch, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useProjectStore } from "@/stores/projects";
import { EPIC_STATUS_LABELS, PRESET_COLORS } from "@/constants/projects";

const props = defineProps({
  epic: Object,
  projectId: String,
});
const visible = defineModel("visible", { default: false });

const toast = useToast();
const store = useProjectStore();

const form = ref({
  title: "",
  description: "",
  status: "open",
  color: PRESET_COLORS[0],
  startDate: null,
  dueDate: null,
});
const errors = ref({ title: false });
const isEdit = ref(false);

const statusOptions = Object.entries(EPIC_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

watch(
  () => props.epic,
  (e) => {
    if (e?.id) {
      isEdit.value = true;
      form.value = {
        title: e.title,
        description: e.description ?? "",
        status: e.status ?? "open",
        color: e.color ?? PRESET_COLORS[0],
        startDate: e.startDate ?? null,
        dueDate: e.dueDate ?? null,
      };
    } else {
      isEdit.value = false;
      form.value = {
        title: "",
        description: "",
        status: "open",
        color: PRESET_COLORS[0],
        startDate: null,
        dueDate: null,
      };
    }
  },
);

function submit() {
  errors.value.title = !form.value.title.trim();
  if (errors.value.title) return;

  if (isEdit.value) {
    store.updateEpic(props.epic.id, { ...form.value });
    toast.add({ severity: "success", summary: "Эпик обновлён", life: 2000 });
  } else {
    store.createEpic(props.projectId, { ...form.value });
    toast.add({ severity: "success", summary: "Эпик создан", life: 2000 });
  }
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="isEdit ? 'Редактировать эпик' : 'Новый эпик'"
    modal
    class="w-full max-w-md"
  >
    <div class="flex flex-col gap-4">
      <div>
        <InputText
          v-model="form.title"
          placeholder="Название эпика"
          class="w-full"
        />
        <small v-if="errors.title" class="text-red-500"
          >Название обязательно</small
        >
      </div>

      <Textarea
        v-model="form.description"
        rows="2"
        placeholder="Описание (необязательно)"
        class="w-full"
      />

      <div>
        <label class="text-xs text-gray-500 mb-2 block">Цвет эпика</label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="color in PRESET_COLORS"
            :key="color"
            class="w-7 h-7 rounded-full border-2 transition-all"
            :class="
              form.color === color
                ? 'border-gray-800 scale-110'
                : 'border-transparent'
            "
            :style="{ background: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <div>
        <label class="text-xs text-gray-500 mb-1 block">Статус</label>
        <Select
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Дата начала</label>
          <DatePicker
            v-model="form.startDate"
            class="w-full"
            dateFormat="dd.mm.yy"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 block">Дата окончания</label>
          <DatePicker
            v-model="form.dueDate"
            class="w-full"
            dateFormat="dd.mm.yy"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" text @click="visible = false" />
      <Button :label="isEdit ? 'Сохранить' : 'Создать'" @click="submit" />
    </template>
  </Dialog>
</template>
