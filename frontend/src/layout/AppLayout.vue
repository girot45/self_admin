<script setup>
import { ref, onMounted } from "vue";
import AppSidebar from "./AppSidebar.vue";
import AppTopbar from "./AppTopbar.vue";

// Инициализируем isVisible с значением из localStorage или false по умолчанию
const isVisible = ref(
  JSON.parse(localStorage.getItem("sidebarVisible")) ?? false,
);

const toggleCard = () => {
  isVisible.value = !isVisible.value;
  // Сохраняем новое значение в localStorage при каждом изменении
  localStorage.setItem("sidebarVisible", JSON.stringify(isVisible.value));
};

// Загружаем состояние при монтировании компонента (опционально, если нужна дополнительная проверка)
onMounted(() => {
  const savedValue = localStorage.getItem("sidebarVisible");
  if (savedValue !== null) {
    isVisible.value = JSON.parse(savedValue);
  }
});
</script>

<template>
  <div>
    <AppTopbar v-model:isVisible="isVisible" @toggleCard="toggleCard" />

    <div class="flex mt-20" style="height: 90vh;">
      <AppSidebar v-model:isVisible="isVisible" :class="{ 'me-4': isVisible }" />
      <div class=" transition-all duration-300 w-full" :class="{ 'ml-80': isVisible, 'ml-0 ps-4': !isVisible }">
        <router-view class="p-0 pe-4"> </router-view>
      </div>
    </div>
    <div class="layout-mask animate-fadein"></div>
  </div>
</template>
