<template>
  <div class="relative h-screen bg-transparent">
    <!-- Боковая панель с динамической шириной -->
    <div class="fixed left-0 overflow-hidden transition-all duration-300" :class="{
      'w-0': !isVisible,
      'w-80': isVisible,
    }">
      <div class="h-full ps-1 pb-96 transform transition-transform duration-300" :class="{
        '-translate-x-full': !isVisible,
        'translate-x-0': isVisible,
      }">
        <Card class="scrollable h-full">
          <template #content>
            <ul>
              <li><router-link to="/test">123</router-link></li>
              <!-- Другие пункты меню -->
            </ul>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  isVisible: Boolean,
});

defineEmits(["update:isVisible"]);
</script>
<style scoped>
.scrollable {
  overflow-y: scroll;
  /* Включаем вертикальную прокрутку */
  height: 90.5vh;
}

/* Стили для WebKit-браузеров (Chrome, Safari, Edge) */
.scrollable::-webkit-scrollbar {
  width: 15px;
}

.scrollable::-webkit-scrollbar-track {
  /* Цвет фона трека */
  border-radius: 0 10px 10px 0;
  /* Закругление справа сверху и справа снизу */
}

.scrollable::-webkit-scrollbar-thumb {
  background: #888;
  /* Цвет ползунка */
  border-radius: 10px;
  /* Закругление справа сверху и справа снизу */
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* Цвет ползунка при наведении */
}
</style>
