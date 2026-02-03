import { createRouter, createWebHistory } from "vue-router";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
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
    meta: { requiresAuth: true },
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
    path: "/maintenance",
    name: "Maintenance",
    component: () => import("@/pages/MaintenanceMode.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    beforeEnter: async (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore();
      await authStore.ensureReady();

      if (!authStore.isAdmin) return next("/");
      return next();
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("@/pages/admin/AdminDashboard.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/pages/admin/AdminUsers.vue"),
      },
      {
        path: "clients",
        name: "AdminClients",
        component: () => import("@/pages/admin/AdminClients.vue"),
      },
      {
        path: "venues",
        name: "AdminVenues",
        component: () => import("@/pages/admin/AdminVenues.vue"),
      },
    ],
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
  const anyErr: any = err as any;
  const msg = String((anyErr && anyErr.message) || err || "");
  const name = String((anyErr && anyErr.name) || "");
  const isChunkLoadError =
    /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|ERR_MODULE_NOT_FOUND/i.test(
      msg
    ) || /ChunkLoadError/i.test(name);
  if (isChunkLoadError) {
    // Em produção isso pode ocorrer após atualização do app/PWA.
    // Recarrega para alinhar HTML/assets com os chunks corretos.
    console.warn("[router] chunk load error; reloading", { name, msg });
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
  // Redireciona toda navegação para a página de manutenção quando habilitado por env var
  const isMaintenance = ["true", "1", "on", "yes"].includes(
    String(import.meta.env.VITE_MAINTENANCE_MODE || "").toLowerCase()
  );
  if (isMaintenance && to.path !== "/maintenance") {
    return next("/maintenance");
  }

  const authStore = useAuthStore();
  const { showSnackbar } = useSnackbar();

  await authStore.ensureReady();


  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      if (typeof window !== "undefined" && to.fullPath) {
        localStorage.setItem("postAuthRedirect", to.fullPath);
      }
    } catch { }
    console.log("usuario nao autenticado, redirecionando para /login");
    // Notifica o usuário sobre a necessidade de login
    showSnackbar("Faça login para acessar esta sessão", "warning", 3500);

    return next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next("/lances-gravanois");
  } else {
    return next();
  }
});

export default router;
