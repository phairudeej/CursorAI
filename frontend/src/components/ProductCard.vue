<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Phone } from '@lucide/vue'
import { mediaUrl } from '../api/http'
import { coverImage, formatPrice, phoneHref, vehicleMeta } from '../lib/format'
import type { Product } from '../types'
import LineIcon from './LineIcon.vue'
import SellerAvatar from './SellerAvatar.vue'

const props = defineProps<{ product: Product }>()
const router = useRouter()

const cover = computed(() => {
  const image = coverImage(props.product)
  return image ? mediaUrl(image.url) : null
})
const meta = computed(() => vehicleMeta(props.product))
const avatar = computed(() => mediaUrl(props.product.sellerAvatar))

function open() {
  void router.push(`/products/${props.product.id}`)
}
</script>

<template>
  <article class="product-card" tabindex="0" @click="open" @keydown.enter="open">
    <div class="card-media">
      <img v-if="cover" :src="cover" :alt="product.name" />
      <div v-else class="media-empty">ไม่มีรูป</div>
    </div>
    <div class="card-body">
      <h2 class="card-title">{{ product.name }}</h2>
      <p v-if="meta" class="card-meta">{{ meta }}</p>
      <p class="card-price">{{ formatPrice(product.price) }}</p>
      <div class="card-seller">
        <SellerAvatar :src="avatar" :alt="product.sellerName ?? ''" />
        <span class="seller-name">{{ product.sellerName || 'ไม่ระบุผู้ขาย' }}</span>
        <div class="card-actions" @click.stop>
          <a
            v-if="product.sellerLineUrl"
            class="icon-btn line"
            :href="product.sellerLineUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINE"
          >
            <LineIcon :size="32" />
          </a>
          <span v-else class="icon-btn line is-disabled" aria-hidden="true"><LineIcon :size="32" /></span>
          <a
            v-if="product.sellerPhone"
            class="icon-btn"
            :href="phoneHref(product.sellerPhone)"
            :aria-label="`โทร ${product.sellerPhone}`"
          >
            <Phone :size="18" />
          </a>
          <span v-else class="icon-btn is-disabled" aria-hidden="true"><Phone :size="18" /></span>
        </div>
      </div>
    </div>
  </article>
</template>
