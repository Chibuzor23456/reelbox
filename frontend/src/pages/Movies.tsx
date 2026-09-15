import { useEffect, useState } from 'react'
import VodCard from '../components/ui/VodCard'
import { listVod } from '../lib/vod'
import type { VodItemSummary } from '../lib/types'

export default function Movies() {
  const [items, setItems] = useState<VodItemSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    listVod({ type: 'movie' })
      .then((res) => setItems(res.items))
      .catch(() => setLoadError('Could not load movies.'))
  }, [])

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text">Movies</h1>

      {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {items.map((item) => (
          <VodCard key={item.id} item={item} />
        ))}
      </div>

      {!loadError && items.length === 0 && (
        <p className="text-sm text-muted">No movies yet — the catalogue is still being ingested.</p>
      )}
    </div>
  )
}
