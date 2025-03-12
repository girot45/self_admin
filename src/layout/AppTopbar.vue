<template>
  <Menubar :model="items" class="fixed top-1 left-1 right-1 z-50">
    <template #start>
      <Button
        :icon="isVisible ? 'pi pi-times' : 'pi pi-bars'"
        @click="$emit('toggleCard')"
        class="px-4 py-2 rounded-lg shadow-lg z-10"
        variant="link"
      />
    </template>
    <template #item="{ item, props, hasSubmenu, root }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span>{{ item.label }}</span>
        <Badge
          v-if="item.badge"
          :class="{ 'ml-auto': !root, 'ml-2': root }"
          :value="item.badge"
        />
        <span
          v-if="item.shortcut"
          class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
          >{{ item.shortcut }}</span
        >
        <i
          v-if="hasSubmenu"
          :class="[
            'pi pi-angle-down ml-auto',
            { 'pi-angle-down': root, 'pi-angle-right': !root },
          ]"
        ></i>
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
defineProps({
  isVisible: Boolean,
});
defineEmits(["toggleCard"]);
const items = ref([
  {
    label: "Home",
    icon: "pi pi-home",
  },
  {
    label: "Projects",
    icon: "pi pi-search",
    badge: 3,
    items: [
      {
        label: "Core",
        icon: "pi pi-bolt",
        shortcut: "⌘+S",
      },
      {
        label: "Blocks",
        icon: "pi pi-server",
        shortcut: "⌘+B",
      },
      {
        separator: true,
      },
      {
        label: "UI Kit",
        icon: "pi pi-pencil",
        shortcut: "⌘+U",
      },
    ],
  },
]);
</script>
