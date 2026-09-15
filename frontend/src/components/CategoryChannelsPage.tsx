import { useEffect, useState } from 'react'
import ChannelCard from './ui/ChannelCard'
import PlayerOverlay from './player/PlayerOverlay'
import VideoPlayer from './player/VideoPlayer'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { listChannels } from '../lib/channels'
import type { ChannelSummary } from '../lib/types'

interface CategoryChannelsPageProps {
  title: string
  category?: string
  shelf?: string
  description: string
}

/** Shared grid+player page for a single fixed live category or curated shelf
 * (Sports, News, Nigeria, Africa, etc.) — same data flow as Live TV's
 * category grid, just scoped to one filter instead of letting the visitor
 * pick. */
export default function CategoryChannelsPage({ title, category, shelf, description }: CategoryChannelsPageProps) {
  const [channels, setChannels] = useState<ChannelSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const { playback, error, play, close } = useChannelPlayback()

  useEffect(() => {
    listChannels({ category, shelf, limit: 200 })
      .then((res) => setChannels(res.channels))
      .catch(() => setLoadError(`Could not load ${title.toLowerCase()} channels.`))
  }, [category, shelf, title])

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-1 text-2xl font-semibold text-text">{title}</h1>
      <p className="mb-4 text-sm text-muted">{description}</p>

      {playback && (
        <PlayerOverlay onClose={close}>
          <VideoPlayer src={playback.url} title={playback.name} live onClose={close} />
        </PlayerOverlay>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} onPlay={play} />
        ))}
      </div>

      {!loadError && channels.length === 0 && (
        <p className="text-sm text-muted">
          No {title.toLowerCase()} channels are in the catalogue yet — ingestion may still be filling it in.
        </p>
      )}
    </div>
  )
}
