import { api } from './api'
import type { CatalogItem, CatalogItemType } from './types'

/** Fire-and-forget — a failed history write shouldn't block or interrupt playback. */
export function recordHistory(itemType: CatalogItemType, itemId: string) {
  api.post('/history', { item_type: itemType, item_id: itemId }).catch(() => {})
}

export function listHistory() {
  return api.get<{ items: CatalogItem[] }>('/history')
}
