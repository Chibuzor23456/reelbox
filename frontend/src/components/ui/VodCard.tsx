import { Link } from 'react-router-dom'
import type { VodItemSummary } from '../../lib/types'

export default function VodCard({ item }: { item: VodItemSummary }) {
  return (
    <Link
      to={`/${item.type === 'movie' ? 'movies' : 'series'}/${item.id}`}
      className="group flex w-full flex-col gap-2"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-card transition-colors group-hover:border-primary">
        {item.poster_url ? (
          <img src={item.poster_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">No artwork</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {item.type}
        </span>
      </div>
      <div>
        <p className="truncate text-xs font-medium text-text">{item.title}</p>
        <p className="text-[11px] text-muted">
          {[item.year, item.runtime_minutes ? `${item.runtime_minutes}m` : null].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
