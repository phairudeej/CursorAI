<script setup lang="ts">
import { Phone } from '@lucide/vue'
import Button from '../components/Button.vue'
import LineIcon from '../components/LineIcon.vue'
import Pagination from '../components/Pagination.vue'
import SellerAvatar from '../components/SellerAvatar.vue'

const colors = [
  ['--color-bg', '#F4F7FB'],
  ['--color-header', '#0B1F3A'],
  ['--color-primary', '#F97316'],
  ['--color-price', '#DC2626'],
  ['--color-line', '#06C755'],
  ['--color-muted', '#EEF2F7'],
  ['--color-overlay', 'rgba(11,31,58,.55)'],
]

const typeScale = [12, 16, 18, 20, 24, 28, 32, 36]
</script>

<template>
  <section class="page ds-page">
    <h1>Design System</h1>
    <p class="lead">โทเคนจาก <code>:root</code> ตาม DoD — ไม่ลิงก์จาก header</p>

    <section class="ds-section">
      <h2>สี</h2>
      <div class="swatch-grid">
        <div v-for="[token, value] in colors" :key="token" class="swatch">
          <div class="swatch-color" :style="{ background: `var(${token})` }" />
          <div class="swatch-meta">
            <div>{{ token }}</div>
            <div>{{ value }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="ds-section">
      <h2>ตัวอักษร (Prompt)</h2>
      <div class="type-scale">
        <p v-for="size in typeScale" :key="size" :style="{ fontSize: `${size}px`, margin: 0 }">
          {{ size }}px — ค้นหารถมือสองทั้งหมด
        </p>
      </div>
    </section>

    <section class="ds-section">
      <h2>Breakpoint</h2>
      <div class="token-list">
        <div><code>--bp-md: 640px</code> — grid 2 คอลัมน์</div>
        <div><code>--bp-lg: 960px</code> — grid 3 คอลัมน์ / detail 2 คอลัมน์</div>
        <div><code>--bp-xl: 1200px</code> — grid 4 คอลัมน์</div>
      </div>
    </section>

    <section class="ds-section">
      <h2>ปุ่ม / ไอคอน / อวตาร</h2>
      <div class="toolbar-actions">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="navy">Navy</Button>
        <Button variant="line"><LineIcon :size="20" /> LINE</Button>
        <span class="icon-btn"><Phone :size="18" /></span>
        <SellerAvatar :size="40" />
      </div>
    </section>

    <section class="ds-section">
      <h2>Filter chip</h2>
      <div class="chip-row">
        <button type="button" class="chip">Hino ×</button>
        <button type="button" class="chip">฿500,000 – ฿1,000,000 ×</button>
      </div>
    </section>

    <section class="ds-section">
      <h2>Pagination</h2>
      <Pagination :page="1" :page-size="12" :total="36" />
    </section>
  </section>
</template>
