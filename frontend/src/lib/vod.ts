import { api } from './api'
import type { VodItemDetail, VodItemSummary, VodPlaybackInfo, VodType } from './types'

export function listVod(params: { type?: VodType; genre?: string } = {}) {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.genre) query.set('genre', params.genre)
  const qs = query.toString()
  return api.get<{ items: VodItemSummary[] }>(`/vod${qs ? `?${qs}` : ''}`)
}

export function getVodDetail(id: string) {
  return api.get<VodItemDetail>(`/vod/detail?id=${encodeURIComponent(id)}`)
}

export function getVodPlayback(id: string, episodeId?: string) {
  const query = new URLSearchParams({ id })
  if (episodeId) query.set('episode_id', episodeId)
  return api.get<VodPlaybackInfo>(`/vod/playback?${query.toString()}`)
}
