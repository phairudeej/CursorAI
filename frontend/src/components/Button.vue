<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'navy' | 'line' | 'ghost'
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', block: false, disabled: false, type: 'button' },
)
</script>

<template>
  <button :type="type" class="btn" :class="[`btn-${variant}`, { 'btn-block': block }]" :disabled="disabled">
    <slot />
  </button>
</template>
