import type { ContinueWatchingItem } from '../../lib/types'

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem
  onPlay: (item: ContinueWatchingItem) => void
}

export default function ContinueWatchingCard({ item, onPlay }: ContinueWatchingCardProps) {
  const progress = item.duration_seconds
    ? Math.min(100, Math.round((item.position_seconds / item.duration_seconds) * 100))
    : 0

  return (
    <button onClick={() => onPlay(item)} className="flex w-full flex-col gap-2 text-left">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-card">
        {item.poster_url ? (
          <img src={item.poster_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">No artwork</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div>
        <p className="truncate text-xs font-medium text-text">{item.title}</p>
        {item.episode_number && <p className="text-[11px] text-muted">Episode {item.episode_number}</p>}
      </div>
    </button>
  )
}
