<script setup lang="ts">
import { UserRound } from '@lucide/vue'

withDefaults(defineProps<{ src?: string | null; alt?: string; size?: number }>(), {
  src: null,
  alt: '',
  size: 36,
})
</script>

<template>
  <span class="avatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="src" :src="src" :alt="alt" />
    <UserRound v-else :size="Math.round(size * 0.55)" />
  </span>
</template>
