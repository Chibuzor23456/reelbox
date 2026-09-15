export interface ChannelSummary {
  id: string
  name: string
  logo_url: string | null
  country: string | null
  category: string | null
  status: 'active' | 'unavailable' | 'disabled'
}

export interface PlaybackInfo {
  id: string
  name: string
  logo_url: string | null
  url: string
  mode: 'direct' | 'relay'
  status: 'active' | 'unavailable' | 'disabled'
}

export type VodType = 'movie' | 'series'
export type VodStatus = 'active' | 'unavailable' | 'disabled'

export interface VodItemSummary {
  id: string
  type: VodType
  title: string
  poster_url: string | null
  year: number | null
  genre: string | null
  runtime_minutes: number | null
  status: VodStatus
}

export interface VodEpisode {
  id: string
  episode_number: number
  title: string | null
  synopsis: string | null
  duration_minutes: number | null
}

export interface VodSeason {
  id: string
  season_number: number
  episodes: VodEpisode[]
}

export interface VodItemDetail {
  id: string
  type: VodType
  title: string
  synopsis: string | null
  poster_url: string | null
  backdrop_url: string | null
  year: number | null
  genre: string | null
  runtime_minutes: number | null
  status: VodStatus
  seasons?: VodSeason[]
}

export interface VodPlaybackInfo {
  id: string
  title: string | null
  url: string
  duration_minutes?: number | null
}

export type CatalogItemType = 'channel' | 'movie' | 'series' | 'episode'

/** A resolved favorites/history entry — shape varies slightly by item_type
 * (channels have `name`/`logo_url`, VOD has `title`/`poster_url`, episodes
 * carry both their parent series' identity and their own episode info). */
export interface CatalogItem {
  item_type: CatalogItemType
  id: string
  name?: string
  title?: string
  logo_url?: string | null
  poster_url?: string | null
  year?: number | null
  genre?: string | null
  runtime_minutes?: number | null
  episode_id?: string
  episode_number?: number
  episode_title?: string | null
  status: VodStatus
}

export interface ContinueWatchingItem {
  id: string
  type: VodType
  title: string | null
  poster_url: string | null
  year: number | null
  genre: string | null
  episode_id: string | null
  episode_number: number | null
  episode_title: string | null
  position_seconds: number
  duration_seconds: number | null
}

export interface RecommendationSection {
  key: string
  title: string
  items: CatalogItem[]
}

export interface EpgProgramme {
  title: string
  description?: string | null
  start_time: string
  end_time: string
}

export interface EpgNowNext {
  now: EpgProgramme | null
  next: EpgProgramme | null
}

export interface EpgGuideChannel {
  id: string
  name: string
  logo_url: string | null
  category: string | null
  country: string | null
  programmes: EpgProgramme[]
}

export interface EpgSearchResult extends EpgProgramme {
  channel_id: string
  channel_name: string
  logo_url: string | null
}
