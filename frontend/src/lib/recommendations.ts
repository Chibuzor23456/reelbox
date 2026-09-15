import { api } from './api'
import type { RecommendationSection } from './types'

export function getRecommendations() {
  return api.get<{ sections: RecommendationSection[] }>('/recommendations')
}
