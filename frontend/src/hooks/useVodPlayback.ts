import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { recordHistory } from '../lib/history'
import { getVodPlayback } from '../lib/vod'
import { getProgress } from '../lib/vodProgress'
import type { VodPlaybackInfo } from '../lib/types'

/** Same login-gated play flow as useChannelPlayback, but for a VOD movie or
 * a specific episode (episodeId omitted plays the movie itself) — also
 * resolves the stored resume position and records the watch. */
export function useVodPlayback() {
  const { requireAuth } = useAuth()
  const [playback, setPlayback] = useState<VodPlaybackInfo | null>(null)
  const [startAt, setStartAt] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function play(id: string, episodeId?: string) {
    requireAuth(() => {
      setError(null)
      Promise.all([
        getVodPlayback(id, episodeId),
        getProgress(id, episodeId).catch(() => ({ position_seconds: 0, duration_seconds: null, completed: 0 })),
      ])
        .then(([playbackInfo, progress]) => {
          setPlayback(playbackInfo)
          setStartAt(progress.completed ? 0 : progress.position_seconds)
          recordHistory(episodeId ? 'episode' : 'movie', episodeId ?? id)
        })
        .catch(() => setError('Could not start playback.'))
    })
  }

  function close() {
    setPlayback(null)
    setStartAt(0)
  }

  return { playback, startAt, error, play, close }
}
