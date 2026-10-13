<script setup lang="ts">
/**
 * Ikony ako inline SVG (farba z `currentColor`). Dekoratívne – pre ikonové tlačidlá
 * pridaj `aria-label` na samotné tlačidlo.
 */
export type IconName =
  | 'clock'
  | 'phone'
  | 'refresh'
  | 'pin'
  | 'globe'
  | 'call'
  | 'lock'
  | 'close'
  | 'arrow-up-right'
  | 'check-circle';

const props = withDefaults(defineProps<{ name: IconName; size?: number; strokeWidth?: number }>(), {
  size: 22,
  strokeWidth: 2,
});

const paths: Record<IconName, string[]> = {
  clock: ['M12 7v5l3 2', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z'],
  phone: ['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M10 18h4'],
  refresh: ['M4 12a8 8 0 1 0 2.3-5.7', 'M4 4v4h4'],
  pin: [
    'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z',
    'M12 7a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
  ],
  globe: [
    'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z',
    'M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  ],
  call: [
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  ],
  lock: [
    'M6 9h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
    'M8 9V6a4 4 0 0 1 8 0v3',
  ],
  close: ['M6 6l12 12M18 6L6 18'],
  'arrow-up-right': ['M7 17L17 7M9 7h8v8'],
  'check-circle': ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M8 12.5l2.5 2.5L16 9.5'],
};
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in paths[props.name]" :key="d" :d="d" />
  </svg>
</template>
