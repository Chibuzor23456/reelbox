import { api } from './api'
import type { ChannelSummary, PlaybackInfo } from './types'

export interface ChannelFacets {
  categories: { category: string; total: number }[]
  countries: { country: string; total: number }[]
}

export function listChannels(params: { category?: string; country?: string; shelf?: string; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.category) query.set('category', params.category)
  if (params.country) query.set('country', params.country)
  if (params.shelf) query.set('shelf', params.shelf)
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return api.get<{ channels: ChannelSummary[] }>(`/channels${qs ? `?${qs}` : ''}`)
}

export function getChannelFacets() {
  return api.get<ChannelFacets>('/channels/facets')
}

export function getPlayback(channelId: string) {
  return api.get<PlaybackInfo>(`/channels/playback?id=${encodeURIComponent(channelId)}`)
}
