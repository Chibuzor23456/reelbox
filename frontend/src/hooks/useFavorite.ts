import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addFavorite, listFavorites, removeFavorite } from '../lib/favorites'
import type { CatalogItemType } from '../lib/types'

export function useFavorite(itemType: CatalogItemType, itemId: string) {
  const { status, requireAuth } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    listFavorites()
      .then((res) => setIsFavorited(res.items.some((i) => i.id === itemId)))
      .catch(() => {})
  }, [status, itemId])

  function toggle() {
    requireAuth(() => {
      if (isFavorited) {
        removeFavorite(itemType, itemId).then(() => setIsFavorited(false))
      } else {
        addFavorite(itemType, itemId).then(() => setIsFavorited(true))
      }
    })
  }

  return { isFavorited, toggle }
}
