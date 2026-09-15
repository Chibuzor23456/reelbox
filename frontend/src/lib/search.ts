import { api } from './api'
import type { EpgSearchResult, RecommendationSection } from './types'

export function searchAll(query: string) {
  return api.get<{ query: string; sections: RecommendationSection[]; programmes: EpgSearchResult[] }>(
    `/search?q=${encodeURIComponent(query)}`,
  )
}
