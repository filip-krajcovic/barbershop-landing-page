<script setup lang="ts">
/** Hviezdičkové hodnotenie; čítačkám obrazovky sa oznámi ako „Hodnotenie 4,9 z 5“. */
const props = withDefaults(defineProps<{ value: number; max?: number; size?: number }>(), {
  max: 5,
  size: 18,
});

const filled = computed(() => Math.round(props.value));
const label = computed(() => `Hodnotenie ${props.value.toLocaleString('sk-SK')} z ${props.max}`);
const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';
</script>

<template>
  <span class="inline-flex gap-[3px]" role="img" :aria-label="label">
    <svg
      v-for="i in props.max"
      :key="i"
      :width="props.size"
      :height="props.size"
      viewBox="0 0 24 24"
      aria-hidden="true"
      :class="i <= filled ? 'fill-accent' : 'fill-[#3a362f]'"
      :data-filled="i <= filled"
    >
      <path :d="STAR" />
    </svg>
  </span>
</template>
