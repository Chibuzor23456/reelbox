import { useFavorite } from '../../hooks/useFavorite'
import type { ChannelSummary } from '../../lib/types'

interface ChannelCardProps {
  channel: ChannelSummary
  onPlay: (channel: ChannelSummary) => void
}

export default function ChannelCard({ channel, onPlay }: ChannelCardProps) {
  const { isFavorited, toggle } = useFavorite('channel', channel.id)

  return (
    <div className="relative w-full">
      <button
        onClick={() => onPlay(channel)}
        className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary"
      >
        <div className="flex h-16 items-center justify-center">
          {channel.logo_url ? (
            <img src={channel.logo_url} alt="" className="max-h-16 max-w-full object-contain" />
          ) : (
            <div className="h-12 w-12 rounded bg-surface" />
          )}
        </div>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-primary" />
          <span className="truncate text-xs font-medium text-text">{channel.name}</span>
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        aria-label={isFavorited ? 'Remove from My List' : 'Add to My List'}
        className={`absolute right-1 top-1 flex min-h-9 min-w-9 items-center justify-center rounded bg-black/60 px-2 text-[10px] font-semibold ${
          isFavorited ? 'text-primary' : 'text-white'
        }`}
      >
        {isFavorited ? '✓' : '+'}
      </button>
    </div>
  )
}
