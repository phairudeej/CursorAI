<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 24 })
</script>

<template>
  <svg class="line-icon" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#06C755" />
    <path
      fill="#fff"
      d="M19.2 10.7c0-3.3-3.3-6-7.4-6s-7.4 2.7-7.4 6c0 3 2.6 5.5 6.2 5.9.2 0 .6.2.6.4.1.2 0 .5 0 .6l-.1 1c0 .3-.1.8.7.4 1.1-.6 5.8-3.4 7.1-5.8 1.4-1.5.3-2.5.3-2.5z"
    />
  </svg>
</template>
