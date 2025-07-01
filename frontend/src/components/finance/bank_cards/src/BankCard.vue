<template>
    <div class="mb-7 relative" v-bind="$attrs"> <!-- Добавлен relative для позиционирования -->
        <div class="rounded-2xl p-4" :class="bgcolour">
            <div class="text-center h-24 text-5xl text-white pb-3 flex items-center">
                {{ moneyValue }}
            </div>

        </div>
    </div>
</template>

<script setup>
defineProps({
    moneyValue: String,
    bgcolour: String,
});

defineOptions({
    inheritAttrs: false,
});
</script>
