<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useProjectStore } from '@/stores/projects'
import { PROJECT_STATUS_LABELS, PRESET_COLORS } from '@/constants/projects'

const props = defineProps({ project: Object })
const visible = defineModel('visible', { default: false })

const toast = useToast()
const store = useProjectStore()

const form = ref({ title: '', description: '', color: PRESET_COLORS[0], status: 'active' })
const errors = ref({ title: false })
const isEdit = ref(false)

const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

watch(() => props.project, (p) => {
  if (p?.id) {
    isEdit.value = true
    form.value = { title: p.title, description: p.description ?? '', color: p.color ?? PRESET_COLORS[0], status: p.status }
  } else {
    isEdit.value = false
    form.value = { title: '', description: '', color: PRESET_COLORS[0], status: 'active' }
  }
})

function submit() {
  errors.value.title = !form.value.title.trim()
  if (errors.value.title) return
  if (isEdit.value) {
    store.updateProject(props.project.id, { ...form.value })
    toast.add({ severity: 'success', summary: 'Проект обновлён', life: 2000 })
  } else {
    store.createProject({ ...form.value })
    toast.add({ severity: 'success', summary: 'Проект создан', life: 2000 })
  }
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" :header="isEdit ? 'Редактировать проект' : 'Новый проект'" modal class="w-full max-w-md">
    <div class="flex flex-col gap-4">
      <div>
        <InputText v-model="form.title" placeholder="Название проекта" class="w-full" />
        <small v-if="errors.title" class="text-red-500">Название обязательно</small>
      </div>
      <Textarea v-model="form.description" rows="2" placeholder="Описание (необязательно)" class="w-full" />
      <div>
        <label class="text-xs text-gray-500 mb-2 block">Цвет проекта</label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="color in PRESET_COLORS"
            :key="color"
            class="w-7 h-7 rounded-full border-2 transition-all"
            :class="form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'"
            :style="{ background: color }"
            @click="form.color = color"
          />
        </div>
      </div>
      <div>
        <label class="text-xs text-gray-500 mb-1 block">Статус</label>
        <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Отмена" text @click="visible = false" />
      <Button :label="isEdit ? 'Сохранить' : 'Создать'" @click="submit" />
    </template>
  </Dialog>
</template>