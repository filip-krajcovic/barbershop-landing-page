<script setup lang="ts">
/** Výberová karta v dialógu (služba, barber, deň). Stav výberu oznamuje cez aria-pressed. */
defineProps<{ selected: boolean; disabled?: boolean }>();
defineEmits<{ select: [] }>();
</script>

<template>
  <button
    type="button"
    :aria-pressed="selected"
    :disabled="disabled"
    class="block rounded-2xl border text-left transition-colors disabled:cursor-not-allowed"
    :class="
      selected
        ? 'border-accent bg-accent text-on-accent'
        : 'border-line-soft bg-surface-2 text-ink hover:border-line-strong'
    "
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>
