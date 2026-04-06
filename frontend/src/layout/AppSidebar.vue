<template>
  <div class="relative h-screen bg-transparent">
    <!-- Боковая панель с динамической шириной -->
    <div class="fixed left-0 overflow-hidden transition-all duration-300 z-40" :class="{
      'w-0': !isVisible,
      'w-80': isVisible,
    }">
      <div class="h-full ps-1 pb-96 transform transition-transform duration-300" :class="{
        '-translate-x-full': !isVisible,
        'translate-x-0': isVisible,
      }">
        <Card class="scrollable h-full shadow-xl border-0">
          <template #content>
            <!-- Заголовок -->
            <div class="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-bars text-teal-600"></i>
                <span>Меню</span>
              </h3>
            </div>

            <!-- Список пунктов -->
            <ul class="p-2">
              <li v-for="item in menuItems" :key="item.to">
                <router-link 
                  :to="item.to"
                  class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group"
                  :class="isActive(item.to) ? 
                    'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium' : 
                    'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
                >
                  <i 
                    :class="item.icon || 'pi pi-circle-fill'" 
                    class="text-sm transition-transform duration-200 group-hover:scale-110"
                    :style="isActive(item.to) ? 'color: #0d9488' : ''"
                  ></i>
                  <span>{{ item.label }}</span>
                  <i 
                    v-if="isActive(item.to)" 
                    class="pi pi-check text-teal-600 ml-auto opacity-100"
                  ></i>
                </router-link>
              </li>
            </ul>

            <!-- Разделитель -->
            <div class="my-3 border-t border-gray-100 dark:border-gray-700"></div>

            <!-- Нижняя секция -->
            <div class="px-4 py-3">
              <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <i class="pi pi-user"></i>
                <span>Пользователь</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Затемнение фона при открытом меню -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Card from 'primevue/card';

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["update:isVisible"]);

const route = useRoute();

const menuItems = computed(() => {
  return route.meta.sidebar || [];
});

const isActive = (path) => {
  return route.path === path;
};
</script>

<style>
.scrollable {
  overflow-y: auto;
  height: 90.5vh;
  background: white;
  border-radius: 0;
}

/* Стили для скроллбара */
.scrollable::-webkit-scrollbar {
  width: 6px;
}

.scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Анимация при наведении */
.router-link-active {
  transition: all 0.2s ease;
}


</style>