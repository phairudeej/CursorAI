<script setup lang="ts">
import { ref, watch } from 'vue'
import { Pencil, Plus, Trash2 } from '@lucide/vue'
import { ApiError, mediaUrl, messageOf } from '../api/http'
import { deleteProduct, listProducts } from '../api/products'
import { coverImage, formatPrice } from '../lib/format'
import type { PageMeta, Product } from '../types'
import { ADMIN_PAGE_SIZE } from '../types'
import Pagination from '../components/Pagination.vue'
import ProductFormModal from '../components/ProductFormModal.vue'

const page = ref(1)
const products = ref<Product[]>([])
const meta = ref<PageMeta>({ page: 1, pageSize: ADMIN_PAGE_SIZE, total: 0 })
const loading = ref(false)
const error = ref('')
const modalOpen = ref(false)
const editing = ref<Product | null>(null)
let requestId = 0

async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await listProducts({ page: page.value, pageSize: ADMIN_PAGE_SIZE, sort: 'newest' })
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

watch(page, () => void load(), { immediate: true })

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(product: Product) {
  editing.value = product
  modalOpen.value = true
}

async function remove(product: Product) {
  if (!window.confirm(`ต้องการลบ "${product.name}" หรือไม่`)) return
  try {
    await deleteProduct(product.id)
    if (products.value.length === 1 && page.value > 1) page.value -= 1
    else await load()
  } catch (cause) {
    error.value = cause instanceof ApiError && cause.status === 404 ? 'ไม่พบสินค้า' : messageOf(cause)
    await load()
  }
}

function onSaved() {
  if (!editing.value) page.value = 1
  void load()
}
</script>

<template>
  <section class="page">
    <div class="admin-header">
      <h1>ระบบจัดการสินค้า</h1>
      <button type="button" class="btn btn-primary" @click="openCreate">
        <Plus :size="18" />
        สร้างรายการใหม่
      </button>
    </div>

    <p v-if="loading" class="status" role="status">กำลังโหลดสินค้า</p>
    <div v-if="error" class="form-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn btn-secondary" @click="load">ลองอีกครั้ง</button>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า</th>
              <th>ยี่ห้อ</th>
              <th>ราคา</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && products.length === 0">
              <td colspan="5" class="empty-cell">ไม่พบสินค้า</td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td>
                <img
                  v-if="coverImage(product)"
                  class="table-thumb"
                  :src="mediaUrl(coverImage(product)?.url) ?? ''"
                  :alt="product.name"
                />
                <span v-else class="table-thumb media-empty">ไม่มีรูป</span>
              </td>
              <td class="name-cell">{{ product.name }}</td>
              <td>{{ product.brand?.name ?? '-' }}</td>
              <td class="price-cell">{{ formatPrice(product.price) }}</td>
              <td class="action-cell">
                <button type="button" class="icon-btn" aria-label="แก้ไข" @click="openEdit(product)">
                  <Pencil :size="18" />
                </button>
                <button type="button" class="icon-btn danger" aria-label="ลบ" @click="remove(product)">
                  <Trash2 :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination
      v-if="meta.total > 0"
      :page="meta.page"
      :page-size="meta.pageSize"
      :total="meta.total"
      @update:page="page = $event"
    />

    <ProductFormModal :open="modalOpen" :product="editing" @close="modalOpen = false" @saved="onSaved" />
  </section>
</template>
