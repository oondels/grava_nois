import router from '@/router'

export function prefetchRoute(path: string) {
  try {
    const rec = router.getRoutes().find(r => r.path === path)
    const comp: any = (rec as any)?.components?.default || (rec as any)?.component
    if (typeof comp === 'function') {
      // dispara o dynamic import
      comp()
    }
  } catch {
    // silencioso
  }
}

export function prefetchMany(paths: string[]) {
  paths.forEach(prefetchRoute)
}

