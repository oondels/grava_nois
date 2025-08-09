import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/',
    redirect: '/meus-lances'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/meus-lances',
    name: 'MeusLances',
    component: () => import('@/pages/MeusLancesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lance/:id',
    name: 'LanceDetails',
    component: () => import('@/pages/LanceDetailsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/downloads',
    name: 'Downloads',
    component: () => import('@/pages/DownloadsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/suporte',
    name: 'Suporte',
    component: () => import('@/pages/SuportePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/meus-lances')
  } else {
    next()
  }
})

export default router