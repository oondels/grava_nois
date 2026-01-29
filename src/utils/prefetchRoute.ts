import router from '@/router'

export function prefetchRoute(path: string) {
  try {
    const rec = router.getRoutes().find(r => r.path === path)
    const comp: any = (rec as any)?.components?.default || (rec as any)?.component
    if (typeof comp === 'function') {
      // dispara o dynamic import
      const p = comp()
      // Evita unhandled promise rejection se o chunk falhar (offline/SW/cache)
      if (p && typeof p.then === 'function') {
        p.catch(() => {})
      }
    }
  } catch {
    // silencioso
  }
}

export function prefetchMany(paths: string[]) {
  paths.forEach(prefetchRoute)
}

