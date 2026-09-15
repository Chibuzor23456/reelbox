import { useEffect, useState, type RefObject } from 'react'

// The Cast SDK has no first-party TypeScript types without an extra
// dependency for a feature-detected, optional enhancement — contained to
// `any` here rather than pulling one in for this alone.
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void
    chrome?: any
    cast?: any
  }
}

let castSdkPromise: Promise<boolean> | null = null

function loadCastSdk(): Promise<boolean> {
  if (castSdkPromise) return castSdkPromise

  castSdkPromise = new Promise((resolve) => {
    if (window.chrome?.cast?.isAvailable) {
      resolve(true)
      return
    }

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (!isAvailable) {
        resolve(false)
        return
      }
      const context = window.cast.framework.CastContext.getInstance()
      // The default media receiver plays generic media (HLS included) with
      // no Google Cast console app registration required.
      context.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      })
      resolve(true)
    }

    const script = document.createElement('script')
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return castSdkPromise
}

/** AirPlay (native WebKit API, Safari-only) and Chromecast (Google's
 * default media receiver, Chrome-only) — both feature-detected so they
 * simply don't render anywhere unsupported. */
export function useCasting(videoRef: RefObject<HTMLVideoElement | null>, src: string | null, title: string) {
  const [airPlayAvailable, setAirPlayAvailable] = useState(false)
  const [castAvailable, setCastAvailable] = useState(false)

  useEffect(() => {
    const video = videoRef.current as (HTMLVideoElement & { webkitShowPlaybackTargetPicker?: () => void }) | null
    if (typeof video?.webkitShowPlaybackTargetPicker === 'function') {
      setAirPlayAvailable(true)
    }
  }, [videoRef])

  useEffect(() => {
    let cancelled = false
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg|OPR/.test(navigator.userAgent)
    if (!isChrome) {
      return
    }
    loadCastSdk().then((available) => {
      if (!cancelled) setCastAvailable(available)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function showAirPlayPicker() {
    const video = videoRef.current as (HTMLVideoElement & { webkitShowPlaybackTargetPicker?: () => void }) | null
    video?.webkitShowPlaybackTargetPicker?.()
  }

  function startCasting() {
    if (!src) return
    const context = window.cast?.framework?.CastContext?.getInstance()
    if (!context) return

    context
      .requestSession()
      .then(() => {
        const session = context.getCurrentSession()
        const mediaInfo = new window.chrome.cast.media.MediaInfo(src, 'application/x-mpegurl')
        mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata()
        mediaInfo.metadata.title = title
        const request = new window.chrome.cast.media.LoadRequest(mediaInfo)
        session.loadMedia(request).catch(() => {})
      })
      .catch(() => {
        // Picker was dismissed or no devices were found — nothing to surface as an error.
      })
  }

  return { airPlayAvailable, castAvailable, showAirPlayPicker, startCasting }
}
