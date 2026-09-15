import { useEffect, useState } from 'react'
import ChannelCard from '../components/ui/ChannelCard'
import Row from '../components/ui/Row'
import PlayerOverlay from '../components/player/PlayerOverlay'
import VideoPlayer from '../components/player/VideoPlayer'
import { useChannelPlayback } from '../hooks/useChannelPlayback'
import { getChannelFacets, listChannels } from '../lib/channels'
import type { ChannelSummary } from '../lib/types'

// Priority order for the featured rows when browsing "All" — only rows that
// actually have channels render; this isn't a fixed taxonomy, it's just
// which categories get first billing when they exist.
const FEATURED_CATEGORIES = ['News', 'Sports', 'Entertainment', 'Movies', 'Series', 'Kids', 'Music', 'Documentary']

export default function LiveTV() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [featuredRows, setFeaturedRows] = useState<Record<string, ChannelSummary[]>>({})
  const [gridChannels, setGridChannels] = useState<ChannelSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const { playback, error, play, close } = useChannelPlayback()

  useEffect(() => {
    getChannelFacets()
      .then((res) => setCategories(res.categories.map((c) => c.category)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedCategory !== null || categories.length === 0) return
    const targets = FEATURED_CATEGORIES.filter((c) => categories.includes(c))

    Promise.all(
      targets.map((category) =>
        listChannels({ category, limit: 12 })
          .then((res): [string, ChannelSummary[]] => [category, res.channels])
          .catch((): [string, ChannelSummary[]] => [category, []]),
      ),
    ).then((results) => {
      const next: Record<string, ChannelSummary[]> = {}
      for (const [category, channels] of results) {
        if (channels.length > 0) next[category] = channels
      }
      setFeaturedRows(next)
    })
  }, [categories, selectedCategory])

  useEffect(() => {
    if (selectedCategory === null) return
    listChannels({ category: selectedCategory, limit: 200 })
      .then((res) => setGridChannels(res.channels))
      .catch(() => setLoadError('Could not load channels.'))
  }, [selectedCategory])

  return (
    <div className="page-gutter py-6">
      <h1 className="mb-4 text-2xl font-semibold text-text">Live TV</h1>

      {playback && (
        <PlayerOverlay onClose={close}>
          <VideoPlayer src={playback.url} title={playback.name} live onClose={close} />
        </PlayerOverlay>
      )}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {loadError && <p className="mb-4 text-sm text-error">{loadError}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors ${
            selectedCategory === null ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
          }`}
        >
          All
        </button>
        {categories.slice(0, 12).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              selectedCategory === category ? 'bg-primary text-white' : 'bg-card text-muted hover:text-text'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory === null ? (
        Object.entries(featuredRows).map(([category, channels]) => (
          <Row key={category} title={category}>
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onPlay={play} />
            ))}
          </Row>
        ))
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {gridChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} onPlay={play} />
          ))}
          {gridChannels.length === 0 && !loadError && (
            <p className="col-span-full text-sm text-muted">No channels in this category yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
