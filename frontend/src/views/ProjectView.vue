<script setup>
import { onMounted } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectDialog from '@/components/projects/ProjectDialog.vue'
import { ref } from 'vue'

const store = useProjectStore()
const router = useRouter()
const dialogVisible = ref(false)
const editingProject = ref(null)

onMounted(() => store.load())

function openCreate() {
  editingProject.value = null
  dialogVisible.value = true
}
</script>

<template>
  <!-- Хедер: тот же стиль что в финансах -->
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Проекты</h1>
    <Button label="Новый проект" icon="pi pi-plus" @click="openCreate" />
  </div>

  <!-- Сетка проектов -->
  <div v-if="store.projects.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <ProjectCard v-for="project in store.projects" :key="project.id" :project="project"
      @click="router.push(`/projects/${project.id}`)" @edit="(p) => { editingProject = p; dialogVisible = true }" />
  </div>

  <!-- Пустое состояние — повтори стиль из финансов -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-gray-400">
    <i class="pi pi-th-large text-5xl mb-4" />
    <p class="text-lg">Проектов пока нет</p>
    <Button label="Создать первый проект" class="mt-4" @click="openCreate" />
  </div>

  <ProjectDialog v-model:visible="dialogVisible" :project="editingProject" />
</template>