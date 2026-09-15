import { useEffect, type ReactNode } from 'react'

interface PlayerOverlayProps {
  onClose: () => void
  children: ReactNode
}

/** Full-screen playback takeover — clicking Play should feel like it opens
 * its own player, not drop a video inline into the page flow. */
export default function PlayerOverlay({ onClose, children }: PlayerOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-0 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl">{children}</div>
    </div>
  )
}
