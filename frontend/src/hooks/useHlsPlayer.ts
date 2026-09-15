import type Hls from 'hls.js'
import { useEffect, useState, type RefObject } from 'react'

export type PlayerStatus = 'loading' | 'playing' | 'paused' | 'error'

interface UseHlsPlayerOptions {
  /** Seconds to seek to once playback is ready — used for VOD resume. */
  startAt?: number
  /** Called on every timeupdate tick; the caller decides how often to
   * actually persist it (see useProgressSaver). */
  onProgress?: (currentTime: number, duration: number) => void
}

interface UseHlsPlayerResult {
  status: PlayerStatus
  errorMessage: string | null
  retry: () => void
}

const MAX_NETWORK_RETRIES = 3

export function useHlsPlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string | null,
  options: UseHlsPlayerOptions = {},
): UseHlsPlayerResult {
  const { startAt, onProgress } = options
  const [status, setStatus] = useState<PlayerStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) {
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    const seekToStart = () => {
      if (startAt && startAt > 0) {
        video.currentTime = startAt
      }
    }

    const handlePlaying = () => setStatus('playing')
    const handlePause = () => setStatus((s) => (s === 'error' ? s : 'paused'))
    const handleWaiting = () => setStatus((s) => (s === 'error' ? s : 'loading'))
    const handleTimeUpdate = () => {
      if (onProgress && Number.isFinite(video.duration)) {
        onProgress(video.currentTime, video.duration)
      }
    }
    const handleLoadedMetadata = () => seekToStart()

    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    let hls: Hls | null = null
    let cancelled = false

    async function setup() {
      if (video!.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari plays HLS natively — no need to load hls.js at all.
        video!.src = src!
        video!.play().catch(() => {
          // Autoplay blocked (no 'pause' event fires here since playback
          // never started) — leave the UI in an unambiguous, tappable state
          // rather than stuck showing the loading spinner forever.
          if (!cancelled) setStatus('paused')
        })
        return
      }

      // Only fetch the hls.js bundle for the browsers that actually need it,
      // and only once someone is about to watch something.
      const { default: HlsCtor } = await import('hls.js')
      if (cancelled) {
        return
      }

      if (!HlsCtor.isSupported()) {
        setStatus('error')
        setErrorMessage('HLS playback is not supported in this browser.')
        return
      }

      let networkRetries = 0
      hls = new HlsCtor({ maxBufferLength: 30 })
      hls.loadSource(src!)
      hls.attachMedia(video!)

      hls.on(HlsCtor.Events.MANIFEST_PARSED, () => {
        seekToStart()
        video!.play().catch(() => {
          if (!cancelled) setStatus('paused')
        })
      })

      hls.on(HlsCtor.Events.ERROR, (_event, data) => {
        if (!data.fatal) {
          return
        }

        switch (data.type) {
          case HlsCtor.ErrorTypes.NETWORK_ERROR:
            if (networkRetries < MAX_NETWORK_RETRIES) {
              networkRetries += 1
              hls?.startLoad()
            } else {
              setStatus('error')
              setErrorMessage('Lost connection to this channel.')
              hls?.destroy()
            }
            break
          case HlsCtor.ErrorTypes.MEDIA_ERROR:
            hls?.recoverMediaError()
            break
          default:
            setStatus('error')
            setErrorMessage('This channel is unavailable right now.')
            hls?.destroy()
        }
      })
    }

    setup()

    return () => {
      cancelled = true
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      hls?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, src, retryToken])

  return {
    status,
    errorMessage,
    retry: () => setRetryToken((t) => t + 1),
  }
}
