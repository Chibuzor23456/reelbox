import { Link } from 'react-router-dom'
import type { CatalogItem, ChannelSummary } from '../../lib/types'

interface CatalogItemCardProps {
  item: CatalogItem
  onPlayChannel: (channel: ChannelSummary) => void
}

/** Renders one favorites/history/recommendation entry, whatever its
 * item_type — channels play directly, movies/series/episodes link to their
 * detail page (an episode links back to its parent series). */
export default function CatalogItemCard({ item, onPlayChannel }: CatalogItemCardProps) {
  if (item.item_type === 'channel') {
    return (
      <button
        onClick={() =>
          onPlayChannel({
            id: item.id,
            name: item.name ?? '',
            logo_url: item.logo_url ?? null,
            country: null,
            category: null,
            status: item.status,
          })
        }
        className="flex w-full flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary"
      >
        {item.logo_url ? (
          <img src={item.logo_url} alt="" className="h-12 w-12 object-contain" />
        ) : (
          <div className="h-12 w-12 rounded bg-surface" />
        )}
        <span className="line-clamp-2 text-center text-xs text-text">{item.name}</span>
      </button>
    )
  }

  const linkTo = item.item_type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`

  return (
    <Link to={linkTo} className="flex w-full flex-col gap-2">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-card">
        {item.poster_url ? (
          <img src={item.poster_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">No artwork</div>
        )}
      </div>
      <p className="truncate text-xs font-medium text-text">{item.title}</p>
      {item.item_type === 'episode' && item.episode_number && (
        <p className="text-[11px] text-muted">Episode {item.episode_number}</p>
      )}
    </Link>
  )
}
