<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlidersHorizontal, X } from '@lucide/vue'
import { brands, ensureCatalog, ensureModels, modelsByBrand, vehicleTypes } from '../api/catalog'
import { messageOf } from '../api/http'
import { listProducts } from '../api/products'
import { formatPrice } from '../lib/format'
import { cloneDraft, emptyDraft, toListQuery, type FilterDraft } from '../lib/filters'
import type { PageMeta, Product, ProductSort } from '../types'
import { HOME_PAGE_SIZE } from '../types'
import FilterDrawer from '../components/FilterDrawer.vue'
import Pagination from '../components/Pagination.vue'
import ProductCard from '../components/ProductCard.vue'

const page = ref(1)
const sort = ref<ProductSort>('newest')
const filters = ref<FilterDraft>(emptyDraft())
const products = ref<Product[]>([])
const meta = ref<PageMeta>({ page: 1, pageSize: HOME_PAGE_SIZE, total: 0 })
const loading = ref(false)
const error = ref('')
const drawerOpen = ref(false)
let requestId = 0

const chips = computed(() => {
  const items: { key: string; label: string }[] = []
  const type = vehicleTypes.value.find((item) => String(item.id) === filters.value.vehicleTypeId)
  if (type) items.push({ key: 'vehicleTypeId', label: type.name })
  const brand = brands.value.find((item) => String(item.id) === filters.value.brandId)
  if (brand) items.push({ key: 'brandId', label: brand.name })
  const brandId = Number(filters.value.brandId)
  const model = (modelsByBrand.value[brandId] ?? []).find((item) => String(item.id) === filters.value.modelId)
  if (model) items.push({ key: 'modelId', label: model.name })
  if (filters.value.minPrice || filters.value.maxPrice) {
    const min = filters.value.minPrice ? formatPrice(Number(filters.value.minPrice)) : ''
    const max = filters.value.maxPrice ? formatPrice(Number(filters.value.maxPrice)) : ''
    const label = min && max ? `${min} – ${max}` : min ? `ราคาตั้งแต่ ${min}` : `ราคาถึง ${max}`
    items.push({ key: 'price', label })
  }
  if (filters.value.minYear || filters.value.maxYear) {
    const min = filters.value.minYear
    const max = filters.value.maxYear
    const label = min && max ? `ปี ${min} – ${max}` : min ? `ปีตั้งแต่ ${min}` : `ปีถึง ${max}`
    items.push({ key: 'year', label })
  }
  return items
})

async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''
  try {
    await ensureCatalog()
    if (filters.value.brandId) await ensureModels(Number(filters.value.brandId))
    const result = await listProducts(toListQuery(filters.value, page.value, HOME_PAGE_SIZE, sort.value))
    if (current !== requestId) return
    const lastPage = Math.max(1, Math.ceil(result.meta.total / result.meta.pageSize))
    if (page.value > lastPage) {
      page.value = lastPage
      return
    }
    products.value = result.data
    meta.value = result.meta
  } catch (cause) {
    if (current !== requestId) return
    products.value = []
    error.value = messageOf(cause)
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch([page, sort, filters], () => void load(), { immediate: true, deep: true })

function onSort(event: Event) {
  sort.value = (event.target as HTMLSelectElement).value as ProductSort
  page.value = 1
}

function applyFilters(next: FilterDraft) {
  filters.value = cloneDraft(next)
  page.value = 1
  drawerOpen.value = false
}

function removeChip(key: string) {
  const next = cloneDraft(filters.value)
  if (key === 'vehicleTypeId') next.vehicleTypeId = ''
  if (key === 'brandId') {
    next.brandId = ''
    next.modelId = ''
  }
  if (key === 'modelId') next.modelId = ''
  if (key === 'price') {
    next.minPrice = ''
    next.maxPrice = ''
  }
  if (key === 'year') {
    next.minYear = ''
    next.maxYear = ''
  }
  filters.value = next
  page.value = 1
}
</script>

<template>
  <section class="page">
    <div class="toolbar">
      <h1 class="page-title">ค้นหารถมือสองทั้งหมด</h1>
      <div class="toolbar-actions">
        <select class="select sort-select" :value="sort" aria-label="เรียงสินค้า" @change="onSort">
          <option value="newest">สินค้ามาใหม่</option>
          <option value="views">ยอดนิยม</option>
          <option value="price">ราคาต่ำ - สูง</option>
          <option value="price_desc">ราคาสูง - ต่ำ</option>
        </select>
        <button type="button" class="btn btn-secondary" @click="drawerOpen = true">
          <SlidersHorizontal :size="18" />
          ตัวกรอง
        </button>
      </div>
    </div>

    <div v-if="chips.length" class="chip-row">
      <button v-for="chip in chips" :key="chip.key" type="button" class="chip" @click="removeChip(chip.key)">
        {{ chip.label }}
        <X :size="14" />
      </button>
    </div>

    <p v-if="loading" class="status" role="status">กำลังโหลดสินค้า</p>
    <div v-if="error" class="form-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn btn-secondary" @click="load">ลองอีกครั้ง</button>
    </div>
    <p v-else-if="!loading && products.length === 0" class="status">ไม่พบสินค้า</p>
    <div v-else class="product-grid" :class="{ 'is-loading': loading }" :aria-busy="loading">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <Pagination
      v-if="meta.total > 0"
      :page="meta.page"
      :page-size="meta.pageSize"
      :total="meta.total"
      @update:page="page = $event"
    />

    <FilterDrawer :open="drawerOpen" :filters="filters" @close="drawerOpen = false" @apply="applyFilters" />
  </section>
</template>
