import { useEffect, useState } from 'react'
import CatalogItemCard from '../components/ui/CatalogItemCard'
import VideoPlayer from '../components/player/VideoPlayer'
import RequireAuth from '../components/RequireAuth'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { listFavorites } from '../lib/favorites'
import type { CatalogItem } from '../lib/types'

function MyListContent() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const { playback, error, play, close } = useChannelPlayback()

  useEffect(() => {
    listFavorites()
      .then((res) => setItems(res.items))
      .catch(() => setLoadError('Could not load My List.'))
  }, [])

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text">My List</h1>

      {playback && (
        <div className="mb-8 max-w-3xl">
          <VideoPlayer src={playback.url} title={playback.name} live onClose={close} />
        </div>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {items.map((item) => (
          <CatalogItemCard key={`${item.item_type}:${item.id}`} item={item} onPlayChannel={play} />
        ))}
      </div>

      {!loadError && items.length === 0 && (
        <p className="text-sm text-muted">Nothing saved yet — add channels, movies or series to see them here.</p>
      )}
    </div>
  )
}

export default function MyList() {
  return (
    <RequireAuth title="My List">
      <MyListContent />
    </RequireAuth>
  )
}
