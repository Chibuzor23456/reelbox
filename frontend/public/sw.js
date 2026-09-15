// ReelBox service worker.
//
// Scope, deliberately: cache the app shell and PUBLIC catalogue metadata
// (channels/VOD/EPG listings) so browsing works offline after the app has
// been opened online at least once. It does NOT precache hashed build
// files by filename (this is a hand-authored worker, not build-integrated,
// so it populates its cache from real traffic instead of a build manifest).
//
// Explicitly excluded, on purpose:
//   - /auth/* — session-sensitive, never cached.
//   - /channels/relay-* and any playback-resolution response — video is
//     out of scope for offline (PRD: "No arbitrary offline video downloads
//     in V1"), and a cached playback URL could go stale anyway.
//   - Personal data (favorites, history, continue-watching, recommendations)
//     — caching these by URL alone risks leaking one user's cached data to
//     the next person who logs in on the same device/browser. If this ever
//     gets added, it needs per-user cache namespacing, not a URL-keyed cache.

const VERSION = 'v2'
const SHELL_CACHE = `reelbox-shell-${VERSION}`
const API_CACHE = `reelbox-api-${VERSION}`
const IMAGE_CACHE = `reelbox-images-${VERSION}`
const KNOWN_CACHES = [SHELL_CACHE, API_CACHE, IMAGE_CACHE]

const CACHEABLE_API_PATTERNS = [
  /\/channels(\?|$)/,
  /\/vod(\?|$)/,
  /\/vod\/detail(\?|$)/,
  /\/epg\/guide(\?|$)/,
  /\/epg\/now-next(\?|$)/,
  /\/epg\/schedule(\?|$)/,
]

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_API_CACHE') {
    event.waitUntil(caches.delete(API_CACHE))
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.pathname.includes('/auth/') || url.pathname.includes('/relay-') || url.pathname.includes('/playback')) {
    return
  }
  if (
    url.pathname.includes('/favorites') ||
    url.pathname.includes('/history') ||
    url.pathname.includes('/continue-watching') ||
    url.pathname.includes('/recommendations') ||
    url.pathname.includes('/admin/')
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request))
    return
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || /\.(js|css|png|svg|webmanifest)$/.test(url.pathname))) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  if (CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search))) {
    // Network-first, not stale-while-revalidate: the catalogue changes as
    // ingestion runs, and a stale cached response (e.g. a category filter
    // captured while a batch job had barely started) would otherwise get
    // served forever to an online client. Cache is purely the offline
    // fallback here.
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return cached || Response.error()
  }
}

async function networkFirstWithShellFallback(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return (await cache.match(request)) || (await cache.match('/index.html')) || Response.error()
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    return cached || Response.error()
  }
}
