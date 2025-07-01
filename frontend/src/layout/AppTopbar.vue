<template>
  <Menubar :model="items" class="fixed top-1 left-1 right-1 z-50">
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
      <div class="flex items-center gap-2">
        <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
      </div>
    </template>
  </Menubar>
</template>

<script setup>
  import { ref } from "vue";
  import { useRouter } from 'vue-router'; // Import useRouter

  defineProps({
    isVisible: Boolean,
  });
  defineEmits(["toggleCard"]);

  const router = useRouter(); // Initialize router

  const items = ref([
    {
      label: "Главная",
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
      label: "About",
      icon: "pi pi-info-circle",
      to: '/about',
    }
  ]);

</script>