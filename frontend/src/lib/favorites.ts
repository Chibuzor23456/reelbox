import { api } from './api'
import type { CatalogItem, CatalogItemType } from './types'

export function listFavorites() {
  return api.get<{ items: CatalogItem[] }>('/favorites')
}

export function addFavorite(itemType: CatalogItemType, itemId: string) {
  return api.post<{ status: string }>('/favorites', { item_type: itemType, item_id: itemId })
}

export function removeFavorite(itemType: CatalogItemType, itemId: string) {
  return api.del<{ status: string }>(
    `/favorites?item_type=${encodeURIComponent(itemType)}&item_id=${encodeURIComponent(itemId)}`,
  )
}
