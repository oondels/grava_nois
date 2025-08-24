import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";

const routes = [
  {
    path: "/",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/videos",
    name: "Videos",
    // Temporariamente público; futuramente use meta: { requiresAuth: true }
    component: () => import("@/pages/VideosPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: { requiresGuest: false },
  },
  // {
  //   path: "/meus-lances",
  //   name: "MeusLances",
  //   component: () => import("@/pages/MeusLancesPage.vue"),
  //   meta: { requiresAuth: false },
  // },
  // {
  //   path: "/lance/:id",
  //   name: "LanceDetails",
  //   component: () => import("@/pages/LanceDetailsPage.vue"),
  //   meta: { requiresAuth: false },
  // },
  // {
  //   path: "/downloads",
  //   name: "Downloads",
  //   component: () => import("@/pages/DownloadsPage.vue"),
  //   meta: { requiresAuth: false },
  // },
  // {
  //   path: "/suporte",
  //   name: "Suporte",
  //   component: () => import("@/pages/SuportePage.vue"),
  //   meta: { requiresAuth: false },
  // },
  {
    path: "/contato",
    name: "Contato",
    component: () => import("@/pages/ContactPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFoundPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/meus-lances");
  } else {
    next();
  }
});

export default router;
