import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ProductDetailView from './views/ProductDetailView.vue'
import AdminView from './views/AdminView.vue'
import DesignSystemView from './views/DesignSystemView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products/:id', name: 'product', component: ProductDetailView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/design-system', name: 'design-system', component: DesignSystemView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
