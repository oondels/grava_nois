import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useSnackbar } from "@/composables/useSnackbar";

const routes = [
  {
    path: "/",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/lances-gravanois",
    name: "Lances GravaNois",
    component: () => import("@/pages/VideosPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
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
  { path: "/auth/callback", component: () => import("@/pages/auth/AuthCallback.vue") },
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { showSnackbar } = useSnackbar();
  // Aguarda a inicialização do auth store para evitar falsos negativos em refresh direto
  await authStore.ensureReady?.();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      if (typeof window !== "undefined" && to.fullPath) {
        localStorage.setItem("postAuthRedirect", to.fullPath);
      }
    } catch {}
    console.log("usuario nao autenticado, redirecionando para /login");
    // Notifica o usuário sobre a necessidade de login
    showSnackbar("Faça login para acessar esta sessão", "warning", 3500);

    next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/lances-gravanois");
  } else {
    next();
  }
});

export default router;
