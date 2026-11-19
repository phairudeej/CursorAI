<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { ApiError, mediaUrl, messageOf } from '../api/http'
import { getProduct, listProducts } from '../api/products'
import { formatPrice, phoneHref, vehicleMeta } from '../lib/format'
import type { Product } from '../types'
import LineIcon from '../components/LineIcon.vue'
import ProductCard from '../components/ProductCard.vue'
import SellerAvatar from '../components/SellerAvatar.vue'

const route = useRoute()
const product = ref<Product | null>(null)
const recommended = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const notFound = ref(false)
const active = ref(0)
const slideName = ref<'slide-next' | 'slide-prev'>('slide-next')
let requestId = 0

const images = computed(() =>
  [...(product.value?.images ?? [])].sort((left, right) => left.sortOrder - right.sortOrder),
)
const meta = computed(() => (product.value ? vehicleMeta(product.value) : ''))
const activeImage = computed(() => images.value[active.value] ?? null)

function routeProductId(): number | null {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  if (!raw || !/^[1-9]\d*$/.test(raw)) return null
  return Number(raw)
}

function step(direction: number) {
  if (images.value.length < 2) return
  slideName.value = direction > 0 ? 'slide-next' : 'slide-prev'
  active.value = (active.value + direction + images.value.length) % images.value.length
}

function goTo(index: number) {
  if (index === active.value) return
  slideName.value = index > active.value ? 'slide-next' : 'slide-prev'
  active.value = index
}

async function load() {
  const current = ++requestId
  const id = routeProductId()
  loading.value = true
  error.value = ''
  notFound.value = false
  product.value = null
  recommended.value = []
  active.value = 0
  window.scrollTo(0, 0)
  if (id == null) {
    notFound.value = true
    loading.value = false
    return
  }
  try {
    const [detail, list] = await Promise.all([
      getProduct(id),
      listProducts({ sort: 'newest', page: 1, pageSize: 5 }).catch(() => null),
    ])
    if (current !== requestId) return
    product.value = detail
    recommended.value = (list?.data ?? []).filter((item) => item.id !== id).slice(0, 4)
  } catch (cause) {
    if (current !== requestId) return
    if (cause instanceof ApiError && cause.status === 404) notFound.value = true
    else error.value = messageOf(cause)
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch(() => route.params.id, () => void load(), { immediate: true })
</script>

<template>
  <section class="page">
    <p v-if="loading" class="status" role="status">กำลังโหลดสินค้า</p>
    <div v-else-if="notFound" class="form-error" role="alert">
      <p>ไม่พบสินค้า</p>
      <RouterLink to="/" class="btn btn-secondary">กลับหน้าแรก</RouterLink>
    </div>
    <div v-else-if="error" class="form-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn btn-secondary" @click="load">ลองอีกครั้ง</button>
    </div>
    <template v-else-if="product">
      <div class="detail-layout">
        <div class="gallery">
          <div class="gallery-stage">
            <button v-if="images.length > 1" type="button" class="gallery-nav prev" aria-label="รูปก่อนหน้า" @click="step(-1)">
              <ChevronLeft :size="22" />
            </button>
            <Transition :name="slideName">
              <img v-if="activeImage" :key="activeImage.id" :src="mediaUrl(activeImage.url) ?? ''" :alt="product.name" />
              <div v-else key="empty" class="media-empty">ไม่มีรูป</div>
            </Transition>
            <button v-if="images.length > 1" type="button" class="gallery-nav next" aria-label="รูปถัดไป" @click="step(1)">
              <ChevronRight :size="22" />
            </button>
          </div>
          <div v-if="images.length > 1" class="thumbs">
            <button
              v-for="(image, index) in images"
              :key="image.id"
              type="button"
              class="thumb"
              :class="{ 'is-active': index === active }"
              @click="goTo(index)"
            >
              <img :src="mediaUrl(image.url) ?? ''" alt="" />
            </button>
          </div>
        </div>

        <article class="info-panel">
          <p v-if="meta" class="card-meta">{{ meta }}</p>
          <h1 class="detail-title">{{ product.name }}</h1>
          <p class="detail-price">{{ formatPrice(product.price) }}</p>
          <p v-if="product.description" class="detail-description">{{ product.description }}</p>
          <dl class="spec-grid">
            <div>
              <dt>ยี่ห้อ</dt>
              <dd>{{ product.brand?.name ?? '-' }}</dd>
            </div>
            <div>
              <dt>รุ่น</dt>
              <dd>{{ product.model?.name ?? '-' }}</dd>
            </div>
            <div>
              <dt>ปี</dt>
              <dd>{{ product.year ?? '-' }}</dd>
            </div>
            <div>
              <dt>ประเภท</dt>
              <dd>{{ product.vehicleType?.name ?? '-' }}</dd>
            </div>
          </dl>
          <div class="seller-box">
            <SellerAvatar :src="mediaUrl(product.sellerAvatar)" :alt="product.sellerName ?? ''" :size="48" />
            <div class="seller-copy">
              <p class="seller-name">{{ product.sellerName || 'ไม่ระบุผู้ขาย' }}</p>
              <a v-if="product.sellerPhone" class="seller-phone" :href="phoneHref(product.sellerPhone)">
                {{ product.sellerPhone }}
              </a>
            </div>
          </div>
          <div class="cta-stack">
            <a v-if="product.sellerPhone" class="btn btn-navy btn-block" :href="phoneHref(product.sellerPhone)">ติดต่อผู้ขาย</a>
            <span v-else class="btn btn-navy btn-block is-disabled">ติดต่อผู้ขาย</span>
            <a
              v-if="product.sellerLineUrl"
              class="btn btn-line btn-block"
              :href="product.sellerLineUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LineIcon :size="22" />
              แอดไลน์
            </a>
            <span v-else class="btn btn-line btn-block is-disabled"><LineIcon :size="22" /> แอดไลน์</span>
          </div>
        </article>
      </div>

      <section class="recommended">
        <h2>สินค้าแนะนำ</h2>
        <div v-if="recommended.length" class="product-grid">
          <ProductCard v-for="item in recommended" :key="item.id" :product="item" />
        </div>
        <p v-else class="status">ไม่มีสินค้าแนะนำ</p>
      </section>
    </template>
  </section>
</template>
