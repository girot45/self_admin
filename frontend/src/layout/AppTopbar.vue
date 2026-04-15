<template>
  <Menubar :model="items" class="fixed top-1 left-7 right-7 z-50">
    <template #start>
      <Button :icon="isVisible ? 'pi pi-times' : 'pi pi-bars'" @click="$emit('toggleCard')"
        class="px-4 py-2 rounded-lg shadow-lg z-10" variant="link" />
    </template>
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action" :href="item.to">
        <span>{{ item.label }}</span>
      </a>
    </template>
    <template #end>
      
      <div class="flex items-center">
        <p class="text-2xl self-center">{{ currentDate }}</p>
      </div>
    </template>
  </Menubar>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from "vue";
  import { useRouter } from 'vue-router'; // Import useRouter

  defineProps({
    isVisible: Boolean,
  });
  defineEmits(["toggleCard"]);

  const router = useRouter(); // Initialize router

  const items = ref([
    {
      label: "Solara",
      icon: "pi pi-home",
      to: '/', // Add 'to' property for routing
    },
    {
      label: "Проекты",
      icon: "pi pi-search",
      to: '/projects', // Add 'to' property for routing
    },
    {
      label: "Финансы",
      icon: "pi pi-search",
      to: '/finance', // Add 'to' property for routing
    },
    {
      label: "CRM",
      icon: "pi pi-info-circle",
      to: '/crm',
    },
    {
      label: "Dash",
      icon: "pi pi-info-circle",
      to: '/dash',
    }
  ]);

  
const currentDate = ref('')

// Функция форматирования даты
const formatDateTime = () => {
  const now = new Date()
  
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

// Обновление времени
const updateDateTime = () => {
  currentDate.value = formatDateTime()
}

let intervalId = null

onMounted(() => {
  updateDateTime() // Установить сразу
  intervalId = setInterval(updateDateTime, 60000) // Обновлять каждую минуту
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId) // Очистить интервал при уничтожении компонента
})

</script>