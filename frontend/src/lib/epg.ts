import { api } from './api'
import type { EpgGuideChannel, EpgNowNext, EpgProgramme, EpgSearchResult } from './types'

export function getNowNext(channelId: string) {
  return api.get<EpgNowNext>(`/epg/now-next?channel_id=${encodeURIComponent(channelId)}`)
}

export function getSchedule(channelId: string, date?: string) {
  const query = new URLSearchParams({ channel_id: channelId })
  if (date) query.set('date', date)
  return api.get<{ date: string; programmes: EpgProgramme[] }>(`/epg/schedule?${query.toString()}`)
}

export function getGuide(date?: string) {
  const query = new URLSearchParams()
  if (date) query.set('date', date)
  const qs = query.toString()
  return api.get<{ date: string; channels: EpgGuideChannel[] }>(`/epg/guide${qs ? `?${qs}` : ''}`)
}

export function searchEpg(query: string) {
  return api.get<{ results: EpgSearchResult[] }>(`/epg/search?q=${encodeURIComponent(query)}`)
}
