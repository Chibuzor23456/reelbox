import { api } from './api'
import type { ContinueWatchingItem } from './types'

export interface VodProgress {
  position_seconds: number
  duration_seconds: number | null
  completed: number
}

export function getProgress(vodItemId: string, episodeId?: string) {
  const query = new URLSearchParams({ vod_item_id: vodItemId })
  if (episodeId) query.set('vod_episode_id', episodeId)
  return api.get<VodProgress>(`/vod/progress?${query.toString()}`)
}

/** Fire-and-forget — a failed progress save shouldn't interrupt playback. */
export function saveProgress(
  vodItemId: string,
  positionSeconds: number,
  durationSeconds: number | null,
  episodeId?: string,
) {
  api
    .post('/vod/progress', {
      vod_item_id: vodItemId,
      vod_episode_id: episodeId ?? null,
      position_seconds: Math.floor(positionSeconds),
      duration_seconds: durationSeconds !== null ? Math.floor(durationSeconds) : null,
    })
    .catch(() => {})
}

export function listContinueWatching() {
  return api.get<{ items: ContinueWatchingItem[] }>('/vod/continue-watching')
}
