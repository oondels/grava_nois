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
  // usa a base do Vite para suportar deploy em subpaths
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Evita tela branca quando um chunk dinâmico falha ao carregar (PWA/atualização)
router.onError((err) => {
  const msg = String((err && (err as any).message) || err || "");
  const isChunkLoadError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    msg
  );
  if (isChunkLoadError) {
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.update())))
          .finally(() => window.location.reload());
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }
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
