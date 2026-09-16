import { useEffect, useRef, useState } from 'react'
import { useCasting } from '../../hooks/useCasting'
import { useHlsPlayer } from '../../hooks/useHlsPlayer'
import {
  AirPlayIcon,
  CastIcon,
  CloseIcon,
  Forward10Icon,
  FullscreenIcon,
  PauseIcon,
  PipIcon,
  PlayIcon,
  Replay10Icon,
  VolumeMuteIcon,
  VolumeUpIcon,
} from './icons'

interface VideoPlayerProps {
  src: string | null
  title: string
  live?: boolean
  onClose?: () => void
  /** Resume position, in seconds — VOD only. */
  startAt?: number
  onProgress?: (currentTime: number, duration: number) => void
}

const ICON_SIZE = 'h-5 w-5'
const AUTO_HIDE_MS = 3000
const SEEK_SECONDS = 10

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export default function VideoPlayer({
  src,
  title,
  live = false,
  onClose,
  startAt,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { status, errorMessage, retry } = useHlsPlayer(videoRef, src, { startAt, onProgress })
  const { airPlayAvailable, castAvailable, showAirPlayPicker, startCasting } = useCasting(videoRef, src, title)
  const [muted, setMuted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDuration = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleDuration)
    video.addEventListener('durationchange', handleDuration)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleDuration)
      video.removeEventListener('durationchange', handleDuration)
    }
  }, [src])

  useEffect(() => {
    clearHideTimer()
    if (controlsVisible && status === 'playing') {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS)
    }
    return clearHideTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlsVisible, status])

  function clearHideTimer() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  function wake() {
    setControlsVisible(true)
  }

  function handleVideoTap() {
    // Checks the real <video> element, not the React `status` string — status
    // briefly reads 'loading' during ordinary live-stream buffering blips
    // even while the video is still actually playing, and toggling off
    // `status !== 'playing'` there would call togglePlay() and pause a
    // perfectly fine live stream just because someone tapped to see the
    // controls (showing up as a confusing delay before it resumed).
    const video = videoRef.current
    if (video && video.paused) {
      // Genuinely not playing (blocked autoplay, or actually paused) — this
      // tap is a fresh user gesture, so retry play from right here.
      togglePlay()
      setControlsVisible(true)
      return
    }
    setControlsVisible((v) => !v)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
    wake()
  }

  function seekBy(deltaSeconds: number) {
    const video = videoRef.current
    if (!video) return
    const max = Number.isFinite(video.duration) ? video.duration : Infinity
    video.currentTime = Math.min(Math.max(0, video.currentTime + deltaSeconds), max)
    wake()
  }

  function handleSeekBarChange(value: number) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value
    setCurrentTime(value)
    wake()
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    wake()
  }

  function toggleFullscreen() {
    const video = videoRef.current
    if (!video) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      video.requestFullscreen().catch(() => {})
    }
    wake()
  }

  function togglePip() {
    const video = videoRef.current
    if (!video) return
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {})
    } else if (document.pictureInPictureEnabled) {
      video.requestPictureInPicture().catch(() => {})
    }
    wake()
  }

  const canSeek = !live && duration > 0

  return (
    <div
      className="group relative aspect-video w-full select-none overflow-hidden rounded-lg bg-black"
      onMouseMove={wake}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <video ref={videoRef} className="h-full w-full" playsInline x-webkit-airplay="allow" />

      {/* Tap target for reveal/hide — sits above the video, below every control. */}
      <button
        type="button"
        aria-label={controlsVisible ? 'Hide controls' : 'Show controls'}
        onClick={handleVideoTap}
        className="absolute inset-0 z-[5] cursor-default"
      />

      {live && status !== 'error' && (
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          LIVE
        </span>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center">
          <p className="text-sm text-white">{errorMessage ?? 'Playback failed.'}</p>
          <button
            onClick={retry}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Retry
          </button>
        </div>
      )}

      {/* Center cluster: big play/pause plus ±10s skip — the tap-to-reveal
          interaction the mobile player was missing entirely. */}
      {status !== 'error' && (
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-6 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 transition-opacity duration-200'
          }`}
        >
          {canSeek && (
            <button
              onClick={() => seekBy(-SEEK_SECONDS)}
              aria-label="Rewind 10 seconds"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-transform active:scale-90"
            >
              <Replay10Icon className="h-7 w-7" />
            </button>
          )}
          <button
            onClick={togglePlay}
            aria-label={status === 'playing' ? 'Pause' : 'Play'}
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white transition-transform active:scale-90"
          >
            {status === 'playing' ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
          </button>
          {canSeek && (
            <button
              onClick={() => seekBy(SEEK_SECONDS)}
              aria-label="Forward 10 seconds"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-transform active:scale-90"
            >
              <Forward10Icon className="h-7 w-7" />
            </button>
          )}
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-4 text-white sm:px-2 ${
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0 transition-opacity duration-200'
        }`}
      >
        {canSeek && (
          <div className="flex items-center gap-2 px-1 text-[11px] text-white/80 sm:px-1.5">
            <span className="tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={Math.min(currentTime, duration)}
              onChange={(e) => handleSeekBarChange(Number(e.target.value))}
              className="h-1 flex-1 accent-primary"
              aria-label="Seek"
            />
            <span className="tabular-nums">{formatTime(duration)}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <button
            onClick={togglePlay}
            aria-label={status === 'playing' ? 'Pause' : 'Play'}
            className="flex min-h-11 min-w-11 flex-none items-center justify-center"
          >
            {status === 'playing' ? <PauseIcon className={ICON_SIZE} /> : <PlayIcon className={ICON_SIZE} />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex min-h-11 min-w-11 flex-none items-center justify-center"
          >
            {muted ? <VolumeMuteIcon className={ICON_SIZE} /> : <VolumeUpIcon className={ICON_SIZE} />}
          </button>
          <span className="min-w-0 flex-1 truncate px-1 text-sm text-white/80">{title}</span>
          {airPlayAvailable && (
            <button
              onClick={showAirPlayPicker}
              aria-label="AirPlay"
              className="flex min-h-11 min-w-11 flex-none items-center justify-center"
            >
              <AirPlayIcon className={ICON_SIZE} />
            </button>
          )}
          {castAvailable && (
            <button
              onClick={startCasting}
              aria-label="Cast"
              className="flex min-h-11 min-w-11 flex-none items-center justify-center"
            >
              <CastIcon className={ICON_SIZE} />
            </button>
          )}
          <button
            onClick={togglePip}
            aria-label="Picture in picture"
            className="hidden min-h-11 min-w-11 flex-none items-center justify-center sm:flex"
          >
            <PipIcon className={ICON_SIZE} />
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="flex min-h-11 min-w-11 flex-none items-center justify-center"
          >
            <FullscreenIcon className={ICON_SIZE} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close player"
              className="flex min-h-11 min-w-11 flex-none items-center justify-center"
            >
              <CloseIcon className={ICON_SIZE} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
