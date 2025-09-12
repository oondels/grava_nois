export function ensureGoogleClientScript(): Promise<void> {
  const src = 'https://accounts.google.com/gsi/client'
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      if ((existing as any)._loaded) return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')))
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    ;(s as any)._loaded = false
    s.onload = () => { (s as any)._loaded = true; resolve() }
    s.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(s)
  })
}

