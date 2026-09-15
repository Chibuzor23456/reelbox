import compression from 'compression'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = process.env.PORT || 3000

const app = express()

app.use(compression())

// Hashed build assets (filenames change every build) — cache aggressively.
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }),
)

// The service worker itself must never sit in an HTTP cache — a stale copy
// delays every future SW update from ever reaching a returning visitor.
app.get('/sw.js', (_req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(distDir, 'sw.js'))
})

// Everything else in dist/ (favicon, manifest, etc.) — short cache.
app.use(express.static(distDir, { index: false, maxAge: '1h' }))

// SPA fallback — React Router resolves the route client-side.
app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`ReelBox frontend listening on port ${port}`)
})
