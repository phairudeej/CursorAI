<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pages = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1))

function go(page: number) {
  if (page < 1 || page > pageCount.value || page === props.page) return
  emit('update:page', page)
}
</script>

<template>
  <nav class="pagination" aria-label="การแบ่งหน้า">
    <button type="button" class="page-btn" :disabled="page <= 1" aria-label="หน้าก่อน" @click="go(page - 1)">
      <ChevronLeft :size="18" />
    </button>
    <button
      v-for="number in pages"
      :key="number"
      type="button"
      class="page-btn"
      :class="{ 'is-active': number === page }"
      :aria-current="number === page ? 'page' : undefined"
      @click="go(number)"
    >
      {{ number }}
    </button>
    <button type="button" class="page-btn" :disabled="page >= pageCount" aria-label="หน้าถัดไป" @click="go(page + 1)">
      <ChevronRight :size="18" />
    </button>
  </nav>
</template>
