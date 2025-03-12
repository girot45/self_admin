<template>
    <div class="mb-7" v-bind="$attrs">
        <div class="rounded-2xl p-4" :class="bgcolour">
            <!-- Добавим flex для вертикального выравнивания -->
            <div class="text-center h-24 text-5xl text-white pb-3 flex items-center justify-center">
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

<style scoped></style>
