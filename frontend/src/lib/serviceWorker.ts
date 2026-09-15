export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support and installability degrade gracefully if this fails.
    })
  })
}

/** Defense in depth: even though the service worker doesn't cache personal
 * data today, clear its runtime cache on logout so nothing lingers if that
 * ever changes. */
export function clearServiceWorkerCaches(): void {
  navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_API_CACHE' })
}
