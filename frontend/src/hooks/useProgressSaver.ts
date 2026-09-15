import { useEffect, useRef } from 'react'
import { saveProgress } from '../lib/vodProgress'

const SAVE_INTERVAL_SECONDS = 10

/** Wraps saveProgress so it fires at most once per ~10s of playback instead
 * of on every timeupdate tick (which fires several times a second). Resets
 * its throttle whenever the item/episode identity changes, so switching
 * episodes doesn't inherit the previous episode's save timing. */
export function useProgressSaver(vodItemId: string, episodeId?: string) {
  const lastSavedAt = useRef(0)
  const identityRef = useRef('')

  useEffect(() => {
    const identity = `${vodItemId}:${episodeId ?? ''}`
    if (identityRef.current !== identity) {
      identityRef.current = identity
      lastSavedAt.current = 0
    }
  }, [vodItemId, episodeId])

  function onProgress(currentTime: number, duration: number) {
    if (currentTime - lastSavedAt.current >= SAVE_INTERVAL_SECONDS) {
      lastSavedAt.current = currentTime
      saveProgress(vodItemId, currentTime, duration, episodeId)
    }
  }

  function flush(currentTime: number, duration: number) {
    saveProgress(vodItemId, currentTime, duration, episodeId)
  }

  return { onProgress, flush }
}
