<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { brands, ensureModels, vehicleTypes } from '../api/catalog'
import { messageOf } from '../api/http'
import { cloneDraft, draftHasValue, emptyDraft, validateDraft, type FilterDraft } from '../lib/filters'
import type { Model } from '../types'
import Button from './Button.vue'

const props = defineProps<{ open: boolean; filters: FilterDraft }>()
const emit = defineEmits<{ close: []; apply: [filters: FilterDraft] }>()

const draft = reactive<FilterDraft>(emptyDraft())
const models = ref<Model[]>([])
const error = ref('')

const canClear = computed(() => draftHasValue(draft))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    Object.assign(draft, cloneDraft(props.filters))
    error.value = ''
    document.body.style.overflow = 'hidden'
  },
)

watch(
  () => [props.open, draft.brandId] as const,
  async ([open, brandId]) => {
    if (!open || !brandId) {
      models.value = []
      return
    }
    try {
      models.value = await ensureModels(Number(brandId))
    } catch (cause) {
      models.value = []
      error.value = messageOf(cause)
    }
  },
)

function onBrandChange() {
  draft.modelId = ''
}

function clearFilters() {
  Object.assign(draft, emptyDraft())
  error.value = ''
  emit('apply', emptyDraft())
}

function apply() {
  const message = validateDraft(draft)
  error.value = message ?? ''
  if (message) return
  emit('apply', cloneDraft(draft))
  close()
}

function close() {
  document.body.style.overflow = ''
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="drawer-root">
      <button type="button" class="overlay" aria-label="ปิดตัวกรอง" @click="close" />
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="filter-title">
        <header class="drawer-header">
          <h2 id="filter-title">ตัวกรอง</h2>
          <button type="button" class="icon-btn" aria-label="ปิด" @click="close"><X :size="18" /></button>
        </header>
        <div class="drawer-body">
          <section class="form-section">
            <h3>ข้อมูลรถ</h3>
            <label class="field">
              <span>ประเภท</span>
              <select v-model="draft.vehicleTypeId" class="select">
                <option value="">กรุณาเลือกประเภท</option>
                <option v-for="type in vehicleTypes" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
              </select>
            </label>
            <label class="field">
              <span>ยี่ห้อ</span>
              <select v-model="draft.brandId" class="select" @change="onBrandChange">
                <option value="">กรุณาเลือกยี่ห้อ</option>
                <option v-for="brand in brands" :key="brand.id" :value="String(brand.id)">{{ brand.name }}</option>
              </select>
            </label>
            <label class="field">
              <span>รุ่น</span>
              <select v-model="draft.modelId" class="select" :disabled="!draft.brandId">
                <option value="">กรุณาเลือกรุ่น</option>
                <option v-for="model in models" :key="model.id" :value="String(model.id)">{{ model.name }}</option>
              </select>
            </label>
          </section>
          <section class="form-section">
            <h3>ราคา</h3>
            <div class="range-row">
              <label class="field">
                <span>ตั้งแต่</span>
                <input v-model="draft.minPrice" class="input" inputmode="numeric" placeholder="กรุณากรอกราคา" />
              </label>
              <label class="field">
                <span>ถึง</span>
                <input v-model="draft.maxPrice" class="input" inputmode="numeric" placeholder="กรุณากรอกราคา" />
              </label>
            </div>
          </section>
          <section class="form-section">
            <h3>ปีที่ผลิต</h3>
            <div class="range-row">
              <label class="field">
                <span>ตั้งแต่</span>
                <input v-model="draft.minYear" class="input" inputmode="numeric" placeholder="กรุณากรอกปี" />
              </label>
              <label class="field">
                <span>ถึง</span>
                <input v-model="draft.maxYear" class="input" inputmode="numeric" placeholder="กรุณากรอกปี" />
              </label>
            </div>
          </section>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        </div>
        <footer class="drawer-footer">
          <Button variant="secondary" :disabled="!canClear" @click="clearFilters">ล้างตัวกรอง</Button>
          <Button @click="apply">ดูผลลัพธ์</Button>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>
