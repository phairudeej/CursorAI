<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/" class="logo" aria-label="CARHUB หน้าแรก">
        <svg class="logo-mark" viewBox="0 0 64 40" aria-hidden="true">
          <rect x="2" y="12" width="32" height="14" rx="2" fill="#fff" />
          <path fill="#fff" d="M34 16h12l6 8H34z" />
          <rect x="40" y="18" width="8" height="4" rx="1" fill="#0B1F3A" />
          <circle cx="14" cy="28" r="4" fill="#fff" />
          <circle cx="14" cy="28" r="1.6" fill="#0B1F3A" />
          <circle cx="42" cy="28" r="4" fill="#fff" />
          <circle cx="42" cy="28" r="1.6" fill="#0B1F3A" />
          <circle cx="52" cy="11" r="7" fill="#F97316" />
          <path d="M48.6 11.1l2.2 2.2 4.3-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="logo-word">CARHUB</span>
      </RouterLink>
      <RouterLink to="/admin" class="btn btn-primary header-admin">จัดการสินค้า</RouterLink>
    </div>
  </header>
</template>
