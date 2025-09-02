import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";

const routes = [
  {
    path: "/",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/lances-gravanois",
    name: "Lances GravaNois",
    component: () => import("@/pages/ManutencaoAviso.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: { requiresGuest: false },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/pages/RegisterPage.vue"),
    meta: { requiresGuest: false },
  },
  {
    path: "/auth/update-password",
    name: "Mudar Senha",
    component: () => import("@/pages/auth/ResetPassword.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/user-page",
    name: "Usuário",
    component: () => import("@/pages/UserPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/contato",
    name: "Contato",
    component: () => import("@/pages/ContactPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/reportar-erro",
    name: "Reportar Erro",
    component: () => import("@/pages/ReportErrorPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFoundPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/videos");
  } else {
    next();
  }
});

export default router;
