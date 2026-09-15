import { useEffect, useState } from 'react'

/** Explicitly distinguishes "the app itself is offline" from "this stream
 * is unavailable" (the player has its own error state for that) — the PRD
 * calls this distinction out directly. */
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="sticky top-0 z-50 bg-warning px-4 py-2 text-center text-xs font-medium text-black">
      You're offline — showing saved content. Live TV and playback need a connection.
    </div>
  )
}
